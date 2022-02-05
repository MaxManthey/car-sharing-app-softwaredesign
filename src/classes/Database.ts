require('dotenv').config();
import * as Mongo from "mongodb";
export class Database {
    private readonly dbName: string = "car-sharing";
    private mongoClient!: Mongo.MongoClient;
    private usersCollection: Mongo.Collection;
    private carsCollection: Mongo.Collection;
    private journiesCollection: Mongo.Collection;
    

    public async connect(): Promise<boolean> {
        const uri: string = 'mongodb+srv://'+process.env.DB_USER+':'+process.env.DB_PASS+'@cluster0.19f2v.mongodb.net/'+this.dbName+'?retryWrites=true&w=majority';
        this.mongoClient = new Mongo.MongoClient(uri, { });
        await this.mongoClient.connect();
        this.usersCollection = this.mongoClient.db(this.dbName).collection('users');
        this.carsCollection = this.mongoClient.db(this.dbName).collection('cars');
        this.journiesCollection = this.mongoClient.db(this.dbName).collection('journies');

        if(this.usersCollection == undefined || this.carsCollection == undefined || this.journiesCollection == undefined) {
            return false;
        }
        return true;
    }

    public async disconnect(): Promise<void> {
        if (this.mongoClient) {
            await this.mongoClient.close();
            console.log("Database disconnected successfully");
        }
    }

    public async userExists(username: string): Promise<boolean> {
        const requestedUser = await this.usersCollection.findOne({"username": username});
        return requestedUser != null;
    }

    public async passwordMatching(username: string, password: string): Promise<boolean> {
        const requestedUser = await this.usersCollection.findOne({"username": username});
        return requestedUser != null && requestedUser.password == password;
    }

    public async insertNewUser(username: string, password: string): Promise<void> {
        await this.usersCollection.insertOne({
            "username": username,
            "password": password,
            "isAdmin": false,
            "all_Journies": [] 
        })
    }

    public async getExistingUser(username: string): Promise<object> {
        return await this.usersCollection.findOne({"username": username})
    }
}