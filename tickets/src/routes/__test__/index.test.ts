import request from 'supertest';
import { app } from '../../app';

const createTicket = (title: String, price: Number) => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title, price })
    .expect(201)
}

it ('can fetch list of tickets',async () => {
  await createTicket('Concert', 10);
  await createTicket('Dance', 20);
  await createTicket('Circus', 30);

  const response = await request(app)
    .get('/api/tickets')
    .send()
    .expect(200);

  expect(response.body.length).toEqual(3);
})