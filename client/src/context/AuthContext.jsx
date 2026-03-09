/**
 * Contexte d'authentification
 * Authentication Context
 *
 * @module context/AuthContext
 * @author Renault Group - Service 00596
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';

// Création du contexte / Context creation
const AuthContext = createContext(null);

/**
 * Provider d'authentification
 * Authentication Provider
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialisation - Vérifier si un token existe
  // Initialization - Check if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('tst_token');
      const storedUser = localStorage.getItem('tst_user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Vérifier que le token est toujours valide
          // Verify token is still valid
          const response = await authAPI.getProfile();
          setUser(response.data.data.user);
          localStorage.setItem('tst_user', JSON.stringify(response.data.data.user));
        } catch (error) {
          // Token invalide, nettoyer / Invalid token, clean up
          console.error('Token invalide:', error);
          localStorage.removeItem('tst_token');
          localStorage.removeItem('tst_user');
          setToken(null);
          setUser(null);
        }
      }

      setLoading(false);
      setInitialized(true);
    };

    initAuth();
  }, []);

  /**
   * Connexion utilisateur
   * User login
   */
  const login = useCallback(async (matricule, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login({ matricule, password });

      const { token: newToken, user: userData } = response.data.data;

      // Stocker le token et l'utilisateur / Store token and user
      localStorage.setItem('tst_token', newToken);
      localStorage.setItem('tst_user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      toast.success(`Bienvenue, ${userData.prenom} ${userData.nom}`);

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur de connexion';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Déconnexion utilisateur
   * User logout
   */
  const logout = useCallback(() => {
    localStorage.removeItem('tst_token');
    localStorage.removeItem('tst_user');
    setToken(null);
    setUser(null);
    toast.info('Vous avez été déconnecté');
  }, []);

  /**
   * Met à jour le profil utilisateur
   * Update user profile
   */
  const updateProfile = useCallback(async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      const updatedUser = response.data.data.user;

      setUser(updatedUser);
      localStorage.setItem('tst_user', JSON.stringify(updatedUser));

      toast.success('Profil mis à jour');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   * Check if user has specific role
   */
  const hasRole = useCallback((roles) => {
    if (!user) return false;
    if (typeof roles === 'string') {
      return user.role === roles;
    }
    return roles.includes(user.role);
  }, [user]);

  /**
   * Vérifie si l'utilisateur peut écrire (pas readonly)
   * Check if user can write (not readonly)
   */
  const canWrite = useCallback(() => {
    return user && user.role !== 'readonly';
  }, [user]);

  /**
   * Vérifie si l'utilisateur est admin
   * Check if user is admin
   */
  const isAdmin = useCallback(() => {
    return user && user.role === 'admin';
  }, [user]);

  // Valeur du contexte / Context value
  const value = {
    user,
    token,
    loading,
    initialized,
    isAuthenticated: !!user,
    login,
    logout,
    updateProfile,
    hasRole,
    canWrite,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook pour utiliser le contexte d'authentification
 * Hook to use authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }

  return context;
}

export default AuthContext;
