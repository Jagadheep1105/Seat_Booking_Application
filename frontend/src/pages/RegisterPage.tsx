import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, Lock, Mail, User as UserIcon, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await register(name, email, password);
      navigate('/events');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full p-8 rounded-3xl bg-dark-900 border border-white/10 shadow-2xl space-y-6 glass-panel">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan flex items-center justify-center mx-auto shadow-glow-cyan">
            <Ticket className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Create Account</h2>
          <p className="text-xs text-slate-400">Join Pulse Pass to reserve venue seats in real time</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-accent-emerald"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-accent-cyan hover:bg-cyan-400 text-dark-950 font-extrabold text-sm flex items-center justify-center space-x-2 shadow-glow-cyan transition-all"
          >
            <span>{isLoading ? 'Creating Account...' : 'Register Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-emerald hover:underline font-semibold">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
};
