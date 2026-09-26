import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Ticket, Zap, ShieldCheck, Clock, ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { EventItem } from '../types';
import { api } from '../services/api';
import { EventCard } from '../components/EventCard';

export const LandingPage: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    api.get('/events').then(res => {
      setFeaturedEvents(res.data);
    }).catch(err => console.error('Failed to load landing events:', err));
  }, []);

  const primaryEvent = featuredEvents[0];

  return (
    <div className="space-y-24 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-12 overflow-hidden bg-grid-pattern bg-radial-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald text-xs font-semibold uppercase tracking-wider shadow-glow-emerald/20">
              <Zap className="w-3.5 h-3.5" />
              <span>Concurrently Protected Booking Engine</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-sans leading-[1.1]">
              Your seat is <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-emerald via-accent-cyan to-blue-500">waiting.</span>
            </h1>

            <p className="text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              Experience zero double-bookings with live interactive SVG seat selection, real-time Socket.IO availability broadcasts, and PostgreSQL row-level transaction protection.
            </p>

            {/* CTAs */}
            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <Link
                to="/events"
                className="px-8 py-4 rounded-xl bg-accent-emerald text-dark-950 font-bold text-base hover:bg-emerald-400 shadow-glow-emerald transition-all transform hover:-translate-y-0.5 flex items-center space-x-3"
              >
                <Compass className="w-5 h-5" />
                <span>Explore Events</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              {primaryEvent && (
                <Link
                  to={`/events/${primaryEvent.id}`}
                  className="px-6 py-4 rounded-xl bg-dark-850 hover:bg-dark-800 border border-white/15 text-slate-200 font-semibold text-base transition-colors flex items-center space-x-2"
                >
                  <Play className="w-4 h-4 text-accent-cyan fill-accent-cyan" />
                  <span>Featured: {primaryEvent.title.split(' ')[0]}</span>
                </Link>
              )}
            </div>

            {/* Technical Highlights Badges */}
            <div className="pt-8 grid grid-cols-3 gap-4 border-t border-white/10 text-slate-400 text-xs">
              <div>
                <span className="text-white font-bold text-lg block font-mono">100%</span>
                <span>Race Condition Proof</span>
              </div>
              <div>
                <span className="text-white font-bold text-lg block font-mono">10 MIN</span>
                <span>Temporary Seat Lock</span>
              </div>
              <div>
                <span className="text-white font-bold text-lg block font-mono">LIVE</span>
                <span>WebSocket Broadcasts</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column Featured Event Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {primaryEvent ? (
              <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-dark-900 p-3 shadow-2xl shadow-glow-cyan/20 group">
                <div className="relative h-[420px] rounded-2xl overflow-hidden">
                  <img
                    src={primaryEvent.imageUrl}
                    alt={primaryEvent.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6 space-y-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent-emerald text-dark-950">
                      FEATURED EVENT
                    </span>
                    <h2 className="text-2xl font-bold text-white leading-snug">{primaryEvent.title}</h2>
                    <p className="text-xs text-slate-300">{primaryEvent.date} • {primaryEvent.venueName}</p>

                    <Link
                      to={`/events/${primaryEvent.id}`}
                      className="block w-full py-3 text-center rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold text-sm transition-colors"
                    >
                      Select Seats Now
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[420px] rounded-3xl bg-dark-900 border border-white/10 animate-pulse flex items-center justify-center text-slate-500">
                Loading Featured Showcase...
              </div>
            )}
          </motion.div>

        </div>
      </section>

      {/* FEATURED EVENTS CATALOG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-accent-emerald font-bold">DISCOVER EXPERIENCE</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">Live Events & Festivals</h2>
          </div>
          <Link
            to="/events"
            className="text-sm font-semibold text-accent-cyan hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View All Events ({featuredEvents.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* TECHNICAL ARCHITECTURE BENCHMARK BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden border border-white/15">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-mono text-accent-cyan uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" />
              <span>Built for CSE Technical Interviews</span>
            </div>
            <h2 className="text-3xl font-bold text-white">Genuine Concurrency Protection Guaranteed</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Our backend executes atomic PostgreSQL <code className="bg-dark-950 px-2 py-0.5 rounded text-accent-amber font-mono">SELECT ... FOR UPDATE</code> transactions. Even if two users attempt to purchase Seat A10 simultaneously, the database serializes requests and guarantees exactly ONE owner.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
