import { ExpirationCompleteEvent, Publisher, Subjects } from "@twtix/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
};
