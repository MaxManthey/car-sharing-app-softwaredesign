# Car-Sharing-App
This is a command line app, implementing a car sharing application, for my Softwaredesign course.  
The project is written in TypeScript and uses a MongoDB Database, hosted on the MongoDB Cloud.

## Installation and Setup
After cloning the project, run `npm i` to install the required dependencies.  
Include a `.env` file on the highest level of the project with the following parameters:  
```
DB_USER=[username]
DB_PASS=[password]
```
Replace `[username]` and `[password]` with the provided credentials.

## Running the project
To compile and run the project, enter `npm run start` or `npm start` into the terminal.  
To run the project after the first compilation, enter `npm run restart` or `npm restart` into the terminal, this should start the project much faster because it's using the previously compiled code.

## Testing the project
To run tests, simply enter `npm run test` or `npm test` into the terminal. 
