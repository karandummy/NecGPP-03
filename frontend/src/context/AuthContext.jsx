import { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '@utils/localStorage';
import { authAPI } from '@api/endpoints/authAPI';
import { parseError } from '@utils/errorHandler';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const storedToken = storage.getToken();
      const storedUser = storage.getUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token: newToken, user: userData } = response.data;

      // Save to state and localStorage
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);

      storage.setToken(newToken);
      storage.setUser(userData);

      toast.success(response.message || 'Login successful!');
      return { success: true };
    } catch (error) {
      const errorMsg = parseError(error).message;
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear state and storage
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      storage.clearAuth();
      toast.success('Logged out successfully');
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
    storage.setUser(userData);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};