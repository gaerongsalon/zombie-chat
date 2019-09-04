import { IUserBase } from ".";

export interface IGame {
  gameId: string;
  user1: IUserBase;
  user2: IUserBase;
}
