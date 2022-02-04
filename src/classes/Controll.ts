import { User } from "./User";
// import { Database } from "./Database";
import prompts from "prompts";

export class Controll {
    private user: User;
    
    constructor(user: User) {
        this.user = user;
    }

    public async startControll(): Promise<void> {
        console.log('Welcome', 'username'); //TODO change to actual username

        //TODO connect DB
        
        let isRegistered = true, isAdmin = true; //TODO Change to actual data

        let userOptions: any = {
            type: 'select',
            name: 'value',
            message: 'Please select an option',
            choices: [
                { title: 'View available cars', description: 'View cars that are available now', value: 'viewCars' },
                { title: 'Filter and view cars', description: 'Filter available cars to your preferance', value: 'viewFilteredCars'}
            ]
        }
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
        
        console.log('Goodbye', 'username'); //TODO change to actual username
        //TODO disconnect DB
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

    private addCar() {}
}