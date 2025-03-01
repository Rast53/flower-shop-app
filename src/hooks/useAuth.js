import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { authApi } from '../services/api';

// Создаем контекст для аутентификации
const AuthContext = createContext();

// Провайдер контекста аутентификации
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Эффект для проверки сохраненного токена и автоматической авторизации
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await authApi.getMe();
          setUser(response.data);
        }
      } catch (err) {
        console.error('Ошибка при автоматической авторизации:', err);
        // Если токен недействительный, удаляем его
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Функция для входа
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login(credentials);
      const { token, user } = response.data;
      
      // Сохраняем токен и данные пользователя
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка авторизации');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Функция для регистрации
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.register(userData);
      const { token, user } = response.data;
      
      // Сохраняем токен и данные пользователя
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при регистрации');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Функция для выхода
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // Функция для обновления данных пользователя
  const updateProfile = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.updateProfile(userData);
      const updatedUser = response.data;
      
      // Обновляем локально сохраненные данные
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при обновлении профиля');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Функция для верификации Telegram аккаунта
  const verifyTelegram = useCallback(async (telegramData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.verifyTelegram(telegramData);
      const { user } = response.data;
      
      // Обновляем локально сохраненные данные
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при верификации Telegram');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Значение, которое будет доступно через контекст
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    verifyTelegram,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Хук для использования контекста аутентификации
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

export default useAuth;