import * as express from 'express';

import CatCtrl from './controllers/cat';
import UserCtrl from './controllers/user';
import Cat from './models/cat';
import User from './models/user';
import {PassportStatic} from 'passport';
import {Application} from 'express';
import * as jwt from 'jsonwebtoken';



export default function setRoutes(app: Application, passport: PassportStatic) {

  const router = express.Router();

  const catCtrl = new CatCtrl();
  const userCtrl = new UserCtrl();

  const jwtAuth = passport.authenticate('jwt', { session: false});
  const isProfileOwner = (req) => JSON.stringify(req.user._id) === JSON.stringify(req.users._id);
  const isAdmin = (req) => req.user.role === 'admin';
  const isAdminOrProfileOwner = (req) => isAdmin(req) || isProfileOwner(req);
  const checkPermission = condition => (req, res, next) =>
    condition(req) ? next() : res.status(403).send();

  const protectRole = (req, res, next) => {
    if (!isAdmin(req)) {
      delete req.body.role;
    }
    next();
  }

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
  router.route('/users').get(jwtAuth, checkPermission(isAdmin), userCtrl.getAll);
  router.route('/users/count').get(jwtAuth, checkPermission(isAdmin), userCtrl.count);
  router.route('/user').post(userCtrl.insert);
  router.route('/user/:userId').get(jwtAuth, checkPermission(isAdminOrProfileOwner), userCtrl.show);
  router.route('/user/:userId').put(jwtAuth, checkPermission(isAdminOrProfileOwner), protectRole, userCtrl.update);
  router.route('/user/:userId').delete(jwtAuth, checkPermission(isAdmin), userCtrl.delete);

  router.param('userId', userCtrl.load);

  // GitHub Login
  router.route('/auth/github').get(
    passport.authenticate('github'));

  router.route('/auth/github/callback').get(
    passport.authenticate('github', { failureRedirect: '/login' , session: false}),
    (req, res) => {
      // Successful authentication, return JWT token.
      const token = jwt.sign({ user: req.user }, process.env.SECRET_TOKEN); // , { expiresIn: 10 } seconds
      res.status(200).json({ token: token });
    });

  // Apply the routes to our application with the prefix /api
  app.use('/api', router);

}