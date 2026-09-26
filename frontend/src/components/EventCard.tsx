import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Ticket, ChevronRight } from 'lucide-react';
import { EventItem } from '../types';
import { motion } from 'framer-motion';

interface EventCardProps {
  event: EventItem;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group relative bg-dark-900 rounded-2xl border border-white/10 overflow-hidden shadow-xl hover:border-accent-emerald/40 hover:shadow-glow-emerald/20 flex flex-col h-full"
    >
      {/* Poster Image Container */}
      <div className="relative h-56 overflow-hidden bg-dark-850">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/30 to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-dark-950/80 backdrop-blur-md border border-white/15 text-accent-cyan">
            {event.category}
          </span>
        </div>

        {/* Available seats badge */}
        <div className="absolute top-4 right-4">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 backdrop-blur-md flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{event.availableSeats} seats left</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-accent-emerald transition-colors line-clamp-1">
            {event.title}
          </h3>

          <div className="mt-3 space-y-2 text-sm text-slate-400">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-accent-cyan flex-shrink-0" />
              <span>{event.date} • {event.time}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-accent-rose flex-shrink-0" />
              <span className="line-clamp-1">{event.venueName}</span>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Price & CTA Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-slate-500 font-mono block">STARTING FROM</span>
            <span className="text-lg font-extrabold text-white">
              ₹{event.startingPrice?.toLocaleString('en-IN')}
            </span>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-dark-800 hover:bg-accent-emerald hover:text-dark-950 text-slate-200 text-xs font-semibold border border-white/10 hover:border-accent-emerald transition-all duration-200"
          >
            <span>Book Seats</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
