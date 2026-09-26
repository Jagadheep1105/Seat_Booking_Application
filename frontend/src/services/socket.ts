import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('[Socket.IO Client] Connected successfully, id:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO Client] Disconnected');
    });
  }

  return socket;
}
