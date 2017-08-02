import * as bodyParser from 'body-parser';

import * as express from 'express';
import * as morgan from 'morgan';

import * as path from 'path';

import setRoutes from './routes';
import * as dotenv from 'dotenv';

import {Strategy, ExtractJwt} from 'passport-jwt';
import * as passport from 'passport';

dotenv.load('.env');

const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
  secretOrKey: process.env.SECRET_TOKEN
};

const app = express();

passport.use(new Strategy(jwtOpts, (jwtPayload, done) => {
  console.log(JSON.stringify(jwtPayload)); done(null, 'Hi!');
}));

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(morgan('dev'));

setRoutes(app, passport);
console.log('Registered Routes');
app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});


export { app };
