import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer | null = null;

export function initSocketIO(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join_event', (eventId: string) => {
      socket.join(`event:${eventId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined event room: event:${eventId}`);
    });

    socket.on('leave_event', (eventId: string) => {
      socket.leave(`event:${eventId}`);
      console.log(`[Socket.IO] Socket ${socket.id} left event room: event:${eventId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO is not initialized!');
  }
  return io;
}

export function broadcastSeatEvent(
  eventType: 'seat_locked' | 'seat_released' | 'seat_sold' | 'booking_cancelled',
  payload: { eventId: string; seatIds: string[]; expiresAt?: string; userId?: string }
) {
  if (!io) return;
  console.log(`[Socket.IO Broadcast] ${eventType} for event ${payload.eventId}, seats: [${payload.seatIds.join(', ')}]`);
  io.to(`event:${payload.eventId}`).emit(eventType, payload);
  io.emit(eventType, payload); // Also emit globally so dashboard/discovery screens can update counts
}
