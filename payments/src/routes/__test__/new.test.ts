import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@twtix/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

it ('returns a 404 when purchasing non-existent order', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'adfadf',
      orderId: new mongoose.Types.ObjectId().toHexString()
    })
  .expect(404);
});

it ('returns a 401 when purchasing an order that does not belong to the user',async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 10,
    status: OrderStatus.Created
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'adfadf',
      orderId: order.id
    })
  .expect(401);
});

it ('returns a 400 when purchasing a cancelled order',async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 1,
    price: 10,
    status: OrderStatus.Cancelled
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'adfadf',
      orderId: order.id
    })
  .expect(400);
})

// jest.mock('../../stripe');

it ('returns a 201 with valid inputs',async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 1000);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 1,
    price,
    status: OrderStatus.Created
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);
  
  const stripeCharges = await stripe.charges.list({ limit: 100 });
  const stripeCharge = stripeCharges.data.find(charge => {
    return charge.amount === price
  })

  expect(stripeCharge!.amount).toEqual(price);
  expect(stripeCharge!.currency).toEqual('jpy');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id
  })
  expect(payment).not.toBeNull();
  // [mock version]
  // const chargeOptions = 
  //   (stripe.charges.create as jest.Mock).mock.calls[0][0];
  // expect(chargeOptions.source).toEqual('tok_visa')
  // expect(chargeOptions.amount).toEqual(order.price)
  // expect(chargeOptions.currency).toEqual('jpy')
})
