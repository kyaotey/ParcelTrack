import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';

function AdminHome() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-slate-500 mb-6">
            Welcome, {user.name}. Real dashboard coming Day 5.
          </p>
          <button
            onClick={logout}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

function AgentHome() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-2xl font-bold mb-2">Agent Dashboard</h1>
          <p className="text-slate-500 mb-6">
            Welcome, {user.name}. Real dashboard coming Day 4.
          </p>
          <button
            onClick={logout}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

function LandingRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/agent'} replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent"
            element={
              <ProtectedRoute role="AGENT">
                <AgentHome />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
