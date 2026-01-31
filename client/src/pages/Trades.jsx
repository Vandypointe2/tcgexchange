import React, { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api';

function fmt(card) {
  if (!card) return '';
  const set = card.setName ? ` — ${card.setName}` : '';
  const num = card.number ? ` #${card.number}` : '';
  return `${card.name || card.id}${set}${num}`;
}

export default function Trades() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [matches, setMatches] = useState(null);
  const [selected, setSelected] = useState({});
  const [note, setNote] = useState('');

  const selectedSwaps = useMemo(
    () => Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k),
    [selected]
  );

  async function loadRecs() {
    setLoading(true);
    setErr('');
    try {
      const data = await apiRequest('/trades/recommendations?limit=15');
      setRecs(data.recommendations || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function viewMatches(otherUserId) {
    const data = await apiRequest(`/trades/matches/${otherUserId}`);
    setMatches({ otherUserId, ...data });
    setSelected({});
  }

  async function propose() {
    if (!matches) return;
    const swaps = (matches.suggestedSwaps || [])
      .filter((s) => selected[`${s.give.id}::${s.receive.id}`])
      .map((s) => ({ giveCardId: s.give.id, receiveCardId: s.receive.id, quantity: s.quantity || 1 }));

    if (!swaps.length) throw new Error('Select at least one swap');

    const res = await apiRequest('/trades', {
      method: 'POST',
      body: { recipientId: matches.otherUserId, swaps, note },
    });

    // naive redirect to old (server-rendered) trade detail for now
    window.location.href = `/trade_detail.html?id=${res.trade.id}`;
  }

  useEffect(() => {
    loadRecs();
  }, []);

  return (
    <div className="grid gap-4">
      <div className="card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-lg font-bold">Recommended traders</div>
            <div className="text-sm text-slate-400">Based on wishlist priority + availability</div>
          </div>
          <button className="btn btn-primary" onClick={loadRecs}>Refresh</button>
        </div>

        {loading && <div className="mt-4 text-slate-400">Loading…</div>}
        {err && <div className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm">{err}</div>}

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {recs.map((r) => (
            <div key={r.user.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold">{r.user.username}</div>
                  <div className="text-sm text-slate-400">Score {r.score} · {r.swapCount} swap ideas</div>
                </div>
                <button className="btn btn-ghost" onClick={() => viewMatches(r.user.id)}>View</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="text-lg font-bold">Matches</div>
        {!matches && <div className="mt-2 text-sm text-slate-400">Pick a recommended user to see matches.</div>}

        {matches && (
          <div className="mt-3 grid gap-4">
            <div className="text-sm text-slate-400">With <span className="text-slate-100 font-semibold">{matches.otherUser.username}</span></div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="mb-2 font-semibold">You have cards they want</div>
                <div className="grid gap-2">
                  {(matches.iGive || []).slice(0, 8).map((m) => (
                    <div key={m.cardId} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                      {fmt(m.card)} <span className="text-slate-400">· up to {m.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 font-semibold">They have cards you want</div>
                <div className="grid gap-2">
                  {(matches.theyGive || []).slice(0, 8).map((m) => (
                    <div key={m.cardId} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                      {fmt(m.card)} <span className="text-slate-400">· up to {m.qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 font-semibold">Suggested 1:1 swaps</div>
              <div className="grid gap-2">
                {(matches.suggestedSwaps || []).slice(0, 20).map((s) => {
                  const key = `${s.give.id}::${s.receive.id}`;
                  return (
                    <label key={key} className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                      <input
                        type="checkbox"
                        checked={!!selected[key]}
                        onChange={(e) => setSelected((prev) => ({ ...prev, [key]: e.target.checked }))}
                      />
                      <div className="text-sm">
                        <div className="font-semibold">Give: {fmt(s.give)}</div>
                        <div className="text-slate-400">Receive: {fmt(s.receive)} · x{s.quantity || 1}</div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="mt-3 grid gap-2">
                <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" />
                <button
                  className="btn btn-primary"
                  disabled={!selectedSwaps.length}
                  onClick={() => propose().catch((e) => alert(e.message))}
                >
                  Propose selected swaps
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
