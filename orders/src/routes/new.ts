import express, { Request, Response } from 'express';
import mongoose from 'mongoose'
import {
  BadRequestError,
  NotFoundError,
  requireAuth,
  validateRequest
} from '@twtix/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order, OrderStatus } from '../models/order';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post('/api/orders', requireAuth, [
  body('ticketId')
    .notEmpty()
    // potentially coupling mongodb as our fixed infra
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('TicketId must be provided')
  ],
  validateRequest, 
  async (req: Request, res: Response) => {
    const { ticketId } = req.body
    
    // Find the ticket the user is trying to order from db
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // Make sure that this ticket is not already reserved
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved')
    }

    // Calculate an expiration time on the order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to the db
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket
    });
    await order.save();

    // Publish an event saying that an order was created

  res.status(201).send(order);
});

export { router as newOrderRouter };