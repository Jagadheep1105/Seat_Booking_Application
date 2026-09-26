"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const index_js_1 = require("./db/index.js");
const seed_js_1 = require("./db/seed.js");
const socket_manager_js_1 = require("./sockets/socket.manager.js");
const expiration_service_js_1 = require("./services/expiration.service.js");
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const event_routes_js_1 = __importDefault(require("./routes/event.routes.js"));
const reservation_routes_js_1 = __importDefault(require("./routes/reservation.routes.js"));
const checkout_routes_js_1 = __importDefault(require("./routes/checkout.routes.js"));
const booking_routes_js_1 = __importDefault(require("./routes/booking.routes.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize Socket.IO
(0, socket_manager_js_1.initSocketIO)(server);
// Routes
app.use('/api/auth', auth_routes_js_1.default);
app.use('/api/events', event_routes_js_1.default);
app.use('/api/reservations', reservation_routes_js_1.default);
app.use('/api/checkout', checkout_routes_js_1.default);
app.use('/api/bookings', booking_routes_js_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'SD-08 Ticketing Backend' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[Unhandled Error]:', err);
    res.status(500).json({ error: 'Internal server error' });
});
async function startServer() {
    try {
        // 1. Initialize Database Schema
        await (0, index_js_1.getDb)();
        // 2. Seed Initial Events & Seats
        await (0, seed_js_1.seedDatabase)();
        // 3. Start Expiration Worker
        expiration_service_js_1.ExpirationService.startWorker(5000);
        // 4. Start Listening
        server.listen(PORT, () => {
            console.log(`=======================================================`);
            console.log(`🚀 SD-08 Ticketing Server running on http://localhost:${PORT}`);
            console.log(`⚡ Socket.IO active and ready for real-time seat locks`);
            console.log(`🔒 Concurrent PostgreSQL row-locking active`);
            console.log(`=======================================================`);
        });
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}
startServer();
