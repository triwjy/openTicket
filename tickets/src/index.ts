import mongoose from 'mongoose';

import { app } from './app';

const PORT = 3000;
const HOST = '0.0.0.0';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('No signing key: JWT_KEY must be defined')
  }

  if (!process.env.MONGO_URI) {
    throw new Error('Mongo URI must be defined')
  }

  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log(`Connected to ${process.env.MONGO_URI}`);
    
  } catch (error) {
    console.log(error);
  }
  app.listen(PORT, HOST, () => {
    console.log(`Listening on port ${PORT}!!`);
  });
};

start();