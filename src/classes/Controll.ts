import prompts from "prompts";
import { User } from "./User";
import { globalDatabase } from "./Main";
import { ObjectId } from "mongodb";
import { Admin } from "./Admin";
import { Car } from "./Car";
import { UserManagement } from "./UserManagement";

export class Controll {
    private user: User;
    private admin: Admin;
    private userOptions: any;
    
    constructor(user: User) {
        this.user = user;
    }

    public async startControll(): Promise<void> {
        console.log('\nWelcome', this.user.getUsername(),'\n');

        this.setUserOptions()

        let continueLoop = true;
        while(continueLoop) {
            continueLoop = await this.displayUserOptions();
        }
        
        console.log('\nGoodbye', this.user.getUsername(), '\n');
    }


    private async displayUserOptions(): Promise<boolean>{
        const response = await prompts(this.userOptions);

        const userChoice: string = response.value;
        
        switch(userChoice) {
            case 'viewCars':
                await this.viewCars();
                return true;
            case 'viewFilteredCars':
                await this.viewFilteredCars();
                return true;
            case 'viewStatistics':
                await this.user.viewStatistics();
                return true;
            case 'viewUpcomingJournies':
                await this.user.viewUpcomingJournies();
                return true;
            case 'viewPastJournies':
                await this.user.viewPastJournies();
                return true;
            case 'addCar':
                await this.admin.addCar();
                return true;
            default:
                return false;  
        }
    }

    private async viewCars(): Promise<void> {
        const carsFromDB: any = await globalDatabase.getTenCarsToDisplay()
        const availableCars: Car[] = [];
        let carCounter = 0;

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
                const chosenCar = availableCars[chosenCarNum-1];
                const dateTime: Date = new Date(bookingPreferences.date);
                const date: Date = new Date(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate());
                const useTime: number = bookingPreferences.useTime;
                const costAmount: number = chosenCar.getFlatFee() + chosenCar.getPricePerMinute() * useTime;
                
                const carTimeOk = chosenCar.providedDateTimeMatch(dateTime.getHours(), dateTime.getMinutes(), useTime);
                const carNotBookedYet = await chosenCar.carNotBookedYet(date, dateTime.getHours(), dateTime.getMinutes(), useTime);
                if(!carTimeOk || !carNotBookedYet) {
                    const message = !carTimeOk ? 'The provided details didn\'t match the cars requirements, please try again' : 'The car has already been booked, sorry about that!';
                    console.log(message);
                    return;
                }

                if(this.user.isNull()) {
                    this.user = await this.promptUserToRegisterOrLogin();
                    if(this.user.getUsername().length > 0 ? false : true) {
                        return;
                    }
                    this.setUserOptions();
                }
                
                console.log("Total cost:", costAmount); 
                if(! await this.confirmBooking()) {
                    console.log('The process has been canceled.');
                    return;
                }
                const hours = dateTime.getHours() < 10 ? '0'+dateTime.getHours().toString() : dateTime.getHours().toString();
                const minutes = dateTime.getMinutes() < 10 ? '0'+dateTime.getMinutes().toString() : dateTime.getMinutes().toString();
                await this.user.bookJourney(chosenCar.getId(), chosenCar.getDescription(), date, hours+':'+minutes, useTime, costAmount);
                console.log('\nYour journey has been booked successfully!\n');
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
    
    private async viewFilteredCars(): Promise<void> {
        const bookingPreferences: any = await this.setBookingPreferences();
        if(Object.keys(bookingPreferences).length != 2) {
            console.log('Can\'t be undefined.');
            return;
        }

        const response = await prompts({
            type: 'select',
            name: 'driveType',
            message: 'What type of drive do you prefer?',
            choices: [
                { title: 'Gas', description: 'Filter for gas cars', value: 'Gas' },
                { title: 'Electric', description: 'Filter for electric cars', value: 'Electric'},
                { title: 'I don\'t care', description: 'Filter for electric and gas cars', value: 'none' }
            ]
        });
        const driveType = response.driveType;
        if(driveType == undefined) {
            console.log('Can\'t be undefined.');
            return;
        }

        const filteredCars: any = await globalDatabase.filterCarsByDriveAndDuration(driveType, bookingPreferences.useTime);
        const dateTime: Date = new Date(bookingPreferences.date);
        const date: Date = new Date(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate());
        const useTime: number = bookingPreferences.useTime;

        const availableCars: Car[] = []

        for(const car of filteredCars) {
            const currentCar = new Car(car._id, car.drive, car.description, car.earliestUseTime, car.latestUseTime, car.maxUseTime, car.flatFee, car.pricePerMinute);
            const carTimeOk = currentCar.providedDateTimeMatch(dateTime.getHours(), dateTime.getMinutes(), useTime);
            const carNotBookedYet = await currentCar.carNotBookedYet(date, dateTime.getHours(), dateTime.getMinutes(), useTime);
            if(carTimeOk && carNotBookedYet) {
                availableCars.push(currentCar);
            }
        }

        if(availableCars.length == 0) {
            console.log('There are no available cars, that match your booking preference. Sorry about that!');
            return;
        }

        let carCounter = 0
        for(const car of availableCars) {
            console.log('--', ++carCounter, '--');
            car.displayInformation();
            console.log('-> Total amount to pay: \t', car.getFlatFee() + car.getPricePerMinute() * useTime);
            console.log();
        }
        console.log('--', ++carCounter, '--');
        console.log('EXIT\n');

        const carToBookChoice = await prompts({
            type: 'number',
            name: 'chosenCar',
            message: 'Please choose an option',
            validate: chosenCar => (chosenCar < 0 || chosenCar > carCounter) ? `Must be > 0 and <= ${carCounter}` : true
        });
        const chosenCarNum = carToBookChoice.chosenCar;
        
        if(chosenCarNum == undefined || chosenCarNum == carCounter) {
            console.log('No car has been booked.')
            return;
        }

        if(this.user.isNull()) {
            this.user = await this.promptUserToRegisterOrLogin();
            if(this.user.getUsername().length > 0 ? false : true) {
                return;
            }
            this.setUserOptions();
        }

        if(! await this.confirmBooking()) {
            console.log('The process has been canceled.');
            return;
        }
        
        const chosenCar = availableCars[chosenCarNum-1];
        const hours = dateTime.getHours() < 10 ? '0'+dateTime.getHours().toString() : dateTime.getHours().toString();
        const minutes = dateTime.getMinutes() < 10 ? '0'+dateTime.getMinutes().toString() : dateTime.getMinutes().toString();
        await this.user.bookJourney(chosenCar.getId(), chosenCar.getDescription(), date, hours+':'+minutes, useTime, chosenCar.getFlatFee() + chosenCar.getPricePerMinute() * useTime);
        console.log('\nYour journey has been booked successfully!\n');
    }


    private async promptUserToRegisterOrLogin(): Promise<User> {
        const response = await prompts({
            type: 'select',
            name: 'value',
            message: 'Sorry but you need an account to book a car.',
            choices: [
                { title: 'Login', description: 'Login to your existing account', value: 'login' },
                { title: 'Register', description: 'Register a new account', value: 'register'},
                { title: 'Exit', description: 'Exit the application', value: 'exit' }
            ]
        });
        const userChoice = response.value;

        if(userChoice == 'exit' || userChoice == undefined) {
            console.log('Sorry but you need an account to proceed.');
            return new User(new ObjectId(), "", "", false);
        }

        const userManagement = new UserManagement();
        
        if(userChoice === 'login') {
            const userObj: any = await userManagement.login();
            if(JSON.stringify(userObj).length > 2) {
                return new User(userObj._id, userObj.username, userObj.password, userObj.isAdmin);
            } 
        } else if(userChoice === 'register') {
            const userObj: any = await userManagement.register();
            if(JSON.stringify(userObj).length > 2) {
                return new User(userObj._id, userObj.username, userObj.password, userObj.isAdmin);
            }
        }
        console.log('Sorry but you need an account to proceed.');
        return new User(new ObjectId(), "", "", false);
    }

    private setUserOptions(): void {
        this.userOptions = {
            type: 'select',
            name: 'value',
            message: 'Please select an option',
            choices: [
                { title: 'View available cars', description: 'View cars that are available now', value: 'viewCars' },
                { title: 'Filter and view cars', description: 'Filter available cars to your preferance', value: 'viewFilteredCars'}
            ]
        };
        if(!this.user.isNull()) {
            this.userOptions.choices.push({ title: 'View statistics', description: 'View your statistics', value: 'viewStatistics' });
            this.userOptions.choices.push({ title: 'View upcoming journies', description: 'View your upcoming journies', value: 'viewUpcomingJournies' });
            this.userOptions.choices.push({ title: 'View past journies', description: 'View your past journies', value: 'viewPastJournies' });
        }
        if(this.user.getIsAdmin()) {
            this.userOptions.choices.push({ title: 'Add new car', description: 'Add a new car to the pool', value: 'addCar' });
            this.admin = new Admin(this.user.getId(), this.user.getUsername(), this.user.getPassword(), true);
        }
        this.userOptions.choices.push({ title: 'Exit', description: 'Exit the application', value: 'exit' });
    }

    private async confirmBooking(): Promise<boolean> {
        const response = await prompts({
            type: 'select',
            name: 'value',
            message: 'Please confirm, that you want to book this journey.',
            choices: [
                { title: 'Confirm', description: 'Yes, I would like to book the journey', value: true },
                { title: 'Decline', description: 'No, I don\'t want to book the journey', value: false }
            ]
        });
        return response.value;
    }
}