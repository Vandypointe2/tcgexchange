import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api';

function CardTile({ card }) {
  return (
    <Link
      to={`/app/cards/${encodeURIComponent(card.id)}`}
      className="group rounded-2xl border border-slate-900/10 bg-white/70 p-3 hover:shadow-md dark:border-white/10 dark:bg-white/5"
    >
      <div className="flex gap-3">
        <img
          src={card.images?.small}
          alt={card.name}
          className="h-20 w-14 rounded-lg object-cover ring-1 ring-black/5 dark:ring-white/10"
          loading="lazy"
        />
        <div className="min-w-0">
          <div className="truncate font-bold group-hover:underline">{card.name}</div>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {card.set?.name}{card.number ? ` #${card.number}` : ''}
          </div>
          {card.rarity && <div className="mt-1"><span className="badge">{card.rarity}</span></div>}
        </div>
      </div>
    </Link>
  );
}

export default function Search() {
  const [sets, setSets] = useState([]);
  const [loadingSets, setLoadingSets] = useState(true);

  const [name, setName] = useState('');
  const [setId, setSetId] = useState('');
  const [rarity, setRarity] = useState('');
  const [supertype, setSupertype] = useState('');
  const [type, setType] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize] = useState(24);

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const filters = useMemo(() => {
    const f = {};
    if (name.trim()) f.name = name.trim();
    if (setId) f.sets = [setId];
    if (rarity) f.rarities = [rarity];
    if (supertype) f.supertypes = [supertype];
    if (type) f.types = [type];
    return f;
  }, [name, rarity, setId, supertype, type]);

  async function loadSets() {
    setLoadingSets(true);
    try {
      const res = await apiRequest('/cards/sets_local');
      setSets(res.sets || []);
    } finally {
      setLoadingSets(false);
    }
  }

  async function search(goToPage = 1) {
    setLoading(true);
    setErr('');
    try {
      const res = await apiRequest('/cards/search_local', {
        method: 'POST',
        body: {
          filters,
          sort: 'name',
          page: goToPage,
          pageSize,
        },
      });
      setCards(res.cards || []);
      setPage(goToPage);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSets().catch(() => {});
    // initial search
    search(1).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid gap-4">
      <div className="card">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-lg font-bold">Search cards (local)</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Uses <span className="font-mono">/cards/search_local</span> + <span className="font-mono">/cards/sets_local</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => search(1)} disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>

        {err && <div className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm">{err}</div>}

        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Name</label>
            <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Pikachu" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Set</label>
            <select className="input mt-1" value={setId} onChange={(e) => setSetId(e.target.value)} disabled={loadingSets}>
              <option value="">Any</option>
              {sets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Rarity</label>
            <select className="input mt-1" value={rarity} onChange={(e) => setRarity(e.target.value)}>
              <option value="">Any</option>
              <option>Common</option>
              <option>Uncommon</option>
              <option>Rare</option>
              <option>Rare Holo</option>
              <option>Double Rare</option>
              <option>Illustration Rare</option>
              <option>Special Illustration Rare</option>
              <option>Hyper Rare</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Supertype</label>
            <select className="input mt-1" value={supertype} onChange={(e) => setSupertype(e.target.value)}>
              <option value="">Any</option>
              <option>Pokémon</option>
              <option>Trainer</option>
              <option>Energy</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Type</label>
            <select className="input mt-1" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Any</option>
              {['Colorless', 'Darkness', 'Dragon', 'Fairy', 'Fighting', 'Fire', 'Grass', 'Lightning', 'Metal', 'Psychic', 'Water'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <button className="btn btn-ghost" onClick={() => {
            setName('');
            setSetId('');
            setRarity('');
            setSupertype('');
            setType('');
          }}>Clear</button>

          <div className="flex items-center gap-2">
            <button className="btn btn-ghost" disabled={loading || page <= 1} onClick={() => search(page - 1)}>
              Prev
            </button>
            <div className="text-slate-600 dark:text-slate-400">Page {page}</div>
            <button className="btn btn-ghost" disabled={loading || cards.length < pageSize} onClick={() => search(page + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {cards.map((c) => (
          <CardTile key={c.id} card={c} />
        ))}
      </div>

      {!loading && !cards.length && (
        <div className="card text-sm text-slate-600 dark:text-slate-400">No results.</div>
      )}
    </div>
  );
}
