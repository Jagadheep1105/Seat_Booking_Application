"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const index_js_1 = require("../db/index.js");
const socket_manager_js_1 = require("../sockets/socket.manager.js");
class BookingService {
    static async getUserBookings(userId) {
        const db = await (0, index_js_1.getDb)();
        const query = `
      SELECT b.id, b.booking_reference, b.total_amount, b.status, b.created_at,
             e.id as event_id, e.title as event_title, e.category as event_category,
             e.date as event_date, e.time as event_time, e.venue_name, e.image_url
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `;
        const res = await db.query(query, [userId]);
        const bookings = [];
        for (const b of res.rows) {
            const itemsRes = await db.query(`SELECT bi.seat_id, bi.price, s.row_label, s.seat_number, tc.name as category_name
         FROM booking_items bi
         JOIN seats s ON bi.seat_id = s.id
         JOIN ticket_categories tc ON s.category_id = tc.id
         WHERE bi.booking_id = $1`, [b.id]);
            bookings.push({
                id: b.id,
                bookingReference: b.booking_reference,
                totalAmount: parseFloat(b.total_amount),
                status: b.status,
                createdAt: b.created_at,
                event: {
                    id: b.event_id,
                    title: b.event_title,
                    category: b.event_category,
                    date: b.event_date,
                    time: b.event_time,
                    venueName: b.venue_name,
                    imageUrl: b.image_url
                },
                seats: itemsRes.rows.map(i => ({
                    id: i.seat_id,
                    rowLabel: i.row_label,
                    seatNumber: i.seat_number,
                    price: parseFloat(i.price),
                    categoryName: i.category_name
                }))
            });
        }
        return bookings;
    }
    static async getBookingById(userId, bookingId) {
        const bookings = await this.getUserBookings(userId);
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) {
            throw { status: 404, message: 'Booking not found.' };
        }
        return booking;
    }
    static async cancelBooking(userId, bookingId) {
        const db = await (0, index_js_1.getDb)();
        return await db.withTransaction(async (tx) => {
            const bRes = await tx.query(`SELECT id, event_id, status FROM bookings WHERE id = $1 AND user_id = $2 FOR UPDATE`, [bookingId, userId]);
            if (bRes.rows.length === 0) {
                throw { status: 404, message: 'Booking not found or access denied.' };
            }
            const booking = bRes.rows[0];
            if (booking.status === 'CANCELLED') {
                throw { status: 400, message: 'Booking is already cancelled.' };
            }
            // Fetch seat IDs
            const itemsRes = await tx.query(`SELECT seat_id FROM booking_items WHERE booking_id = $1`, [bookingId]);
            const seatIds = itemsRes.rows.map(r => r.seat_id);
            // Revert seats to AVAILABLE
            if (seatIds.length > 0) {
                await tx.query(`UPDATE seats SET status = 'AVAILABLE' WHERE id = ANY($1::text[])`, [seatIds]);
            }
            // Update booking status
            await tx.query(`UPDATE bookings SET status = 'CANCELLED' WHERE id = $1`, [bookingId]);
            // Broadcast Socket event
            setImmediate(() => {
                (0, socket_manager_js_1.broadcastSeatEvent)('booking_cancelled', {
                    eventId: booking.event_id,
                    seatIds
                });
            });
            return { message: 'Booking cancelled successfully. Seats are now available.' };
        });
    }
}
exports.BookingService = BookingService;
