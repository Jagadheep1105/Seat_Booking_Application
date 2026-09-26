# SD-08 — Concurrency Deep Dive & Race Condition Benchmark

This document explains the concurrency protection mechanics of **Pulse Pass**, detailing why frontend-only checks fail, how PostgreSQL row locking prevents race conditions, and how to execute a live 2-browser evaluation test.

---

## 1. What is a Race Condition in Event Ticketing?

A **race condition** occurs when two or more asynchronous processes attempt to read and write shared state at nearly the exact same millisecond, leading to inconsistent or corrupted state.

### The Naive (Vulnerable) Approach:
```javascript
// ❌ WRONG: Vulnerable to race conditions!
const seat = await db.query('SELECT status FROM seats WHERE id = $1', [seatId]);

if (seat.status === 'AVAILABLE') {
  // ⚡ CONCURRENCY BUG HERE:
  // If User A and User B execute this IF check simultaneously,
  // BOTH see status === 'AVAILABLE' before either updates it!
  await db.query('UPDATE seats SET status = "LOCKED" WHERE id = $1', [seatId]);
  return success();
}
```

If User A and User B request Seat `A10` at $t = 0\text{ms}$, both read `status = AVAILABLE`. Both proceed into the `if` block, and both execute the update. As a result, **both users receive confirmation for the exact same seat** (double booking).

---

## 2. Why Frontend Checking is Insufficient

Frontend state (JavaScript variables, React state) exists **only inside individual client browsers**.
- Window A has no direct knowledge of Window B's local state.
- Even with WebSockets, network latency means a user can click a seat before the broadcast arrives.
- Attackers can bypass frontend UI completely and send direct HTTP API requests (`POST /api/reservations`).

Therefore, **the backend database MUST be the sole authority** enforcing concurrency invariants.

---

## 3. The Solution: PostgreSQL Row-Level Locking (`FOR UPDATE`)

Pulse Pass implements atomic transaction execution with explicit row-level locking:

```typescript
return await db.withTransaction(async (tx) => {
  // 🔒 Acquire exclusive row lock on requested seat rows
  const lockQuery = `
    SELECT s.id, s.row_label, s.seat_number, s.status
    FROM seats s
    WHERE s.event_id = $1 AND s.id IN ($2)
    FOR UPDATE
  `;
  
  const seatsRes = await tx.query(lockQuery, [eventId, seatId]);
  const seat = seatsRes.rows[0];

  // Under lock: check availability
  if (seat.status !== 'AVAILABLE') {
    // Transaction rolls back, releasing locks
    throw { status: 409, message: `Seat ${seat.row_label}${seat.seatNumber} is no longer available.` };
  }

  // Atomically update status
  await tx.query(`UPDATE seats SET status = 'LOCKED' WHERE id = $1`, [seatId]);
  
  // Commit transaction
  return reservationDetails;
});
```

### How PostgreSQL Handles Dual Requests:
1. **User A Request Arrives ($t = 0\text{ms}$)**: Transaction A begins. `SELECT ... FOR UPDATE` acquires an exclusive lock on row `Seat A10`.
2. **User B Request Arrives ($t = 1\text{ms}$)**: Transaction B attempts `SELECT ... FOR UPDATE` on `Seat A10`. PostgreSQL **suspends Transaction B** until Transaction A completes.
3. **Transaction A Completes ($t = 5\text{ms}$)**: Seat A10 status is updated to `LOCKED`. Transaction A commits and releases lock.
4. **Transaction B Resumes ($t = 6\text{ms}$)**: Transaction B reads Seat A10. It sees `status === 'LOCKED'`.
5. **Rejection**: Transaction B fails the `status !== 'AVAILABLE'` check, rolls back, and returns `HTTP 409 Conflict`: `"Seat A10 is no longer available. It was recently reserved by another user."`

---

## 4. Dual-Browser Verification Test Protocol

To demonstrate this feature to evaluators:

### Step-by-Step Scenario:
1. Open **Browser Window 1** (Chrome) and **Browser Window 2** (Edge / Firefox / Incognito).
2. Navigate both windows to `http://localhost:3000/events/evt-cyberpulse-2026/seats`.
3. Position windows side-by-side on your screen.
4. In **Window 1**, select **Seat `A10`**. Do NOT click reserve yet.
5. In **Window 2**, select **Seat `A10`**.
6. Click **Reserve & Lock Seats** in **Window 1**.
   - **Result in Window 1**: Reservation successful! 10-minute timer begins.
   - **Result in Window 2**: Real-time Socket.IO update instantly turns Seat `A10` amber (**TEMPORARILY LOCKED**).
7. Now click **Reserve & Lock Seats** in **Window 2**.
   - **Result in Window 2**: Immediate rejection alert: `"Seat A10 is no longer available. It was recently reserved by another user."`
8. **Conclusion**: Zero double booking occurs. PostgreSQL row-locking guaranteed atomic isolation.
