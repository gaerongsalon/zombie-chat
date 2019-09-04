import { RedisRepository } from "@yingyeothon/repository-redis";
import * as mem from "mem";
import { getGame, getLobby } from ".";
import { ITroop, IUser, IUserBase } from "../state";
import { redis } from "../sys";
import { StatefulLambdaActor, StateManager } from "./helper";

type UserConnectMessage = { type: "connect"; name: string } & IUserBase;
type UserDisconnectMessage = { type: "disconnect" } & IUserBase;
type UserChatMessage = { type: "chat"; message: string } & IUserBase;
type UserAddTroopMessage = { type: "addTroop"; troop: ITroop };
type UserMessage =
  | UserConnectMessage
  | UserDisconnectMessage
  | UserChatMessage
  | UserAddTroopMessage;

const stateManager = new StateManager<IUser>("user:");
const connectionIdToUserIdStore = new RedisRepository({
  redis,
  prefix: "connectionId:"
});
const expirationMillisForConnection = 2 * 60 * 60 * 1000;

const generateNewState = (message: UserConnectMessage): IUser => ({
  userId: message.userId,
  connectionId: message.connectionId,
  name: message.name,
  image: "default",
  troops: []
});

class UserActor extends StatefulLambdaActor<UserMessage, IUser> {
  constructor(public readonly userId: string) {
    super(stateManager, "user", userId);
  }

  protected async onMessage(message: UserMessage) {
    switch (message.type) {
      case "connect":
        return this.onConnect(message);
      case "disconnect":
        return this.onDisconnect(message);
      case "chat":
        return this.onChat(message);
      case "addTroop":
        return this.onAddTroop(message);
      default:
        throw new Error(`No handler for ${message}`);
    }
  }

  private async onConnect(message: UserConnectMessage) {
    const logger = this.logger.with(`onConnect`);
    // Load a user model from the repository.
    let state = await this.getState();
    logger.write(`loadModel`, state);

    // Create a new user model if it does not exist.
    if (!state) {
      state = generateNewState(message);
      logger.write(`createNewModel`, state);
    }

    // Clear the old game context.
    if (state.gameId) {
      logger.write(`clearOldGame`, state.gameId);
      getGame(state.gameId).send({
        type: "leave",
        userId: message.userId,
        connectionId: state.connectionId
      });
      logger.write(`requestToLeaveGame`, state.gameId, message.userId);

      state.gameId = undefined;
    }

    // Update a connectionId and save it into the repository.
    logger.write(`updateRepository`, state, message);
    state.connectionId = message.connectionId;
    await Promise.all([
      connectionIdToUserIdStore.setWithExpire(
        message.connectionId,
        message.userId,
        expirationMillisForConnection
      ),
      this.setState(state)
    ]);

    // Enter to the lobby.
    logger.write(`enterToLobby`, message);
    getLobby().send({
      type: "enter",
      userId: state.userId,
      connectionId: state.connectionId
    });
  }

  private async onDisconnect(message: UserDisconnectMessage) {
    const logger = this.logger.with(`onDisconnect`);

    // Load a user model from the repository.
    const state = await this.getState();
    logger.write(`loadModel`, state);

    if (!state) {
      logger.write(`noUser`);
      return;
    }

    // Leave from the lobby.
    logger.write(`leaveFromLobby`, message);
    getLobby().send({
      type: "leave",
      connectionId: message.connectionId,
      userId: message.userId
    });

    // Leave from a game.
    if (state.gameId) {
      logger.write(`leaveFromGame`, state.gameId, message);
      getGame(state.gameId).send({
        type: "leave",
        connectionId: message.connectionId,
        userId: message.userId
      });
    }

    // Delete all context from repositories.
    logger.write(`deleteFromRepository`, message);
    await Promise.all([
      connectionIdToUserIdStore.delete(message.connectionId),
      this.deleteState()
    ]);
  }

  private async onChat(message: UserChatMessage) {
    const logger = this.logger.with(`onChat`);

    const state = await this.getState();
    logger.write(`loadModel`, state);

    if (!state) {
      logger.write(`noUser`);
      return;
    }

    if (state.gameId) {
      // This user is joining the game.
      getGame(state.gameId).send(message);
    } else {
      // This user is in the lobby.
      getLobby().send(message);
    }
  }

  private async onAddTroop(message: UserAddTroopMessage) {
    const state = await this.getState();
    const { troop: newTroop } = message;
    if (state.troops.length === 0) {
      state.troops.push(newTroop);
    } else {
      if (state.troops[state.troops.length - 1].level === newTroop.level) {
        state.troops[state.troops.length - 1].count += newTroop.count;
      } else {
        state.troops.push(newTroop);
      }
    }
    await this.setState(state);
  }
}

export const resolveUserIdFromConnectionId = (connectionId: string) =>
  connectionIdToUserIdStore.get<string>(connectionId);

export const getUser = mem((userId: string) => new UserActor(userId));
