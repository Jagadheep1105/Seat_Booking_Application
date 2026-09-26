import React, { createContext, useContext, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '../services/socket';
import { SocketSeatPayload } from '../types';

interface SocketContextType {
  socket: Socket;
  joinEventRoom: (eventId: string) => void;
  leaveEventRoom: (eventId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socket = getSocket();

  const joinEventRoom = (eventId: string) => {
    socket.emit('join_event', eventId);
  };

  const leaveEventRoom = (eventId: string) => {
    socket.emit('leave_event', eventId);
  };

  return (
    <SocketContext.Provider value={{ socket, joinEventRoom, leaveEventRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
