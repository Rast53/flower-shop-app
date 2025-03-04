import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { authApi } from '../services/api';

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
    
    console.log('Попытка входа:', { email });
    
    try {
      console.log('Отправка запроса на аутентификацию...');
      const response = await authApi.login({ email, password });
      
      console.log('API Login Response:', response.data);
      
      // Проверяем структуру ответа
      const responseData = response.data?.data || response.data;
      
      if (responseData?.token || responseData?.data?.token) {
        const token = responseData.token || responseData.data.token;
        const userData = responseData.user || responseData.data?.user || {};
        
        localStorage.setItem('auth_token', token);
        
        // Добавляем отладочную информацию
        console.log('User data from login:', userData);
        console.log('Admin status:', userData.is_admin);
        
        // Явно преобразуем is_admin в булево значение, если оно строковое
        const isAdminValue = 
          typeof userData.is_admin === 'string' 
            ? userData.is_admin.toLowerCase() === 'true' 
            : Boolean(userData.is_admin);
        
        setUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(isAdminValue);
        
        // Сохраняем пользователя и его права в локальное хранилище для дополнительной безопасности
        localStorage.setItem('user_is_admin', String(isAdminValue));
        
        return true;
      } else {
        console.error('Неверный формат ответа API:', response);
        setError('Неверный формат ответа от сервера. Пожалуйста, обратитесь к администратору.');
        return false;
      }
    } catch (err) {
      console.error('Полная ошибка при входе:', err);
      
      // Детализированная обработка ошибок
      let errorMessage = 'Ошибка при входе. Пожалуйста, проверьте ваши данные.';
      
      if (err.response) {
        // Ответ получен, но статус не 2xx
        console.error('Детали ответа с ошибкой:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
        
        if (err.response.status === 401) {
          errorMessage = 'Неверный email или пароль';
        } else if (err.response.status === 403) {
          errorMessage = 'Доступ запрещен';
        } else if (err.response.status === 500) {
          errorMessage = 'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.';
        }
        
        // Используем сообщение от сервера, если оно есть
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        // Запрос был сделан, но ответ не получен
        console.error('Запрос был отправлен, но ответ не получен:', err.request);
        errorMessage = 'Сервер недоступен. Пожалуйста, проверьте подключение или попробуйте позже.';
      } else {
        // Что-то случилось при настройке запроса
        console.error('Ошибка при настройке запроса:', err.message);
        errorMessage = 'Ошибка при настройке запроса: ' + err.message;
      }
      
      setError(errorMessage);
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
    // Удаляем все данные из localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_is_admin');
    
    // Сбрасываем состояние
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    
    // Для полной очистки состояния и предотвращения проблем с кешированием
    // можно перезагрузить страницу
    window.location.href = '/';
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