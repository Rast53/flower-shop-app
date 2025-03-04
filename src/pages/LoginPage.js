import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import { useAuth } from '../hooks/useAuth';
import '../styles/LoginPage.css';
import api from '../services/api';

/**
 * Компонент LoginPage для Telegram Mini App
 * Использует данные из Telegram для авторизации пользователя
 */
const LoginPage = () => {
  const { tg, user: telegramUser } = useTelegram();
  const { isAuthenticated, loading, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Используем данные из Telegram для автоматической авторизации
  useEffect(() => {
    const authenticateWithTelegram = async () => {
      if (tg && telegramUser && !isAuthenticated && !isProcessing) {
        try {
          setIsProcessing(true);
          setError(null);
          
          // Получаем initData от Telegram
          const initData = tg.initData || '';
          
          // Готовим данные для отправки на сервер
          const telegramData = {
            telegram_id: telegramUser.id.toString(),
            telegram_username: telegramUser.username || '',
            initData: initData,
            user_data: telegramUser
          };
          
          console.log('Отправка данных для авторизации через Telegram:', telegramData);
          
          // Отправляем данные на сервер для аутентификации
          const response = await api.auth.verifyTelegram(telegramData);
          
          if (response.data && response.data.token) {
            // Вызываем функцию входа из контекста авторизации
            login(response.data.token, response.data.user);
            navigate('/');
          }
        } catch (err) {
          console.error('Ошибка авторизации через Telegram:', err);
          setError('Не удалось авторизоваться через Telegram. Пожалуйста, попробуйте позже.');
        } finally {
          setIsProcessing(false);
        }
      }
    };

    authenticateWithTelegram();
  }, [tg, telegramUser, isAuthenticated, login, navigate, isProcessing]);

  // Если пользователь уже авторизован, перенаправляем на главную
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Показываем лоадер, пока проверяем авторизацию
  if (loading || isProcessing) {
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
        {error && <div className="error-message">{error}</div>}
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