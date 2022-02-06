import mongoose from 'mongoose';

import { app } from './app';

const PORT = 3000;
const HOST = '0.0.0.0';

const start = async () => {
  console.log('Starting up Auth Service...');
  
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
    console.log(`Auth service is listening on port ${PORT}`);
  });
};

start();