import { useState, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { NetworkClient } from './network/NetworkClient';

const client = new NetworkClient();

export default function App() {
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [wsStatus, setWsStatus] = useState<'disconnected' | 'connected'>('disconnected');
  const [wsMessage, setWsMessage] = useState<string | null>(null);
  const connected = useRef(false);

  async function handlePing() {
    setPingResult('...');
    const res = await fetch('/api/ping');
    const data = await res.json();
    setPingResult(JSON.stringify(data));
  }

  function handleToggleWs() {
    if (connected.current) {
      client.disconnect();
      connected.current = false;
      setWsStatus('disconnected');
      setWsMessage(null);
    } else {
      client.connect(
        (msg) => setWsMessage(JSON.stringify(msg)),
        () => {
          connected.current = false;
          setWsStatus('disconnected');
          setWsMessage(null);
        },
      );
      connected.current = true;
      setWsStatus('connected');
    }
  }

  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1 style={{ fontSize: 24 }}>browser-arena</h1>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h2 style={{ fontSize: 14, opacity: 0.5 }}>HTTP</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={handlePing}>ping server</button>
          {pingResult && <code style={{ fontSize: 13 }}>{pingResult}</code>}
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h2 style={{ fontSize: 14, opacity: 0.5 }}>WebSocket</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={handleToggleWs}>
            {wsStatus === 'connected' ? 'disconnect' : 'connect websocket'}
          </button>
          <span style={{ fontSize: 13, color: wsStatus === 'connected' ? '#4ecca3' : '#888' }}>
            {wsStatus}
          </span>
          {wsMessage && <code style={{ fontSize: 13 }}>{wsMessage}</code>}
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h2 style={{ fontSize: 14, opacity: 0.5 }}>canvas</h2>
        <GameCanvas />
      </section>
    </div>
  );
}
