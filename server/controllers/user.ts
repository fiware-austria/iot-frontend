import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';

import User from '../models/user';
import BaseCtrl from './base';

export default class UserCtrl extends BaseCtrl {

  model = User;

  login = (req, res) => {
    this.model.findOne({ email: req.body.email, provider: 'local' }, (err, user) => {
      if (!user) { return res.sendStatus(403); }
      user.comparePassword(req.body.password, (error, isMatch) => {
        if (!isMatch) { return res.sendStatus(403); }
        const token = jwt.sign({ user: user }, process.env.SECRET_TOKEN); // , { expiresIn: 10 } seconds
        res.status(200).json({ token: token });
      });
    });
  };

  insert = (req, res) =>  {
    try {
      req.body.role = 'user';
      req.body.provider = 'local';
      const obj = new this.model(req.body);
      obj.save((err, item) => {
        // 11000 is the code for duplicate key error
        if (err && err.code === 11000) {
          res.sendStatus(400);
        }
        if (err) {
          return console.error(err);
        }
        res.status(200).json(item);
      });
    } catch (err) {
      res.status(400).json(err)
    }
  }

}