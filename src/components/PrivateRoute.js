import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Компонент PrivateRoute защищает маршруты, требующие авторизации
 * Неавторизованные пользователи будут перенаправлены на страницу входа
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Показываем лоадер пока проверяем авторизацию
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  // Сохраняем текущий URL, чтобы вернуться после входа
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если пользователь авторизован, показываем защищенный контент
  return children;
};

export default PrivateRoute;