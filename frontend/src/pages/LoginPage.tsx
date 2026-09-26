import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('alex@example.com');
  const [password, setPassword] = useState('demo123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/events');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full p-8 rounded-3xl bg-dark-900 border border-white/10 shadow-2xl space-y-6 glass-panel">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald flex items-center justify-center mx-auto shadow-glow-emerald">
            <Ticket className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Sign In</h2>
          <p className="text-xs text-slate-400">Access your concurrent seat reservations and ticket pass history</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-accent-emerald"
                placeholder="name@domain.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-accent-emerald"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-dark-950/60 border border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Demo User: <strong className="text-white font-mono">alex@example.com</strong></span>
            <span>Pass: <strong className="text-white font-mono">demo123</strong></span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-accent-emerald hover:bg-emerald-400 text-dark-950 font-extrabold text-sm flex items-center justify-center space-x-2 shadow-glow-emerald transition-all"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In To Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent-cyan hover:underline font-semibold">
            Create new account
          </Link>
        </p>

      </div>
    </div>
  );
};
