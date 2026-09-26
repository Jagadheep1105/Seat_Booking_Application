import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDb } from './db/index.js';
import { seedDatabase } from './db/seed.js';
import { initSocketIO } from './sockets/socket.manager.js';
import { ExpirationService } from './services/expiration.service.js';

import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';
import reservationRoutes from './routes/reservation.routes.js';
import checkoutRoutes from './routes/checkout.routes.js';
import bookingRoutes from './routes/booking.routes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Socket.IO
initSocketIO(server);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'SD-08 Ticketing Backend' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Unhandled Error]:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  try {
    // 1. Initialize Database Schema
    await getDb();

    // 2. Seed Initial Events & Seats
    await seedDatabase();

    // 3. Start Expiration Worker
    ExpirationService.startWorker(5000);

    // 4. Start Listening
    server.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 SD-08 Ticketing Server running on http://localhost:${PORT}`);
      console.log(`⚡ Socket.IO active and ready for real-time seat locks`);
      console.log(`🔒 Concurrent PostgreSQL row-locking active`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
