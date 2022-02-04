import * as Mongo from "mongodb";

// const uri = "mongodb+srv://max:<password>@cluster0.19f2v.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// const client = new Mongo.MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });


export class Database {
    private readonly dbName: string = "TodoApp";
    private mongoClient!: Mongo.MongoClient;

    private async connect(user: string, pw: string): Promise<void> {
        const uri: string ='';
        this.mongoClient = new Mongo.MongoClient(uri, { });
        await this.mongoClient.connect();
        console.log("Database connected succesfully") //TODO delete
        // this.dbUsers = this.mongoClient.db(this.dbName).collection(this.dbUsersCollectionName);
        // this.dbQuiz = this.mongoClient.db(this.dbName).collection(this.dbQuizCollectionName);
        // this.dbQuestions = this.mongoClient.db(this.dbName).collection(this.dbQuestionsCollectionName);
        // console.log("Database connection", this.dbUsers != undefined);
        // return this.dbUsers != undefined;
    }

    public async disconnect(): Promise<void> {
        if (this.mongoClient) {
            await this.mongoClient.close();
            console.log("Database disconnected successfull");
        }
    }
}


//un: max pw: sw-design