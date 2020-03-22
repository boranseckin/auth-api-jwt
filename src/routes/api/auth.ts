import express from 'express';

import UserModel, { IUser } from '../../models/UserModel';

const AuthRouter = express.Router();

AuthRouter.post('/login', (req, res, next) => {
  if (!req.body.user) return next({ status: 400, message: 'User info is not supplied' });

  const { username, password, email } = req.body.user;

  if (!username && !email) return next({ status: 400, message: 'Username/Email is not supplied' });
  if (!password) return next({ status: 400, message: 'Password is not supplied' });

  const querry = username ? { username } : { email: email.toLowerCase() };

  UserModel.findOne(querry)
    .then((user: any) => {
      if (!user) return res.sendStatus(401);

      if (user.validatePassword(password)) {
        return res.status(200).json({ user: user.toAuthJSON() });
      }

      return res.sendStatus(401);
    });
});

AuthRouter.post('/signup', (req, res, next) => {
  if (!req.body.user) return next({ status: 400, message: 'User info is not supplied' });

  const {
    username,
    password,
    email,
  } = req.body.user;

  if (!username) return next({ status: 400, message: 'Username is not supplied' });
  if (!password) return next({ status: 400, message: 'Password is not supplied' });
  if (!email) return next({ status: 400, message: 'Email is not supplied' });

  const user: IUser = new UserModel();

  user.username = username;
  user.email = email.toLowerCase();
  user.role = 'User';

  user.setPassword(password);

  user.save()
    .then(() => {
      res.json({ user: user.toAuthJSON() });
    })
    .catch((err: any) => {
      if (err.code === 11000) {
        if (err.errmsg.includes(username)) return next({ status: 400, message: 'This username already exists' });
        if (err.errmsg.includes(email.toLowerCase())) return next({ status: 400, message: 'This email already exists' });
      }
    });
});

export default AuthRouter;
