# Open Ticket

A scalable and reliable microservice app for ticket transaction.

Each service can be deployed independently, and all other services will not be affected if any of them crashes.

Services communicate each other asynchronously using event broker.

This project uses common library [@twtix/common](https://www.npmjs.com/package/@twtix/common) for consistency and conventions accross services and common middleware, such as:

- Event message subjects and data structures
- Base listener and base publisher
- Checking current user from JWT and resource authorization
- Request validation
- Error definition and handling

## List of services:

### Auth service

Service that handles user signup, signin, and signout.

### Expiration

Worker service that handles ticket order expiration timer.

### Orders

Service that handles order for ticket.  
Once a ticket is ordered by User A, it will be locked to allow User A to finish his transaction. User B cannot order the same ticket while User A's order is not expired. Ticket will be unlocked once User A failed to finish his transaction within the expiration time.

### Payments

Service that handles user payment given a valid order and user.

### Tickets

Service that handles tickets resource. Ticket can be created and list of tickets can be shown to all visitor.
Ticket can only be ordered by authenticated user.  
Once a ticket is successfully ordered and transactioned, it will no longer appear in index page.
