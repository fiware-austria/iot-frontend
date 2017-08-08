# Angular Full Stack [![Dependencies](https://david-dm.org/DavideViolante/Angular2-Full-Stack.svg)](https://david-dm.org/DavideViolante/Angular2-Full-Stack) [![Donate](https://img.shields.io/badge/paypal-donate-179BD7.svg)](https://www.paypal.me/dviolante) [![MIT license](http://img.shields.io/badge/license-MIT-lightgrey.svg)](http://opensource.org/licenses/MIT)

This project is based on Davide Violantes [Angular Full Stack](https://github.com/DavideViolante/Angular-Full-Stack) starter project. 
The major difference to the original project is that server- and client-side are all tested with _jest_. Additionally this project
integrates _passport_ for validating the JWT token and supporting OAuth authentication (it actually features a github example).

The frontend is generated with [Angular CLI](https://github.com/angular/angular-cli). The backend is made from scratch. Whole stack in [TypeScript](https://www.typescriptlang.org).

This project uses the [MEAN stack](https://en.wikipedia.org/wiki/MEAN_(software_bundle)):
* [**M**ongoose.js](http://www.mongoosejs.com) ([MongoDB](https://www.mongodb.com)): database
* [**E**xpress.js](http://expressjs.com): backend framework
* [**A**ngular 4](https://angular.io): frontend framework
* [**N**ode.js](https://nodejs.org): runtime environment

Other tools and technologies used:
* [Angular CLI](https://cli.angular.io): frontend scaffolding
* [Bootstrap](http://www.getbootstrap.com): layout and styles
* [Font Awesome](http://fontawesome.io): icons
* [JSON Web Token](https://jwt.io): user authentication
* [Angular 2 JWT](https://github.com/auth0/angular2-jwt): JWT helper for Angular
* [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js): password encryption
* [Passport](http://passportjs.org/): various authentication strategies
* [Jest](https://facebook.github.io/jest/): delightful JavaScript testing

## Prerequisites
1. Install [Node.js](https://nodejs.org), [Yarn](https://yarnpkg.com/lang/en/) and [MongoDB](https://www.mongodb.com)
2. Install Angular CLI: `npm i -g @angular/cli`
3. From project root folder install all the dependencies: `npm i`

## Run
### Development mode
`npm run dev`: [concurrently](https://github.com/kimmobrunfeldt/concurrently) execute MongoDB, Angular build, TypeScript compiler and Express server.

A window will automatically open at [localhost:4200](http://localhost:4200). Angular and Express files are being watched. Any change automatically creates a new bundle, restart Express server and reload your browser.

### Production mode
`npm run prod`: run the project with a production bundle and AOT compilation listening at [localhost:3000](http://localhost:3000) 

## Deploy (Heroku)
1. Go to Heroku and create a new app
2. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-command-line)
3. `heroku login`
4. `cd my-project/`
5. `git init`
6. `heroku git:remote -a your-app-name`
7. Download this repo and copy all files into `my-project` folder
8. Edit `.gitignore` and remove line with `/dist`
9. Edit `.env` and replace the MongoDB URI with a real remote MongoDB server. You can create a MongoDB server with Heroku or mLab.
10. `npm i`
11. `ng build -prod` or `ng build -aot -prod`
12. `tsc -p server`
13. `git add .`
14. `git commit -m "Going to Heroku"`
15. `git push heroku master`
16. `heroku open`
17. A window will open with your app online

## Preview
![Preview](https://raw.githubusercontent.com/DavideViolante/Angular2-Full-Stack/master/demo.gif "Preview")

## Please open an issue if
* you have any suggestion to improve this project
* you noticed any problem or error
* you have a question

## To do
* More tests

## Running unit tests
Run `yarn test` to execute the client-side (Angular4) unit tests via [Jest](https://facebook.github.io/jest/).
To run the server-side (node/express) tests run `yarn test-srv`

If you need to debug your server-side tests there's `yarn compile-tests` that will generate JavaScript
in the folder `/test-out-tsc` (e.g. _Webstorm_ requires JS file with source maps for debugging). 
Besides this you will also need to modify the `roots` configuration in the `jest` section of your `package.json` file
in order to load these tests instead of the `typescript` version:

```json
"jest": {
    ...
    "roots": [
      "test-out-tsc",
      "server"
    ]
  }
```

## Running end-to-end tests
Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/). 
Before running the tests make sure you are serving the app via `npm start`.

## Running TSLint
Run `ng lint` (frontend) and `npm run lintbe` (backend) to execute the linter via [TSLint](https://palantir.github.io/tslint/).

## Further help
To get more help on the `angular-cli` use `ng --help` or go check out the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

To get more help about this project, [visit the wiki](https://github.com/DavideViolante/Angular-Full-Stack/wiki).

### Author
* [AnotherCodeArtist](https://github.com/AnotherCodeArtist/angular4-full-stack) 
* Original Project: [Davide Violante](https://github.com/DavideViolante)
