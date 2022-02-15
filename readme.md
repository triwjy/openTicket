# Open Ticket

A scalable and reliable microservice app for ticket transaction.

Each service can be deployed independently, and all other services will not be affected if any of them crashes.

Services communicate each other asynchronously using event broker.

This project uses common library [@twtix/common](https://www.npmjs.com/package/@twtix/common) to share code between services for consistency and conventions accross services and common middlewares, such as:

- Event message subjects and data structures
- Base listener and base publisher
- Checking current user from JWT and resource authorization
- Request validation
- Error definition and handling

## List of services:

### Auth service

Service that handles user signup, signin, and signout.  
Publish:

- UserCreated
- UserUpdated

### Expiration

Worker service that handles ticket order expiration timer.  
Run whenever order is created, and will cancel the order when the timer finish counting.  
Publish:

- OrderExpired

### Orders

Service that handles order for ticket.  
Order is created whenever user attempts to buy a ticket.
Once a ticket is ordered by User A, it will be locked to allow User A to finish his transaction. User B cannot order the same ticket while User A's order is not expired. Ticket will be unlocked once User A failed to finish his transaction within the expiration time.
Authenticated user can see their order history.  
Publish:

- OrderCreated
- OrderCancelled

### Payments

Service that handles user payment given a valid order and user.
This service will update the order status whenever payment is failed or succeeds.  
Publish:

- PaymentCreated

### Tickets

Service that handles tickets resource, handles ticket creation and editing.
List of tickets for sale can be shown to all visitors.  
Ticket can only be created and ordered by authenticated user.  
Ordered ticket will be locked for an interval to allow user finish the transaction.  
Ticket can be edited whenever it is not locked.  
Once a ticket is successfully ordered and transactioned, it will no longer appear in index page.  
Publish:

- TicketCreated
- TicketUpdated
