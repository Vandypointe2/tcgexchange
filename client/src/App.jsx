import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Search from './pages/Search.jsx';
import CardDetail from './pages/CardDetail.jsx';
import Collection from './pages/Collection.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Trades from './pages/Trades.jsx';
import TradeDetail from './pages/TradeDetail.jsx';
import Profile from './pages/Profile.jsx';
import { getToken } from './api';

function RequireAuth({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/app/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/app/search" replace />} />

        <Route path="/app" element={<Layout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          <Route
            path="search"
            element={
              <RequireAuth>
                <Search />
              </RequireAuth>
            }
          />
          <Route
            path="cards/:id"
            element={
              <RequireAuth>
                <CardDetail />
              </RequireAuth>
            }
          />

          <Route
            path="collection"
            element={
              <RequireAuth>
                <Collection />
              </RequireAuth>
            }
          />
          <Route
            path="wishlist"
            element={
              <RequireAuth>
                <Wishlist />
              </RequireAuth>
            }
          />

          <Route
            path="trades"
            element={
              <RequireAuth>
                <Trades />
              </RequireAuth>
            }
          />
          <Route
            path="trades/:id"
            element={
              <RequireAuth>
                <TradeDetail />
              </RequireAuth>
            }
          />

          <Route
            path="profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />

          <Route index element={<Navigate to="/app/search" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
