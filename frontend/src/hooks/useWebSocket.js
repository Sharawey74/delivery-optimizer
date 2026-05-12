import { useState, useEffect, useRef } from 'react';

export function useSimulation() {
  const [state, setState] = useState(null);
  const [connected, setConnected] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    let reconnectTimeout;

    function connect() {
      const socketUrl = 'ws://localhost:8000/ws';
      ws.current = new WebSocket(socketUrl);

      ws.current.onopen = () => {
        setConnected(true);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setState(data);
        } catch (error) {
          console.error("Error parsing websocket message", error);
        }
      };

      ws.current.onclose = () => {
        setConnected(false);
        reconnectTimeout = setTimeout(connect, 3000);
      };
      
      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.current.close();
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const startSimulation = async () => {
    try {
      await fetch('/api/simulation/start', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  const stopSimulation = async () => {
    try {
      await fetch('/api/simulation/stop', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  return { state, connected, startSimulation, stopSimulation };
}
