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
            userOptions.choices.push({ title: 'View upcoming journies', description: 'View your upcoming journies', value: 'viewUpcomingJournies' });
            userOptions.choices.push({ title: 'View past journies', description: 'View your past journies', value: 'viewPastJournies' });
        }
        if(this.user.getIsAdmin()) {
            userOptions.choices.push({ title: 'Add new car', description: 'Add a new car to the pool', value: 'addCar' });
            this.admin = new Admin(this.user.getId(), this.user.getUsername(), this.user.getPassword(), true);
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
        if(userChoice == 'viewCars') { //TODO change to switch case
            await this.viewCars(); //TODO check in function if user is registered
            return true;
        }
        else if(userChoice == 'viewFilteredCars') {
            await this.viewFilteredCars(); //TODO check in function if user is registered
            return true;
        }
        else if(userChoice == 'viewStatistics') {
            await this.user.viewStatistics();
            return true;
        }
        else if(userChoice == 'viewUpcomingJournies') {
            await this.user.viewUpcomingJournies();
            return true;
        }
        else if(userChoice == 'viewPastJournies') {
            await this.user.viewPastJournies();
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
        const chosenCarNum = response.chosenCar;

        if(chosenCarNum == undefined || chosenCarNum == carCounter) {
            return;
        } else {
            const bookingPreferences: any = await this.setBookingPreferences();
            if(JSON.stringify(bookingPreferences).length < 3) {
                console.log('The provided booking details are incorrect.');
                const retryResponse = await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Would you like to try again?',
                    choices: [
                        { title: 'Yes', value: true },
                        { title: 'No', value: false }
                    ]
                });
                if(retryResponse.value) {
                    await this.viewCars();
                } else {
                    return;
                }
            } else {
                //TODO check if car is available
                const chosenCar = availableCars[chosenCarNum-1];
                const dateTime: Date = new Date(bookingPreferences.date);
                const date: Date = new Date(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate());
                const useTime: number = bookingPreferences.useTime;
                const costAmount: number = chosenCar.getFlatFee() + chosenCar.getPricePerMinute() * useTime;
                
                const carTimeOk = chosenCar.providedDateTimeMatch(dateTime.getHours(), dateTime.getMinutes(), useTime);
                const carNotBookedYet = await chosenCar.carNotBookedYet(date, dateTime.getHours(), dateTime.getMinutes(), useTime);
                if(!carTimeOk || !carNotBookedYet) {
                    return;
                }
                
                console.log("Total cost:", costAmount);
                const hours = dateTime.getHours() < 10 ? '0'+dateTime.getHours().toString() : dateTime.getHours().toString();
                const minutes = dateTime.getMinutes() < 10 ? '0'+dateTime.getMinutes().toString() : dateTime.getMinutes().toString();
                await this.user.bookJourney(chosenCar.getId(), chosenCar.getDescription(), date, hours+':'+minutes, useTime, costAmount);
            }
        }
    }

    private async setBookingPreferences(): Promise<object> {
        console.log('Let us know when your journey should start.')
        const questions = [
            {
                type: 'date',
                name: 'date',
                message: 'When would you like to start your trip?',
                initial: new Date(),
                validate: date => date < Date.now() ? 'Date must be in the future' : true
            },
            {
                type: 'number',
                name: 'useTime',
                message: 'How long should the trip be? (In minutes)',
                validate: useTime => useTime < 1 ? `Must be > 0` : true
            }
        ];
        const response = await prompts(questions);

        if(Object.keys(response).length != 2) {
            console.log('Entries can\'t be undefined.')
            return {}
        }

        return {
            date: response.date.toISOString(),
            useTime: response.useTime
        }
    }
    
    private async viewFilteredCars() {
        console.log('in filtered cars')
        //TODO Filter for type of drive
    } //TODO add params and implement
}