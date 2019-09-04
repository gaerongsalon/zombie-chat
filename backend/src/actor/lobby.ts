import * as mem from "mem";
import { v4 as uuidv4 } from "uuid";
import { getGame, getUser } from ".";
import { ILobby, IUserBase } from "../state";
import { StatefulLambdaActor, StateManager } from "./helper";
import { broadcastChatMessage } from "./respond";

export type LobbyEnterMessage = { type: "enter" } & IUserBase;
export type LobbyLeaveMessage = { type: "leave" } & IUserBase;
export type LobbyMatchMessage = { type: "match" };
export type LobbyChatMessage = { type: "chat"; message: string } & IUserBase;
export type LobbyMessage =
  | LobbyEnterMessage
  | LobbyLeaveMessage
  | LobbyMatchMessage
  | LobbyChatMessage;

const globalLobbyId = "global-lobby";

const stateManager = new StateManager<ILobby>("lobby:");
const generateNewState = (lobbyId: string): ILobby => ({
  lobbyId,
  pool: []
});

class LobbyActor extends StatefulLambdaActor<LobbyMessage, ILobby> {
  constructor(public readonly lobbyId: string) {
    super(stateManager, "lobby", lobbyId);
  }

  protected async onMessage(message: LobbyMessage) {
    switch (message.type) {
      case "enter":
        return this.onEnter(message);
      case "leave":
        return this.onLeave(message);
      case "match":
        return this.onMatch();
      case "chat":
        return this.onChat(message);
      default:
        throw new Error(`No handler for ${message}`);
    }
  }

  private async onEnter(message: LobbyEnterMessage) {
    const logger = this.logger.with(`onEnter`);
    const state = (await this.getState()) || generateNewState(this.lobbyId);
    logger.write(`model`, state);

    // Add this user to a lobby pool.
    state.pool.push({
      userId: message.userId,
      connectionId: message.connectionId
    });
    logger.write(`afterPoolUpdated`, state);

    logger.write(`countOfPool`, state.pool.length);
    if (state.pool.length === 2) {
      logger.write(`tryToMatch`);

      // Try to match.
      this.send({
        type: "match"
      });
    }

    await this.setState(state);
    logger.write(`modelSaved`);
  }

  private async onLeave(message: LobbyLeaveMessage) {
    const logger = this.logger.with(`onLeave`);
    const state = await this.getState();
    logger.write(`model`, state);

    // Delete an user from a lobby pool.
    state.pool = state.pool.filter(
      each => each.connectionId !== message.connectionId
    );
    logger.write(`afterPoolUpdated`, state);

    await this.setState(state);
    logger.write(`modelSaved`);
  }

  private async onMatch() {
    const logger = this.logger.with(`onMatch`);

    // Match any two people and create a new game.
    const model = await this.getState();
    logger.write(`model`, model);

    while (model.pool.length >= 2) {
      const user1 = model.pool.pop();
      const user2 = model.pool.pop();
      const gameId = uuidv4();
      logger.write(`newGame`, gameId, user1, user2);

      getGame(gameId).send({
        type: "new",
        gameId,
        user1,
        user2
      });
      logger.write(`newGamePosted`, gameId);
    }

    await this.setState(model);
    logger.write(`modelSaved`);
  }

  private async onChat(message: LobbyChatMessage) {
    const logger = this.logger.with(`onChat`);
    const model = await this.getState();
    logger.write(`loadModel`, model);

    const sender = await getUser(message.userId).getState();
    logger.write(`broadcast`, sender, message);
    await broadcastChatMessage(
      message.message,
      model.pool.map(user => user.connectionId),
      {
        connectionId: message.connectionId,
        name: sender.name,
        image: sender.image
      }
    );
  }
}

export const getLobby = mem(
  (lobbyId: string = globalLobbyId) => new LobbyActor(lobbyId)
);
