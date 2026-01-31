import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../api';

export default function TradeDetail() {
  const { id } = useParams();
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const res = await apiRequest(`/trades/${encodeURIComponent(id)}`);
      setTrade(res.trade || res);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    await apiRequest(`/trades/${encodeURIComponent(id)}/messages`, {
      method: 'POST',
      body: { message },
    });
    setMessage('');
    await load();
  }

  async function respond(action) {
    await apiRequest(`/trades/${encodeURIComponent(id)}/respond`, {
      method: 'POST',
      body: { action },
    });
    await load();
  }

  async function hide() {
    await apiRequest(`/trades/${encodeURIComponent(id)}/hide`, { method: 'POST' });
    alert('Trade hidden');
  }

  useEffect(() => {
    load();
  }, [id]);

  return (
    <div className="grid gap-4">
      <div className="card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-bold">Trade detail</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Trade ID: {id}</div>
          </div>
          <div className="flex gap-2">
            <Link className="btn btn-ghost" to="/app/trades">Back</Link>
            <button className="btn btn-primary" onClick={load} disabled={loading}>Refresh</button>
          </div>
        </div>

        {loading && <div className="mt-4 text-slate-600 dark:text-slate-400">Loading…</div>}
        {err && (
          <div className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm">
            {err}
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              Note: trade endpoints may not exist on this backend branch yet.
            </div>
          </div>
        )}

        {trade && (
          <div className="mt-4 grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-900/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="font-bold">Items</div>
                <pre className="mt-2 overflow-auto rounded-xl bg-black/5 p-3 text-xs dark:bg-white/5">
                  {JSON.stringify(trade.items || trade.swaps || trade, null, 2)}
                </pre>
              </div>

              <div className="rounded-2xl border border-slate-900/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="font-bold">Actions</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button className="btn btn-primary" onClick={() => respond('accept').catch((e) => alert(e.message))}>Accept</button>
                  <button className="btn btn-ghost" onClick={() => respond('decline').catch((e) => alert(e.message))}>Decline</button>
                  <button className="btn btn-ghost" onClick={() => hide().catch((e) => alert(e.message))}>Hide</button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-900/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="font-bold">Messages</div>
              <div className="mt-2 grid gap-2">
                {(trade.messages || []).length ? (
                  trade.messages.map((m, idx) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={idx} className="rounded-xl border border-slate-900/10 bg-white/70 p-3 text-sm dark:border-white/10 dark:bg-white/5">
                      <div className="text-xs text-slate-500">{m.createdAt || ''}</div>
                      <div className="mt-1">{m.message || m.text || JSON.stringify(m)}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-600 dark:text-slate-400">No messages.</div>
                )}

                <div className="mt-2 flex gap-2">
                  <input className="input" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a message" />
                  <button className="btn btn-primary" onClick={() => sendMessage().catch((e) => alert(e.message))} disabled={!message.trim()}>
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
