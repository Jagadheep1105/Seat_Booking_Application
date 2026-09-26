import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Seat, EventItem } from '../types';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useReservation } from '../context/ReservationContext';
import { useAuth } from '../context/AuthContext';
import { SeatMap } from '../components/SeatMap';
import { BookingSummary } from '../components/BookingSummary';
import { ShieldCheck, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export const SeatSelectionPage: React.FC = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { socket, joinEventRoom, leaveEventRoom } = useSocket();
  const { activeReservation, setActiveReservation } = useReservation();
  const { isAuthenticated } = useAuth();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState<boolean>(true);
  const [isReserving, setIsReserving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    // Fetch Event Info & Seat Map
    fetchSeats();

    // Join Socket.IO Room for real-time seat lock updates
    joinEventRoom(eventId);

    // Socket Event Handlers
    const handleSeatLocked = (payload: { eventId: string; seatIds: string[]; expiresAt?: string; userId?: string }) => {
      if (payload.eventId === eventId) {
        setSeats(prev =>
          prev.map(seat =>
            payload.seatIds.includes(seat.id)
              ? { ...seat, status: 'LOCKED' }
              : seat
          )
        );
      }
    };

    const handleSeatReleased = (payload: { eventId: string; seatIds: string[] }) => {
      if (payload.eventId === eventId) {
        setSeats(prev =>
          prev.map(seat =>
            payload.seatIds.includes(seat.id)
              ? { ...seat, status: 'AVAILABLE' }
              : seat
          )
        );
      }
    };

    const handleSeatSold = (payload: { eventId: string; seatIds: string[] }) => {
      if (payload.eventId === eventId) {
        setSeats(prev =>
          prev.map(seat =>
            payload.seatIds.includes(seat.id)
              ? { ...seat, status: 'SOLD' }
              : seat
          )
        );
      }
    };

    socket.on('seat_locked', handleSeatLocked);
    socket.on('seat_released', handleSeatReleased);
    socket.on('seat_sold', handleSeatSold);
    socket.on('booking_cancelled', handleSeatReleased);

    return () => {
      leaveEventRoom(eventId);
      socket.off('seat_locked', handleSeatLocked);
      socket.off('seat_released', handleSeatReleased);
      socket.off('seat_sold', handleSeatSold);
      socket.off('booking_cancelled', handleSeatReleased);
    };
  }, [eventId]);

  const fetchSeats = async () => {
    setIsLoadingSeats(true);
    try {
      const [evRes, seatsRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/events/${eventId}/seats`)
      ]);
      setEvent(evRes.data);
      setSeats(seatsRes.data);
    } catch (err) {
      console.error('Failed to load seats:', err);
      setErrorMessage('Failed to load event seat map.');
    } finally {
      setIsLoadingSeats(false);
    }
  };

  const handleToggleSeat = (seat: Seat) => {
    // Clear any previous error
    setErrorMessage(null);

    // If seat is currently selected, unselect it
    if (selectedSeats.some(s => s.id === seat.id)) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
    } else {
      // Limit selection to max 6 seats per transaction
      if (selectedSeats.length >= 6) {
        setErrorMessage('Maximum 6 seats can be selected per booking.');
        return;
      }
      setSelectedSeats(prev => [...prev, seat]);
    }
  };

  const handleProceed = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (activeReservation) {
      // Already locked, proceed directly to checkout
      navigate('/checkout');
      return;
    }

    if (selectedSeats.length === 0) return;

    setIsReserving(true);
    setErrorMessage(null);

    try {
      const seatIds = selectedSeats.map(s => s.id);
      const res = await api.post('/reservations', {
        eventId,
        seatIds
      });

      // Reservation lock successful!
      setActiveReservation(res.data);
      navigate('/checkout');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to lock selected seats. Please try again.';
      setErrorMessage(msg);
      // Refresh seats to update availability
      fetchSeats();
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-extrabold text-white">{event?.title || 'Interactive Seat Selection'}</h1>
          <p className="text-xs text-slate-400 mt-1">{event?.venueName} • {event?.date}</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-semibold flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-accent-cyan animate-ping"></span>
            <span>Real-time WebSocket Live</span>
          </div>
        </div>
      </div>

      {/* Conflict / Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-3 animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Concurrency Conflict / Reservation Notice</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Main Grid: Left Seat Map SVG, Right Sticky Summary */}
      {isLoadingSeats ? (
        <div className="py-20 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-accent-emerald animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-mono">Rendering Interactive SVG Venue Seat Map...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SVG Seat Map */}
          <div className="lg:col-span-8">
            <SeatMap
              seats={seats}
              selectedSeatIds={selectedSeats.map(s => s.id)}
              onToggleSeat={handleToggleSeat}
              disabled={!!activeReservation}
            />
          </div>

          {/* Sticky Summary */}
          <div className="lg:col-span-4 sticky top-24">
            <BookingSummary
              selectedSeats={selectedSeats}
              activeReservation={activeReservation}
              onProceed={handleProceed}
              isLoading={isReserving}
              eventTitle={event?.title || 'Event'}
            />
          </div>

        </div>
      )}

    </div>
  );
};
