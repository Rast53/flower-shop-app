import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Компонент AdminRoute защищает маршруты, требующие прав администратора
 * Пользователи без прав администратора будут перенаправлены на главную страницу
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

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
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Если пользователь не администратор, перенаправляем на главную страницу
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Если пользователь администратор, показываем защищенный контент
  return children;
};

export default AdminRoute;