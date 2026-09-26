import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Booking } from '../types';
import { api } from '../services/api';
import { TicketCard } from '../components/TicketCard';
import { CheckCircle, History, Compass, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export const ConfirmationPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();

  const [booking, setBooking] = useState<Booking | null>(() => {
    const passedBooking = location.state?.booking;
    if (passedBooking && (passedBooking.event || passedBooking.eventTitle)) {
      return passedBooking;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(!booking);

  useEffect(() => {
    if (!booking && bookingId) {
      setIsLoading(true);
      api.get(`/bookings/${bookingId}`)
        .then(res => {
          setBooking(res.data);
        })
        .catch(err => {
          console.error('Failed to fetch booking details:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [bookingId, booking]);

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-accent-emerald animate-spin mx-auto" />
        <p className="text-slate-300 font-bold text-lg">Generating Verified Digital Ticket Pass...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <CheckCircle className="w-12 h-12 text-accent-emerald mx-auto" />
        <h2 className="text-2xl font-bold text-white">Booking Confirmed!</h2>
        <p className="text-slate-400 text-sm">Your seats have been booked successfully. You can review your ticket pass in your history.</p>
        <div className="pt-4 flex justify-center space-x-4">
          <Link to="/bookings" className="px-6 py-2.5 rounded-xl bg-accent-emerald text-dark-950 font-bold text-sm">
            View My Bookings
          </Link>
          <Link to="/events" className="px-6 py-2.5 rounded-xl bg-dark-850 text-slate-200 border border-white/10 font-bold text-sm">
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3"
      >
        <div className="w-16 h-16 rounded-full bg-accent-emerald/20 border-2 border-accent-emerald text-accent-emerald flex items-center justify-center mx-auto shadow-glow-emerald">
          <CheckCircle className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono text-accent-emerald uppercase tracking-widest block font-bold">TRANSACTION SUCCESSFUL</span>
        <h1 className="text-4xl font-extrabold text-white">Booking Confirmed!</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Your seats have been permanently converted from temporary lock to <strong className="text-white">SOLD</strong> in PostgreSQL database.
        </p>
      </motion.div>

      {/* Ticket Card Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <TicketCard booking={booking} />
      </motion.div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
        <Link
          to="/bookings"
          className="px-6 py-3 rounded-xl bg-dark-850 hover:bg-dark-800 border border-white/10 text-white font-bold text-sm flex items-center space-x-2 transition-colors"
        >
          <History className="w-4 h-4 text-accent-emerald" />
          <span>View All My Bookings</span>
        </Link>

        <Link
          to="/events"
          className="px-6 py-3 rounded-xl bg-accent-emerald text-dark-950 font-bold text-sm shadow-glow-emerald hover:bg-emerald-400 transition-colors flex items-center space-x-2"
        >
          <Compass className="w-4 h-4" />
          <span>Explore More Events</span>
        </Link>
      </div>

    </div>
  );
};
