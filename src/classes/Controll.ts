import { User } from "./User";
import { Database } from "./Database";
import prompts from "prompts";

export class Controll {
    private user: User;
    
    constructor(user: User) {
        this.user = user;
    }

    public startControll() {
        console.log('Welcome', 'username') //TODO change to username

        //TODO connect DB
        //TODO check if is admin, user or unregistered
        //TODO disconnect DB
    }

    public async adminOptions() {} //TODO loop in here with options (dont forget exit)

    public async userOptions() {} //TODO loop in here with options (dont forget exit)

    public async unregisteredOptions() {} //TODO loop in here with options (dont forget exit)
}