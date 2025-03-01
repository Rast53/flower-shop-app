import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

// Создаем контекст аутентификации
export const AuthContext = createContext();

/**
 * Провайдер контекста аутентификации
 * Управляет состоянием аутентификации пользователя и предоставляет методы для входа, выхода и регистрации
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // При загрузке приложения проверяем наличие токена в localStorage
  // и пытаемся авторизовать пользователя, если токен существует
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Устанавливаем токен в заголовок запросов
        const response = await api.auth.getMe();
        
        if (response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
          setIsAdmin(response.data.is_admin || false);
        }
      } catch (err) {
        console.error('Ошибка при проверке авторизации:', err);
        // Если токен недействителен, удаляем его
        localStorage.removeItem('auth_token');
        setError('Сессия истекла. Пожалуйста, войдите снова.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Метод для входа в систему
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.auth.login({ email, password });
      
      if (response.data?.token) {
        localStorage.setItem('auth_token', response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        setIsAdmin(response.data.user.is_admin || false);
        return true;
      }
    } catch (err) {
      console.error('Ошибка при входе:', err);
      setError(err.response?.data?.message || 'Ошибка при входе. Пожалуйста, проверьте ваши данные.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Метод для регистрации
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.auth.register(userData);
      
      if (response.data?.token) {
        localStorage.setItem('auth_token', response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        setIsAdmin(false); // Новые пользователи не являются администраторами
        return true;
      }
    } catch (err) {
      console.error('Ошибка при регистрации:', err);
      setError(err.response?.data?.message || 'Ошибка при регистрации. Попробуйте другой email.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Метод для обновления данных пользователя
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.auth.updateProfile(userData);
      
      if (response.data) {
        setUser({ ...user, ...response.data });
        return true;
      }
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
      setError(err.response?.data?.message || 'Ошибка при обновлении профиля.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Метод для выхода из системы
  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 