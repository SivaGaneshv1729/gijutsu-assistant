import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Login from './pages/Login';
import Copilot from './pages/Copilot';
import Landing from './pages/Landing';

const queryClient = new QueryClient();

// Simple auth check for routing purposes
const isAuthenticated = () => !!localStorage.getItem('token');

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
}

import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={
            <ProtectedRoute>
              <Copilot />
            </ProtectedRoute>
          } />
          <Route path="/graph" element={
            <ProtectedRoute>
              <Copilot />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Copilot />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={<ProtectedRoute><Copilot /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </BrowserRouter>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
