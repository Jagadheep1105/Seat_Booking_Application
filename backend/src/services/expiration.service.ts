import { getDb } from '../db/index.js';
import { broadcastSeatEvent } from '../sockets/socket.manager.js';

export class ExpirationService {
  private static timerHandle: NodeJS.Timeout | null = null;

  static startWorker(intervalMs: number = 5000) {
    if (this.timerHandle) return;

    console.log(`[ExpirationWorker] Started background expiration monitor (interval: ${intervalMs}ms)...`);

    this.timerHandle = setInterval(async () => {
      try {
        await this.checkAndCleanupExpiredReservations();
      } catch (err) {
        console.error('[ExpirationWorker] Error during cleanup worker run:', err);
      }
    }, intervalMs);
  }

  static stopWorker() {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }

  static async checkAndCleanupExpiredReservations() {
    const db = await getDb();

    // Query active reservations where expires_at has passed
    const expiredRes = await db.query(
      `SELECT id, event_id FROM reservations WHERE status = 'ACTIVE' AND expires_at <= NOW()`
    );

    if (expiredRes.rows.length === 0) return;

    for (const res of expiredRes.rows) {
      await db.withTransaction(async (tx) => {
        // Fetch seat IDs for this reservation
        const items = await tx.query(
          `SELECT seat_id FROM reservation_items WHERE reservation_id = $1`,
          [res.id]
        );
        const seatIds = items.rows.map(r => r.seat_id);

        // Mark seats as AVAILABLE
        if (seatIds.length > 0) {
          await tx.query(`UPDATE seats SET status = 'AVAILABLE' WHERE id = ANY($1::text[])`, [seatIds]);
        }

        // Mark reservation as EXPIRED
        await tx.query(`UPDATE reservations SET status = 'EXPIRED' WHERE id = $1`, [res.id]);

        console.log(`[ExpirationWorker] Expired reservation ${res.id}, released seats: [${seatIds.join(', ')}]`);

        // Broadcast real-time update
        broadcastSeatEvent('seat_released', {
          eventId: res.event_id,
          seatIds
        });
      });
    }
  }
}
