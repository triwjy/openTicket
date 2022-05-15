import { Publisher, OrderCompletedEvent, Subjects } from "@twtix/common";

export class OrderCompletedPublisher extends Publisher<OrderCompletedEvent> {
  readonly subject = Subjects.OrderCompleted;
}
