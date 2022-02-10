import { ObjectId } from "mongodb";
export class User {
    protected _id: ObjectId;
    protected username: string;
    protected password: string;
    protected isAdmin: boolean;
    protected journies: ObjectId[];

    constructor(id: ObjectId, username: string, password: string, isAdmin: boolean, journies: ObjectId[]) {
        this._id = id;
        this.username = username;
        this.password = password;
        this.isAdmin = isAdmin;
        this.journies = journies;
    }

    public getId(): ObjectId { return this._id; }

    public getUsername(): string { return this.username; }

    public getPassword(): string { return this.password; }

    public getIsAdmin(): boolean { return this.isAdmin; }

    public getJournies(): ObjectId[] { return this.journies; }
}