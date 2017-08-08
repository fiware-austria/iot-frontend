var bodyParser = require('body-parser');
var express = require('express');
var morgan = require('morgan');
var path = require('path');
var routes_1 = require('./routes');
var dotenv = require('dotenv');
var passport_jwt_1 = require('passport-jwt');
var github = require('passport-github');
var passport = require('passport');
var user_1 = require('./models/user');
dotenv.load('.env');
var jwtOpts = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    secretOrKey: process.env.SECRET_TOKEN
};
var app = express();
exports.app = app;
// Register JWT Strategy
passport.use(new passport_jwt_1.Strategy(jwtOpts, function (jwtPayload, done) {
    console.log(JSON.stringify(jwtPayload));
    user_1["default"].findOne({ _id: jwtPayload.user._id })
        .then(function (user) { return done(null, user); })
        .catch(done);
}));
// Register GitHub Strategy
passport.use(new github.Strategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHIB_CALLBACK_URL,
    session: false,
    scope: 'user:email'
}, function (accessToken, refreshToken, profile, done) { return done(null, profile); }));
app.set('port', (process.env.PORT || 3000));
app.use('/', express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));
routes_1["default"](app, passport);
console.log('Registered Routes');
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});
