import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it ('returns a 404 if the ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  console.log(mongoose.Types.ObjectId.isValid(id));
  
  await request(app)
    .get(`/api/tickets/${id}`)
    .send()
    .expect(404);  
});

it ('returns the ticket if the ticket is found', async () => {
  const title = 'Concert';
  const price = 20;

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title, price })
    .expect(201);

  console.log(response.body);
  

  const getResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(getResponse.body.title).toEqual(title);
  expect(getResponse.body.price).toEqual(price);
});



