import { NotFoundError } from '@twtix/common';
import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets/:id',async (req: Request, res: Response) => {
  console.log(`Route: ${req.params.id}`);
  
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new NotFoundError();
  }
  console.log(`Response: ${res}`);
  
  res.send(ticket);
});

export { router as showTicketRouter };