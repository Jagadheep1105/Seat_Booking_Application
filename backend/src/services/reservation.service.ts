import { getDb, DbAdapter } from '../db/index.js';
import { broadcastSeatEvent } from '../sockets/socket.manager.js';

export interface ReservationResult {
  reservationId: string;
  eventId: string;
  expiresAt: string;
  seats: Array<{
    id: string;
    rowLabel: string;
    seatNumber: number;
    price: number;
    categoryName: string;
  }>;
  totalPrice: number;
}

export class ReservationService {
  /**
   * Reserves seats concurrently using PostgreSQL Atomic Conditional Updates & Transactions.
   * Guarantees that even under simultaneous Promise.all execution, EXACTLY ONE user acquires the seat lock.
   */
  static async reserveSeats(
    userId: string,
    eventId: string,
    seatIds: string[]
  ): Promise<ReservationResult> {
    if (!seatIds || seatIds.length === 0) {
      throw { status: 400, message: 'At least one seat must be selected.' };
    }

    const db = await getDb();
    const LOCK_DURATION_MINUTES = 10;
    const expiresAtDate = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
    const expiresAtIso = expiresAtDate.toISOString();

    return await db.withTransaction<ReservationResult>(async (tx: DbAdapter) => {
      // 1. Clear any previous active reservation held by this user for this event
      const oldRes = await tx.query(
        `SELECT id FROM reservations WHERE user_id = $1 AND event_id = $2 AND status = 'ACTIVE'`,
        [userId, eventId]
      );

      for (const old of oldRes.rows) {
        await tx.query(
          `UPDATE seats SET status = 'AVAILABLE' WHERE id IN (
             SELECT seat_id FROM reservation_items WHERE reservation_id = $1
           )`,
          [old.id]
        );
        await tx.query(`UPDATE reservations SET status = 'EXPIRED' WHERE id = $1`, [old.id]);
      }

      // 2. ATOMIC CONDITIONAL UPDATE: Atomically transition status from AVAILABLE -> LOCKED
      // In PostgreSQL, UPDATE ... WHERE status = 'AVAILABLE' RETURNING ... is guaranteed atomic per row.
      const lockSeatsQuery = `
        UPDATE seats SET status = 'LOCKED'
        WHERE event_id = $1::text AND id = ANY($2::text[]) AND status = 'AVAILABLE'
        RETURNING id, row_label, seat_number, category_id
      `;

      const updateRes = await tx.query(lockSeatsQuery, [eventId, seatIds]);
      const lockedSeats = updateRes.rows;

      // 3. Inspect Atomic Result
      if (lockedSeats.length !== seatIds.length) {
        // Find which seat failed
        const lockedIds = lockedSeats.map(s => s.id);
        const failedSeatId = seatIds.find(id => !lockedIds.includes(id));
        
        throw {
          status: 409,
          message: `Seat (${failedSeatId || 'selected'}) is no longer available. It was reserved or purchased by another user.`
        };
      }

      // 4. Fetch category details for locked seats
      const catQuery = `
        SELECT s.id, s.row_label, s.seat_number, tc.price, tc.name as category_name
        FROM seats s
        JOIN ticket_categories tc ON s.category_id = tc.id
        WHERE s.id = ANY($1::text[])
      `;
      const seatDetailsRes = await tx.query(catQuery, [seatIds]);

      // 5. Insert new reservation record
      const reservationId = `res-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      await tx.query(
        `INSERT INTO reservations (id, user_id, event_id, expires_at, status)
         VALUES ($1, $2, $3, $4, 'ACTIVE')`,
        [reservationId, userId, eventId, expiresAtIso]
      );

      // 6. Insert reservation items
      let totalPrice = 0;
      const formattedSeats = [];

      for (const seat of seatDetailsRes.rows) {
        const itemId = `res-item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const seatPrice = parseFloat(seat.price);
        totalPrice += seatPrice;

        await tx.query(
          `INSERT INTO reservation_items (id, reservation_id, seat_id, price)
           VALUES ($1, $2, $3, $4)`,
          [itemId, reservationId, seat.id, seatPrice]
        );

        formattedSeats.push({
          id: seat.id,
          rowLabel: seat.row_label,
          seatNumber: seat.seat_number,
          price: seatPrice,
          categoryName: seat.category_name
        });
      }

      // 7. Broadcast Socket event after transaction commit
      setImmediate(() => {
        broadcastSeatEvent('seat_locked', {
          eventId,
          seatIds,
          expiresAt: expiresAtIso,
          userId
        });
      });

      return {
        reservationId,
        eventId,
        expiresAt: expiresAtIso,
        seats: formattedSeats,
        totalPrice
      };
    });
  }

  /**
   * Release a temporary reservation manually before it expires
   */
  static async releaseReservation(userId: string, reservationId: string): Promise<void> {
    const db = await getDb();

    await db.withTransaction(async (tx) => {
      const res = await tx.query(
        `SELECT id, event_id, status FROM reservations WHERE id = $1 AND user_id = $2`,
        [reservationId, userId]
      );

      if (res.rows.length === 0) {
        throw { status: 404, message: 'Reservation not found or does not belong to you.' };
      }

      const reservation = res.rows[0];
      if (reservation.status !== 'ACTIVE') {
        return; // Already non-active
      }

      // Get seat IDs
      const items = await tx.query(
        `SELECT seat_id FROM reservation_items WHERE reservation_id = $1`,
        [reservationId]
      );
      const seatIds = items.rows.map(r => r.seat_id);

      // Release seats
      if (seatIds.length > 0) {
        await tx.query(`UPDATE seats SET status = 'AVAILABLE' WHERE id = ANY($1::text[])`, [seatIds]);
      }

      // Update reservation status
      await tx.query(`UPDATE reservations SET status = 'EXPIRED' WHERE id = $1`, [reservationId]);

      setImmediate(() => {
        broadcastSeatEvent('seat_released', {
          eventId: reservation.event_id,
          seatIds
        });
      });
    });
  }
}
