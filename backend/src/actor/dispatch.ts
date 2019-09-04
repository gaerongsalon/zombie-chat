import { getGame } from "./game";
import { getLobby } from "./lobby";
import { getUser } from "./user";

export const getActor = (actorType: string, actorId: string) => {
  switch (actorType) {
    case "lobby":
      return getLobby(actorId);
    case "user":
      return getUser(actorId);
    case "game":
      return getGame(actorId);
  }
  throw new Error(`Undefined actor type: ${actorType}`);
};
