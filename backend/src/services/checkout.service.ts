import { getDb } from '../db/index.js';
import { broadcastSeatEvent } from '../sockets/socket.manager.js';

export interface CheckoutResult {
  id: string;
  bookingId: string;
  bookingReference: string;
  totalAmount: number;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  event: {
    id: string;
    title: string;
    category: string;
    date: string;
    time: string;
    venueName: string;
    imageUrl: string;
  };
  seats: Array<{
    id: string;
    rowLabel: string;
    seatNumber: number;
    price: number;
    categoryName: string;
  }>;
}

export class CheckoutService {
  static async processCheckout(userId: string, reservationId: string): Promise<CheckoutResult> {
    const db = await getDb();

    return await db.withTransaction<CheckoutResult>(async (tx) => {
      // 1. Lock reservation record
      const resQuery = await tx.query(
        `SELECT r.id, r.event_id, r.expires_at, r.status, e.title as event_title, e.category as event_category, e.venue_name, e.date, e.time, e.image_url
         FROM reservations r
         JOIN events e ON r.event_id = e.id
         WHERE r.id = $1 AND r.user_id = $2
         FOR UPDATE`,
        [reservationId, userId]
      );

      if (resQuery.rows.length === 0) {
        throw { status: 404, message: 'Active reservation not found.' };
      }

      const resRow = resQuery.rows[0];

      if (resRow.status !== 'ACTIVE') {
        throw { status: 400, message: `Reservation is no longer active (Status: ${resRow.status}).` };
      }

      const now = new Date();
      const expiresAt = new Date(resRow.expires_at);
      if (now > expiresAt) {
        // Expire reservation and release seats
        await tx.query(`UPDATE reservations SET status = 'EXPIRED' WHERE id = $1`, [reservationId]);
        await tx.query(
          `UPDATE seats SET status = 'AVAILABLE' WHERE id IN (
             SELECT seat_id FROM reservation_items WHERE reservation_id = $1
           )`,
          [reservationId]
        );
        throw { status: 410, message: 'Your reservation timer has expired. Please select your seats again.' };
      }

      // 2. Fetch reservation items and associated seat details
      const itemsRes = await tx.query(
        `SELECT ri.seat_id, ri.price, s.row_label, s.seat_number, tc.name as category_name
         FROM reservation_items ri
         JOIN seats s ON ri.seat_id = s.id
         JOIN ticket_categories tc ON s.category_id = tc.id
         WHERE ri.reservation_id = $1`,
        [reservationId]
      );

      if (itemsRes.rows.length === 0) {
        throw { status: 400, message: 'Reservation has no seats associated.' };
      }

      const seatIds = itemsRes.rows.map(r => r.seat_id);
      let totalAmount = 0;
      const seatDetails = [];

      for (const item of itemsRes.rows) {
        const itemPrice = parseFloat(item.price);
        totalAmount += itemPrice;
        seatDetails.push({
          id: item.seat_id,
          rowLabel: item.row_label,
          seatNumber: item.seat_number,
          price: itemPrice,
          categoryName: item.category_name
        });
      }

      // 3. Mark seats as SOLD
      await tx.query(`UPDATE seats SET status = 'SOLD' WHERE id = ANY($1::text[])`, [seatIds]);

      // 4. Update reservation status to CONFIRMED
      await tx.query(`UPDATE reservations SET status = 'CONFIRMED' WHERE id = $1`, [reservationId]);

      // 5. Create Booking
      const bookingId = `bk-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const bookingRef = `TKT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      await tx.query(
        `INSERT INTO bookings (id, user_id, event_id, reservation_id, booking_reference, total_amount, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'CONFIRMED')`,
        [bookingId, userId, resRow.event_id, reservationId, bookingRef, totalAmount]
      );

      // 6. Create Booking Items
      for (const item of itemsRes.rows) {
        const bItemId = `bitem-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        await tx.query(
          `INSERT INTO booking_items (id, booking_id, seat_id, price)
           VALUES ($1, $2, $3, $4)`,
          [bItemId, bookingId, item.seat_id, parseFloat(item.price)]
        );
      }

      // 7. Broadcast Socket.IO event
      setImmediate(() => {
        broadcastSeatEvent('seat_sold', {
          eventId: resRow.event_id,
          seatIds
        });
      });

      return {
        id: bookingId,
        bookingId,
        bookingReference: bookingRef,
        totalAmount,
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
        event: {
          id: resRow.event_id,
          title: resRow.event_title,
          category: resRow.event_category || 'Event',
          date: resRow.date,
          time: resRow.time,
          venueName: resRow.venue_name,
          imageUrl: resRow.image_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80'
        },
        seats: seatDetails
      };
    });
  }
}
