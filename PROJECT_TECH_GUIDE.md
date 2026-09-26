# SD-08 — Project Technology Guide & CSE Interview Companion

This document provides a comprehensive technical breakdown of every technology used in the **Pulse Pass Event Ticketing System**. It is structured for final-year Computer Science & Engineering (CSE) students to explain architectural choices during technical evaluation interviews.

---

## 1. React (v18)

* **WHY?**
  Event seat maps require dynamic UI state synchronization (e.g. toggling seat selection, updating timers, reacting to WebSocket lock events). React's declarative component model and virtual DOM enable efficient UI updates without manual DOM manipulation.
* **WHAT DOES IT DO?**
  Manages UI components, page routing context, and application state across all 9 screens.
* **WHERE IS IT USED?**
  Entire frontend application (`src/components/`, `src/pages/`, `src/context/`).
* **HOW DOES IT WORK?**
  React maintains an in-memory Virtual DOM tree. When component state changes (e.g. `selectedSeats`), React computes diffs and patches only the affected DOM elements.
* **WHAT ALTERNATIVE EXISTS?**
  Vue.js, Svelte, Angular, Vanilla JavaScript.

---

## 2. TypeScript

* **WHY?**
  Prevents runtime type errors (e.g. `undefined is not a function`, missing property access on `Seat` or `Booking` objects). Ensures type safety across REST API payloads and Socket.IO events.
* **WHAT DOES IT DO?**
  Adds compile-time static type checking and interface contracts to JavaScript.
* **WHERE IS IT USED?**
  Both Frontend (`frontend/src/types/index.ts`) and Backend (`backend/src/services/`, `backend/src/routes/`).
* **HOW DOES IT WORK?**
  The TypeScript compiler (`tsc`) validates type annotations during development and compiles code down to clean standard JavaScript.
* **WHAT ALTERNATIVE EXISTS?**
  Plain JavaScript, JSDoc comments, Flow.

---

## 3. Vite

* **WHY?**
  Traditional Webpack builds are slow. Vite provides instant server start (HMR) using native ES Modules during development and fast Rollup bundling for production.
* **WHAT DOES IT DO?**
  Acts as the frontend dev server, build tool, and module bundler.
* **WHERE IS IT USED?**
  `frontend/vite.config.ts` and frontend package scripts.
* **HOW DOES IT WORK?**
  In development, Vite serves source files over native ESM without pre-bundling. On changes, it updates only the edited module via Hot Module Replacement (HMR).
* **WHAT ALTERNATIVE EXISTS?**
  Webpack, Create React App, Parcel, Turbopack.

---

## 4. Tailwind CSS

* **WHY?**
  Utility-first CSS allows building custom cinematic dark designs without writing thousands of lines of ad-hoc CSS stylesheets or suffering from global class collisions.
* **WHAT DOES IT DO?**
  Provides utility classes for layout, typography, flexbox/grid, shadows, glassmorphism, and color palettes.
* **WHERE IS IT USED?**
  `frontend/src/styles/index.css` and inline component `className` attributes.
* **HOW DOES IT WORK?**
  Tailwind scans all JSX/TSX files for class names and generates a minimal, purged CSS file containing only the exact styles used.
* **WHAT ALTERNATIVE EXISTS?**
  Bootstrap, Material UI, Styled Components, CSS Modules.

---

## 5. Motion (Framer Motion)

* **WHY?**
  Enhances UX with micro-animations (card hover scaling, page entrance transitions, ticket reveal animations) without compromising performance.
* **WHAT DOES IT DO?**
  Provides declarative animation components (`<motion.div>`) and exit transitions (`<AnimatePresence>`).
* **WHERE IS IT USED?**
  `LandingPage.tsx`, `EventCard.tsx`, `SeatMap.tsx`, `TicketCard.tsx`, `ConfirmationPage.tsx`.
* **HOW DOES IT WORK?**
  Hooks directly into browser requestAnimationFrame loops and hardware-accelerated CSS transforms.
* **WHAT ALTERNATIVE EXISTS?**
  GSAP, Anime.js, CSS Keyframes.

---

## 6. SVG (Scalable Vector Graphics)

* **WHY?**
  Building a seat map with hundreds of traditional HTML `<button>` elements creates heavy DOM overhead and poor responsive scaling. SVG resolution-independence allows smooth rendering, zoom scaling, stage curvature, and precise seat positioning.
* **WHAT DOES IT DO?**
  Renders the interactive 2D venue grid, stage spotlight arc, seat circles, and state indicators.
* **WHERE IS IT USED?**
  `frontend/src/components/SeatMap.tsx`.
* **HOW DOES IT WORK?**
  SVG elements (`<svg>`, `<circle>`, `<path>`, `<text>`) exist in vector space. React binds click/hover event listeners directly to SVG nodes.
* **WHAT ALTERNATIVE EXISTS?**
  HTML5 Canvas 2D context, WebGL / Three.js.

---

## 7. Node.js & Express.js

* **WHY?**
  Non-blocking I/O event loop model makes Node.js ideal for handling concurrent REST requests and persistent WebSocket connections simultaneously.
* **WHAT DOES IT DO?**
  Powers the backend HTTP server, API router, service layer, and database query orchestration.
* **WHERE IS IT USED?**
  `backend/src/index.ts`, `backend/src/routes/`, `backend/src/services/`.
* **HOW DOES IT WORK?**
  Express executes a stack of middleware functions (CORS, JSON body parser, JWT auth) for incoming HTTP requests, delegating SQL transactions to PostgreSQL.
* **WHAT ALTERNATIVE EXISTS?**
  Fastify, NestJS, Python FastAPI, Go Fiber.

---

## 8. PostgreSQL & Transaction Locking (`SELECT ... FOR UPDATE`)

* **WHY?**
  PostgreSQL provides ACID compliance, strong isolation levels, and row-level locking capabilities necessary to solve race conditions in seat ticketing.
* **WHAT DOES IT DO?**
  Stores persistent records for users, events, seats, reservations, and bookings. Enforces uniqueness constraints (`UNIQUE(event_id, row_label, seat_number)`).
* **WHERE IS IT USED?**
  `backend/src/db/`, `backend/src/services/reservation.service.ts`, `backend/src/services/checkout.service.ts`.
* **HOW DOES IT WORK?**
  When a reservation starts, backend executes `BEGIN TRANSACTION` followed by `SELECT * FROM seats WHERE id IN (...) FOR UPDATE`. This acquires exclusive row locks. Concurrent transactions trying to select the same rows must wait or fail if status check fails.
* **WHAT ALTERNATIVE EXISTS?**
  MySQL / MariaDB with `FOR UPDATE`, CockroachDB. (NoSQL databases like MongoDB lack strict row-level SQL locking without complex multi-document ACID setup).

---

## 9. JWT (JSON Web Tokens)

* **WHY?**
  Stateless user authentication. The backend doesn't need server-side session memory to verify identity on every HTTP API call.
* **WHAT DOES IT DO?**
  Signs user identity claims (`userId`, `email`, `role`) with a secret key and returns a base64 string to the client.
* **WHERE IS IT USED?**
  `backend/src/middleware/auth.middleware.ts`, `frontend/src/services/api.ts`.
* **HOW DOES IT WORK?**
  Client includes `Authorization: Bearer <token>` header in requests. Express verifies token signature cryptographically.
* **WHAT ALTERNATIVE EXISTS?**
  Session cookies + Redis store, OAuth2 / OIDC.

---

## 10. Socket.IO (WebSockets)

* **WHY?**
  HTTP polling (requesting seat state every second) creates heavy server load and delay. WebSockets maintain a persistent bi-directional connection for zero-latency updates.
* **WHAT DOES IT DO?**
  Broadcasts seat lock/release/sold events instantly to all clients connected to an event room.
* **WHERE IS IT USED?**
  `backend/src/sockets/socket.manager.ts`, `frontend/src/context/SocketContext.tsx`, `SeatSelectionPage.tsx`.
* **HOW DOES IT WORK?**
  Clients join room `event:<eventId>`. When backend locks a seat in DB, it emits `seat_locked` to `event:<eventId>`, causing all open browser windows to update their seat color instantly.
* **WHAT ALTERNATIVE EXISTS?**
  Server-Sent Events (SSE), WebRTC, Raw WebSockets (`ws`).

---

## 11. Zod

* **WHY?**
  Ensures incoming API request bodies contain valid schema types before hitting database code, preventing unexpected crashes or SQL injection vectors.
* **WHAT DOES IT DO?**
  Validates request body schemas (e.g. email formatting, non-empty array of seat IDs).
* **WHERE IS IT USED?**
  `backend/src/routes/auth.routes.ts`, `backend/src/routes/reservation.routes.ts`, `backend/src/routes/checkout.routes.ts`.
* **HOW DOES IT WORK?**
  `schema.parse(req.body)` parses and validates inputs, throwing structured validation errors if schema rules fail.
* **WHAT ALTERNATIVE EXISTS?**
  Joi, Yup, Ajv.
