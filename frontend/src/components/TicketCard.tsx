import React from 'react';
import { Booking } from '../types';
import { Ticket, Calendar, MapPin, CheckCircle, QrCode, Download } from 'lucide-react';

interface TicketCardProps {
  booking: Booking;
}

export const TicketCard: React.FC<TicketCardProps> = ({ booking }) => {
  const eventTitle = booking?.event?.title || 'Verified Event Pass';
  const eventCategory = booking?.event?.category || 'Event';
  const eventDate = booking?.event?.date || 'Upcoming';
  const eventTime = booking?.event?.time || 'Scheduled';
  const venueName = booking?.event?.venueName || 'Venue Arena';
  const seats = booking?.seats || [];
  const totalAmount = booking?.totalAmount || 0;
  const bookingRef = booking?.bookingReference || 'TKT-2026-PASS';
  const bookingStatus = booking?.status || 'CONFIRMED';

  return (
    <div className="relative max-w-xl mx-auto bg-dark-900 border border-accent-emerald/30 rounded-3xl overflow-hidden shadow-2xl shadow-glow-emerald/20">
      
      {/* Top Banner Accent */}
      <div className="h-3 bg-gradient-to-r from-accent-cyan via-accent-emerald to-accent-purple" />

      {/* Ticket Header */}
      <div className="p-8 pb-6 border-b border-dashed border-white/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-accent-emerald" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase text-accent-emerald tracking-widest block font-bold">VERIFIED BOARDING PASS</span>
              <h2 className="text-xl font-extrabold text-white">{eventTitle}</h2>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase flex items-center space-x-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{bookingStatus}</span>
          </div>
        </div>

        {/* Event Meta */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-300">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-accent-cyan" />
            <span>{eventDate} • {eventTime}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-accent-rose" />
            <span className="truncate">{venueName}</span>
          </div>
        </div>
      </div>

      {/* Ticket Body / Seats */}
      <div className="p-8 py-6 bg-dark-950/40 space-y-4">
        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">RESERVED SEATS & TIER</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {seats.map((seat) => (
              <span
                key={seat.id}
                className="px-3 py-1.5 rounded-xl bg-dark-850 border border-white/10 text-white font-mono text-sm font-bold flex items-center space-x-2 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-accent-emerald"></span>
                <span>Row {seat.rowLabel} - Seat {seat.seatNumber}</span>
                <span className="text-xs text-slate-400 font-sans">({seat.categoryName})</span>
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">BOOKING REFERENCE</span>
            <span className="text-lg font-bold font-mono text-white tracking-widest">{bookingRef}</span>
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">TOTAL AMOUNT PAID</span>
            <span className="text-lg font-extrabold font-mono text-accent-emerald">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* QR Code Barcode Section */}
      <div className="p-8 pt-6 border-t border-dashed border-white/15 bg-dark-900 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-white rounded-xl shadow-md">
            <QrCode className="w-16 h-16 text-dark-950" />
          </div>
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase block">SCAN AT ENTRY GATE</span>
            <span className="text-xs font-mono text-slate-500">AUTH ID: {booking?.id || 'VERIFIED'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="p-2.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-200 border border-white/10 transition-colors"
            title="Download / Print Ticket"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
