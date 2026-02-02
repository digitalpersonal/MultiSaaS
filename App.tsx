
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { ServiceOrders } from './pages/ServiceOrders';
import { Sales } from './pages/Sales';
import { Customers } from './pages/Customers';
import { Finance } from './pages/Finance';
import { Team } from './pages/Team';
import { Help } from './pages/Help'; // Novo
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { SuperAdmin } from './pages/SuperAdmin';
import { Budgets } from './pages/Budgets';
import { Login } from './pages/Login';
import { User, UserRole } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('multiplus_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('multiplus_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('multiplus_user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/estoque" element={<Inventory />} />
          <Route path="/servicos" element={<ServiceOrders />} />
          <Route path="/vendas" element={<Sales />} />
          <Route path="/orcamentos" element={<Budgets />} />
          <Route path="/financeiro" element={<Finance />} />
          <Route path="/clientes" element={<Customers />} />
          <Route path="/equipe" element={<Team />} />
          <Route path="/ajuda" element={<Help />} />
          <Route path="/relatorios" element={<Reports />} />
          <Route path="/configuracoes" element={<Settings />} />
          
          {user.role === UserRole.SUPER_ADMIN ? (
            <Route path="/super-admin" element={<SuperAdmin />} />
          ) : (
            <Route path="/super-admin" element={<Navigate to="/" replace />} />
          )}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
