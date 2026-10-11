# Slotly — Interactive Demo & Evaluation Walkthrough

This document outlines the step-by-step evaluator flow for verifying the **Adaptive Appointment & Service Flow Management System**.

---

## ⚡ Option A: Automated 8-Step Verification (Fastest)

Run the comprehensive end-to-end test script from the terminal:

```bash
cd server
node tests/e2e_demo_flow.js
```

This automated script performs the complete live lifecycle in under 6 seconds:
1. Registers a new Provider account and provisions business catalog, services, and staff.
2. Registers 3 unique Customer accounts.
3. Books 3 consecutive 20-minute appointments.
4. Starts Customer 1 and completes it with an actual duration of 35 minutes (+15m delay overrun).
5. Verifies downstream cascade recalculation: Customer 2 and Customer 3 ETAs shift later by +15 minutes.
6. Verifies Customer 2 cancels appointment $\rightarrow$ Customer 3 is promoted to Position #1 and queue pulls forward.
7. Adds an in-person Walk-in customer to the live queue.
8. Runs the What-If Simulator (+20m delay, +1 walk-in) and verifies non-mutating mathematical projections.

---

## 🖥️ Option B: Interactive Manual UI Walkthrough

### 1. Landing Page Inspection
1. Open `http://localhost:5173/` in your browser.
2. Inspect the hero banner: *"Appointments change. Your schedule should too."*
3. Notice the live comparison card displaying Planned vs Actual duration and the downstream adapted queue.
4. Review the 6-stage closed loop cycle: **BOOK $\rightarrow$ PLAN $\rightarrow$ OBSERVE $\rightarrow$ ADAPT $\rightarrow$ NOTIFY $\rightarrow$ LEARN**.

### 2. Service Provider Registration & Catalog Setup
1. Click **Get Started Free** or navigate to `/register`.
2. Select **Service Provider / Business** account type.
3. Fill in provider details:
   - Name: `Alex Provider`
   - Business Name: `Apex Grooming Lounge`
   - Category: `Grooming`
   - Password: `Password@123`
4. In the Provider Dashboard:
   - Navigate to **Services** $\rightarrow$ Click **Add Service** $\rightarrow$ Create `Classic Haircut` (20 min, $35).
   - Navigate to **Staff** $\rightarrow$ Click **Add Staff** $\rightarrow$ Create `Jordan Stylist`.

### 3. Customer Account & Consecutive Bookings
1. Open an Incognito window or log out.
2. Navigate to `/register` $\rightarrow$ Select **Customer** account type.
3. Register Customer 1 (`Sam Customer`, `sam@demo.com`).
4. Click **Book Appointment** $\rightarrow$ Select `Apex Grooming Lounge` $\rightarrow$ Choose `Classic Haircut` $\rightarrow$ Book for current hour.
5. Repeat for Customer 2 (`Taylor Customer`, `taylor@demo.com`) for 20 minutes later.

### 4. Live Queue Execution & Overrun Trigger
1. Switch back to the Provider session and open **Live Queue** (`/provider/queue`).
2. Both appointments appear with tokens (e.g., `A-101`, `A-102`), position numbers, and estimated start times.
3. Click **Start** on Customer 1 $\rightarrow$ Status changes to `serving` with a green indicator.
4. Click **Complete** $\rightarrow$ Modal opens:
   - Expected Duration: `20 min`.
   - Enter Actual Duration: `35 min` (+15 min overrun).
   - Click **Save & Complete**.

### 5. Downstream Cascade Verification
1. Notice Customer 2's ETA in the provider queue automatically pushed back by 15 minutes.
2. In the Customer 2 browser session:
   - Open `/customer/dashboard` or `/customer/queue`.
   - Check the **Updated ETA** and **Wait Time** cards: dynamically extended.
   - Click notifications (bell icon): Verify delay notification received.

### 6. Cancellation Recovery (Pull-Forward)
1. In Customer 2's account: Click **Cancel Appointment**.
2. Notice the slot is immediately released and remaining queue items pull forward.

### 7. What-If Simulator
1. In Provider session: Navigate to **Simulator** (`/provider/simulator`).
2. Adjust the hypothetical delay slider: `+25 min`.
3. Click **Run Simulation**.
4. Observe the side-by-side Planned vs Projected ETA table, highlighting delay shifts and affected appointments without altering the live database.
