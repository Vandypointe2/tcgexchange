import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../api';

function collectrUrl(card) {
  const printedTotal = card?.set?.printedTotal;
  const number = card?.number;
  const q = [card?.name, number && printedTotal ? `${number}/${printedTotal}` : null, card?.set?.name]
    .filter(Boolean)
    .join(' ');

  // Best-effort: Collectr changes URLs; using a search query is the most stable.
  return `https://app.getcollectr.com/search?query=${encodeURIComponent(q)}`;
}

export default function CardDetail() {
  const { id } = useParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [addQty, setAddQty] = useState(1);
  const [condition, setCondition] = useState('NM');

  const [wishQty, setWishQty] = useState(1);
  const [wishPriority, setWishPriority] = useState(3);
  const [wishMinCondition, setWishMinCondition] = useState('LP');
  const [wishNotes, setWishNotes] = useState('');

  const printedTotal = card?.set?.printedTotal;
  const number = card?.number;

  const subtitle = useMemo(() => {
    if (!card) return '';
    const pieces = [];
    if (card.set?.name) pieces.push(card.set.name);
    if (number) pieces.push(`#${number}`);
    if (printedTotal && number) pieces.push(`(${number}/${printedTotal})`);
    return pieces.join(' · ');
  }, [card, number, printedTotal]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setErr('');
      try {
        const res = await apiRequest(`/cards/local/${encodeURIComponent(id)}`);
        if (cancelled) return;
        setCard(res.card);
      } catch (e) {
        if (cancelled) return;
        setErr(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function addToCollection() {
    await apiRequest('/collection', {
      method: 'POST',
      body: { cardId: id, condition, quantity: Number(addQty) },
    });
    alert('Added to collection');
  }

  async function addToWishlist() {
    await apiRequest('/wishlist', {
      method: 'POST',
      body: {
        cardId: id,
        minCondition: wishMinCondition,
        quantityDesired: Number(wishQty),
        priority: Number(wishPriority),
        notes: wishNotes || null,
      },
    });
    alert('Added to wishlist');
  }

  return (
    <div className="grid gap-4">
      <div className="card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-bold">Card detail</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Uses <span className="font-mono">/cards/local/:id</span>
            </div>
          </div>
          <Link className="btn btn-ghost" to="/app/search">Back to search</Link>
        </div>

        {loading && <div className="mt-4 text-slate-600 dark:text-slate-400">Loading…</div>}
        {err && <div className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm">{err}</div>}

        {card && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <img
                src={card.images?.large || card.images?.small}
                alt={card.name}
                className="w-full max-w-md rounded-2xl ring-1 ring-black/5 dark:ring-white/10"
              />
            </div>

            <div className="grid gap-4">
              <div>
                <div className="text-2xl font-extrabold tracking-tight">{card.name}</div>
                {subtitle && <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</div>}
                <div className="mt-2 flex flex-wrap gap-2">
                  {card.supertype && <span className="badge">{card.supertype}</span>}
                  {card.rarity && <span className="badge">{card.rarity}</span>}
                  {Array.isArray(card.types) && card.types.map((t) => <span key={t} className="badge">{t}</span>)}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <a className="btn btn-primary" href={collectrUrl(card)} target="_blank" rel="noreferrer">
                    Open in Collectr
                  </a>
                  <a className="btn btn-ghost" href={`/card.html?id=${encodeURIComponent(id)}`} target="_blank" rel="noreferrer">
                    Open legacy detail
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-900/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="font-bold">Add to collection</div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Condition</label>
                    <select className="input mt-1" value={condition} onChange={(e) => setCondition(e.target.value)}>
                      {['NM', 'LP', 'MP', 'HP', 'DMG'].map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Quantity</label>
                    <input className="input mt-1" type="number" min="1" value={addQty} onChange={(e) => setAddQty(e.target.value)} />
                  </div>
                </div>
                <button className="btn btn-primary mt-3" onClick={() => addToCollection().catch((e) => alert(e.message))}>
                  Add
                </button>
              </div>

              <div className="rounded-2xl border border-slate-900/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="font-bold">Add to wishlist</div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Min condition</label>
                    <select className="input mt-1" value={wishMinCondition} onChange={(e) => setWishMinCondition(e.target.value)}>
                      {['NM', 'LP', 'MP', 'HP', 'DMG'].map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Priority (1..5)</label>
                    <input className="input mt-1" type="number" min="1" max="5" value={wishPriority} onChange={(e) => setWishPriority(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Quantity desired</label>
                    <input className="input mt-1" type="number" min="1" value={wishQty} onChange={(e) => setWishQty(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Notes</label>
                    <input className="input mt-1" value={wishNotes} onChange={(e) => setWishNotes(e.target.value)} placeholder="Optional" />
                  </div>
                </div>

                <button className="btn btn-primary mt-3" onClick={() => addToWishlist().catch((e) => alert(e.message))}>
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
