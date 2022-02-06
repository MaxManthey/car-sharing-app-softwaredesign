import { User } from "./User";
// import { Database } from "./Database";
import prompts from "prompts";
import { globalDatabase } from "./Main";
import { ConnectionCheckOutFailedEvent } from "mongodb";

export class Controll {
    private user: User;
    
    constructor(user: User) {
        this.user = user;
    }

    public async startControll(): Promise<void> {
        console.log('\nWelcome', this.user.getUsername(),'\n');
        
        let isRegistered = this.user.getUsername().length > 0 ? true : false;
        let isAdmin = this.user.getIsAdmin(); 

        let userOptions: any = {
            type: 'select',
            name: 'value',
            message: 'Please select an option',
            choices: [
                { title: 'View available cars', description: 'View cars that are available now', value: 'viewCars' },
                { title: 'Filter and view cars', description: 'Filter available cars to your preferance', value: 'viewFilteredCars'}
            ]
        };
        if(isRegistered) {
            userOptions.choices.push({ title: 'View statistics', description: 'View your statistics', value: 'viewStatistics' });
        }
        if(isAdmin) {
            userOptions.choices.push({ title: 'Add new car', description: 'Add a new car to the pool', value: 'addCar' });
        }
        userOptions.choices.push({ title: 'Exit', description: 'Exit the application', value: 'exit' })

        let continueLoop: boolean = true;
        while(continueLoop) {
            continueLoop = await this.displayUserOptions(userOptions);
        }
        
        console.log('\nGoodbye', this.user.getUsername(), '\n');
    }


    private async displayUserOptions(userOptions: any): Promise<boolean>{
        const response = await prompts(userOptions);

        const userChoice: string = response.value;
        if(userChoice == 'viewCars') {
            await this.viewCars();
            return true;
        }
        else if(userChoice == 'viewFilteredCars') {
            await this.viewFilteredCars();
            return true;
        }
        else if(userChoice == 'viewStatistics') {
            await this.viewStatistics();
            return true;
        }
        else if(userChoice == 'addCar') {
            await this.addCar();
            return true;
        }
        else {
            return false;
        }
    }

    private viewCars() {
        console.log('In view cars')
    }
    
    private viewFilteredCars() {} //TODO add params

    private viewStatistics() {}

    private async addCar(): Promise<void> {
        console.log('Let\'s add a new car shall we?')
        const questions = [
            {
                type: 'select',
                name: 'drive',
                message: 'Which type of car is it?',
                choices: [
                    { title: 'Gas', value: 'Gas' },
                    { title: 'Electric', value: 'Electric'}
                ]
            },
            {
                type: 'text',
                name: 'description',
                message: 'Please describe the car',
                validate: description => description.length < 3 ? `Must contain at least 3 characters` : true
            },
            {
                type: 'text',
                name: 'earliestUseTime',
                message: 'Please add the earliest time from which the car may be used - the format must be hh:mm',
                validate: earliestUseTime => !/^([01][0-9]|2[0-3]):([0-5][0-9])$/.test(earliestUseTime) ? `Must match hh:mm pattern` : true
            },
            {
                type: 'text',
                name: 'latestUseTime',
                message: 'Please add the latest time from which the car may be used - the format must be hh:mm',
                validate: latestUseTime => !/^([01][0-9]|2[0-3]):([0-5][0-9])$/.test(latestUseTime) ? `Must match hh:mm pattern` : true
            },
            {
                type: 'number',
                name: 'maxUseTime',
                message: 'Please add the max period of time, in which the car may be used (in minutes)',
                validate: maxUseTime => maxUseTime < 1 ? `Must be > 0` : true
            },
            {
                type: 'number',
                name: 'flatFee',
                message: 'Please add the flat fee (in EUR)',
                validate: flatFee => flatFee < 0 ? `Must be > 0` : true
            },
            {
                type: 'number',
                name: 'pricePerMinute',
                message: 'Pleae add the price per minute (in EUR)',
                validate: pricePerMinute => pricePerMinute < 0 ? `Must be > 0` : true
            },
        ];
        const response = await prompts(questions);

        if(Object.keys(response).length != 7) {
            console.log('Entries can\'t be undefined');
        } else {
            const earliestUseTime: string[] = response.earliestUseTime.split(':').map(num => parseInt(num));
            const latestUseTime: string[] = response.latestUseTime.split(':').map(num => parseInt(num));

            if(earliestUseTime[0] > latestUseTime[0] || (earliestUseTime[0] == latestUseTime[0] && earliestUseTime[1] > latestUseTime[1])) {
                console.log('Earliest use time can\'t be greater then latest use time');
            } else {
                globalDatabase.insertNewCar(response.drive, response.description, response.earliestUseTime, response.latestUseTime, response.maxUseTime, response.flatFee, response.pricePerMinute);
                console.log('New Car has been added to DB');
            }
        }
    }
}