import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { authApi } from '../services/api';
import { useTelegram } from '../hooks/useTelegram';

// Создаем контекст аутентификации
export const AuthContext = createContext();

/**
 * Провайдер контекста аутентификации
 * Управляет состоянием аутентификации пользователя и предоставляет методы для входа, выхода и регистрации
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const { user: telegramUser, isReady: isTelegramReady } = useTelegram();

  // Метод для телеграм-авторизации
  const telegramAuth = async (telegramUser) => {
    if (!telegramUser) return false;
    
    try {
      console.log('Авторизация через Telegram:', telegramUser);
      
      // Отправляем данные пользователя Telegram на наш сервер для проверки
      const response = await authApi.telegramAuth({
        telegram_id: String(telegramUser.id),
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name
      });
      
      // Проверяем структуру ответа
      const responseData = response.data?.data || response.data;
      
      if (responseData?.token || responseData?.user) {
        const token = responseData.token;
        const userData = responseData.user || {};
        
        localStorage.setItem('authToken', token);
        setToken(token);
        setCurrentUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(userData.is_admin || false);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Ошибка при авторизации через Telegram:', error);
      return false;
    }
  };

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      // Проверяем состояние debugging
      const debugEnabled = process.env.NODE_ENV === 'production';
      if (debugEnabled) {
        console.log('AUTH CONTEXT DEBUG MODE:', { 
          token: localStorage.getItem('authToken'),
          isAdmin: localStorage.getItem('user_is_admin')
        });
      }

      // Сначала пробуем авторизоваться через Telegram
      if (isTelegramReady && telegramUser) {
        const success = await telegramAuth(telegramUser);
        if (success) {
          setLoading(false);
          return;
        }
      }
      
      // Если не удалось через Telegram, проверяем токен
      const storedToken = localStorage.getItem('authToken');
      
      if (storedToken) {
        try {
          // Устанавливаем токен в заголовки запросов
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          console.log('Установлен токен из localStorage:', storedToken.substring(0, 10) + '...');
          
          // Проверка валидности токена через /auth/me
          console.log('Проверка токена через /auth/me...');
          const response = await authApi.getMe();
          
          if (debugEnabled) {
            console.log('Auth status response:', response);
          }
          
          // Проверяем структуру ответа
          const userData = response.data?.user || response.data?.data?.user || response.data;
          
          if (userData) {
            console.log('Токен действителен, пользователь:', userData);
            setCurrentUser(userData);
            setToken(storedToken);
            setIsAuthenticated(true);
            
            // Явно преобразуем is_admin в булево значение
            const isAdminValue = 
              typeof userData.is_admin === 'string' 
                ? userData.is_admin.toLowerCase() === 'true' 
                : Boolean(userData.is_admin);
            
            setIsAdmin(isAdminValue);
            
            // Обновляем информацию о правах в localStorage
            localStorage.setItem('user_is_admin', String(isAdminValue));
            console.log('Установлен флаг администратора:', isAdminValue);
          } else {
            console.warn('Неверный формат ответа от сервера, userData отсутствует');
            throw new Error('Неверный формат ответа от сервера');
          }
        } catch (error) {
          console.error('Ошибка проверки токена:', error);
          
          // Если токен недействителен, очищаем localStorage
          localStorage.removeItem('authToken');
          localStorage.removeItem('user_is_admin');
          delete api.defaults.headers.common['Authorization'];
          setToken(null);
          setCurrentUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } else {
        console.warn('Токен не найден в localStorage');
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, [isTelegramReady, telegramUser]);

  // Метод для входа в систему
  const login = async (emailOrToken, passwordOrUser) => {
    setLoading(true);
    setError(null);
    
    // Если передан токен напрямую (используется при авторизации через Telegram)
    if (typeof emailOrToken === 'string' && typeof passwordOrUser === 'object') {
      const token = emailOrToken;
      const userData = passwordOrUser;
      
      console.log('Вход с готовым токеном:', { userData });
      
      localStorage.setItem('authToken', token);
      setToken(token);
      
      // Явно преобразуем is_admin в булево значение, если оно строковое
      const isAdminValue = 
        typeof userData.is_admin === 'string' 
          ? userData.is_admin.toLowerCase() === 'true' 
          : Boolean(userData.is_admin);
      
      setCurrentUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(isAdminValue);
      
      // Сохраняем информацию о правах в localStorage
      localStorage.setItem('user_is_admin', String(isAdminValue));
      
      setLoading(false);
      return true;
    }
    
    // Стандартный вход с email и паролем
    const email = emailOrToken;
    const password = passwordOrUser;
    
    console.log('Попытка входа с email/паролем:', { email });
    
    try {
      console.log('Отправка запроса на аутентификацию...');
      const response = await authApi.login({ email, password });
      
      console.log('API Login Response:', response.data);
      
      // Проверяем структуру ответа
      const responseData = response.data?.data || response.data;
      
      if (responseData?.token || responseData?.data?.token) {
        const token = responseData.token || responseData.data.token;
        const userData = responseData.user || responseData.data?.user || {};
        
        localStorage.setItem('authToken', token);
        setToken(token);
        
        // Добавляем отладочную информацию
        console.log('User data from login:', userData);
        console.log('Admin status:', userData.is_admin);
        
        // Явно преобразуем is_admin в булево значение, если оно строковое
        const isAdminValue = 
          typeof userData.is_admin === 'string' 
            ? userData.is_admin.toLowerCase() === 'true' 
            : Boolean(userData.is_admin);
        
        setCurrentUser(userData);
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
      const response = await authApi.register(userData);
      
      if (response.data?.token) {
        const token = response.data.token;
        const user = response.data.user;
        
        localStorage.setItem('authToken', token);
        setToken(token);
        setCurrentUser(user);
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
        setCurrentUser({ ...currentUser, ...response.data });
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('user_is_admin');
    
    // Сбрасываем состояние
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setToken(null);
    
    // Для полной очистки состояния и предотвращения проблем с кешированием
    // можно перезагрузить страницу
    window.location.href = '/';
  };

  const value = {
    currentUser,
    token,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    telegramAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 