import { getDb } from './db/index.js';
import { seedDatabase } from './db/seed.js';
import { ReservationService } from './services/reservation.service.js';

async function runConcurrencyBenchmark() {
  console.log('=======================================================');
  console.log('⚡ STARTING CONCURRENCY RACE CONDITION BENCHMARK TEST ⚡');
  console.log('=======================================================');

  // Initialize DB and Seed Data
  await getDb();
  await seedDatabase();

  const targetEventId = 'evt-cyberpulse-2026';
  const targetSeatId = 'seat-evt-cyberpulse-2026-A1'; // Row A, Seat 1 (VIP)
  const userA = 'user-demo-1';
  const userB = 'user-admin-1';

  console.log(`[Test] User A (${userA}) and User B (${userB}) attempting to lock Seat '${targetSeatId}' CONCURRENTLY...`);

  // Execute simultaneous reservation calls using Promise.all
  const results = await Promise.allSettled([
    ReservationService.reserveSeats(userA, targetEventId, [targetSeatId]),
    ReservationService.reserveSeats(userB, targetEventId, [targetSeatId])
  ]);

  console.log('\n--- BENCHMARK RESULTS ---');

  let successCount = 0;
  let rejectedCount = 0;

  results.forEach((res, index) => {
    const userLabel = index === 0 ? 'User A' : 'User B';
    if (res.status === 'fulfilled') {
      successCount++;
      console.log(`✅ ${userLabel}: SUCCESS! Reserved Reservation ID: ${res.value.reservationId}`);
    } else {
      rejectedCount++;
      console.log(`❌ ${userLabel}: REJECTED! Error: "${res.reason.message || res.reason}" (Status: ${res.reason.status || 409})`);
    }
  });

  console.log('-------------------------');
  console.log(`Summary: Successes = ${successCount}, Rejections = ${rejectedCount}`);

  if (successCount === 1 && rejectedCount === 1) {
    console.log('🎉 VERIFICATION PASSED: Database row-level transaction locking successfully prevented double booking!');
  } else {
    console.error('❌ VERIFICATION FAILED: Invariant violated!');
  }

  process.exit(0);
}

runConcurrencyBenchmark().catch((err) => {
  console.error('[Benchmark Error]:', err);
  process.exit(1);
});
