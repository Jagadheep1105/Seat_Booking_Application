import React from 'react';
import { Seat, Reservation } from '../types';
import { CountdownTimer } from './CountdownTimer';
import { ShoppingBag, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

interface BookingSummaryProps {
  selectedSeats: Seat[];
  activeReservation: Reservation | null;
  onProceed: () => void;
  isLoading: boolean;
  eventTitle: string;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  selectedSeats,
  activeReservation,
  onProceed,
  isLoading,
  eventTitle
}) => {
  const isReserved = !!activeReservation;
  
  // Calculate itemized pricing
  const seatsToCalculate = isReserved
    ? activeReservation.seats
    : selectedSeats.map(s => ({
        id: s.id,
        rowLabel: s.rowLabel,
        seatNumber: s.seatNumber,
        price: s.price,
        categoryName: s.categoryName
      }));

  const subtotal = seatsToCalculate.reduce((acc, s) => acc + s.price, 0);
  const bookingFee = subtotal > 0 ? Math.round(subtotal * 0.08) : 0;
  const grandTotal = subtotal + bookingFee;

  return (
    <div className="bg-dark-900 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-accent-emerald" />
            <h3 className="font-bold text-white text-lg">Booking Summary</h3>
          </div>

          {isReserved && (
            <CountdownTimer expiresAt={activeReservation.expiresAt} />
          )}
        </div>

        {/* Selected Seats List */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400">
            <span>SELECTED SEATS ({seatsToCalculate.length})</span>
            <span>CATEGORY</span>
          </div>

          {seatsToCalculate.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-white/10 rounded-xl bg-dark-950/40">
              <p className="text-sm text-slate-400 font-medium">No seats selected yet</p>
              <p className="text-xs text-slate-500 mt-1">Click available seats on the interactive SVG map</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {seatsToCalculate.map((seat) => (
                <div
                  key={seat.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-dark-950/60 border border-white/5 text-sm"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-lg bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald flex items-center justify-center font-bold font-mono text-xs">
                      {seat.rowLabel}{seat.seatNumber}
                    </span>
                    <div>
                      <span className="font-medium text-white block">Row {seat.rowLabel} - Seat {seat.seatNumber}</span>
                      <span className="text-[11px] text-slate-400">{seat.categoryName}</span>
                    </div>
                  </div>
                  <span className="font-bold text-white font-mono">₹{seat.price.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Financial Breakdown */}
        {seatsToCalculate.length > 0 && (
          <div className="mt-6 pt-4 border-t border-white/10 space-y-2.5 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono text-slate-200">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Convenience & Tech Fee (8%)</span>
              <span className="font-mono text-slate-200">₹{bookingFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-white/10 text-base font-extrabold text-white">
              <span>Grand Total</span>
              <span className="font-mono text-accent-emerald text-xl">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Security & CTA */}
      <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-accent-cyan flex-shrink-0" />
          <span>PostgreSQL atomic lock guarantees zero double-booking</span>
        </div>

        <button
          onClick={onProceed}
          disabled={seatsToCalculate.length === 0 || isLoading}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-dark-950 flex items-center justify-center space-x-2 shadow-lg transition-all duration-200 ${
            seatsToCalculate.length === 0 || isLoading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
              : isReserved
              ? 'bg-accent-emerald hover:bg-emerald-400 shadow-glow-emerald hover:-translate-y-0.5'
              : 'bg-accent-cyan hover:bg-cyan-400 shadow-glow-cyan hover:-translate-y-0.5'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Verifying Concurrency Lock...</span>
            </>
          ) : isReserved ? (
            <>
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Reserve & Lock Seats</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
