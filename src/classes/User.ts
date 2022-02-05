import { ObjectId } from "mongodb";
import { Journey } from "./Journey";
export class User {
    private _id: ObjectId;
    private username: string;
    private password: string;
    private isAdmin: boolean;
    private journies: ObjectId[];

    constructor(id: ObjectId, username: string, password: string, isAdmin: boolean, journies: ObjectId[]) {
        this._id = id;
        this.username = username;
        this.password = password;
        this.isAdmin = isAdmin;
        this.journies = journies;
    }

    public getId() { return this._id }

    public getUsername() { return this.username }

    public getPassword() { return this.password }

    public getIsAdmin() { return this.isAdmin }

    public getJournies() { return this.journies }
}