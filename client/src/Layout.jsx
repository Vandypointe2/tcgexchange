import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { clearToken, getToken } from './api';

export default function Layout() {
  const nav = useNavigate();
  const token = getToken();

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5" />
          <div>
            <div className="text-xl font-extrabold tracking-tight">TCG Exchange</div>
            <div className="text-sm text-slate-400">React rewrite POC</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link className="btn btn-ghost" to="/app/trades">Trades</Link>
          <Link className="btn btn-ghost" to="/app/cards">Cards</Link>
          {token ? (
            <button
              className="btn btn-ghost"
              onClick={() => {
                clearToken();
                nav('/app/login');
              }}
            >
              Log out
            </button>
          ) : (
            <Link className="btn btn-ghost" to="/app/login">Log in</Link>
          )}
        </div>
      </div>

      <Outlet />

      <div className="mt-10 text-center text-xs text-slate-500">
        This is a separate branch + separate UI. Backend/API is unchanged.
      </div>
    </div>
  );
}
