// frontend/src/hooks/useWebSocket.ts
import { useState, useEffect, useRef } from 'react';
import { SimulationState } from '../types';

export function useSimulation() {
  const [state, setState] = useState<SimulationState | null>(null);
  const [connected, setConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      // Connect to the WS proxy defined in vite.config.ts
      const socketUrl = `ws://${window.location.host}/ws`;
      ws.current = new WebSocket(socketUrl);

      ws.current.onopen = () => {
        setConnected(true);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as SimulationState;
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
        ws.current?.close();
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

  const setMode = async (mode: string) => {
    try {
      await fetch('/api/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const triggerEvent = async (type: string) => {
    try {
      await fetch(`/api/trigger/${type}`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  // C1: Demo mode — advance exactly one tick manually
  const stepSimulation = async () => {
    try {
      await fetch('/api/simulation/step', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  return { state, connected, startSimulation, stopSimulation, triggerEvent, setMode, stepSimulation };
}