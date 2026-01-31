import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api';
import { useCardsByIds } from '../hooks/useCardsByIds';

function ItemRow({ item, card, onUpdate, onDelete }) {
  const [qty, setQty] = useState(item.quantity);
  const [condition, setCondition] = useState(item.condition);

  useEffect(() => {
    setQty(item.quantity);
    setCondition(item.condition);
  }, [item.condition, item.quantity]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-900/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {card?.images?.small ? (
          <img
            src={card.images.small}
            alt={card.name}
            style={{ height: 'calc(var(--card-thumb-h) * 0.85)', width: 'calc(var(--card-thumb-w) * 0.85)' }}
            className="rounded-lg object-cover ring-1 ring-black/5 dark:ring-white/10"
            loading="lazy"
          />
        ) : (
          <div style={{ height: 'calc(var(--card-thumb-h) * 0.85)', width: 'calc(var(--card-thumb-w) * 0.85)' }} className="rounded-lg bg-black/5 dark:bg-white/5" />
        )}

        <div className="min-w-0">
          <div className="truncate font-bold">{card?.name || item.cardId}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {card?.set ? `${card.set} ` : ''}{card?.number ? `#${card.number}` : ''}
          </div>
          <div className="mt-1 text-xs text-slate-500">Card ID: {item.cardId}</div>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-3 md:items-end">
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Condition</label>
          <select className="input mt-1" value={condition} onChange={(e) => setCondition(e.target.value)}>
            {['NM', 'LP', 'MP', 'HP', 'DMG'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Qty</label>
          <input className="input mt-1" type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={() => onUpdate({ id: item.id, quantity: Number(qty), condition }).catch((e) => alert(e.message))}>
            Save
          </button>
          <button className="btn btn-ghost" onClick={() => onDelete(item.id).catch((e) => alert(e.message))}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Collection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [newCardId, setNewCardId] = useState('');
  const [newQty, setNewQty] = useState(1);
  const [newCondition, setNewCondition] = useState('NM');

  const cardIds = useMemo(() => items.map((i) => i.cardId), [items]);
  const { cardsById } = useCardsByIds(cardIds);

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const res = await apiRequest('/collection');
      setItems(res.items || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function add() {
    await apiRequest('/collection', {
      method: 'POST',
      body: { cardId: newCardId.trim(), quantity: Number(newQty), condition: newCondition },
    });
    setNewCardId('');
    setNewQty(1);
    await load();
  }

  async function update(payload) {
    await apiRequest(`/collection/${payload.id}`, { method: 'PUT', body: payload });
    await load();
  }

  async function remove(id) {
    if (!confirm('Delete this item?')) return;
    await apiRequest(`/collection/${id}`, { method: 'DELETE' });
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="grid gap-4">
      <div className="card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-bold">Your collection</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Uses <span className="font-mono">/collection</span></div>
          </div>
          <div className="flex gap-2">
            <Link className="btn btn-ghost" to="/app/search">Find cards</Link>
            <button className="btn btn-primary" onClick={load} disabled={loading}>Refresh</button>
          </div>
        </div>

        {err && <div className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm">{err}</div>}

        <div className="mt-4 rounded-2xl border border-slate-900/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="font-bold">Add item</div>
          <div className="mt-2 grid gap-2 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Card ID</label>
              <input className="input mt-1" value={newCardId} onChange={(e) => setNewCardId(e.target.value)} placeholder="sv3pt5-65" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Condition</label>
              <select className="input mt-1" value={newCondition} onChange={(e) => setNewCondition(e.target.value)}>
                {['NM', 'LP', 'MP', 'HP', 'DMG'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Qty</label>
              <input className="input mt-1" type="number" min="1" value={newQty} onChange={(e) => setNewQty(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary mt-3" onClick={() => add().catch((e) => alert(e.message))} disabled={!newCardId.trim()}>
            Add
          </button>
        </div>
      </div>

      {loading && <div className="card text-slate-600 dark:text-slate-400">Loading…</div>}

      <div className="grid gap-3">
        {items.map((it) => (
          <ItemRow
            key={it.id}
            item={it}
            card={cardsById[it.cardId]}
            onUpdate={update}
            onDelete={remove}
          />
        ))}
      </div>

      {!loading && !items.length && (
        <div className="card text-sm text-slate-600 dark:text-slate-400">Your collection is empty.</div>
      )}
    </div>
  );
}
