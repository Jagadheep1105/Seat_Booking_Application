import React, { useEffect, useState } from 'react';
import { Booking } from '../types';
import { api } from '../services/api';
import { History, Calendar, MapPin, Ticket, Ban, CheckCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BookingHistoryPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Reserved seats will be released back to the venue map.')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      // Refresh list
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-xs font-mono text-accent-emerald uppercase tracking-widest">
          <History className="w-4 h-4" />
          <span>USER BOOKING RECORDS</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white">My Booking History</h1>
        <p className="text-slate-400 text-sm">Review your active tickets, confirmed orders, and cancelled bookings.</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-accent-emerald animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading your ticket history...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-dark-900 border border-white/10 rounded-3xl space-y-4">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-white font-bold text-lg">No booking records found</p>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">Explore upcoming music, sports, and tech events to reserve your seats.</p>
          <Link to="/events" className="inline-block px-6 py-2.5 rounded-xl bg-accent-emerald text-dark-950 font-bold text-sm">
            Discover Events
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="p-6 rounded-3xl bg-dark-900 border border-white/10 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 hover:border-white/20 transition-all glass-panel"
            >
              {/* Left Details */}
              <div className="flex items-start space-x-5">
                <img
                  src={booking.event.imageUrl}
                  alt={booking.event.title}
                  className="w-24 h-24 rounded-2xl object-cover border border-white/10 flex-shrink-0"
                />

                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono text-accent-cyan font-bold">{booking.bookingReference}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      booking.status === 'CONFIRMED'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white">{booking.event.title}</h3>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-accent-cyan" />
                      <span>{booking.event.date}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-accent-rose" />
                      <span>{booking.event.venueName}</span>
                    </div>
                  </div>

                  {/* Seat badges */}
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {booking.seats.map((seat) => (
                      <span key={seat.id} className="px-2 py-0.5 rounded-md bg-dark-950 border border-white/10 text-xs font-mono font-bold text-slate-200">
                        Row {seat.rowLabel}-{seat.seatNumber}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Action */}
              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-4 md:pt-0 border-white/10 space-y-2">
                <div className="text-left md:text-right">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">TOTAL PAID</span>
                  <span className="text-xl font-extrabold text-accent-emerald font-mono">₹{booking.totalAmount.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/confirmation/${booking.id}`}
                    className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-200 text-xs font-semibold border border-white/10 transition-colors"
                  >
                    View Voucher
                  </Link>

                  {booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center space-x-1"
                    >
                      {cancellingId === booking.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Ban className="w-3.5 h-3.5" />
                      )}
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
