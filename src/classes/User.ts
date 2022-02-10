import { ObjectId } from "mongodb";
import { Journey } from "./Journey";
import { globalDatabase } from "./Main";
export class User {
    private _id: ObjectId;
    private username: string;
    private password: string;
    private isAdmin: boolean;

    constructor(id: ObjectId, username: string, password: string, isAdmin: boolean) {
        this._id = id;
        this.username = username;
        this.password = password;
        this.isAdmin = isAdmin;
    }

    public getId(): ObjectId { return this._id; }

    public getUsername(): string { return this.username; }

    public getPassword(): string { return this.password; }

    public getIsAdmin(): boolean { return this.isAdmin; }

    public async bookJourney(carId: ObjectId, description: string, dateStart: Date, timeStart: string, duration: number, costAmount: number): Promise<void> {
        await globalDatabase.insertNewJourney(this._id, carId, description, dateStart, timeStart, duration, costAmount);
    }

    public async viewStatistics(): Promise<void> {
        const allJournies: any = await globalDatabase.getUserJournies(this._id);
        const totalAmount = allJournies.reduce((acc, journey) => acc + journey.costAmount, 0);
        console.log("Total sum of fares \t", totalAmount);
        console.log("Amount of fares booked\t", allJournies.length);
        console.log("Average price of fares\t", totalAmount / allJournies.length);
    }

    public async viewUpcomingJournies(): Promise<void> {
        const allJournies: any = await globalDatabase.getUserJournies(this._id);
        const filtedUpcomingJournies: any = allJournies.filter(journey => {
            const journeyDate: Date = new Date(journey.dateStart);
            const journeyTime: string[] = journey.timeStart.split(':');
            return Date.now() < Date.parse(new Date(journeyDate.getFullYear(), journeyDate.getMonth(), journeyDate.getDate(), parseInt(journeyTime[0]), parseInt(journeyTime[1])).toISOString());
        });
        
        if(filtedUpcomingJournies.length == 0) {
            console.log('It seems like you don\'t have any journies coming up. Book one now!');
            return;
        }
        
        this.displayFilteredJournies(filtedUpcomingJournies);
    }

    public async viewPastJournies(): Promise<void> {
        const allJournies: any = await globalDatabase.getUserJournies(this._id);
        const filtedPastJournies: any = allJournies.filter(journey => {
            const journeyDate: Date = new Date(journey.dateStart);
            const journeyTime: string[] = journey.timeStart.split(':');
            return Date.now() > Date.parse(new Date(journeyDate.getFullYear(), journeyDate.getMonth(), journeyDate.getDate(), parseInt(journeyTime[0]), parseInt(journeyTime[1])).toISOString());
        });
        
        if(filtedPastJournies.length == 0) {
            console.log('It seems like you don\'t have any past journies. Book one now!');
            return;
        }
        
        this.displayFilteredJournies(filtedPastJournies);
    }

    private displayFilteredJournies(filteredJournies: any): void {
        let journeyCounter = 0;
        for(const journey of filteredJournies) {
            console.log("--", ++journeyCounter, "--");
            const upcomingJourney = new Journey(journey._id, journey.userId, journey.carId, journey.description, journey.dateStart, journey.timeStart, journey.duration, journey.costAmount);
            upcomingJourney.displayJourney();
        }
    }
}