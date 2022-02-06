import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { currentUser, errorHandler, NotAuthorizedError, NotFoundError } from '@twtix/common';
import { indexOrderRouter } from './routes';
import { showOrderRouter } from './routes/show';
import { newOrderRouter } from './routes/new';
import { deleteOrderRouter } from './routes/delete';

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

app.use(indexOrderRouter);
app.use(showOrderRouter);
app.use(newOrderRouter);
app.use(deleteOrderRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app }