import request from "supertest";
import { app } from "../../app";

it ('responds with a cookie when given valid credentials', async ()=> {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'email@email.com',
      password: 'password'
    })
    .expect(201)

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'email@email.com',
      password: 'password'
    })
    .expect(200)
  expect(response.get('Set-Cookie')).toBeDefined();
})

it ('fails when using non-existing email', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'myemail@email.com',
      password: 'password'
    })
    .expect(400)
})

it ('fails when incorrect password is supplied', async ()=> {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'email@email.com',
      password: 'password'
    })
    .expect(201)

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'email@email.com',
      password: 'passwords'
    })
    .expect(400)
})
