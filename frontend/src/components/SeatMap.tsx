import React, { useState } from 'react';
import { Seat, SeatStatus } from '../types';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

interface SeatMapProps {
  seats: Seat[];
  selectedSeatIds: string[];
  onToggleSeat: (seat: Seat) => void;
  disabled?: boolean;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  selectedSeatIds,
  onToggleSeat,
  disabled = false
}) => {
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);

  // Group seats by Row Label
  const rowsOrder = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatsByRow: Record<string, Seat[]> = {};

  rowsOrder.forEach(r => {
    seatsByRow[r] = seats.filter(s => s.rowLabel === r);
  });

  const getEffectiveStatus = (seat: Seat): SeatStatus => {
    if (selectedSeatIds.includes(seat.id)) return 'SELECTED';
    return seat.status;
  };

  const getSeatColor = (seat: Seat, status: SeatStatus) => {
    switch (status) {
      case 'SELECTED':
        return '#10B981'; // Emerald glow
      case 'LOCKED':
        return '#F59E0B'; // Amber warning
      case 'SOLD':
        return '#334155'; // Dark slate muted
      default:
        return seat.color || '#06B6D4'; // Default cyan/emerald
    }
  };

  return (
    <div className="relative w-full select-none space-y-6">
      
      {/* Dynamic Hover Status Banner */}
      <div className="min-h-[54px] p-3 px-6 rounded-2xl bg-dark-900/90 border border-white/10 glass-panel flex items-center justify-between transition-all duration-300 shadow-lg">
        {hoveredSeat ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between w-full text-sm font-medium"
          >
            <div className="flex items-center space-x-3">
              <span
                className="w-3.5 h-3.5 rounded-full shadow-md"
                style={{ backgroundColor: getSeatColor(hoveredSeat, getEffectiveStatus(hoveredSeat)) }}
              />
              <span className="font-bold text-white text-base">
                Row {hoveredSeat.rowLabel} — Seat {hoveredSeat.seatNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-dark-950 border border-white/10 text-slate-300">
                {hoveredSeat.categoryName}
              </span>
            </div>

            <div className="flex items-center space-x-6">
              <span className="text-xs text-slate-400">
                Status: <strong className="text-white uppercase font-mono">{getEffectiveStatus(hoveredSeat)}</strong>
              </span>
              <span className="text-base font-extrabold text-accent-emerald font-mono">
                ₹{hoveredSeat.price.toLocaleString('en-IN')}
              </span>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <Info className="w-4 h-4 text-accent-cyan" />
            <span>Hover over any seat circle to inspect category, pricing, and live availability</span>
          </div>
        )}
      </div>

      <div className="min-w-[720px] max-w-4xl mx-auto flex flex-col items-center">
        
        {/* STAGE Arc */}
        <div className="w-full mb-8 flex flex-col items-center">
          <div className="relative w-3/4 h-14 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 400 50" fill="none">
              <path
                d="M 20 45 Q 200 8 380 45"
                stroke="url(#stage-gradient)"
                strokeWidth="4"
                fill="none"
              />
              <defs>
                <linearGradient id="stage-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#10B981" stopOpacity="1" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[11px] uppercase tracking-[0.3em] font-extrabold text-slate-200 bg-dark-950 px-4 py-1 rounded-full border border-white/10 shadow-glow-emerald">
                STAGE / SCREEN AREA
              </span>
            </div>
          </div>
        </div>

        {/* SVG Seat Layout Container */}
        <div className="w-full bg-dark-900/60 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
          
          <svg viewBox="0 0 800 480" className="w-full h-auto overflow-hidden">
            
            {/* Section Dividers */}
            <text x="40" y="55" fill="#10B981" fontSize="11" fontWeight="bold" letterSpacing="1.5">VIP STAGE ROW</text>
            <line x1="160" y1="50" x2="760" y2="50" stroke="#10B981" strokeOpacity="0.2" strokeDasharray="4 4" />

            <text x="40" y="155" fill="#3B82F6" fontSize="11" fontWeight="bold" letterSpacing="1.5">PREMIUM TIER</text>
            <line x1="160" y1="150" x2="760" y2="150" stroke="#3B82F6" strokeOpacity="0.2" strokeDasharray="4 4" />

            <text x="40" y="305" fill="#94A3B8" fontSize="11" fontWeight="bold" letterSpacing="1.5">REGULAR STAND</text>
            <line x1="160" y1="300" x2="760" y2="300" stroke="#94A3B8" strokeOpacity="0.2" strokeDasharray="4 4" />

            {/* Render Rows */}
            {rowsOrder.map((rowLabel) => {
              const rowSeats = seatsByRow[rowLabel] || [];
              const seatCount = rowSeats.length;
              if (seatCount === 0) return null;

              const seatSpacing = 42;
              const startX = 400 - ((seatCount - 1) * seatSpacing) / 2;
              
              let rowY = 75;
              if (rowLabel === 'B') rowY = 175;
              if (rowLabel === 'C') rowY = 225;
              if (rowLabel === 'D') rowY = 325;
              if (rowLabel === 'E') rowY = 375;
              if (rowLabel === 'F') rowY = 425;

              return (
                <g key={rowLabel}>
                  {/* Row Label Left */}
                  <text
                    x={startX - 35}
                    y={rowY + 5}
                    fill="#64748B"
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="Outfit, sans-serif"
                    textAnchor="end"
                  >
                    ROW {rowLabel}
                  </text>

                  {/* Seats */}
                  {rowSeats.map((seat, colIndex) => {
                    const cx = startX + colIndex * seatSpacing;
                    const cy = rowY;
                    const status = getEffectiveStatus(seat);
                    const isSelected = status === 'SELECTED';
                    const isLocked = status === 'LOCKED';
                    const isSold = status === 'SOLD';
                    const isAvailable = status === 'AVAILABLE';

                    const isHovered = hoveredSeat?.id === seat.id;
                    const seatColor = getSeatColor(seat, status);

                    return (
                      <g
                        key={seat.id}
                        onClick={() => {
                          if ((isAvailable || isSelected) && !disabled) {
                            onToggleSeat(seat);
                          }
                        }}
                        onMouseEnter={() => setHoveredSeat(seat)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        style={{ outline: 'none' }}
                        className="cursor-pointer outline-none focus:outline-none select-none"
                      >
                        {/* Hover Ring (Clean non-overflowing stroke) */}
                        {isHovered && !isSold && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r="17"
                            fill="none"
                            stroke={seatColor}
                            strokeWidth="2"
                            strokeOpacity="0.8"
                          />
                        )}

                        {/* Selected Outer Ring */}
                        {isSelected && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r="17"
                            fill="none"
                            stroke="#10B981"
                            strokeWidth="2.5"
                            strokeOpacity="0.9"
                          />
                        )}

                        {/* Base Seat Circle */}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isHovered ? "15" : "14"}
                          fill={isSelected ? '#10B981' : isLocked ? '#F59E0B' : isSold ? '#1E293B' : '#0F172A'}
                          stroke={seatColor}
                          strokeWidth={isSelected || isHovered ? 2.5 : 2}
                        />

                        {/* Inner Content */}
                        {isSelected ? (
                          <path
                            d={`M ${cx - 4} ${cy} L ${cx - 1} ${cy + 3} L ${cx + 5} ${cy - 3}`}
                            stroke="#07090E"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                        ) : isLocked ? (
                          <circle cx={cx} cy={cy} r="4" fill="#F59E0B" />
                        ) : isSold ? (
                          <path
                            d={`M ${cx - 3} ${cy - 3} L ${cx + 3} ${cy + 3} M ${cx + 3} ${cy - 3} L ${cx - 3} ${cy + 3}`}
                            stroke="#64748B"
                            strokeWidth="1.5"
                          />
                        ) : (
                          <text
                            x={cx}
                            y={cy + 4}
                            fill={isHovered ? '#FFFFFF' : '#CBD5E1'}
                            fontSize={isHovered ? "11" : "10"}
                            fontWeight="bold"
                            textAnchor="middle"
                            fontFamily="Inter, sans-serif"
                          >
                            {seat.seatNumber}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Row Label Right */}
                  <text
                    x={startX + seatCount * seatSpacing - seatSpacing + 35}
                    y={rowY + 5}
                    fill="#64748B"
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="Outfit, sans-serif"
                    textAnchor="start"
                  >
                    ROW {rowLabel}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Seat Legend Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-300">
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-full bg-dark-950 border-2 border-accent-cyan"></span>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-full bg-accent-emerald shadow-glow-emerald"></span>
              <span className="text-accent-emerald font-bold">Your Selection</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-full bg-accent-amber shadow-glow-amber"></span>
              <span>Temporarily Locked (10m)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-700"></span>
              <span className="text-slate-500">Sold / Reserved</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
