import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { currentUser, errorHandler, NotAuthorizedError, NotFoundError } from '@twtix/common';
import { createChargeRouter } from './routes/new';

const app = express();
// trust traffic that comes from proxy (ingress-nginx)
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
  signed: false,
  // dev:
  // secure: process.env.NODE_ENV != 'test'
  secure: false,
}));
app.use(currentUser);

app.use(createChargeRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app }