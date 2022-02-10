import prompts from "prompts";
import { User } from "./User";
import { globalDatabase } from "./Main";
import { Admin } from "./Admin";
import { Car } from "./Car";

export class Controll {
    private user: User;
    private admin: Admin;
    
    constructor(user: User) {
        this.user = user;
    }

    public async startControll(): Promise<void> {
        console.log('\nWelcome', this.user.getUsername(),'\n');
        
        let isRegistered = this.user.getUsername().length > 0 ? true : false; //TODO get different Method 

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
        if(this.user.getIsAdmin()) {
            userOptions.choices.push({ title: 'Add new car', description: 'Add a new car to the pool', value: 'addCar' });
            this.admin = new Admin(this.user.getId(), this.user.getUsername(), this.user.getPassword(), true, this.user.getJournies());
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
            await this.admin.addCar();
            return true;
        }
        else {
            return false;
        }
    }

    private async viewCars(): Promise<void> {
        const carsFromDB: any = await globalDatabase.getTenCarsToDisplay()
        let availableCars: Car[] = [];
        let carCounter: number = 0;

        console.log('Chose wisely...');
        for(const car of carsFromDB) {
            ++carCounter;
            const carToChoose = new Car(car._id, car.drive, car.description, car.earliestUseTime, car.latestUseTime, car.maxUseTime, car.flatFee, car.pricePerMinute)
            availableCars.push(carToChoose);
            console.log('--', carCounter, '--');
            carToChoose.displayInformation();
            console.log();
        }

        console.log('--', ++carCounter, '--');
        console.log('EXIT\n');

        const response = await prompts({
            type: 'number',
            name: 'chosenCar',
            message: 'Please choose an option',
            validate: chosenCar => (chosenCar < 0 || chosenCar > carCounter) ? `Must be > 0 and <= ${carCounter}` : true
        });
        const chosenCar = response.chosenCar;

        if(chosenCar == undefined || chosenCar == carCounter) {
            return;
        } else {
            console.log('You\'ve chosen car no.' + chosenCar);
            const bookingSuccessful = await this.setBookingPreferences();
            if(!bookingSuccessful) {
                console.log('Sorry about that!');
                const response = await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Would you like to try again?',
                    choices: [
                        { title: 'Yes', value: true },
                        { title: 'No', value: false }
                    ]
                });
                if(response.value) {
                    await this.viewCars();
                } else {
                    return;
                }
            } else {
                return;
            }
        }
    }

    private async setBookingPreferences(): Promise<boolean> {
        console.log('Let us know when your journey should start.')
        const questions = [
            //TODO ask for date
            {
                type: 'text',
                name: 'timeTripStart',
                message: 'What time do you want to start your journey? - the format must be hh:mm',
                validate: timeTripStart => !/^([01][0-9]|2[0-3]):([0-5][0-9])$/.test(timeTripStart) ? `Must match hh:mm pattern` : true
            },
            {
                type: 'number',
                name: 'useTime',
                message: 'How long should the trip be? (In minutes)',
                validate: useTime => useTime < 1 ? `Must be > 0` : true
            }
        ];
        const response = await prompts(questions);
        
        if(response.timeTripStart == undefined || response.useTime == undefined) {
            return false;
        }
        //TODO check if car is available
            // if yes -> book car (maybe ask before) return true
            //if no -> return false and ask to go back or start again
        return true;
    }
    
    private async viewFilteredCars() {
        console.log('in filtered cars')
    } //TODO add params and implement

    private async viewStatistics() {
        console.log('in statistics')
    } //TODO implement
}