import React, { createContext, useContext, useState, useEffect } from 'react';
import { Reservation } from '../types';
import { api } from '../services/api';

interface ReservationContextType {
  activeReservation: Reservation | null;
  setActiveReservation: (res: Reservation | null) => void;
  clearReservation: () => void;
  releaseActiveReservation: () => Promise<void>;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export const ReservationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(() => {
    const saved = localStorage.getItem('pulse_pass_active_reservation');
    if (!saved) return null;
    try {
      const parsed: Reservation = JSON.parse(saved);
      // Check if already expired
      if (new Date() > new Date(parsed.expiresAt)) {
        localStorage.removeItem('pulse_pass_active_reservation');
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (activeReservation) {
      localStorage.setItem('pulse_pass_active_reservation', JSON.stringify(activeReservation));
    } else {
      localStorage.removeItem('pulse_pass_active_reservation');
    }
  }, [activeReservation]);

  const clearReservation = () => {
    setActiveReservation(null);
    localStorage.removeItem('pulse_pass_active_reservation');
  };

  const releaseActiveReservation = async () => {
    if (!activeReservation) return;
    try {
      await api.delete(`/reservations/${activeReservation.reservationId}`);
    } catch (err) {
      console.warn('Failed to release reservation on server:', err);
    } finally {
      clearReservation();
    }
  };

  return (
    <ReservationContext.Provider
      value={{
        activeReservation,
        setActiveReservation,
        clearReservation,
        releaseActiveReservation
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservation = () => {
  const ctx = useContext(ReservationContext);
  if (!ctx) throw new Error('useReservation must be used within ReservationProvider');
  return ctx;
};
