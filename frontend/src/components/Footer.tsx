import React from 'react';
import { Ticket, Cpu, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-dark-950 border-t border-white/10 py-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-accent-emerald/10 border border-accent-emerald/30 flex items-center justify-center">
              <Ticket className="w-4 h-4 text-accent-emerald" />
            </div>
            <div>
              <span className="text-white font-bold tracking-tight">PULSE PASS</span>
              <p className="text-xs text-slate-500">Hackathon CSE Project SD-08 • Concurrent Seat Booking Engine</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-accent-cyan" />
              <span>PostgreSQL Transaction Locking</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" />
              <span>Socket.IO Realtime Engine</span>
            </span>
          </div>

          <p className="text-xs text-slate-500">
            © 2026 Pulse Pass. Built for Hackathon Evaluation.
          </p>
        </div>
      </div>
    </footer>
  );
};
