import { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';

export default function App() {
  const [pingResult, setPingResult] = useState<string | null>(null);

  async function handlePing() {
    setPingResult('...');
    const res = await fetch('/api/ping');
    const data = await res.json();
    setPingResult(JSON.stringify(data));
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
        <h2 style={{ fontSize: 14, opacity: 0.5 }}>game</h2>
        <GameCanvas />
      </section>
    </div>
  );
}
