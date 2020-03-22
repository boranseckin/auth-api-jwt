import request from 'supertest';

import { connect, closeDatabase, clearDatabase } from '../db-handler';
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

describe('Auth Endpoints', () => {
  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      await UserModel.create(testUser)
        .then((value) => {
          testUser = new UserModel(value);
        });
    });

    afterAll(async () => {
      await clearDatabase();
    });

    test('return 200 and AuthJSON with correct username and password', async () => {
      const res = await agent
        .post('/api/auth/login')
        .set('Accept', 'application/json')
        .send({
          user: {
            username: testUser.username,
            password,
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.user).toStrictEqual(testUser.toAuthJSON());
    });

    test('return 200 and AuthJSON with correct email and password', async () => {
      const res = await agent
        .post('/api/auth/login')
        .set('Accept', 'application/json')
        .send({
          user: {
            email: testUser.email,
            password,
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.user).toStrictEqual(testUser.toAuthJSON());
    });

    test('return 400 without user data', async () => {
      const res = await agent
        .post('/api/auth/login')
        .set('Accept', 'application/json')
        .send({});

      expect(res.status).toBe(400);
    });

    test('return 400 without password', async () => {
      const res = await agent
        .post('/api/auth/login')
        .set('Accept', 'application/json')
        .send({
          user: {
            username: testUser.username,
          },
        });

      expect(res.status).toBe(400);
    });

    test('return 400 without username or email', async () => {
      const res = await agent
        .post('/api/auth/login')
        .set('Accept', 'application/json')
        .send({
          user: {},
        });

      expect(res.status).toBe(400);
    });

    test('return 401 with unknown username', async () => {
      const random = Math.random().toString(36).substring(5);

      const res = await agent
        .post('/api/auth/login')
        .set('Accept', 'application/json')
        .send({
          user: {
            username: random,
            password,
          },
        });

      expect(res.status).toBe(401);
    });

    test('return 401 with wrong password', async () => {
      const random = Math.random().toString(36).substring(5);

      const res = await agent
        .post('/api/auth/login')
        .set('Accept', 'application/json')
        .send({
          user: {
            username: testUser.username,
            password: random,
          },
        });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/signup', () => {
    test('return 200 and AuthJSON with correct user data', async () => {
      const res = await agent
        .post('/api/auth/signup')
        .set('Accept', 'application/json')
        .send({
          user: {
            username: testUser.username,
            password,
            email: testUser.email,
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.user.username).toBe(testUser.username);
      expect(res.body.user.email).toBe(testUser.email);
    });

    test('return 400 without user data', async () => {
      const res = await agent
        .post('/api/auth/signup')
        .set('Accept', 'application/json')
        .send({});

      expect(res.status).toBe(400);
    });

    test('return 400 without username', async () => {
      const res = await agent
        .post('/api/auth/signup')
        .set('Accept', 'application/json')
        .send({
          user: {
            password,
            email: testUser.email,
          },
        });

      expect(res.status).toBe(400);
    });

    test('return 400 without password', async () => {
      const res = await agent
        .post('/api/auth/signup')
        .set('Accept', 'application/json')
        .send({
          user: {
            username: testUser.username,
            email: testUser.email,
          },
        });

      expect(res.status).toBe(400);
    });

    test('return 400 without email', async () => {
      const res = await agent
        .post('/api/auth/signup')
        .set('Accept', 'application/json')
        .send({
          user: {
            username: testUser.username,
            password,
          },
        });

      expect(res.status).toBe(400);
    });

    test('return 400 with an existing username', async () => {
      const random = Math.random().toString(36).substring(5);

      const res = await agent
        .post('/api/auth/signup')
        .set('Accept', 'application/json')
        .send({
          user: {
            username: testUser.username,
            password,
            email: `${random}@test.com`,
          },
        });

      expect(res.status).toBe(400);
    });

    test('return 400 with an existing email', async () => {
      const random = Math.random().toString(36).substring(5);

      const res = await agent
        .post('/api/auth/signup')
        .set('Accept', 'application/json')
        .send({
          user: {
            username: random,
            password,
            email: testUser.email,
          },
        });

      expect(res.status).toBe(400);
    });
  });
});
