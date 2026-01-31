import React, { useEffect, useState } from 'react';
import { apiRequest, setToken } from '../api';

export default function Profile() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const res = await apiRequest('/auth/me');
      setMe(res);
      setUsername(res.username || '');
      setAvatarUrl(res.avatarUrl || '');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    const res = await apiRequest('/auth/me', {
      method: 'PUT',
      body: { username, avatarUrl },
    });
    setMe(res);
    alert('Profile updated');
  }

  async function changePassword() {
    const res = await apiRequest('/auth/change-password', {
      method: 'POST',
      body: { currentPassword: curPw, newPassword: newPw },
    });
    if (res?.token) setToken(res.token);
    setCurPw('');
    setNewPw('');
    alert('Password changed');
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="grid gap-4">
      <div className="card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-bold">Profile</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Uses <span className="font-mono">/auth/me</span> + <span className="font-mono">/auth/change-password</span></div>
          </div>
          <button className="btn btn-primary" onClick={load} disabled={loading}>Refresh</button>
        </div>

        {loading && <div className="mt-4 text-slate-600 dark:text-slate-400">Loading…</div>}
        {err && <div className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm">{err}</div>}

        {me && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-900/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="font-bold">Public profile</div>
              <div className="mt-2 grid gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Username</label>
                  <input className="input mt-1" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Avatar URL</label>
                  <input className="input mt-1" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" />
                </div>
              </div>

              <button className="btn btn-primary mt-3" onClick={() => saveProfile().catch((e) => alert(e.message))}>
                Save
              </button>
            </div>

            <div className="rounded-2xl border border-slate-900/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="font-bold">Change password</div>
              <div className="mt-2 grid gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Current password</label>
                  <input className="input mt-1" type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">New password (min 10 chars)</label>
                  <input className="input mt-1" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                </div>
              </div>

              <button
                className="btn btn-primary mt-3"
                onClick={() => changePassword().catch((e) => alert(e.message))}
                disabled={!curPw || !newPw}
              >
                Change password
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
