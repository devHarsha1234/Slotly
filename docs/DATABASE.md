# Slotly Database Design

## Models

### User
- `name` (String, required)
- `email` (String, unique, required)
- `phone` (String, required)
- `passwordHash` (String, required)
- `role` (String, enum: ['customer', 'provider', 'admin'], default: 'customer')
- `status` (String, enum: ['active', 'inactive'], default: 'active')
- Timestamps

### Business
- `owner` (ObjectId -> User, required)
- `name` (String, required)
- `category` (String, required)
- `description` (String)
- `phone` (String)
- `address` (String)
- `operatingHours` (Object - start, end for days)
- `status` (String, enum: ['active', 'inactive'], default: 'active')
- Timestamps

### Service
- `business` (ObjectId -> Business, required)
- `name` (String, required)
- `description` (String)
- `expectedDurationMinutes` (Number, required)
- `price` (Number, required)
- `active` (Boolean, default: true)
- Timestamps

### Staff
- `business` (ObjectId -> Business, required)
- `name` (String, required)
- `email` (String)
- `phone` (String)
- `role` (String)
- `services` (Array of ObjectId -> Service)
- `availability` (Object)
- `active` (Boolean, default: true)
- Timestamps

### Appointment
- `customer` (ObjectId -> User, required)
- `business` (ObjectId -> Business, required)
- `service` (ObjectId -> Service, required)
- `staff` (ObjectId -> Staff)
- `date` (Date, required)
- `scheduledStart` (Date, required)
- `scheduledEnd` (Date, required)
- `expectedDuration` (Number, required)
- `actualDuration` (Number)
- `status` (String, enum: ['scheduled', 'confirmed', 'serving', 'completed', 'cancelled', 'no_show'])
- `source` (String, enum: ['appointment', 'walk_in'])
- `notes` (String)
- Timestamps

### QueueEntry
- `appointment` (ObjectId -> Appointment, optional)
- `customer` (ObjectId -> User, optional)
- `business` (ObjectId -> Business, required)
- `service` (ObjectId -> Service, required)
- `staff` (ObjectId -> Staff, optional)
- `token` (String, required)
- `position` (Number, required)
- `status` (String, enum: ['waiting', 'serving', 'completed', 'cancelled', 'no_show'])
- `estimatedStart` (Date, required)
- `estimatedWaitMinutes` (Number, required)
- Timestamps

### ServiceRecord
- `appointment` (ObjectId -> Appointment, required)
- `staff` (ObjectId -> Staff, optional)
- `service` (ObjectId -> Service, required)
- `expectedDuration` (Number, required)
- `actualDuration` (Number, required)
- `delayMinutes` (Number, required)
- `startedAt` (Date, required)
- `completedAt` (Date, required)
- Timestamps

### Notification
- `recipient` (ObjectId -> User, required)
- `type` (String)
- `title` (String, required)
- `message` (String, required)
- `read` (Boolean, default: false)
- `relatedAppointment` (ObjectId -> Appointment)
- Timestamps
