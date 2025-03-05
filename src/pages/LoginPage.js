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
      // Добавляем больше отладочной информации
      console.log('Состояние авторизации:', {
        tgAvailable: !!tg,
        userAvailable: !!telegramUser,
        isAuthenticated,
        isProcessing
      });
      
      if (tg && telegramUser && !isAuthenticated && !isProcessing) {
        try {
          setIsProcessing(true);
          setError(null);
          
          // Получаем initData от Telegram
          const initData = tg.initData || '';
          console.log('initData из Telegram:', initData ? 'Получен' : 'Отсутствует');
          
          // Подробная информация о пользователе
          console.log('Данные пользователя Telegram для авторизации:', {
            id: telegramUser.id,
            username: telegramUser.username,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name
          });
          
          // Готовим данные для отправки на сервер
          const telegramData = {
            telegram_id: String(telegramUser.id),
            username: telegramUser.username || '',
            first_name: telegramUser.first_name || '',
            last_name: telegramUser.last_name || '',
            // Добавляем дополнительные данные, если они требуются
            initData: initData
          };
          
          console.log('Отправка данных для авторизации через Telegram:', telegramData);
          
          // Отправляем данные на сервер для аутентификации
          console.log('Вызываем api.auth.telegramAuth...');
          const response = await api.auth.telegramAuth(telegramData);
          
          console.log('Ответ от сервера при авторизации через Telegram:', response.data);
          
          // Учитываем различные варианты структуры ответа
          const responseData = response.data?.data || response.data;
          
          if (responseData?.token || responseData?.user?.token) {
            console.log('Токен получен успешно');
            const token = responseData.token || responseData.user?.token;
            const userData = responseData.user || {};
            
            console.log('Выполняем вход с данными:', { 
              userDataAvailable: !!userData, 
              tokenExists: !!token,
              userData: {
                id: userData.id,
                name: userData.name,
                is_admin: userData.is_admin
              }
            });
            
            // Вызываем функцию входа из контекста авторизации
            login(token, userData);
            navigate('/');
          } else {
            console.error('Ошибка формата ответа:', responseData);
            setError('Неверный формат ответа от сервера.');
          }
        } catch (err) {
          console.error('Полная ошибка авторизации через Telegram:', err);
          console.error('Стек ошибки:', err.stack);
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