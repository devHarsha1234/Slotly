# CS365 Experiment Mapping

This document explains how Slotly implements the CS365 Full Stack Web Development Lab requirements.

- **EXPERIMENT 1: Development environment + GitHub repository**
  - **Implementation**: The project uses Vite, Express, and Git. The environment is configured via `.env` files.
- **EXPERIMENT 2: MongoDB schema + CRUD operations**
  - **Implementation**: Mongoose schemas in `server/models/`. Complete CRUD implemented for Services, Staff, and Appointments (Create, Read, Update, Delete/Deactivate).
- **EXPERIMENT 3: React components using props and state**
  - **Implementation**: Functional React components with `useState`. Example: `AppointmentCard` takes props; forms manage local state.
- **EXPERIMENT 4: React Router + Hooks**
  - **Implementation**: Client-side routing with `react-router-dom`. Extensive use of `useEffect`, `useState`, `useContext` for data fetching and auth.
- **EXPERIMENT 5: Express REST APIs + Postman**
  - **Implementation**: RESTful API in `server/routes/` and `server/controllers/`. Postman collection provided.
- **EXPERIMENT 6: React frontend ↔ Express backend integration**
  - **Implementation**: Frontend uses `axios` to communicate with the Express backend APIs.
- **EXPERIMENT 7: JWT login/register**
  - **Implementation**: `authController.js` handles registration and login, generating JWTs. Protected routes use JWT middleware.
- **EXPERIMENT 8: Validation + middleware using Joi/Yup/Zod**
  - **Implementation**: `zod` is used for request body validation via middleware before controller logic executes.
- **EXPERIMENT 9: Centralized error handling + standardized API responses**
  - **Implementation**: Custom error handler middleware `errorHandler.js` formats all errors into a standardized `{ success: false, message: ... }` response.
- **EXPERIMENT 10: Cloud deployment readiness/deployment**
  - **Implementation**: Configuration relies on environment variables (`MONGO_URI`, `PORT`, `VITE_API_URL`). Scripts are provided to build for production.
