import { ObjectId } from "mongodb";

export class Journey {
    private _id: ObjectId;
    private userId: ObjectId;
    private carId: ObjectId;
    private description: string;
    private dateStart: string;
    private timeStart: string;
    private duration: number;
    private costAmount: number;

    constructor(id: ObjectId, userId: ObjectId, carId: ObjectId, description: string, dateStart: string, timeStart: string, duration: number, costAmount: number) {
        this._id = id;
        this.userId = userId;
        this.carId = carId;
        this.description = description;
        this.dateStart = dateStart;
        this.timeStart = timeStart; 
        this.duration = duration;
        this.costAmount = costAmount;
    }

    public getId(): ObjectId { return this._id; }

    public getUserId(): ObjectId { return this.userId; }

    public getCarId(): ObjectId { return this.carId; }

    public getDescription(): string { return this.description; }

    public getDateStart(): string { return this.dateStart; }

    public getTimeStart(): string { return this.timeStart; }

    public getDuration(): number { return this.duration; }

    public getCostAmount(): number { return this.costAmount; }

    public displayJourney(): void {
        console.log('Car description:', this.description);
        console.log('Journey date:\t', new Date(this.dateStart).toDateString());
        console.log('Journey time:\t', this.timeStart);
        console.log('Duration:\t', this.duration + "min");
        console.log('Total cost:\t', this.costAmount + "EUR");
    }
}