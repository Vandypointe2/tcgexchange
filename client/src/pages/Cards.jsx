import React, { useState } from 'react';

export default function Cards() {
  const [id, setId] = useState('');

  return (
    <div className="card">
      <div className="text-lg font-bold">Card detail (bridge)</div>
      <div className="mt-1 text-sm text-slate-400">This POC reuses the existing card detail page for now.</div>

      <div className="mt-4 grid gap-2">
        <input className="input" value={id} onChange={(e) => setId(e.target.value)} placeholder="Enter card id (e.g. sv3pt5-65)" />
        <a className="btn btn-primary" href={`/card.html?id=${encodeURIComponent(id)}`}>Open card detail</a>
      </div>
    </div>
  );
}
