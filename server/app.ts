import * as bodyParser from 'body-parser';

import * as express from 'express';
import * as morgan from 'morgan';

import * as path from 'path';

import setRoutes from './routes';
// import * as dotenv from 'dotenv';

import {Strategy, ExtractJwt} from 'passport-jwt';
import * as github from 'passport-github';
import * as passport from 'passport';

import User from './models/user';
import chatRoutes from './chat-routes';

// dotenv.load('.env');

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

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));



app.use(morgan('dev'));

const ioServer = chatRoutes(app);
setRoutes(app, passport);
console.log('Registered Routes');
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});


export {app, ioServer};
