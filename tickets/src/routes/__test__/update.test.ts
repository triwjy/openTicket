import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

jest.mock('../../nats-wrapper');

it ('returns a 404 if the provided ticket id is not exist',async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
 
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'adfa',
      price: 23
    })
    .expect(404);
})

it ('returns a 401 is user is not authenticated',async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ 
      title: 'adfa',
      price: 23
    })
    .expect(401);

})

it ('returns a 401 if user does not own the ticket',async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'concert',
      price: 10
    })
    .expect(201)

  const id = response.body.id

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'circus',
      price: 23
    })
    .expect(401);
})

it ('returns a 400 if user provide invalid title or price',async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'concert',
      price: 10
    })
    .expect(201)

  const id = response.body.id

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 23
    })
    .expect(400);  

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', cookie)
    .send({
      title: 'Circus',
      price: -1
    })
    .expect(400);  

})

it ('updates the ticket provided valid inputs',async () => {

  const cookie = global.signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'concert',
      price: 10
    })
    .expect(201)

  const id = response.body.id

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', cookie)
    .send({
      title: 'Circus',
      price: 23
    })
    .expect(200);  
  
  const getResponse = await request(app)
    .get(`/api/tickets/${id}`)
    .send()
    .expect(200)
  
  expect(getResponse.body.title).toEqual('Circus');
  expect(getResponse.body.price).toEqual(23);
})

it ('publishes an event', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'concert',
      price: 10
    })
    .expect(201)

  const id = response.body.id

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', cookie)
    .send({
      title: 'Circus',
      price: 23
    })
    .expect(200);  

  expect(natsWrapper.client.publish).toHaveBeenCalled();
})