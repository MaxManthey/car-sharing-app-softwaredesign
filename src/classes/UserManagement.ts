import prompts from "prompts";

export class UserManagement {
    public async login(): Promise<boolean> { //TODO Change to User
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
        console.log(providedUsername, providedPassword);
        
        let loginFailed = false;
        if(providedUsername == undefined || providedPassword == undefined) {
            console.log("Username and password can't be undefined");
            loginFailed = true;
        } else {
            //TODO check if user exists and password matches
        }

        if(loginFailed) {
            const repeatLoginResponse = await prompts({
                type: 'select',
                name: 'value',
                message: 'Would you like to try again or exit the app?',
                choices: [
                    { title: 'Try again', value: 'repeat' },
                    { title: 'Exit', value: 'exit'}
                ]
            });

            if(repeatLoginResponse.value == 'repeat') {
                return this.login();
            } else {
                return false;
            }
        } else {
            return true;
        }

        //TODO If not ask to repeat or leave app
        
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
            hint: 'The username can only contain letters and numbers and must be at least 2 characters long'
        });

        //TODO Check if username exists
        
        if(response.username == undefined) {
            console.log('Username can\'t be undefinded please try again');
            return await this.checkUsername();
        } else if(!/^[A-Za-z\d]{2,}$/.test(response.username)) {
            console.log('The username can only contain letters and numbers and must be at least 2 characters long');
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
              hint: 'Your password must contain at least 4 characters, 1 letter and 1 number'
            },
            {
              type: 'password',
              name: 'repeatPassword',
              message: 'Please repeat the password'
            }
        ];
        const response = await prompts(questions);

        if(response.password == undefined) {
            console.log('Password can\'t be undefined please try again');
            return await this.checkPassword();
        } else if(response.password != response.repeatPassword) {
            console.log('Your passwords didn\'t match please try again');
            return await this.checkPassword();
        } else if(!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,}$/.test(response.password)) {
            console.log('Your password must contain at least 4 characters, 1 letter and 1 number');
            return await this.checkPassword();
        }else {
            return response.password;
        }
    }
}