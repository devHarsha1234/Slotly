# Slotly Architecture Plan

## Overview
Slotly is an Adaptive Appointment & Service Flow Management System built using the MERN stack. Unlike traditional appointment systems that manage planned schedules, Slotly adapts to real-world deviations (delays, early completions, cancellations, no-shows, walk-ins) and dynamically recalculates downstream appointments and queues.

## Technology Stack
- **Frontend**: React.js, Vite, React Router, Tailwind CSS, Axios, Lucide React (icons), date-fns (date formatting).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB, Mongoose.
- **Authentication**: JWT, bcryptjs.
- **Validation**: Zod.
- **Testing**: Jest, Supertest (backend).

## System Components
1. **Client**: A single-page application (SPA) providing separate experiences for Public (Landing, Auth), Customers (Booking, Queue tracking), and Providers (Dashboard, Queue management, Configuration, Simulator).
2. **Server**: A RESTful API providing endpoints for business logic, data persistence, and the core adaptive algorithm.
3. **Database**: MongoDB storing documents for Users, Businesses, Services, Staff, Appointments, Queue Entries, Service Records, and Notifications.

## Core Adaptive Algorithm
The adaptive engine triggers on specific events:
- Service Start
- Service Complete
- Walk-in Added
- Cancellation
- No-Show
- Manual Delay/Adjustment

**Recalculation Logic:**
1. Fetch all pending/scheduled appointments and queue entries for a given staff/service queue.
2. Determine the current running service's actual end time or projected end time based on actual start time + (expected duration + known delay).
3. Cascade the calculated end time as the start time for the next entity in the queue.
4. Update `estimatedStart` and `estimatedWaitMinutes` for all subsequent entities.
5. Generate notifications for customers whose ETA changes significantly.
6. When a service completes, log a `ServiceRecord` to help adjust future expected durations using historical averages.

## What-If Simulator
The simulator duplicates the current queue state in memory, applies a hypothetical event (e.g., +15 mins delay, +2 walk-ins), runs the adaptive algorithm on the in-memory state, and returns the projected impact (new wait times, affected appointments) without persisting the changes to MongoDB.
