import { Message } from 'node-nats-streaming';
import { Listener } from './base-listener';
import { Subjects } from './subjects';
import { TicketCreatedEvent } from './ticket-created-event';

class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  // ensure valid subject value won't be changed
  readonly subject = Subjects.TicketCreated;
  queueGroupName = 'payments-service';

  onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
      console.log(`Event data: `, data);

      console.log(data.price);
      console.log(data.title);
            
      msg.ack();
  }
}

export { TicketCreatedListener }