import { TicketUpdatedEvent } from '@twtix/common';
import mongoose from 'mongoose';
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { Message } from 'node-nats-streaming';

const setup =async () => {
  // create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);
  // create and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 10,
    id: new mongoose.Types.ObjectId().toHexString()
  })
  await ticket.save();
  // create fake data object
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    title: ticket.title,
    price: 15,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: ticket.version + 1
  };
  // create fake message object
  //  @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };
  // return all data
  return { listener, ticket, data, msg };
};

it ('find, updates, and save a ticket',async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title)
  expect(updatedTicket!.price).toEqual(data.price)
  expect(updatedTicket!.version).toEqual(data.version)
  
});

it ('acks the message',async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it ('does not call ack if the event has a skipped version', async () => {
  const { listener, ticket, data, msg } = await setup();

  data.version = 5;

  try {
    await listener.onMessage(data, msg);
  } catch (err) {

  }

  expect(msg.ack).not.toHaveBeenCalled();
});