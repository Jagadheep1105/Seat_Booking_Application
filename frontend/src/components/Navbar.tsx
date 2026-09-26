import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Ticket, User as UserIcon, LogOut, Compass, History, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useReservation } from '../context/ReservationContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { activeReservation } = useReservation();
  const navigate = useNavigate();
  const location = useLocation();

  const isCurrent = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-dark-950/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-emerald to-accent-cyan flex items-center justify-center shadow-glow-emerald group-hover:scale-105 transition-transform duration-300">
            <Ticket className="w-5 h-5 text-dark-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white font-sans">PULSE<span className="text-accent-emerald">PASS</span></span>
            <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-mono">CONCURRENT TICKETING</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/events"
            className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
              isCurrent('/events') ? 'text-accent-emerald' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Discover Events</span>
          </Link>

          {isAuthenticated && (
            <Link
              to="/bookings"
              className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                isCurrent('/bookings') ? 'text-accent-emerald' : 'text-slate-300 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>My Bookings</span>
            </Link>
          )}

          {activeReservation && (
            <Link
              to={`/events/${activeReservation.eventId}/seats`}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-accent-amber/10 border border-accent-amber/30 text-accent-amber text-xs font-semibold animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-accent-amber animate-ping"></span>
              <span>Active Seat Hold</span>
            </Link>
          )}
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-dark-850 border border-white/10">
                <UserIcon className="w-4 h-4 text-accent-emerald" />
                <span className="text-xs font-medium text-slate-200">{user?.name}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-2 rounded-lg bg-dark-850 text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold px-4 py-2 rounded-lg bg-accent-emerald text-dark-950 hover:bg-emerald-400 shadow-glow-emerald transition-all transform hover:-translate-y-0.5"
              >
                Register
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
