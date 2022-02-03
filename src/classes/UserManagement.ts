import prompts from "prompts";

export class UserManagement {
    public async login(): Promise<void> { //TODO Change to User
        console.log('Please login to your CarShare account');
        const questions = [
            {
              type: 'text',
              name: 'username',
              message: 'What is your username?'
            },
            {
              type: 'password',
              name: 'password',
              message: 'What is your password?'
            }
        ];
        const response = await prompts(questions);
        const providedUsername = response.username;
        const providedPassword = response.password;
        console.log(providedUsername, providedPassword)

        //TODO check if user exists and password matches
        //If not ask to repeat or leave app
    }

    public async register(): Promise<void> { //TODO Change to User
        console.log('Let\'s register a new CarShare account for you');
        
        const providedUsername = await this.checkUsername();
        console.log(providedUsername);

        const providedPassword = await this.checkPassword();
        console.log(providedPassword);
    }

    private async checkUsername(): Promise<string> {
        const response = await prompts({
            type: 'text',
            name: 'username',
            message: 'Please choose a username',
            hint: 'The username can only contain letters and numbers'
        });

        //TODO Check if username exists
        //TODO Check if username is alphanumeric
        //TODO Username min 2 chars
        
        if(response.username === "") {
            console.log('Username is not allowed or already exits');
            return await this.checkUsername();
        } else {
            return response.username;
        }
    }

    private async checkPassword(): Promise<string> {
        const questions = [
            {
              type: 'password',
              name: 'password',
              message: 'Which password would you like to use?',
              hint: 'Your password must contain at least 6 characters, 1 letter and 1 number'
            },
            {
              type: 'password',
              name: 'repeatPassword',
              message: 'Please repeat the password'
            }
        ];
        const response = await prompts(questions);

        //TODO Check password with regex

        if(response.password != response.repeatPassword) {
            console.log('Your passwords didn\'t match please try again');
            return await this.checkPassword();
        } else {
            return response.password;
        }
    }
}