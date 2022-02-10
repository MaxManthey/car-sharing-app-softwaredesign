import { ObjectId } from "mongodb";

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
}