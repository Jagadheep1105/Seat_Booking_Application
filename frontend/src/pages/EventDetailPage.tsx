import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Ticket, ChevronRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { EventItem } from '../types';
import { api } from '../services/api';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      api.get(`/events/${id}`)
        .then(res => {
          setEvent(res.data);
          setIsLoading(false);
        })
        .catch(err => {
          setError(err.response?.data?.error || 'Failed to load event details');
          setIsLoading(false);
        });
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="h-96 rounded-3xl bg-dark-900 border border-white/10" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-rose-400 font-bold text-lg">{error || 'Event not found'}</p>
        <Link to="/events" className="inline-block px-4 py-2 rounded-xl bg-dark-800 text-slate-200 text-sm">
          Return to Events Discovery
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Back Button */}
      <Link to="/events" className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events</span>
      </Link>

      {/* Hero Banner Showcase */}
      <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-dark-900 shadow-2xl h-[450px]">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-transparent" />

        <div className="absolute bottom-8 left-8 right-8 space-y-4 max-w-3xl">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent-emerald text-dark-950 shadow-glow-emerald">
            {event.category}
          </span>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">{event.title}</h1>

          <div className="flex flex-wrap gap-6 text-sm text-slate-200 font-medium">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-accent-cyan" />
              <span>{event.date} • {event.time}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-accent-rose" />
              <span>{event.venueName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Description & Perks */}
        <div className="lg:col-span-8 space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">About The Event</h3>
            <p className="text-slate-300 text-base leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Ticket Categories Tier Breakdown */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Ticket Categories</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {event.categories?.map((cat) => (
                <div
                  key={cat.id}
                  className="p-6 rounded-2xl bg-dark-900 border border-white/10 space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-lg">{cat.name}</span>
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    </div>

                    <p className="text-xs text-slate-400 mt-2 leading-normal">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">PRICE</span>
                      <span className="text-xl font-extrabold text-accent-emerald font-mono">
                        ₹{cat.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <span className="text-xs text-slate-400 font-mono">
                      {cat.availableSeats} / {cat.totalSeats} seats
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Action Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 p-8 rounded-3xl bg-dark-900 border border-white/15 shadow-2xl space-y-6 glass-panel">
            <div>
              <span className="text-xs uppercase text-slate-400 font-mono block">SEAT MAP REGISTRATION</span>
              <h4 className="text-xl font-bold text-white mt-1">Ready to Select Seats?</h4>
            </div>

            <div className="p-4 rounded-2xl bg-dark-950/60 border border-white/5 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Real-time Map:</span>
                <span className="text-accent-emerald font-bold">Interactive SVG</span>
              </div>
              <div className="flex justify-between">
                <span>Temporary Lock:</span>
                <span className="text-accent-amber font-bold">10 Minutes Timer</span>
              </div>
              <div className="flex justify-between">
                <span>Concurrency Protection:</span>
                <span className="text-accent-cyan font-bold">PostgreSQL Engine</span>
              </div>
            </div>

            <Link
              to={`/events/${event.id}/seats`}
              className="w-full py-4 rounded-xl bg-accent-emerald hover:bg-emerald-400 text-dark-950 font-extrabold text-center block shadow-glow-emerald transition-all transform hover:-translate-y-0.5"
            >
              Choose Your Seats
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};
