import { UserManagement } from "./UserManagement";
import { Controll } from "./Controll";
import prompts from "prompts";
import { User } from "./User";

export class Main {
    public async main(): Promise<void> {
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

        const userChoice = response.value;
        const userManagement = new UserManagement();

        if(userChoice === 'login') {
            await userManagement.login(); //TODO receive user obj
            //TODO proceed to controll if correct
            const controll = new Controll(new User()); //TODO use actual User obj
            await controll.startControll();
        } else if(userChoice === 'register') {
            await userManagement.register(); //TODO receive user obj
            //TODO proceed to controll if correct
            const controll = new Controll(new User());//TODO use actual User obj
            await controll.startControll();
        } else if(userChoice === 'viewCars') {
            console.log('These are our available cars');
        }

        console.log('Application has been stopped.');
        console.log('\n\nThank you for using CarShare!');
        console.log('We hope to see you again soon!');
    }
}