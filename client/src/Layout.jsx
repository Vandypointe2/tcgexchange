import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearToken, getToken } from './api';
import ThemeToggle from './components/ThemeToggle.jsx';
import { useTheme } from './theme';

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `btn btn-ghost ${isActive ? 'ring-4 ring-neonCyan/10 border-neonCyan/50' : ''}`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Layout() {
  const nav = useNavigate();
  const token = getToken();
  const theme = useTheme();

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl border border-slate-900/10 bg-white/60 dark:border-white/10 dark:bg-white/5" />
          <div>
            <div className="text-xl font-extrabold tracking-tight">TCG Exchange</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">React rewrite POC</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <NavItem to="/app/search">Search</NavItem>
          <NavItem to="/app/collection">Collection</NavItem>
          <NavItem to="/app/wishlist">Wishlist</NavItem>
          <NavItem to="/app/trades">Trades</NavItem>
          <NavItem to="/app/profile">Profile</NavItem>

          <ThemeToggle theme={theme.theme} onToggle={theme.toggle} />

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
        Backend/API is unchanged. Vite proxies /auth, /cards, /collection, /wishlist, /trades.
      </div>
    </div>
  );
}
