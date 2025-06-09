'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface MarketUpdate {
  marketId: string;
  totalVolume?: string;
  totalStakers?: number;
  outcomes?: Array<{
    name: string;
    odds: number;
    percentage: number;
  }>;
  timestamp: number;
}

interface UseWebSocketProps {
  url?: string;
  onMarketUpdate?: (update: MarketUpdate) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface WebSocketState {
  isConnected: boolean;
  isReconnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

export const useWebSocket = ({
  url = process.env.NODE_ENV === 'production' 
    ? 'wss://your-production-ws-url.com/ws'
    : 'ws://localhost:3001/ws',
  onMarketUpdate,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5
}: UseWebSocketProps = {}) => {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isReconnecting: false,
    error: null,
    reconnectAttempts: 0
  });

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnect = useRef(true);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    console.log('🔌 Attempting WebSocket connection to:', url);

    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        setState(prev => ({
          ...prev,
          isConnected: true,
          isReconnecting: false,
          error: null,
          reconnectAttempts: 0
        }));

        // Subscribe to market updates
        ws.current?.send(JSON.stringify({
          type: 'subscribe',
          channel: 'market_updates'
        }));
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'market_update' && onMarketUpdate) {
            console.log('📊 Received market update:', data.payload);
            onMarketUpdate(data.payload);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('🔌 WebSocket connection closed:', event.code, event.reason);
        
        setState(prev => ({
          ...prev,
          isConnected: false,
          error: event.reason || 'Connection closed'
        }));

        // Attempt to reconnect if not intentionally closed
        if (shouldReconnect.current) {
          setState(prev => {
            if (prev.reconnectAttempts < maxReconnectAttempts) {
              reconnectTimeoutRef.current = setTimeout(() => {
                connect();
              }, reconnectInterval);
              
              return {
                ...prev,
                isReconnecting: true,
                reconnectAttempts: prev.reconnectAttempts + 1
              };
            }
            return prev;
          });
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setState(prev => ({
          ...prev,
          error: 'WebSocket connection error'
        }));
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to establish connection'
      }));
    }
  }, [url, onMarketUpdate, reconnectInterval, maxReconnectAttempts]); // Removed state.reconnectAttempts to prevent infinite loops

  const disconnect = useCallback(() => {
    shouldReconnect.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (ws.current) {
      ws.current.close(1000, 'Intentional disconnect');
      ws.current = null;
    }

    setState({
      isConnected: false,
      isReconnecting: false,
      error: null,
      reconnectAttempts: 0
    });
  }, []);

  const sendMessage = useCallback((message: Record<string, unknown>) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('⚠️ WebSocket not connected, cannot send message');
    return false;
  }, []);

  useEffect(() => {
    // Only connect in development for now (no real WebSocket server yet)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Simulating WebSocket connection');
      setState(prev => ({ ...prev, isConnected: false, error: 'Development mode - WebSocket simulation' }));
      return;
    }

    shouldReconnect.current = true;
    connect();

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]); // Only depend on url to prevent infinite loops

  return {
    ...state,
    connect,
    disconnect,
    sendMessage
  };
}; 