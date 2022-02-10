import prompts from "prompts";
import { ObjectId } from "mongodb";
import { User } from "./User";
import { globalDatabase } from "./Main";

export class Admin extends User {
    constructor(id: ObjectId, username: string, password: string, isAdmin: boolean, journies: ObjectId[]) {
        super(id, username, password, isAdmin, journies);
    }

    public async addCar(): Promise<void> {
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