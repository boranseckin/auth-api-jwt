import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';

import UserRouter from './routes/api/users';
import AuthRouter from './routes/api/auth';

export const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(methodOverride());

// Handle request and response timeouts
app.use((req, res, next) => {
  req.setTimeout(5000, () => {
    const err = {
      message: 'Request Timeout',
      status: 408,
    };
    next(err);
  });

  res.setTimeout(5000, () => {
    const err = {
      message: 'Service Unavailable',
      status: 503,
    };
    next(err);
  });

  next();
});

// Handle teapot
app.get('/teapot', (_req, res) => {
  res.status(418).send('I\'m a teapot');
});

// Send a confirmation (for test purposes)
app.get('/api', (_req, res) => {
  res.status(200).send('API works.');
});

// Use routers
app.use('/api/auth', AuthRouter);
app.use('/api/users', UserRouter);

// If there is no route, send 404
app.use((req, res) => {
  res.sendStatus(404);
});

// Handle errors
app.use((err: any, _req: any, res: any, _next: any) => {
  res.status(err.status || 500);
  res.json({ message: err.message });
});

export const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
server.setTimeout(10000);
