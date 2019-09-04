import { IUserBase } from ".";

export interface ILobby {
  lobbyId: string;
  pool: IUserBase[];
}
