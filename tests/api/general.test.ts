import request from 'supertest';

import { app, server } from '../../src/server';

const agent = request.agent(app);

afterAll(async () => {
  server.close();
  await new Promise((resolve) => setTimeout(() => resolve(), 500));
});

describe('General Endpoints', () => {
  test('/api should return 200', async () => {
    const res = await agent
      .get('/api');
    expect(res.status).toBe(200);
  });

  test('/teapot should return 418', async () => {
    const res = await agent
      .get('/teapot');
    expect(res.status).toBe(418);
  });

  test('/foo should return 404', async () => {
    const res = await agent
      .get('/foo');
    expect(res.status).toBe(404);
  });

  test('/api/auth/signup should return 503 without DB connection', async () => {
    const username = Math.random().toString(36).substring(5);
    const password = Math.random().toString(36).substring(5);

    const res = await agent
      .post('/api/auth/signup')
      .set('Accept', 'application/json')
      .send({
        user: {
          username,
          password,
          email: `${username}@test.com`,
        },
      });

    expect(res.status).toBe(503);
  }, 10000);
});
