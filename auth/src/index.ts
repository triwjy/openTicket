import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session';

import { currentUserRouter } from './routes/current-user';
import { signInRouter } from './routes/signin';
import { signUpRouter } from './routes/signup';
import { signOutRouter } from './routes/signout';
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';

const app = express();
// trust traffic that comes from proxy (ingress-nginx)
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
  signed: false,
  secure: true
}));

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signUpRouter);
app.use(signOutRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

const PORT = 3000;
const HOST = '0.0.0.0';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('No signing key: JWT_KEY must be defined')
  }

  try {
    await mongoose.connect('mongodb://auth-mongo-svc:27017/auth')  
    console.log('Connected to auth-mongo-db');
    
  } catch (error) {
    console.log(error);
  }
  app.listen(PORT, HOST, () => {
    console.log(`Listening on port ${PORT}!!`);
  });
};

start();