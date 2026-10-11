# Slotly API Routes

## Auth (`/api/auth`)
- `POST /register`: Register a new user (customer or provider).
- `POST /login`: Authenticate and receive JWT.
- `GET /me`: Get current user info based on JWT.

## Users (`/api/users`)
- `GET /:id`: Get user profile.
- `PUT /:id`: Update user profile.

## Businesses (`/api/businesses`)
- `POST /`: Create a business (Provider only).
- `GET /`: List businesses (with filters).
- `GET /:id`: Get business details.
- `PUT /:id`: Update business info.

## Services (`/api/services`)
- `POST /`: Create a service (Provider only).
- `GET /`: List services for a business.
- `PUT /:id`: Update a service.
- `DELETE /:id`: Deactivate a service.

## Staff (`/api/staff`)
- `POST /`: Add staff.
- `GET /`: List staff.
- `PUT /:id`: Update staff.
- `DELETE /:id`: Deactivate staff.

## Appointments (`/api/appointments`)
- `POST /`: Book an appointment.
- `GET /`: List appointments (filtered by user or business).
- `GET /:id`: Get appointment details.
- `PUT /:id/status`: Update status (cancel, no-show, complete).

## Queue (`/api/queue`)
- `POST /walk-in`: Add a walk-in to the queue.
- `GET /:businessId`: Get current live queue for a business.
- `PUT /:id/start`: Mark queue entry as serving.
- `PUT /:id/complete`: Complete service and trigger recalculation.
- `PUT /:id/status`: Update queue entry status directly (cancel, no_show).

## Simulator (`/api/simulator`)
- `POST /simulate`: Run what-if simulation for a business queue.

## Notifications (`/api/notifications`)
- `GET /`: Get notifications for current user.
- `PUT /:id/read`: Mark notification as read.
