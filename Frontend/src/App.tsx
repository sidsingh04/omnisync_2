import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AgentDashboard from './pages/AgentDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import './App.css';

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) => {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
  const isSupervisor = sessionStorage.getItem('supervisorId') !== null;
  const isAgent = sessionStorage.getItem('agentId') !== null;

  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (requiredRole === 'supervisor' && !isSupervisor) return <Navigate to={isAgent ? "/agent" : "/"} replace />;
  if (requiredRole === 'agent' && !isAgent) return <Navigate to={isSupervisor ? "/supervisor" : "/"} replace />;

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/agent"
          element={
            <ProtectedRoute requiredRole="agent">
              <AgentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor"
          element={
            <ProtectedRoute requiredRole="supervisor">
              <SupervisorDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
