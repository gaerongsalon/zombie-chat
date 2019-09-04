export interface IUserBase {
  connectionId: string;
  userId: string;
}

export interface ITroop {
  level: number;
  count: number;
}

export interface IUser extends IUserBase {
  name: string;
  image: string;
  troops: ITroop[];
  gameId?: string;
}
