"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DDL_SCHEMA = void 0;
exports.DDL_SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_categories (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT NOT NULL,
  color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS seats (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES ticket_categories(id) ON DELETE CASCADE,
  row_label TEXT NOT NULL,
  seat_number INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'AVAILABLE',
  version INT NOT NULL DEFAULT 1,
  UNIQUE (event_id, row_label, seat_number)
);

CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reservation_items (
  id TEXT PRIMARY KEY,
  reservation_id TEXT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  seat_id TEXT NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  reservation_id TEXT REFERENCES reservations(id),
  booking_reference TEXT UNIQUE NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONFIRMED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booking_items (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  seat_id TEXT NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_seats_event_status ON seats(event_id, status);
CREATE INDEX IF NOT EXISTS idx_reservations_status_expires ON reservations(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
`;
