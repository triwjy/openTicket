import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it ('returns NotFoundError if order does not exist',async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .get('/api/orders/adfadsf')
    .set('Cookie', global.signin())
    .send()
    .expect(404)
})

it ('returns NotAuthorizedError if user is trying to fetch other users order',async () => {
  // create ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10    
  });
  await ticket.save();

  // make an order with the ticket
  const userOne = global.signin();
  const userTwo = global.signin();
  const { body: order} = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticket.id})
    .expect(201)

  // make a request to fetch the order using other user
  const { body: fetchOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', userTwo)
    .send()
    .expect(401);
})

it ('fetches the order',async () => {
  // create ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10    
  });
  await ticket.save();

  // make an order with the ticket
  const user = global.signin();
  const { body: order} = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id})
    .expect(201)

  // make a request to fetch the order
  const { body: fetchOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);
  
  expect(fetchOrder.id).toEqual(order.id);
})
