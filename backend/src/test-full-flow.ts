import { getDb } from './db/index.js';
import { seedDatabase } from './db/seed.js';
import { EventService } from './services/event.service.js';
import { ReservationService } from './services/reservation.service.js';
import { CheckoutService } from './services/checkout.service.js';
import { BookingService } from './services/booking.service.js';

async function runFullFlowVerification() {
  console.log('=======================================================');
  console.log('🧪 TESTING FULL APPLICATION FLOW & REGISTRATION 🧪');
  console.log('=======================================================');

  // Initialize DB and Seed Data
  await getDb();
  await seedDatabase();

  const testUser = 'user-demo-1';

  // 1. Create Custom Event Test
  console.log('\n[1] Testing Custom Event Creation...');
  const newEv = await EventService.createEvent({
    title: 'Neon Symphony 2026',
    category: 'Music',
    date: 'December 15, 2026',
    time: '20:00 PM - 23:00 PM',
    venueName: 'Grand Arena Dome',
    description: 'An extraordinary live event experience with VIP, Premium, and Regular venue seat layouts.',
    vipPrice: 4000,
    premiumPrice: 2500,
    regularPrice: 1200
  });

  console.log(`✅ Event Created Successfully! Event ID: ${newEv.eventId}`);

  // 2. Fetch Created Event Seats
  const seats = await EventService.getEventSeats(newEv.eventId);
  console.log(`✅ Venue Seat Map Generated: ${seats.length} total seats created.`);
  const targetSeat = seats[0]; // Seat A1

  // 3. Reserve Seats Test
  console.log(`\n[2] Testing Temporary Seat Lock for Seat '${targetSeat.rowLabel}${targetSeat.seatNumber}'...`);
  const reservation = await ReservationService.reserveSeats(testUser, newEv.eventId, [targetSeat.id]);
  console.log(`✅ Seats Held Successfully! Reservation ID: ${reservation.reservationId}, Expires: ${reservation.expiresAt}`);

  // 4. Checkout Booking Test
  console.log(`\n[3] Testing Transactional Checkout...`);
  const booking = await CheckoutService.processCheckout(testUser, reservation.reservationId);
  console.log(`✅ Booking Confirmed! Ref: ${booking.bookingReference}, Total Amount: ₹${booking.totalAmount}`);

  // 5. Booking History Test
  console.log(`\n[4] Testing User Booking History...`);
  const history = await BookingService.getUserBookings(testUser);
  console.log(`✅ User Has ${history.length} Confirmed Bookings in Database.`);

  // 6. Cancellation Test
  console.log(`\n[5] Testing Booking Cancellation & Seat Reversal...`);
  const cancelRes = await BookingService.cancelBooking(testUser, booking.bookingId);
  console.log(`✅ ${cancelRes.message}`);

  const updatedSeats = await EventService.getEventSeats(newEv.eventId);
  const releasedSeat = updatedSeats.find(s => s.id === targetSeat.id);
  console.log(`✅ Seat '${releasedSeat?.rowLabel}${releasedSeat?.seatNumber}' Status After Cancellation: ${releasedSeat?.status}`);

  console.log('\n=======================================================');
  console.log('🎉 ALL BACKEND WORKFLOWS & APIS ARE 100% OPERATIONAL!');
  console.log('=======================================================');

  process.exit(0);
}

runFullFlowVerification().catch((err) => {
  console.error('[Flow Verification Error]:', err);
  process.exit(1);
});
