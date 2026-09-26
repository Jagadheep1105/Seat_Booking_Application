"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketIO = initSocketIO;
exports.getIO = getIO;
exports.broadcastSeatEvent = broadcastSeatEvent;
const socket_io_1 = require("socket.io");
let io = null;
function initSocketIO(server) {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    io.on('connection', (socket) => {
        console.log(`[Socket.IO] Client connected: ${socket.id}`);
        socket.on('join_event', (eventId) => {
            socket.join(`event:${eventId}`);
            console.log(`[Socket.IO] Socket ${socket.id} joined event room: event:${eventId}`);
        });
        socket.on('leave_event', (eventId) => {
            socket.leave(`event:${eventId}`);
            console.log(`[Socket.IO] Socket ${socket.id} left event room: event:${eventId}`);
        });
        socket.on('disconnect', () => {
            console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
        });
    });
    return io;
}
function getIO() {
    if (!io) {
        throw new Error('Socket.IO is not initialized!');
    }
    return io;
}
function broadcastSeatEvent(eventType, payload) {
    if (!io)
        return;
    console.log(`[Socket.IO Broadcast] ${eventType} for event ${payload.eventId}, seats: [${payload.seatIds.join(', ')}]`);
    io.to(`event:${payload.eventId}`).emit(eventType, payload);
    io.emit(eventType, payload); // Also emit globally so dashboard/discovery screens can update counts
}
