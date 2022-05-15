import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from 'node-nats-streaming';
import { OrderCreatedListener } from "../order-created-listener"
import { OrderCreatedEvent, OrderStatus } from "@twtix/common";
import mongoose from 'mongoose';

const setup = async() => {
  // Create a listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 10,
    userId: 'safda'
  });
  await ticket.save();

  // Create fake data event object
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: 'aqerq',
    expiresAt: 'adsfads',
    status: OrderStatus.Created,
    ticket: {
        id: ticket.id,
        price: ticket.price,
    },
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, ticket, data, msg };
}

it ('sets the orderId of the ticket',async () => {
  const { listener, ticket, data, msg } = await setup();
  
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it ('acks the message',async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it ('publishes ticket updated event',async () => {
  const { listener, ticket, data, msg } = await setup();
  
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = 
    JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  
  expect(data.id).toEqual(ticketUpdatedData.orderId);
});

