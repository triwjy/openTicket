import { PaymentCreatedEvent, Publisher, Subjects } from "@twtix/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}