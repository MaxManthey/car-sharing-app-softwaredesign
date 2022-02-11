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
        }
    }

    public async insertNewUser(username: string, password: string): Promise<void> {
        await this.usersCollection.insertOne({
            "username": username,
            "password": password,
            "isAdmin": false
        });
    }

    public async userExists(username: string): Promise<boolean> {
        const requestedUser = await this.usersCollection.findOne({"username": username});
        return requestedUser != null;
    }

    public async passwordMatching(username: string, password: string): Promise<boolean> {
        const requestedUser = await this.usersCollection.findOne({"username": username});
        return requestedUser != null && requestedUser.password == password;
    }

    public async getExistingUser(username: string): Promise<object> {
        return await this.usersCollection.findOne({"username": username});
    }

    public async getUserJournies(userId: Mongo.ObjectId): Promise<object> {
        return await this.journiesCollection.find({ "userId": userId }).toArray();
    }

    public async insertNewJourney(userId: Mongo.ObjectId, carId: Mongo.ObjectId, description: string, dateStart: Date, timeStart, duration, costAmount): Promise<Mongo.ObjectId> {
        const journeyId: any = await this.journiesCollection.insertOne({
            "userId": userId,
            "carId": carId,
            "description": description,
            "dateStart": dateStart,
            "timeStart": timeStart,
            "duration": duration,
            "costAmount": costAmount
        });
        return journeyId.insertedId;
    }

    public async getJourniesByCarIdAndDate(carId: Mongo.ObjectId, dateStart: Date): Promise<object> {
        return await this.journiesCollection.find({
            "carId": carId,
            "dateStart": dateStart
        }).toArray();
    }

    public async insertNewCar(drive: string, description: string, earliestUseTime: string, latestUseTime: string, maxUseTime: number, flatFee: number, pricePerMinute: number): Promise<void> {
        await this.carsCollection.insertOne({
            "drive": drive,
            "description": description,
            "earliestUseTime": earliestUseTime,
            "latestUseTime": latestUseTime,
            "maxUseTime": maxUseTime,
            "flatFee": flatFee,
            "pricePerMinute": pricePerMinute
        });
    }

    public async getTenCarsToDisplay(): Promise<object[]> {
        return await this.carsCollection.aggregate([{$sample: {size: 10}}]).toArray();
    }

    public async filterCarsByDriveAndDuration(drive: string, duration: number): Promise<object[]> {
        if(drive == 'none') {
            return await this.carsCollection.find({ "maxUseTime": { "$gte": duration } }).toArray();
        }
        return await this.carsCollection.find({ 
            "drive": drive,
            "maxUseTime": { "$gte": duration }
        }).toArray();
    }
}