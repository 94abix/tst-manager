/**
 * Page de connexion
 * Login Page
 *
 * @author Renault Group - Service 00596
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loading } = useAuth();

  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Vérifier si la session a expiré / Check if session expired
  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      toast.warning('Votre session a expiré, veuillez vous reconnecter');
    }
  }, [searchParams]);

  // Soumission du formulaire / Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!matricule.trim() || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    const result = await login(matricule.trim(), password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Erreur de connexion');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-renault-yellow rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-black">TST</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">TST Manager</h1>
          <p className="text-gray-400">Gestion des fiches Travail Sous Tension</p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Connexion</h2>

          {/* Message d'erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Matricule */}
            <div>
              <label htmlFor="matricule" className="form-label">
                Matricule
              </label>
              <input
                id="matricule"
                type="text"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value.toUpperCase())}
                placeholder="Ex: USER001"
                className="form-input"
                autoComplete="username"
                disabled={loading}
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="form-label">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  className="form-input pr-10"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="loading-spinner w-5 h-5"></div>
                  Connexion...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Se connecter
                </span>
              )}
            </button>
          </form>

          {/* Info compte de test */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">Comptes de démonstration :</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p><strong>Admin:</strong> ADMIN001 / Admin@123!</p>
              <p><strong>Utilisateur:</strong> USER001 / User@123!</p>
              <p><strong>Lecture seule:</strong> VIEW001 / View@123!</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Renault Group - Service 00596
        </p>
      </div>
    </div>
  );
}

export default Login;
