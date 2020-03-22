import express from 'express';

import UserModel, { IUser } from '../../models/UserModel';
import { handleAuth, handleRole } from '../middleware';

const UserRouter = express.Router();

UserRouter.get('/', handleAuth, handleRole.getRole, (req: any, res, next) => {
  if (!req.payload.role) return res.sendStatus(401);
  if (req.payload.role === 'Admin') return next();

  UserModel.findById(req.payload.id)
    .then((user: IUser) => res.status(200).json({ user: user.toBasicJSON() }));
}, (_req, res) => {
  UserModel.find({}).sort({ role: 'asc', username: 'asc' }).then((users) => {
    const basicUsers = users.map((user) => user.toBasicJSON());

    const mappedUsers: any = {};
    basicUsers.forEach((user) => {
      mappedUsers[user.username] = user;
    });

    return res.status(200).json({ users: mappedUsers });
  });
});

UserRouter.get('/:username', handleAuth, handleRole.getRole, (req: any, res, next) => {
  if (!req.payload.role) return res.sendStatus(401);
  if (req.payload.role === 'Admin') return next();

  if (req.payload.username !== req.params.username) return res.sendStatus(403);

  UserModel.findOne({ username: req.params.username })
    .then((user: IUser) => res.status(200).json({ user: user.toBasicJSON() }));
}, (req, res) => {
  UserModel.findOne({ username: req.params.username }).then((user: IUser) => {
    if (!user) return res.sendStatus(404);

    return res.status(200).json({ user: user.toBasicJSON() });
  });
});

UserRouter.delete('/:username', handleAuth, handleRole.admin, (req, res) => {
  const { username } = req.params;

  UserModel.deleteOne({ username })
    .then((result) => {
      if (result.n < 1) return res.sendStatus(404);
      if (result.ok === 1 && result.deletedCount > 0) {
        return res.status(200).json({ deleted: username });
      }
    });
});

export default UserRouter;
