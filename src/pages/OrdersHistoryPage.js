import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Компонент OrdersHistoryPage для Telegram Mini App
 * В контексте Telegram Mini App история заказов интегрирована в профиль пользователя,
 * поэтому перенаправляем на страницу профиля
 */
const OrdersHistoryPage = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Информируем в консоли о перенаправлении
  useEffect(() => {
    console.log('История заказов интегрирована в профиль пользователя в Telegram Mini App');
  }, []);

  // Показываем лоадер, пока проверяем авторизацию
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Перенаправляем на страницу профиля, где есть список заказов
  return <Navigate to="/profile" replace />;
};

export default OrdersHistoryPage; 