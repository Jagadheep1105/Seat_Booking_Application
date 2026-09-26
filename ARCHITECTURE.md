# SD-08 — System Architecture & Data Flow

This document details the architectural design, database entity-relationship schema, REST API specs, and real-time WebSocket data flows for **Pulse Pass Event Ticketing Platform**.

---

## 1. System Architecture Diagram

```
+-----------------------------------------------------------------------+
|                           CLIENT LAYER                                |
|                                                                       |
|   +-------------------+  +-------------------+  +-----------------+   |
|   |  Browser Window A |  |  Browser Window B |  |  Mobile Client  |   |
|   +---------+---------+  +---------+---------+  +--------+--------+   |
+-------------|----------------------|---------------------|------------+
              |                      |                     |
              | REST (HTTPS)         | Socket.IO (WSS)     | REST (HTTPS)
              v                      v                     v
+-----------------------------------------------------------------------+
|                           BACKEND LAYER                               |
|                                                                       |
|   +---------------------------------------------------------------+   |
|   |                       Express.js Router                       |   |
|   +-------------------------------+-------------------------------+   |
|                                   |                                   |
|   +-------------------------------+-------------------------------+   |
|   |                       Service Layer                           |   |
|   |  - ReservationService (PostgreSQL Transaction Locking)         |   |
|   |  - CheckoutService (ACTIVE -> CONFIRMED & LOCKED -> SOLD)     |   |
|   |  - ExpirationWorker (Background 5s Cleanup Monitor)          |   |
|   |  - SocketManager (Broadcasts seat_locked / seat_released)     |   |
|   +-------------------------------+-------------------------------+   |
+-----------------------------------|-----------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                          DATABASE LAYER                               |
|                                                                       |
|   +---------------------------------------------------------------+   |
|   |                   PostgreSQL Database Engine                  |   |
|   |                                                               |   |
|   |  Tables: users, events, ticket_categories, seats,             |   |
|   |          reservations, reservation_items, bookings,           |   |
|   |          booking_items                                        |   |
|   |                                                               |   |
|   |  Locks: Exclusive Row Locking via SELECT ... FOR UPDATE       |   |
|   +---------------------------------------------------------------+   |
+-----------------------------------------------------------------------+
```

---

## 2. Database ER Schema

```
 [users] 1 ─── N [reservations] 1 ─── N [reservation_items]
   │                   │                         │
   │ 1                 │ 1                       │ N
   ▼ N                 ▼ 1                       ▼ 1
 [bookings] 1 ─── N [booking_items] ──────────► [seats] N ─── 1 [ticket_categories] N ─── 1 [events]
```

### Table Definitions & Invariants

1. **`users`**: Stores authenticated user accounts and password hashes (`bcrypt`).
2. **`events`**: Event metadata (title, category, date, time, venue, image URL).
3. **`ticket_categories`**: Pricing tiers (VIP, Premium, Regular) per event.
4. **`seats`**: Individual physical venue seats (`row_label`, `seat_number`, `status: AVAILABLE | LOCKED | SOLD`). Uniqueness enforced by `UNIQUE(event_id, row_label, seat_number)`.
5. **`reservations`**: Temporary seat lock records with backend timestamp `expires_at`.
6. **`bookings`**: Confirmed purchase orders with unique reference string (e.g. `TKT-2026-X98A2`).

---

## 3. Real-time Socket.IO Event Flows

### Event 1: `seat_locked`
* **Trigger**: User A successfully reserves seats.
* **Payload**:
  ```json
  {
    "eventId": "evt-cyberpulse-2026",
    "seatIds": ["seat-evt-cyberpulse-2026-A1"],
    "expiresAt": "2026-09-26T14:40:00.000Z",
    "userId": "usr-123"
  }
  ```
* **Effect**: All connected clients in room `event:evt-cyberpulse-2026` immediately render Seat A1 as **TEMPORARILY_LOCKED** (amber).

### Event 2: `seat_released`
* **Trigger**: Reservation expires after 10 mins or user manually releases/cancels.
* **Payload**:
  ```json
  {
    "eventId": "evt-cyberpulse-2026",
    "seatIds": ["seat-evt-cyberpulse-2026-A1"]
  }
  ```
* **Effect**: All clients update Seat A1 back to **AVAILABLE** (cyan border).

### Event 3: `seat_sold`
* **Trigger**: Checkout successfully confirms payment.
* **Payload**:
  ```json
  {
    "eventId": "evt-cyberpulse-2026",
    "seatIds": ["seat-evt-cyberpulse-2026-A1"]
  }
  ```
* **Effect**: All clients render Seat A1 as **SOLD** (dark muted slate).
