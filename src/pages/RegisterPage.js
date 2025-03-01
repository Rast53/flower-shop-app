import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Компонент RegisterPage для Telegram Mini App
 * В контексте Telegram Mini App отдельная регистрация не требуется,
 * поэтому перенаправляем на страницу входа
 */
const RegisterPage = () => {
  const { isAuthenticated } = useAuth();
  
  // Выводим предупреждение в консоль для разработчиков
  useEffect(() => {
    console.log('Для Telegram Mini App отдельная регистрация не требуется, используется авторизация через Telegram');
  }, []);

  // Если пользователь уже авторизован, перенаправляем на главную
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Иначе перенаправляем на страницу входа
  return <Navigate to="/login" replace />;
};

export default RegisterPage; 