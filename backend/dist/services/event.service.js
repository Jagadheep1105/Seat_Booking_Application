"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const index_js_1 = require("../db/index.js");
class EventService {
    static async getEvents(category, search) {
        const db = await (0, index_js_1.getDb)();
        let sql = `
      SELECT e.id, e.title, e.category, e.date, e.time, e.venue_name, e.description, e.image_url,
             MIN(tc.price) as starting_price,
             COUNT(s.id) as total_seats,
             SUM(CASE WHEN s.status = 'AVAILABLE' THEN 1 ELSE 0 END) as available_seats
      FROM events e
      LEFT JOIN ticket_categories tc ON e.id = tc.event_id
      LEFT JOIN seats s ON e.id = s.event_id
      WHERE 1=1
    `;
        const params = [];
        if (category && category.toLowerCase() !== 'all') {
            params.push(category);
            sql += ` AND LOWER(e.category) = LOWER($${params.length})`;
        }
        if (search && search.trim() !== '') {
            params.push(`%${search.trim()}%`);
            sql += ` AND (LOWER(e.title) LIKE LOWER($${params.length}) OR LOWER(e.venue_name) LIKE LOWER($${params.length}))`;
        }
        sql += ` GROUP BY e.id ORDER BY e.created_at DESC`;
        const res = await db.query(sql, params);
        return res.rows.map(r => ({
            id: r.id,
            title: r.title,
            category: r.category,
            date: r.date,
            time: r.time,
            venueName: r.venue_name,
            description: r.description,
            imageUrl: r.image_url,
            startingPrice: parseFloat(r.starting_price || 0),
            totalSeats: parseInt(r.total_seats || 0, 10),
            availableSeats: parseInt(r.available_seats || 0, 10)
        }));
    }
    static async getEventById(id) {
        const db = await (0, index_js_1.getDb)();
        const evRes = await db.query(`SELECT id, title, category, date, time, venue_name, description, image_url FROM events WHERE id = $1`, [id]);
        if (evRes.rows.length === 0) {
            throw { status: 404, message: 'Event not found.' };
        }
        const event = evRes.rows[0];
        const catRes = await db.query(`SELECT tc.id, tc.name, tc.price, tc.description, tc.color,
              COUNT(s.id) as total_seats,
              SUM(CASE WHEN s.status = 'AVAILABLE' THEN 1 ELSE 0 END) as available_seats
       FROM ticket_categories tc
       LEFT JOIN seats s ON tc.id = s.category_id
       WHERE tc.event_id = $1
       GROUP BY tc.id`, [id]);
        return {
            id: event.id,
            title: event.title,
            category: event.category,
            date: event.date,
            time: event.time,
            venueName: event.venue_name,
            description: event.description,
            imageUrl: event.image_url,
            categories: catRes.rows.map(c => ({
                id: c.id,
                name: c.name,
                price: parseFloat(c.price),
                description: c.description,
                color: c.color,
                totalSeats: parseInt(c.total_seats || 0, 10),
                availableSeats: parseInt(c.available_seats || 0, 10)
            }))
        };
    }
    static async getEventSeats(eventId) {
        const db = await (0, index_js_1.getDb)();
        const seatsRes = await db.query(`SELECT s.id, s.category_id, s.row_label, s.seat_number, s.status,
              tc.name as category_name, tc.price, tc.color
       FROM seats s
       JOIN ticket_categories tc ON s.category_id = tc.id
       WHERE s.event_id = $1
       ORDER BY s.row_label ASC, s.seat_number ASC`, [eventId]);
        return seatsRes.rows.map(s => ({
            id: s.id,
            categoryId: s.category_id,
            rowLabel: s.row_label,
            seatNumber: parseInt(s.seat_number, 10),
            status: s.status,
            categoryName: s.category_name,
            price: parseFloat(s.price),
            color: s.color
        }));
    }
    static async createEvent(input) {
        const db = await (0, index_js_1.getDb)();
        const eventId = `evt-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        return await db.withTransaction(async (tx) => {
            // 1. Insert Event
            await tx.query(`INSERT INTO events (id, title, category, date, time, venue_name, description, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
                eventId,
                input.title,
                input.category,
                input.date,
                input.time,
                input.venueName,
                input.description,
                input.imageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80'
            ]);
            // 2. Insert Ticket Categories (Explicit single queries for PGlite parameter safety)
            const vipCatId = `cat-${eventId}-vip`;
            const premCatId = `cat-${eventId}-prem`;
            const regCatId = `cat-${eventId}-reg`;
            await tx.query(`INSERT INTO ticket_categories (id, event_id, name, price, description, color)
         VALUES ($1, $2, 'VIP Stage Row', $3, 'Front-row stage view & lounge pass.', '#10B981')`, [vipCatId, eventId, input.vipPrice]);
            await tx.query(`INSERT INTO ticket_categories (id, event_id, name, price, description, color)
         VALUES ($1, $2, 'Premium Tier', $3, 'Elevated central seating.', '#3B82F6')`, [premCatId, eventId, input.premiumPrice]);
            await tx.query(`INSERT INTO ticket_categories (id, event_id, name, price, description, color)
         VALUES ($1, $2, 'Regular Stand', $3, 'Standard venue seating.', '#6B7280')`, [regCatId, eventId, input.regularPrice]);
            // 3. Generate Seat Layout
            const rowConfigs = [
                { row: 'A', catId: vipCatId, count: 10 },
                { row: 'B', catId: premCatId, count: 12 },
                { row: 'C', catId: premCatId, count: 12 },
                { row: 'D', catId: regCatId, count: 14 },
                { row: 'E', catId: regCatId, count: 14 },
                { row: 'F', catId: regCatId, count: 14 }
            ];
            for (const cfg of rowConfigs) {
                for (let num = 1; num <= cfg.count; num++) {
                    const seatId = `seat-${eventId}-${cfg.row}${num}`;
                    await tx.query(`INSERT INTO seats (id, event_id, category_id, row_label, seat_number, status)
             VALUES ($1, $2, $3, $4, $5, 'AVAILABLE')`, [seatId, eventId, cfg.catId, cfg.row, num]);
                }
            }
            return { eventId, message: 'Event created successfully with full SVG venue seat map!' };
        });
    }
}
exports.EventService = EventService;
