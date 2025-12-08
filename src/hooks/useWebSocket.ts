import { useEffect, useRef, useState } from 'react';

export const useWebSocket = () => {
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    connect();
    return () => {
      ws.current?.close();
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, []);

  const connect = () => {
    const token = localStorage.getItem('authToken');
    const wsUrl = `${process.env.REACT_APP_WS_URL}?token=${token}`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket conectado');
      setConnectionStatus('connected');
    };

    ws.current.onmessage = (event) => {
      setLastMessage(event);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket erro:', error);
      setConnectionStatus('disconnected');
    };

    ws.current.onclose = () => {
      console.log('WebSocket desconectado');
      setConnectionStatus('disconnected');

      // Reconectar após 3 segundos
      reconnectTimeout.current = setTimeout(() => {
        console.log('Tentando reconectar...');
        connect();
      }, 3000);
    };
  };

  const sendMessage = (data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    } else {
      console.error('WebSocket não está conectado');
    }
  };

  return { sendMessage, lastMessage, connectionStatus };
};