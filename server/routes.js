var express = require('express');
var cat_1 = require('./controllers/cat');
var user_1 = require('./controllers/user');
function setRoutes(app, passport) {
    var router = express.Router();
    var catCtrl = new cat_1["default"]();
    var userCtrl = new user_1["default"]();
    var jwtAuth = passport.authenticate('jwt', { session: false });
    app.use(passport.initialize());
    // Cats
    router.route('/cats').get(catCtrl.getAll);
    router.route('/cats/count').get(jwtAuth, catCtrl.count);
    router.route('/cat').post(jwtAuth, catCtrl.insert);
    router.route('/cat/:id').get(catCtrl.get);
    router.route('/cat/:id').put(catCtrl.update);
    router.route('/cat/:id').delete(catCtrl.delete);
    // Users
    router.route('/login').post(userCtrl.login);
    router.route('/users').get(userCtrl.getAll);
    router.route('/users/count').get(userCtrl.count);
    router.route('/user').post(userCtrl.insert);
    router.route('/user/:id').get(userCtrl.get);
    router.route('/user/:id').put(userCtrl.update);
    router.route('/user/:id').delete(userCtrl.delete);
    // GitHub Login
    router.route('/auth/github').get(passport.authenticate('github'));
    router.route('/auth/github/callback').get(passport.authenticate('github', { failureRedirect: '/login', session: false }), function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });
    // Apply the routes to our application with the prefix /api
    app.use('/api', router);
}
exports["default"] = setRoutes;
