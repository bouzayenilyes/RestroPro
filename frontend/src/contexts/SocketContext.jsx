import React, { createContext, useState, useEffect } from 'react';
import socket, { initSocket } from '../utils/socket';
import { getUserDetailsInLocalStorage } from '../helpers/UserDetails';

const SocketContext = createContext(null);

const SocketProvider = ({ children }) => {
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    initSocket();

    socket.on('connect', () => {
      const user = getUserDetailsInLocalStorage();
      if(user) {
        socket.emit("authenticate", user.tenant_id);
      }
      setIsSocketConnected(true)
    });
    socket.on('disconnect', () => setIsSocketConnected(false));

    // Cleanup function to disconnect on unmount
    return () => socket.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isSocketConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };
