import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';

import User from '../models/user';
import BaseCtrl from './base';
import {IUserDocument} from '../models/types';

export default class UserCtrl extends BaseCtrl<IUserDocument> {

  model = User;
  projection = '_id username email';
  listName = 'users';

  login = (req, res) => {
    this.model.findOne({ email: req.body.email, provider: 'local' }, (err, user) => {
      if (!user) { return res.sendStatus(403); }
      user.comparePassword(req.body.password, (error, isMatch) => {
        if (!isMatch) { return res.sendStatus(403); }
        const token = jwt.sign({ user: user }, process.env.SECRET_TOKEN, { expiresIn: '8h'}); // , { expiresIn: 10 } seconds
        res.status(200).json({ token: token });
      });
    });
  };

  setRoleAndProvider = (req, res, next) =>  {
      req.body.role = 'user';
      req.body.provider = 'local';
      next();
  }

}
