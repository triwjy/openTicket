import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';

const buildTicket = async (title: string, price: number) => {
  const ticket = Ticket.build({ 
    id: new mongoose.Types.ObjectId().toHexString(),
    title, price});
  await ticket.save();

  return ticket
}

it ('fetches orders for a particular user',async () => {
  // Create three tickets
  const ticketOne = await buildTicket('concert1', 5);
  const ticketTwo = await buildTicket('concert2', 10);
  const ticketThree = await buildTicket('concert3', 15);

  const userOne = global.signin();
  const userTwo = global.signin();
  // Create one order as User #1
  await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  // Create two orders as User #2
  const { body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);
  
  const { body: orderThree } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);

  // Make request to get orders for User #2
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .expect(200);

  // Make sure only retrieve orders for User #2
  expect(response.body.length).toEqual(2);
  expect(orderTwo.ticket.id).toEqual(ticketTwo.id);
  expect(orderThree.ticket.id).toEqual(ticketThree.id);

})
