import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReservation } from '../context/ReservationContext';
import { api } from '../services/api';
import { CountdownTimer } from '../components/CountdownTimer';
import { CreditCard, Lock, ShieldCheck, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { activeReservation, clearReservation } = useReservation();
  const navigate = useNavigate();

  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');
  const [cardHolder, setCardHolder] = useState('Alex Mercer');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotal = activeReservation?.totalPrice || 0;
  const bookingFee = Math.round(subtotal * 0.08);
  const grandTotal = subtotal + bookingFee;

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReservation || isProcessing) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await api.post('/checkout', {
        reservationId: activeReservation.reservationId
      });

      const booking = res.data;
      
      // Navigate to confirmation ticket page first with state
      navigate(`/confirmation/${booking.bookingId}`, { state: { booking }, replace: true });
      
      // Clear reservation context after navigation completes
      setTimeout(() => {
        clearReservation();
      }, 200);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to confirm booking. Please try again.';
      setErrorMessage(msg);
      setIsProcessing(false);
    }
  };

  if (!activeReservation && !isProcessing) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-slate-300 font-bold text-lg">No active seat reservation held.</p>
        <button
          onClick={() => navigate('/events')}
          className="px-6 py-2.5 rounded-xl bg-accent-emerald text-dark-950 font-bold text-sm"
        >
          Browse Events
        </button>
      </div>
    );
  }

  return (
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Fullscreen Loading Backdrop Overlay during payment submission */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-dark-950/90 backdrop-blur-lg flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-accent-emerald/20 border-2 border-accent-emerald text-accent-emerald flex items-center justify-center animate-spin">
            <RefreshCw className="w-8 h-8" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-white">Confirming Transactional Booking...</h3>
            <p className="text-xs font-mono text-slate-400">Converting PostgreSQL row locks from TEMPORARY to SOLD</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-white mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Modify Seat Selection</span>
          </button>
          <h1 className="text-3xl font-extrabold text-white">Checkout & Verification</h1>
        </div>

        {activeReservation && (
          <CountdownTimer expiresAt={activeReservation.expiresAt} />
        )}
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Payment Form */}
        <div className="md:col-span-7 space-y-6">
          <form onSubmit={handleConfirmBooking} className="p-8 rounded-3xl bg-dark-900 border border-white/10 space-y-6 shadow-2xl glass-panel">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-accent-cyan" />
                <h3 className="font-bold text-white text-lg">Mock Payment Portal</h3>
              </div>
              <span className="text-xs font-mono text-accent-emerald bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                TEST DEMO MODE
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Cardholder Name</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-dark-950 border border-white/10 text-white font-medium focus:outline-none focus:border-accent-emerald"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-dark-950 border border-white/10 text-white font-mono font-medium focus:outline-none focus:border-accent-emerald"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-dark-950 border border-white/10 text-white font-mono font-medium focus:outline-none focus:border-accent-emerald"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">CVV / CVC</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-dark-950 border border-white/10 text-white font-mono font-medium focus:outline-none focus:border-accent-emerald"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-accent-emerald hover:bg-emerald-400 text-dark-950 font-extrabold text-base flex items-center justify-center space-x-2 shadow-glow-emerald transition-all"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Confirming Booking...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay & Confirm Booking (₹{grandTotal.toLocaleString('en-IN')})</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Review */}
        {activeReservation && (
          <div className="md:col-span-5 p-6 rounded-3xl bg-dark-900 border border-white/10 space-y-6 shadow-2xl">
            <h3 className="font-bold text-white text-lg">Order Items</h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {activeReservation.seats.map((seat) => (
                <div key={seat.id} className="flex items-center justify-between p-3 rounded-xl bg-dark-950/60 border border-white/5 text-sm">
                  <div>
                    <span className="font-bold text-white block">Row {seat.rowLabel} - Seat {seat.seatNumber}</span>
                    <span className="text-xs text-slate-400">{seat.categoryName}</span>
                  </div>
                  <span className="font-mono text-white font-bold">₹{seat.price.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Seats Subtotal</span>
                <span className="font-mono text-slate-200">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tech & Booking Fee</span>
                <span className="font-mono text-slate-200">₹{bookingFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-white/10 text-lg font-extrabold text-white">
                <span>Total Payable</span>
                <span className="font-mono text-accent-emerald">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
