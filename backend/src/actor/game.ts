import * as mem from "mem";
import { getUser } from ".";
import { IGame, ITroop, IUserBase } from "../state";
import { sleep } from "../sys";
import { StatefulLambdaActor, StateManager } from "./helper";
import { broadcastChatMessage } from "./respond";

type GameNewMessage = {
  type: "new";
  gameId: string;
  user1: IUserBase;
  user2: IUserBase;
};
type GameChatMessage = { type: "chat"; message: string } & IUserBase;
type GameLeaveMessage = { type: "leave" } & IUserBase;
type GameTickMessage = { type: "tick" };
type GameMessage =
  | GameNewMessage
  | GameChatMessage
  | GameLeaveMessage
  | GameTickMessage;

const stateManager = new StateManager<IGame>("game:");
const generateNewState = (message: GameNewMessage): IGame => ({
  gameId: message.gameId,
  user1: message.user1,
  user2: message.user2
});

class GameActor extends StatefulLambdaActor<GameMessage, IGame> {
  constructor(public readonly gameId: string) {
    super(stateManager, "game", gameId);
  }

  protected async onMessage(message: GameMessage) {
    switch (message.type) {
      case "new":
        return this.onNew(message);
      case "leave":
        return this.onLeave(message);
      case "chat":
        return this.onChat(message);
      case "tick":
        return this.onTick();
      default:
        throw new Error(`No handler for ${message}`);
    }
  }

  private async onNew(message: GameNewMessage) {
    const logger = this.logger.with(`onNew`);
    logger.write(`message`, message);

    const newGame = generateNewState(message);
    await this.setState(newGame);

    this.send({
      type: "tick"
    });
  }

  private async onLeave(message: GameLeaveMessage) {}

  private async onChat(message: GameChatMessage) {
    const logger = this.logger.with(`onChat`);

    const troop = spawnNewZombie(message.message.length);
    const speaker = getUser(message.userId);
    speaker.send({
      type: "addTroop",
      troop
    });

    const [state, speakerState] = await Promise.all([
      this.getState(),
      speaker.getState()
    ]);
    await broadcastChatMessage(
      message.message,
      [state.user1.connectionId, state.user2.connectionId],
      speakerState
    );
  }

  private async onTick() {
    sleep(500).then(() => {
      this.send({
        type: "tick"
      });
    });
  }
}

const spawnNewZombie = (energy: number): ITroop => {
  const level = Math.floor(Math.log2(energy) / 2);
  const count = Math.floor(energy / level);
  return {
    level,
    count
  };
};

export const getGame = mem((gameId: string) => new GameActor(gameId));
