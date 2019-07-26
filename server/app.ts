import bodyParser from 'body-parser';

import express from 'express';
import morgan from 'morgan';

import path from 'path';

import setRoutes from './routes';

import {Strategy, ExtractJwt} from 'passport-jwt';
import * as github from 'passport-github';
import passport from 'passport';

import User from './models/user';
import {catSystem} from './config';

const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
  secretOrKey: process.env.SECRET_TOKEN
};

const app = express();

// Register JWT Strategy
passport.use(new Strategy(jwtOpts, (jwtPayload, done) => {
  // console.log(JSON.stringify(jwtPayload));
  User.findOne({_id: jwtPayload.user._id})
    .then((user) => done(null, user))
    .catch(done);
}));

// Register GitHub Strategy
/*
passport.use(new github.Strategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHIB_CALLBACK_URL,
    session: false,
    scope: 'user:email'
  },
  (accessToken, refreshToken, profile, done) =>
    User.findOrCreate(profile).then(user => done(null, user)).catch(done)
  )
);
*/


app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({extended: false}));



app.use(morgan('dev'));


setRoutes(app, passport);
catSystem.info('Registered Routes');
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});


export {app};
