import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent } from "@twtix/common";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedListener } from "../ticket-created-listener";
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // Create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);
  // Create a fake data event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString()
  }
  // Create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };
  return { listener, data, msg };
};

it ('creates and saves a ticket', async () => {
  const { listener, data, msg } = await setup();
  // Call onMessage fn w/ data object+message object
  await listener.onMessage(data, msg);
  // Asserts that ticket was created
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it ('acks the message',async () => {
  // Call onMessage fn w/ data object+message object
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  // Asserts ack fn was called
  expect(msg.ack).toHaveBeenCalled();
});