import { OrderCancelledEvent, Publisher, Subjects } from "@twtix/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
