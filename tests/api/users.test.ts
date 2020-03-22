import request from 'supertest';
import jwt from 'jsonwebtoken';

import { connect, closeDatabase } from '../db-handler';
import { app, server } from '../../src/server';
import UserModel, { IUser } from '../../src/models/UserModel';

beforeAll(async () => connect());

afterAll(async () => {
  closeDatabase();
  server.close();
  await new Promise((resolve) => setTimeout(() => resolve(), 500)); // avoid jest open handle error
});

const agent = request.agent(app);

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

describe('Users Endpoints', () => {
  beforeAll(async () => {
    await UserModel.create([testUser, testAdmin])
      .then((value) => {
        testUser = new UserModel(value[0]);
        testAdmin = new UserModel(value[1]);
      });
  });

  describe('GET /api/users', () => {
    test('should return user with user token', async () => {
      const res = await agent
        .get('/api/users')
        .set('Accept', 'application/json')
        .set('Authorization', testUser.generateJWT());

      expect(res.status).toBe(200);
      expect(res.body.user).toStrictEqual(testUser.toBasicJSON());
    });

    test('should return all users with admin token', async () => {
      const res = await agent
        .get('/api/users')
        .set('Accept', 'application/json')
        .set('Authorization', testAdmin.generateJWT());

      const keys = Object.keys(res.body.users);

      expect(res.status).toBe(200);
      expect(keys.length).toBe(2);
      expect(keys.includes(testUser.username)).toBeTruthy();
      expect(keys.includes(testAdmin.username)).toBeTruthy();
    });

    test('should return 401 with wrong token', async () => {
      const fakeToken = jwt.sign({
        id: Math.random().toString(36).substring(5),
        username: Math.random().toString(36).substring(5),
      }, process.env.secret, { expiresIn: '1h' });

      const res = await agent
        .get('/api/users')
        .set('Accept', 'application/json')
        .set('Authorization', fakeToken);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/users/:username', () => {
    test('should return user with user token', async () => {
      const res = await agent
        .get(`/api/users/${testUser.username}`)
        .set('Accept', 'application/json')
        .set('Authorization', testUser.generateJWT());

      expect(res.status).toBe(200);
      expect(res.body.user).toStrictEqual(testUser.toBasicJSON());
    });

    test('should return user with admin token', async () => {
      const res = await agent
        .get(`/api/users/${testUser.username}`)
        .set('Accept', 'application/json')
        .set('Authorization', testAdmin.generateJWT());

      expect(res.status).toBe(200);
      expect(res.body.user).toStrictEqual(testUser.toBasicJSON());
    });

    test('should return 403 with user token', async () => {
      const res = await agent
        .get(`/api/users/${testAdmin.username}`)
        .set('Accept', 'application/json')
        .set('Authorization', testUser.generateJWT());

      expect(res.status).toBe(403);
    });

    test('should return 404 with admin token', async () => {
      const random = Math.random().toString(36).substring(5);

      const res = await agent
        .get(`/api/users/${random}`)
        .set('Accept', 'application/json')
        .set('Authorization', testAdmin.generateJWT());

      expect(res.status).toBe(404);
    });

    test('should return 401 with wrong token', async () => {
      const fakeToken = jwt.sign({
        id: Math.random().toString(36).substring(5),
        username: Math.random().toString(36).substring(5),
      }, process.env.secret, { expiresIn: '1h' });

      const res = await agent
        .get(`/api/users/${testUser.username}`)
        .set('Accept', 'application/json')
        .set('Authorization', fakeToken);

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/users/:username', () => {
    test('should return 200 with admin token', async () => {
      const res = await agent
        .delete(`/api/users/${testUser.username}`)
        .set('Accept', 'application/json')
        .set('Authorization', testAdmin.generateJWT());

      expect(res.status).toBe(200);
      expect(res.body.deleted).toBe(testUser.username);
    });

    test('should return 403 with user token', async () => {
      const res = await agent
        .delete(`/api/users/${testUser.username}`)
        .set('Accept', 'application/json')
        .set('Authorization', testUser.generateJWT());

      expect(res.status).toBe(403);
    });

    test('should return 404 with unknown username', async () => {
      const random = Math.random().toString(36).substring(5);

      const res = await agent
        .delete(`/api/users/${random}`)
        .set('Accept', 'application/json')
        .set('Authorization', testAdmin.generateJWT());

      expect(res.status).toBe(404);
    });
  });
});
