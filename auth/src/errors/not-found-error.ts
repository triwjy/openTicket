import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
  statusCode = 404;

  constructor() {
    // for logging
    super('Route not found');

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
      // for response
      return [{ message:'Not Found' }];
  }
}
