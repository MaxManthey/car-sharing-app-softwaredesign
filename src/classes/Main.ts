import prompts from "prompts";
import * as Mongo from "mongodb";
import { UserManagement } from "./UserManagement";
import { Controll } from "./Controll";
import { User } from "./User";
import { Database } from "./Database";

export let globalDatabase: Database = new Database();
export class Main {
    public async main(): Promise<void> {
        const dbConnectionSuccessfull = await globalDatabase.connect();
        
        //TODO ASCII art

        console.log('\nWelcome to CarShare!\n\n');
        const response = await prompts({
            type: 'select',
            name: 'value',
            message: 'How do you wish to proceed?',
            choices: [
                { title: 'Login', description: 'Login to your existing account', value: 'login' },
                { title: 'Register', description: 'Register a new account', value: 'register'},
                { title: 'View cars', description: 'View our available cars', value: 'viewCars' },
                { title: 'Exit', description: 'Exit the application', value: 'exit' }
            ]
        });

        if(!dbConnectionSuccessfull) {
            console.log('Error trying to connect to the Database. \nThe application will be stopped.');
            return;
        }

        const userChoice = response.value;
        const userManagement = new UserManagement();
        
        if(userChoice === 'login') {
            const userObj: any = await userManagement.login();
            if(JSON.stringify(userObj).length > 2) {
                const controll = new Controll(new User(userObj._id, userObj.username, userObj.password, userObj.isAdmin, userObj.journies));
                await controll.startControll();
            } else {
                console.log("Login has been stopped");
            }
        } else if(userChoice === 'register') {
            const userObj: any = await userManagement.register();
            if(JSON.stringify(userObj).length > 2) {
                const controll = new Controll(new User(userObj._id, userObj.username, userObj.password, userObj.isAdmin, userObj.journies));
                await controll.startControll();
            } else {
                console.log("Login has been stopped");
            }
        } else if(userChoice === 'viewCars') {
            const controll = new Controll(new User(new Mongo.ObjectId(), "", "", false, []));
            await controll.startControll();
        }
        
        await globalDatabase.disconnect();
        console.log('Application has been stopped.');
        console.log('\n\nThank you for using CarShare!');
        //TODO ASCII art
        console.log('We hope to see you again soon!');
    }
}
//TODO implement Design Pattern 1
//TODO implement Design Pattern 2
//TODO implement Test
//TODO run linter
//TODO use loop in main for logout