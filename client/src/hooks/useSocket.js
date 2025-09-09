import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = (url = 'http://localhost:3001') => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    const newSocket = io(url, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      console.log('🔌 Connected to server');
      setIsConnected(true);
      setError(null);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from server:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect
        setError('Server disconnected');
      } else {
        // Client-side disconnect, attempt reconnection
        setError('Connection lost, attempting to reconnect...');
        reconnectTimeoutRef.current = setTimeout(() => {
          if (!newSocket.connected) {
            setError('Reconnection failed');
          }
        }, 10000);
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('🔌 Connection error:', err);
      setError(`Connection failed: ${err.message}`);
    });

    setSocket(newSocket);

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      newSocket.close();
    };
  }, [url]);

  return { socket, isConnected, error };
};

export default useSocket;
