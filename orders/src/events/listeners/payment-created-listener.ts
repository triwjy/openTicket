import { Listener, OrderStatus, PaymentCreatedEvent, Subjects } from "@twtix/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { OrderCompletedPublisher } from "../publishers/order-completed-publisher";
import { queueGroupName } from "./queue-group-name";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent>{
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;
  
  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');
    if (!order) {
      throw new Error('Order not found');
    }
    order.set({ status: OrderStatus.Complete });
    await order.save();

    await new OrderCompletedPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id
      }
    })

    msg.ack();
  }
}
