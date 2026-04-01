'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  namespace?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = io(`http://64.112.127.107:3000/${options.namespace || ''}`, {
      auth: {
        token: `Bearer ${token}`,
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      options.onConnect?.();
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      options.onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      options.onError?.(error);
    });

    return () => {
      socket.disconnect();
    };
  }, [options.namespace]);

  const emit = useCallback(<T = any>(event: string, data: any): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket not connected'));
        return;
      }

      socketRef.current.emit(event, data, (response: T) => {
        resolve(response);
      });
    });
  }, []);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (!socketRef.current) return;
    socketRef.current.on(event, callback);
  }, []);

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (!socketRef.current) return;
    socketRef.current.off(event, callback);
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off,
  };
}
