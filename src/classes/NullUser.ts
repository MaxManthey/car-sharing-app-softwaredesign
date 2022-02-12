import { User } from "./User";
import { ObjectId } from "mongodb";

export class NullUser extends User {
  constructor(
    id: ObjectId,
    username: string,
    password: string,
    isAdmin: boolean
  ) {
    super(id, username, password, isAdmin);
  }

  public isNull(): boolean {
    return true;
  }
}
