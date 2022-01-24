import request from "supertest";
import { app } from "../../app";
import { Ticket } from '../../models/ticket';
import { natsWrapper } from "../../nats-wrapper";

it ('has a route handler listening to /api/ticktes for post requests',async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send({});
  
  expect(response.status).not.toEqual(404);
});

it ('can only be accessed if the user is signed in',async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send({})
  
  expect(response.status).toEqual(401);
});

it ('returns a status other than 401 if user is signed in',async () => {
  const cookie = signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({})

  expect(response.status).not.toEqual(401);
});

it ('returns an error if an invalid title is provided',async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 2
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      price: 2
    })
    .expect(400);

});

it ('returns an error if an invalid price is provided',async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'Concert ticket',
      price: -100
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'Concert ticket',
    })
    .expect(400);
  
});

it ('creates a ticket with valid inputs',async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
  .post('/api/tickets')
  .set('Cookie', global.signin())
  .send({
    title: 'Concert ticket',
    price: 15
  })
  .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(15);
});

it ('published an event',async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'Concert ticket',
      price: 15
    })
    .expect(201);
  
  console.log(natsWrapper);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
})