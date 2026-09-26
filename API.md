# SD-08 — REST API Documentation

Complete REST API specification for **Pulse Pass Event Ticketing Backend**.

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### `POST /auth/register`
Creates a new user account.

* **Request Body**:
  ```json
  {
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "password": "demo123"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr-1711234567-abc123",
      "name": "Alex Mercer",
      "email": "alex@example.com",
      "role": "user"
    }
  }
  ```

---

### `POST /auth/login`
Authenticates credentials and returns a JWT Bearer token.

* **Request Body**:
  ```json
  {
    "email": "alex@example.com",
    "password": "demo123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr-1711234567-abc123",
      "name": "Alex Mercer",
      "email": "alex@example.com",
      "role": "user"
    }
  }
  ```

---

## 2. Events Endpoints

### `GET /events`
Retrieves event catalog with category filter and search parameters.

* **Query Parameters**:
  - `category` *(optional)*: `Music` | `Sports` | `Conference` | `All`
  - `search` *(optional)*: Search query string
* **Response (200 OK)**:
  ```json
  [
    {
      "id": "evt-cyberpulse-2026",
      "title": "CyberPulse Music Festival 2026",
      "category": "Music",
      "date": "October 24, 2026",
      "time": "19:00 PM - 01:00 AM",
      "venueName": "NeoArena Grand Dome",
      "description": "The world's premier electronic audio-visual festival...",
      "imageUrl": "https://images.unsplash.com/...",
      "startingPrice": 1500,
      "totalSeats": 76,
      "availableSeats": 72
    }
  ]
  ```

---

### `GET /events/:id`
Retrieves detailed information for a single event, including ticket categories.

* **Response (200 OK)**:
  ```json
  {
    "id": "evt-cyberpulse-2026",
    "title": "CyberPulse Music Festival 2026",
    "category": "Music",
    "date": "October 24, 2026",
    "time": "19:00 PM - 01:00 AM",
    "venueName": "NeoArena Grand Dome",
    "description": "The world's premier electronic audio-visual festival...",
    "imageUrl": "https://images.unsplash.com/...",
    "categories": [
      {
        "id": "cat-cp-vip",
        "name": "VIP Frontstage",
        "price": 4500,
        "description": "Front-row stage view...",
        "color": "#10B981",
        "totalSeats": 10,
        "availableSeats": 10
      }
    ]
  }
  ```

---

### `GET /events/:id/seats`
Retrieves live venue seat map grid for SVG rendering.

* **Response (200 OK)**:
  ```json
  [
    {
      "id": "seat-evt-cyberpulse-2026-A1",
      "categoryId": "cat-cp-vip",
      "rowLabel": "A",
      "seatNumber": 1,
      "status": "AVAILABLE",
      "categoryName": "VIP Frontstage",
      "price": 4500,
      "color": "#10B981"
    }
  ]
  ```

---

## 3. Reservations Endpoints (Protected)

### `POST /reservations`
Acquires a temporary 10-minute lock on requested seats using PostgreSQL row locking (`FOR UPDATE`).

* **Headers**: `Authorization: Bearer <JWT>`
* **Request Body**:
  ```json
  {
    "eventId": "evt-cyberpulse-2026",
    "seatIds": ["seat-evt-cyberpulse-2026-A1", "seat-evt-cyberpulse-2026-A2"]
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "reservationId": "res-1711234567-xyz",
    "eventId": "evt-cyberpulse-2026",
    "expiresAt": "2026-09-26T14:40:00.000Z",
    "seats": [
      {
        "id": "seat-evt-cyberpulse-2026-A1",
        "rowLabel": "A",
        "seatNumber": 1,
        "price": 4500,
        "categoryName": "VIP Frontstage"
      }
    ],
    "totalPrice": 9000
  }
  ```
* **Error Response (409 Conflict)**:
  ```json
  {
    "error": "Seat A1 is no longer available. It was recently reserved by another user."
  }
  ```

---

### `DELETE /reservations/:id`
Releases an active temporary seat reservation back to `AVAILABLE`.

* **Headers**: `Authorization: Bearer <JWT>`
* **Response (200 OK)**:
  ```json
  {
    "message": "Reservation released successfully"
  }
  ```

---

## 4. Checkout Endpoint (Protected)

### `POST /checkout`
Executes transactional conversion from ACTIVE reservation to CONFIRMED booking and seat status to `SOLD`.

* **Headers**: `Authorization: Bearer <JWT>`
* **Request Body**:
  ```json
  {
    "reservationId": "res-1711234567-xyz"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "bookingId": "bk-1711234567-mno",
    "bookingReference": "TKT-2026-X98A2",
    "eventId": "evt-cyberpulse-2026",
    "eventTitle": "CyberPulse Music Festival 2026",
    "venueName": "NeoArena Grand Dome",
    "date": "October 24, 2026",
    "time": "19:00 PM - 01:00 AM",
    "totalAmount": 9720,
    "seats": [
      {
        "id": "seat-evt-cyberpulse-2026-A1",
        "rowLabel": "A",
        "seatNumber": 1,
        "price": 4500,
        "categoryName": "VIP Frontstage"
      }
    ],
    "createdAt": "2026-09-26T14:32:00.000Z"
  }
  ```

---

## 5. Bookings Endpoints (Protected)

### `GET /bookings`
Retrieves all ticket purchase history for the authenticated user.

* **Headers**: `Authorization: Bearer <JWT>`
* **Response (200 OK)**: Array of booking objects.

---

### `POST /bookings/:id/cancel`
Cancels a confirmed booking, sets status to `CANCELLED`, reverts seat status to `AVAILABLE`, and broadcasts Socket.IO `seat_released` event.

* **Headers**: `Authorization: Bearer <JWT>`
* **Response (200 OK)**:
  ```json
  {
    "message": "Booking cancelled successfully. Seats are now available."
  }
  ```
