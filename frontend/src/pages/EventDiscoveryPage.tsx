import React, { useEffect, useState } from 'react';
import { Search, Compass, Plus, X, Calendar, MapPin, Ticket } from 'lucide-react';
import { EventItem } from '../types';
import { api } from '../services/api';
import { EventCard } from '../components/EventCard';

export const EventDiscoveryPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Music');
  const [date, setDate] = useState('December 15, 2026');
  const [time, setTime] = useState('20:00 PM - 23:00 PM');
  const [venueName, setVenueName] = useState('Grand Arena Dome');
  const [description, setDescription] = useState('An extraordinary live event experience with VIP, Premium, and Regular venue seat layouts.');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80');
  const [vipPrice, setVipPrice] = useState(4000);
  const [premiumPrice, setPremiumPrice] = useState(2500);
  const [regularPrice, setRegularPrice] = useState(1200);

  const categories = ['All', 'Music', 'Sports', 'Conference'];

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, searchQuery]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/events', {
        params: {
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          search: searchQuery.trim() !== '' ? searchQuery.trim() : undefined
        }
      });
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await api.post('/events', {
        title,
        category,
        date,
        time,
        venueName,
        description,
        imageUrl,
        vipPrice: Number(vipPrice),
        premiumPrice: Number(premiumPrice),
        regularPrice: Number(regularPrice)
      });

      setShowModal(false);
      setTitle('');
      fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create custom event');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono text-accent-emerald uppercase tracking-widest">
            <Compass className="w-4 h-4" />
            <span>EVENT DISCOVERY CATALOG</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white">Find Your Next Event</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Browse upcoming music festivals, tech summits, and sports games with real-time seat availability.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-xl bg-accent-emerald text-dark-950 font-bold text-sm shadow-glow-emerald hover:bg-emerald-400 transition-all flex items-center space-x-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Custom Event</span>
        </button>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-dark-900 border border-white/10 glass-panel">
        
        {/* Category Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-accent-emerald text-dark-950 shadow-glow-emerald'
                  : 'bg-dark-850 text-slate-300 hover:bg-dark-800 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-accent-emerald transition-colors"
          />
        </div>

      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 rounded-2xl bg-dark-900 border border-white/10 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-dark-900/50 rounded-3xl border border-white/10">
          <p className="text-slate-300 font-bold text-lg">No events found matching your criteria</p>
          <p className="text-slate-500 text-sm mt-1">Try resetting your search query or create a custom event</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-dark-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-dark-900 border border-white/15 rounded-3xl p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl glass-panel">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Ticket className="w-5 h-5 text-accent-emerald" />
                <h3 className="text-xl font-bold text-white">Manually Add Custom Event</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg bg-dark-850"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Event Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Neon Symphony 2026"
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white focus:outline-none focus:border-accent-emerald"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white focus:outline-none focus:border-accent-emerald"
                  >
                    <option value="Music">Music</option>
                    <option value="Sports">Sports</option>
                    <option value="Conference">Conference</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Date</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white focus:outline-none focus:border-accent-emerald"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white focus:outline-none focus:border-accent-emerald"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Venue Name</label>
                <input
                  type="text"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white focus:outline-none focus:border-accent-emerald"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-950 border border-white/10 text-white focus:outline-none focus:border-accent-emerald"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/10">
                <div>
                  <label className="block text-xs font-mono text-emerald-400 uppercase mb-1">VIP Tier Price (₹)</label>
                  <input
                    type="number"
                    value={vipPrice}
                    onChange={(e) => setVipPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-blue-400 uppercase mb-1">Premium Price (₹)</label>
                  <input
                    type="number"
                    value={premiumPrice}
                    onChange={(e) => setPremiumPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Regular Price (₹)</label>
                  <input
                    type="number"
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-3.5 rounded-xl bg-accent-emerald text-dark-950 font-bold text-sm hover:bg-emerald-400 shadow-glow-emerald transition-all"
              >
                {isCreating ? 'Creating Event & Generating Seat Grid...' : 'Publish Event & Venue Map'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
