import { Publisher, Subjects, TicketUpdatedEvent } from "@twtix/common"

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
  readonly subject = Subjects.TicketUpdated;
}
