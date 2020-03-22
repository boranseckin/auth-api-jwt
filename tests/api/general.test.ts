import request from 'supertest';

import { app, server } from '../../src/server';

afterAll(async () => {
  server.close();
  await new Promise((resolve) => setTimeout(() => resolve(), 500)); // avoid jest open handle error
});

const agent = request.agent(app);

describe('General Endpoints', () => {
  it('/api should return 200', async () => {
    const res = await agent
      .get('/api');
    expect(res.status).toBe(200);
  });

  it('/teapot should return 418', async () => {
    const res = await agent
      .get('/teapot');
    expect(res.status).toBe(418);
  });

  it('/foo should return 404', async () => {
    const res = await agent
      .get('/foo');
    expect(res.status).toBe(404);
  });
});
