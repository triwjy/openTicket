import { 
  BadRequestError, 
  NotAuthorizedError, 
  NotFoundError, 
  OrderStatus, 
  requireAuth, 
  validateRequest 
} from '@twtix/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { natsWrapper } from '../nats-wrapper';
import { stripe } from '../stripe';

const router = express.Router();

router.post('/api/payments', 
  requireAuth, 
  [
    body('token')
      .notEmpty(),
    body('orderId')
      .notEmpty()
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot complete payment: order has been cancelled');
    }

    if (order.status === OrderStatus.Complete) {
      throw new BadRequestError('Cannot complete payment: order has been completed');
    }

    const charge = await stripe.charges.create({
      currency: 'jpy',
      amount: order.price,
      source: token,
    });

    const payment = Payment.build({
      orderId,
      stripeId: charge.id
    })
    await payment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId
    });

    res.status(201).send({ id: payment.id })
});

export { router as createChargeRouter };
