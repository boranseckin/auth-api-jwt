import express from 'express';
import jwt from 'jsonwebtoken';

import UserModel, { IUser } from '../models/UserModel';

const { secret } = process.env;

/**
 * Roles
 */
const roles = {
  admin: ['Admin'],
  user: ['Admin', 'User'],
};

/**
 * Get the Authorization token from the request.
 * @param req Express request
 * @returns JWT token or null.
 */
export function getTokenFromHeader(req: express.Request): string {
  const { authorization } = req.headers;
  if (authorization) {
    if (authorization.startsWith('Bearer') || authorization.startsWith('Token')) {
      return authorization.split(' ')[1];
    }
    return authorization;
  }
  return null;
}

/**
 * Verify the supplied token using the environmental secret.
 * @param token JWT token
 */
export function verifyToken(token: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decode) => {
      if (err) reject(err);
      resolve(decode);
    });
  });
}

/**
 * Find the user from the database and checks if their role
 * matches the requested role.
 * @param reqRole Requested role(s)
 * @param id ID of the user
 * @Example reqRole: ['Admin', 'User']
 */
function verifyRole(reqRole: string[], id: string) {
  return new Promise((resolve, reject) => {
    UserModel.findById(id)
      .then((user: IUser) => {
        if (!user) reject();
        if (reqRole.includes(user.role)) resolve();
        reject();
      })
      .catch(reject);
  });
}

export const handleRole = {
  admin: async (
    req: any,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    await verifyRole(roles.admin, req.payload.id)
      .then(next)
      .catch(() => next({ status: 403, message: 'Insufficient clearance' }));
  },
  user: async (
    req: any,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    await verifyRole(roles.user, req.payload.id)
      .then(() => {
        next();
      })
      .catch(() => {
        next({ status: 403, message: 'Insufficient clearance' });
      });
  },
  getRole: async (
    req: any,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    await UserModel.findById(req.payload.id)
      .then((user: IUser) => {
        if (!user) {
          req.payload.role = null;
          return next();
        }
        req.payload.role = user.role;
        next();
      })
      .catch(() => {
        req.payload.role = null;
        next();
      });
  },
};

export async function handleAuth(
  req: any,
  _res: express.Response,
  next: express.NextFunction,
) {
  await verifyToken(getTokenFromHeader(req))
    .then((decode: object) => {
      req.payload = decode;
      next();
    })
    .catch((err) => {
      next({ status: 403, message: err.message });
    });
}
