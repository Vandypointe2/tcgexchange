import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Trades from './pages/Trades.jsx';
import Cards from './pages/Cards.jsx';
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
        <Route path="/" element={<Navigate to="/app/trades" replace />} />

        <Route path="/app" element={<Layout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route
            path="trades"
            element={
              <RequireAuth>
                <Trades />
              </RequireAuth>
            }
          />
          <Route
            path="cards"
            element={
              <RequireAuth>
                <Cards />
              </RequireAuth>
            }
          />
          <Route index element={<Navigate to="/app/trades" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
