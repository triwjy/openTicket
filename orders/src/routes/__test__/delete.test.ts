import request from 'supertest';
import mongoose from 'mongoose'
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';

it ('returns an error if order is not exist',async () => {
  const orderId = new mongoose.Types.ObjectId()
  await request(app)
    .delete(`/api/orders/${orderId}`)
    .set('Cookie', global.signin())
    .send()
    .expect(404)
});

it ('returns an error the order is not belong to the correct user',async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 10
  });
  await ticket.save();

  const userOne = global.signin();
  const userTwo = global.signin();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticket.id })
    .expect(201)

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', userTwo)
    .send()
    .expect(401);
});

it ('cancels an order upon delete order request',async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 10
  });
  await ticket.save();

  const user = global.signin();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201)

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  const updatedOrder = await Order.findById(order.id)
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
})

it.todo('publish an event when order is cancelled');
