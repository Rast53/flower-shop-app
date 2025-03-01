import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import { useAuth } from '../hooks/useAuth';
import '../styles/LoginPage.css';

/**
 * Компонент LoginPage для Telegram Mini App
 * Использует данные из Telegram для авторизации пользователя
 */
const LoginPage = () => {
  const { tg, user: telegramUser } = useTelegram();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Используем данные из Telegram для автоматической авторизации
  useEffect(() => {
    if (tg && telegramUser) {
      // В реальном приложении здесь можно отправить данные на сервер 
      // для синхронизации пользователя Telegram с базой данных
      console.log('Авторизация через Telegram:', telegramUser);
      
      // После успешной авторизации перенаправляем на главную страницу
      navigate('/');
    }
  }, [tg, telegramUser, navigate]);

  // Если пользователь уже авторизован, перенаправляем на главную
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Показываем лоадер, пока проверяем авторизацию
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Вход в систему</h1>
        <p className="telegram-login-message">
          Авторизация происходит автоматически через Telegram.
          <br />
          Если вы видите эту страницу, значит приложение запущено вне Telegram.
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 