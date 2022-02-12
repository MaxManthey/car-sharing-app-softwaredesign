import { ObjectId } from "mongodb"
import { Car } from "../src/classes/Car"

const mockCar = new Car(new ObjectId(), "Gas", "TestCar", "05:45", "22:30", 450, 2, 1);

describe("Testing addDurationToTime method", () => {
    it("should add 2 hours", () => {
        const { hour, minute }: any = mockCar.addDurationToTime(0, 0, 120);

        expect(hour).toBe(2);
        expect(minute).toBe(0);
    });

    it("should add 2 hours, 27mins", () => {
        const { hour, minute }: any = mockCar.addDurationToTime(12, 45, 147);

        expect(hour).toBe(15);
        expect(minute).toBe(12);
    });
})

describe("Testing providedDateTimeMatch method", () => {
    it("should return true", () => {
        const result: boolean = mockCar.providedDateTimeMatch(6, 30, 120);

        expect(result).toBeTruthy();
    });

    it("should return false", () => {
        const result: boolean = mockCar.providedDateTimeMatch(6, 30, 500);

        expect(result).toBeFalsy();
    });

    it("should return false", () => {
        const result: boolean = mockCar.providedDateTimeMatch(5, 44, 120);

        expect(result).toBeFalsy();
    });

    it("should return false", () => {
        const result: boolean = mockCar.providedDateTimeMatch(22, 0, 60);

        expect(result).toBeFalsy();
    });
})