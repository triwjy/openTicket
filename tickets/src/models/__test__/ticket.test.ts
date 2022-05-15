import { app } from "../../app";
import { Ticket } from "../ticket";

it ('implement optimistic concurrency control',async () => {
  // Create ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 10,
    userId: '123'
  });

  // Save the ticket to db
  await ticket.save()

  // Fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // Make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 15 });
  secondInstance!.set({ price: 20 });

  // Save the first fetched ticket
  await firstInstance!.save();
  
  // Save the second fetched ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }

  throw new Error('Should not reach this point');
})

it ('increments the version number on multiple saves',async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 10,
    userId: '123'
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
})