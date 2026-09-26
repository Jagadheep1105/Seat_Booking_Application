export type SeatStatus = 'AVAILABLE' | 'SELECTED' | 'LOCKED' | 'SOLD';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface TicketCategory {
  id: string;
  name: string;
  price: number;
  description: string;
  color: string;
  totalSeats?: number;
  availableSeats?: number;
}

export interface EventItem {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  venueName: string;
  description: string;
  imageUrl: string;
  startingPrice?: number;
  totalSeats?: number;
  availableSeats?: number;
  categories?: TicketCategory[];
}

export interface Seat {
  id: string;
  categoryId: string;
  rowLabel: string;
  seatNumber: number;
  status: SeatStatus;
  categoryName: string;
  price: number;
  color: string;
}

export interface ReservationSeat {
  id: string;
  rowLabel: string;
  seatNumber: number;
  price: number;
  categoryName: string;
}

export interface Reservation {
  reservationId: string;
  eventId: string;
  expiresAt: string;
  seats: ReservationSeat[];
  totalPrice: number;
}

export interface BookingSeat {
  id: string;
  rowLabel: string;
  seatNumber: number;
  price: number;
  categoryName: string;
}

export interface Booking {
  id: string;
  bookingReference: string;
  totalAmount: number;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  event: {
    id: string;
    title: string;
    category: string;
    date: string;
    time: string;
    venueName: string;
    imageUrl: string;
  };
  seats: BookingSeat[];
}

export interface SocketSeatPayload {
  eventId: string;
  seatIds: string[];
  expiresAt?: string;
  userId?: string;
}
