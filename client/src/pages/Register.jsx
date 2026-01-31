import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest, setToken } from '../api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  return (
    <div className="card">
      <div className="mb-1 text-lg font-bold">Create account</div>
      <div className="mb-4 text-sm text-slate-400">This hits /auth/signup on the existing backend.</div>

      {err && <div className="mb-3 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm">{err}</div>}

      <form
        className="grid gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr('');
          setLoading(true);
          try {
            const data = await apiRequest('/auth/signup', { method: 'POST', body: { username, password } });
            setToken(data.token);
            nav('/app/trades');
          } catch (e2) {
            setErr(e2.message);
          } finally {
            setLoading(false);
          }
        }}
      >
        <input className="input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button className="btn btn-primary" disabled={loading} type="submit">
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <div className="mt-3 text-sm text-slate-400">
        Already have an account? <Link className="link" to="/app/login">Log in</Link>
      </div>
    </div>
  );
}
