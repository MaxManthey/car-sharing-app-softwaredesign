import prompts from "prompts";
import * as Mongo from "mongodb";
import { UserManagement } from "./UserManagement";
import { Controll } from "./Controll";
import { User } from "./User";
import { Database } from "./Database";
import { NullUser } from "./NullUser";

export const globalDatabase: Database = new Database();
export class Main {
  private static instance: Main = new Main();

  private constructor() {}

  public static getInstance() {
    return this.instance;
  }

  public async main(): Promise<void> {
    const dbConnectionSuccessfull = await globalDatabase.connect();
    if (!dbConnectionSuccessfull) {
      console.log(
        "Error trying to connect to the Database. \nThe application will be stopped."
      );
      return;
    }
    const enterImage = `
        _______
       //  ||\\ \\
 _____//___||_\\ \\___
 )  _          _    \\
 |_/ \\________/ \\___|
___\\_/________\\_/______
`;
    console.log(enterImage);

    console.log("Welcome to CarShare!\n\n");

    while (true) {
      const response = await prompts({
        type: "select",
        name: "value",
        message: "How would you like to proceed?",
        choices: [
          {
            title: "Login",
            description: "Login to your existing account",
            value: "login",
          },
          {
            title: "Register",
            description: "Register a new account",
            value: "register",
          },
          {
            title: "View cars",
            description: "View our available cars",
            value: "viewCars",
          },
          { title: "Quit", description: "Exit the application", value: "exit" },
        ],
      });
      const userChoice = response.value;

      const userManagement = new UserManagement();

      if (userChoice === "login") {
        const userObj: any = await userManagement.login();
        if (JSON.stringify(userObj).length > 2) {
          const controll = new Controll(
            new User(
              userObj._id,
              userObj.username,
              userObj.password,
              userObj.isAdmin
            )
          );
          await controll.startControll();
        } else {
          console.log("Login has been stopped");
        }
      } else if (userChoice === "register") {
        const userObj: any = await userManagement.register();
        if (JSON.stringify(userObj).length > 2) {
          const controll = new Controll(
            new User(
              userObj._id,
              userObj.username,
              userObj.password,
              userObj.isAdmin
            )
          );
          await controll.startControll();
        } else {
          console.log("Login has been stopped");
        }
      } else if (userChoice === "viewCars") {
        const controll = new Controll(
          new NullUser(new Mongo.ObjectId(), "", "", false)
        );
        await controll.startControll();
      } else {
        break;
      }
    }

    await globalDatabase.disconnect();

    const exitImage = `
  ___
    _-_-  _/\\______\\\\__
 _-_-__  / ,-. -|-  ,-.\`-.
    _-_- \`( o )----( o )-'
           \`-'      \`-'
`;
    console.log(exitImage);

    console.log("Thank you for using CarShare!");
    console.log("We hope to see you again soon!");
  }
}
