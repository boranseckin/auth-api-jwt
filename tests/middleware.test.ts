import express from 'express';
import { ObjectId } from 'mongodb';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import { connect, closeDatabase } from './db-handler';
import UserModel, { IUser } from '../src/models/UserModel';

import {
  getTokenFromHeader,
  verifyToken,
  handleRole,
  handleAuth,
} from '../src/routes/middleware';

const mockReq = (
  token: string = '',
  payload?: any,
) => {
  const req: any = express.request;
  req.headers = {};
  req.headers.authorization = token;
  req.payload = payload || undefined;
  return req;
};

const mockRes = () => {
  const res: any = express.response;
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

const password = Math.random().toString(36).substring(5);

let testUser: IUser = new UserModel({
  username: Math.random().toString(36).substring(5),
  email: Math.random().toString(36).substring(5),
  role: 'User',
});
testUser.setPassword(password);

let testAdmin: IUser = new UserModel({
  username: Math.random().toString(36).substring(5),
  email: Math.random().toString(36).substring(5),
  role: 'Admin',
});
testAdmin.setPassword(password);

const id = Math.random().toString(36).substring(5);
const username = Math.random().toString(36).substring(5);

const token = jwt.sign({
  id,
  username,
}, process.env.secret, { expiresIn: '1h' });

beforeAll(async () => connect());

afterAll(async () => closeDatabase());

describe('Middleware Tests', () => {
  describe('Get Token From header', () => {
    test('return token when sent without a prefix', async () => {
      const req = mockReq(token);
      expect(getTokenFromHeader(req)).toBe(token);
    });

    test('return token when sent with Bearer prefix', async () => {
      const req = mockReq(`Bearer ${token}`);
      expect(getTokenFromHeader(req)).toBe(token);
    });

    test('return token when sent with Token prefix', async () => {
      const req = mockReq(`Token ${token}`);
      expect(getTokenFromHeader(req)).toBe(token);
    });

    test('return null when sent no token', async () => {
      const req = mockReq();
      expect(getTokenFromHeader(req)).toBeNull();
    });
  });

  describe('Verify Token', () => {
    test('resolve with a legit token', async () => {
      const decoded = jwt.decode(token);
      await expect(verifyToken(token)).resolves.toStrictEqual(decoded);
    });

    test('reject with a fake token (malformed)', async () => {
      const random = Math.random().toString(36).substring(5);
      await expect(verifyToken(random)).rejects.toThrowError(JsonWebTokenError);
    });

    test('reject with a fake token (invalid signature)', async () => {
      const random = Math.random().toString(36).substring(5);
      const fakeToken = jwt.sign({
        id,
        username,
      }, random, { expiresIn: '1h' });
      await expect(verifyToken(fakeToken)).rejects.toThrowError(JsonWebTokenError);
    });

    test('reject with a fake token (expired)', async () => {
      const expiredToken = jwt.sign({
        id,
        username,
      }, process.env.secret, { expiresIn: '1' });
      await expect(verifyToken(expiredToken)).rejects.toThrowError(TokenExpiredError);
    });
  });

  describe('Handle Auth', () => {
    test('return decoded object with token', async () => {
      const req = mockReq(token);
      const res = mockRes();
      const next = jest.fn();

      const decoded = jwt.decode(token);

      await handleAuth(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.payload).toStrictEqual(decoded);
    });

    test('return undefined without token', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      await handleAuth(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.payload).toBeUndefined();
    });
  });

  describe('Handle Role', () => {
    beforeAll(async () => {
      await UserModel.create([testUser, testAdmin])
        .then((value) => {
          testUser = new UserModel(value[0]);
          testAdmin = new UserModel(value[1]);
        });
    });

    test('return when admin matches admin role', async () => {
      const payload = {
        id: testAdmin._id,
      };

      const req = mockReq(undefined, payload);
      const res = mockRes();
      const next = jest.fn();

      await handleRole.admin(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('return when admin matches user role', async () => {
      const payload = {
        id: testAdmin._id,
      };

      const req = mockReq(undefined, payload);
      const res = mockRes();
      const next = jest.fn();

      await handleRole.user(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('return when user matches user role', async () => {
      const payload = {
        id: testUser._id,
      };

      const req = mockReq(undefined, payload);
      const res = mockRes();
      const next = jest.fn();

      await handleRole.user(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('throw when user doesn\'t matche admin role', async () => {
      const payload = {
        id: testUser._id,
      };

      const req = mockReq(undefined, payload);
      const res = mockRes();
      const next = jest.fn();

      await handleRole.admin(req, res, next);
      expect(next).toHaveBeenCalledWith({ status: 403, message: 'Insufficient clearance' });
    });

    test('throw when payload is not supplied', async () => {
      const payload = {};

      const req = mockReq(undefined, payload);
      const res = mockRes();
      const next = jest.fn();

      await handleRole.user(req, res, next);
      expect(next).toHaveBeenCalledWith({ status: 403, message: 'Insufficient clearance' });
    });

    test('return User when user is supplied', async () => {
      const payload = {
        id: testUser._id,
      };

      const req = mockReq(undefined, payload);
      const res = mockRes();
      const next = jest.fn();

      await handleRole.getRole(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.payload.role).toBeDefined();
      expect(req.payload.role).toBe('User');
    });

    test('return null when user id is random', async () => {
      const random = new ObjectId();
      const payload = {
        id: random,
      };

      const req = mockReq(undefined, payload);
      const res = mockRes();
      const next = jest.fn();

      await handleRole.getRole(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.payload.role).toBeNull();
    });

    test('return null when user id is undefined', async () => {
      const payload = {
        id: '',
      };

      const req = mockReq(undefined, payload);
      const res = mockRes();
      const next = jest.fn();

      await handleRole.getRole(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.payload.role).toBeNull();
    });
  });
});
