/**
 * Composant principal de l'application
 * Main Application Component
 *
 * @author Renault Group - Service 00596
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewTSTForm from './pages/NewTSTForm';
import TSTDetail from './pages/TSTDetail';
import Archive from './pages/Archive';
import Interveners from './pages/Interveners';

/**
 * Composant de route protégée
 * Protected Route Component
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, initialized } = useAuth();

  // Attendre l'initialisation / Wait for initialization
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Rediriger vers login si non authentifié / Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Layout principal avec sidebar
 * Main Layout with Sidebar
 */
function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      <main className="main-content p-6">
        {children}
      </main>
    </div>
  );
}

/**
 * Application principale
 * Main Application
 */
function App() {
  const { isAuthenticated, initialized } = useAuth();

  // Écran de chargement initial / Initial loading screen
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-renault-yellow rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold">TST</span>
          </div>
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Initialisation...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Route publique - Login */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        }
      />

      {/* Routes protégées */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/nouvelle-fiche"
        element={
          <ProtectedRoute>
            <MainLayout>
              <NewTSTForm />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/fiche/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TSTDetail />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/fiche/:id/edit"
        element={
          <ProtectedRoute>
            <MainLayout>
              <NewTSTForm />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/archives"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Archive />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/intervenants"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Interveners />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Route 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-6">Page non trouvée</p>
              <a href="/" className="btn-primary">
                Retour à l'accueil
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
