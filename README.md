# Slotly — Adaptive Appointment & Service Flow Management System

> **"Appointments change. Your schedule should too."**

Slotly is a production-grade Full-Stack MERN application engineered for real-world service environments where operations deviate from static calendar plans.

Traditional appointment tools only manage what was *planned*. Slotly continuously observes what *actually happens* (service overruns, early finishes, cancellations, no-shows, and physical walk-ins) and dynamically recalculates downstream ETAs and queue flows in real time.

---

## 🌐 Deployments & Repository

- **Live Frontend (Vercel):** [https://slotly-dusky.vercel.app/](https://slotly-dusky.vercel.app/)
- **Live Backend API (Render):** [https://slotly-api-s5fe.onrender.com](https://slotly-api-s5fe.onrender.com)
- **GitHub Repository:** [https://github.com/devHarsha1234/Slotly](https://github.com/devHarsha1234/Slotly)

---

## ⚙️ Core Product Engine: The 6-Stage Adaptive Loop

```
BOOK ───► PLAN ───► OBSERVE ───► ADAPT ───► NOTIFY ───► LEARN
```

1. **Book:** Customers reserve appointments online or service providers register in-person walk-ins.
2. **Plan:** Baseline schedule is initialized using catalog expected durations.
3. **Observe:** Service provider triggers actual service execution (`Start` and `Complete` with actual duration).
4. **Adapt:** Queue engine executes downstream cascade recalculation:
   $$\text{Adapted ETA} = \max(\text{Scheduled Start}, \text{Practitioner Free Time})$$
5. **Notify:** Real-time notification records generated whenever downstream schedules shift by $> 10\text{ minutes}$.
6. **Learn:** Data-driven rolling historical average refines future duration estimates ($70\%$ baseline catalog duration $+ 30\%$ rolling historical average).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router 6, Tailwind CSS, Axios, Lucide React, date-fns |
| **Backend** | Node.js, Express.js (REST API, JWT Authentication, Custom Error Middleware) |
| **Database** | MongoDB, Mongoose ODM (Indexes, Relationships, Cascade Recalculations) |
| **Validation** | Zod (Strong schema validation on auth, appointments, and queue payloads) |
| **Security** | bcrypt password hashing, JWT Bearer tokens, Role-Based Access Control (`customer`, `provider`) |

---

## 📁 Repository Structure

```
Slotly/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Shared UI components & Layouts
│   │   ├── context/            # AuthContext & State management
│   │   ├── hooks/              # Custom hooks (useAuth, etc.)
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register
│   │   │   ├── customer/       # Customer Dashboard, Appointments, Live Queue, Services
│   │   │   ├── provider/       # Provider Dashboard, Live Queue, Services, Staff, What-If Simulator
│   │   │   └── public/         # Landing Page, Business directory
│   │   ├── services/           # Axios API client
│   │   └── App.jsx             # React Router routing
│   └── package.json
├── server/                     # Express Backend
│   ├── controllers/            # Controller logic (Auth, Queue, Appointment, Simulator, etc.)
│   ├── middleware/             # Auth (protect/authorize), Zod validate, Error middleware
│   ├── models/                 # Mongoose Schemas (User, Business, Service, Staff, Appointment, QueueEntry, etc.)
│   ├── routes/                 # RESTful Express route definitions
│   ├── services/               # Core adaptive queue engine & duration learning
│   ├── tests/                  # Automated verification & acceptance test suites
│   │   ├── acceptance_test.js          # Delay cascade & notification shift verification
│   │   ├── audit_verification_test.js  # Security, authorization, & profile verification
│   │   └── e2e_demo_flow.js            # Complete 8-step end-to-end evaluation scenario
│   └── package.json
└── docs/                       # Academic & Technical Documentation
    ├── API.md                  # Comprehensive REST endpoint specifications
    ├── ARCHITECTURE.md         # System architecture & engine flow
    ├── CS365_MAPPING.md        # Mapping to CS365 Full-Stack Lab syllabus
    ├── DATABASE.md             # MongoDB Schema & relationship documentation
    └── DEMO_FLOW.md            # Interactive step-by-step evaluator script
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (running locally at `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 2. Backend Setup
```bash
cd server
npm install
npm run dev
# Server listening on http://localhost:5000
```

Environment file (`server/.env`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/slotly
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
# Vite dev server listening on http://localhost:5173
```

Environment file (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🧪 Automated Test Verification

Slotly includes 3 complete automated test suites executing against the real database and REST APIs:

1. **End-to-End Evaluation Demo Flow:**
   ```bash
   cd server
   node tests/e2e_demo_flow.js
   ```
   *Verifies: 3 customer sequential bookings $\rightarrow$ +15m delay overrun $\rightarrow$ downstream ETA cascade $\rightarrow$ notification dispatch $\rightarrow$ Customer 2 cancellation $\rightarrow$ queue pull-forward $\rightarrow$ walk-in insertion $\rightarrow$ What-If Simulator.*

2. **Core Acceptance Test:**
   ```bash
   node tests/acceptance_test.js
   ```
   *Verifies: Exact mathematical delta calculation, delay capture, and notification delivery.*

3. **Security & Authorization Audit Test:**
   ```bash
   node tests/audit_verification_test.js
   ```
   *Verifies: 403 Forbidden cross-tenant isolation, password double-hashing prevention, staff auto-resolution.*

4. **Frontend Production Build:**
   ```bash
   cd client
   npm run build
   ```
   *Verifies: 100% clean production bundle creation with zero Vite/PostCSS errors.*

---

## 🎓 Academic Curriculum Mapping (CS365 Full-Stack Lab)

| Experiment | Requirement | Slotly Implementation |
| :--- | :--- | :--- |
| **Exp 1** | Dev environment + GitHub repo | Node.js, Vite, npm workspaces, Git version control. |
| **Exp 2** | MongoDB schema + CRUD operations | Mongoose schemas for 8 entities with complete CRUD on Services, Staff, and Appointments. |
| **Exp 3** | React components with props & state | Modular components (`QueueTable`, `AppointmentCard`, `Simulator`), controlled forms. |
| **Exp 4** | React Router + Hooks | Client-side routing with role guards, `useAuth`, `useEffect`, `useState`. |
| **Exp 5** | Express REST APIs | Fully documented RESTful API endpoints across 8 resource controllers. |
| **Exp 6** | Frontend ↔ Backend integration | Axios client with JWT interceptor, handling asynchronous promises. |
| **Exp 7** | JWT Authentication | `bcrypt` hashing, JWT token issuance, protected routes via middleware. |
| **Exp 8** | Zod Schema Validation | Pre-controller request body validation preventing invalid payloads. |
| **Exp 9** | Centralized Error Handling | Custom Express error middleware with standardized JSON error envelopes. |
| **Exp 10** | Cloud Deployment | Production deploy on Vercel (Client) and Render (Server) using environment variables. |

---

## 📄 License
Academic Project — Third Year B.Tech Computer Engineering Full-Stack Web Development Evaluation.
