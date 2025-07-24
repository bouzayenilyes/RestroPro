import io from 'socket.io-client';
import { VITE_BACKEND_SOCKET_IO } from '../config/config';

const socket = io(VITE_BACKEND_SOCKET_IO, {
  autoConnect: false, // Prevent automatic connection until explicit initialization
  // transports: ['websocket'], // Prefer WebSockets for better performance
  rejectUnauthorized: false,
});

export const initSocket = () => {
  // if (!socket.connected) {
  //   socket.connect();
  // }
  socket.connect();
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
