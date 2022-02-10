import { ObjectId } from "mongodb";
import { globalDatabase } from "./Main";
export class Car {
    private _id: ObjectId;
    private drive: string;
    private description: string;
    private earliestUseTime: string;
    private latestUseTime: string;
    private maxUseTime: number;
    private flatFee: number;
    private pricePerMinute: number;

    constructor(id: ObjectId, drive: string, description: string, earliestUseTime: string, latestUseTime: string, maxUseTime: number, flatFee: number, pricePerMinute: number) {
        this._id = id;
        this.drive = drive;
        this.description = description;
        this.earliestUseTime = earliestUseTime;
        this.latestUseTime = latestUseTime;
        this.maxUseTime = maxUseTime;
        this.flatFee = flatFee;
        this.pricePerMinute = pricePerMinute;
    }

    public getId(): ObjectId { return this._id; }

    public getDrive(): string { return this.drive; }

    public getDescription(): string { return this.description; }

    public getEarliestUseTime(): string { return this.earliestUseTime; }
    
    public getLatestUseTime(): string { return this.latestUseTime; }

    public getMaxUseTime(): number { return this.maxUseTime; }

    public getFlatFee(): number { return this.flatFee; }

    public getPricePerMinute(): number { return this.pricePerMinute; }

    public displayInformation(): void {
        console.log('Description \t', this.description);
        console.log('Drive \t\t', this.drive);
        console.log('Flat fee \t', this.flatFee);
        console.log('Price per min \t', this.pricePerMinute);
        console.log('-> Earliest time available\t', this.earliestUseTime);
        console.log('-> Latest time available \t', this.latestUseTime);
        console.log('-> Maximum time available \t', this.maxUseTime, (this.maxUseTime == 1 ? 'minute' : 'minutes'));
    }

    public providedDateTimeMatch(hour: number, minute: number, duration: number): boolean {
        if(duration > this.maxUseTime) {
            console.log('The provided duration was too long.')
            return false;
        }

        const earliestTimeArr = this.earliestUseTime.split(':').map(time => parseInt(time));
        const latestTimeArr = this.latestUseTime.split(':').map(time => parseInt(time));
        
        if(earliestTimeArr[0] > hour || (earliestTimeArr[0] == hour && earliestTimeArr[1] > minute)) {
            console.log('The provided starting time was below the minimum')
            return false;
        }

        const updatedTime: any = this.addDurationToTime(hour, minute, duration);
        if(updatedTime.hour > 23) {
            console.log('The provided duration was too long.')
            return false;
        }

        if(latestTimeArr[0] < updatedTime.hour || (latestTimeArr[0] == updatedTime.hour && latestTimeArr[1] < updatedTime.minute)) {
            console.log('The provided duration was too long.')
            return false;
        }

        return true;
    }

    public async carNotBookedYet(dateStart: Date, hour: number, minute: number, duration: number) {
        const journiesBooked: any = await globalDatabase.getJourniesByCarIdAndDate(this._id, dateStart);
        if(journiesBooked.length == 0) {
            return true;
        }

        const chosenMinDate: number = Date.parse(new Date(dateStart.getFullYear(), dateStart.getMonth(), dateStart.getDate(), hour, minute).toISOString());
        const chosenUpdatedTime: any = this.addDurationToTime(hour, minute, duration);
        if(chosenUpdatedTime.hour > 23) {
            return false;
        }
        const chosenMaxDate: number = Date.parse(new Date(dateStart.getFullYear(), dateStart.getMonth(), dateStart.getDate(), chosenUpdatedTime.hour, chosenUpdatedTime.minute).toISOString());
        for(const journey of journiesBooked) {
            const journeyTime: number[] = journey.timeStart.split(':').map(time => parseInt(time));
            const journeyHour: number = journeyTime[0];
            const journeyMinute: number = journeyTime[1];
            const journeyDate: Date = new Date(journey.dateStart);
            const journeyMinDate: number = Date.parse(new Date(journeyDate.getFullYear(), journeyDate.getMonth(), journeyDate.getDate(), journeyHour, journeyMinute).toISOString());
            const journeyUpdatedTime: any = this.addDurationToTime(journeyHour, journeyMinute, duration);
            const journeyMaxDate = Date.parse(new Date(journeyDate.getFullYear(), journeyDate.getMonth(), journeyDate.getDate(), journeyUpdatedTime.hour, journeyUpdatedTime.minute).toISOString());
            if((journeyMinDate <= chosenMinDate && journeyMaxDate >= chosenMinDate) || (journeyMinDate <= chosenMaxDate && journeyMaxDate >= chosenMaxDate)) {
                console.log('Sorry but someone else has booked that car at your preferred timeslot.')
                return false;
            }
        }

        return true;
    }

    private addDurationToTime(hour, minute, duration): object {
        if(duration > 59) {
            minute += duration % 60;
            duration -= duration % 60;
            hour += duration / 60;
        } else {
            minute += duration % 60;
        }
        if(minute > 59) {
            minute = minute % 60;
            hour += 1;
        }
        return { hour, minute };
    }
}