import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Компонент AdminRoute защищает маршруты, требующие прав администратора
 * Пользователи без прав администратора будут перенаправлены на главную страницу
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Добавляем отладочную информацию
    console.log('AdminRoute - Auth Status:', { isAuthenticated, isAdmin, loading, user });
  }, [isAuthenticated, isAdmin, loading, user]);

  // Показываем лоадер пока проверяем авторизацию
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа администратора
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Если пользователь не администратор, перенаправляем на главную страницу
  if (!isAdmin) {
    // Добавляем сообщение об ошибке перед перенаправлением
    alert('У вас нет прав администратора');
    return <Navigate to="/" replace />;
  }

  // Если пользователь администратор, показываем защищенный контент
  return children;
};

export default AdminRoute;