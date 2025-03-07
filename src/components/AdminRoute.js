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
    console.log('AdminRoute - Auth Status:', { 
      isAuthenticated, 
      isAdmin, 
      loading, 
      user,
      localStorage: {
        token: localStorage.getItem('authToken') ? 'Присутствует' : 'Отсутствует',
        isAdmin: localStorage.getItem('user_is_admin')
      }
    });
    
    // Дополнительная проверка локального хранилища для обеспечения согласованности
    const storedToken = localStorage.getItem('authToken');
    const storedIsAdmin = localStorage.getItem('user_is_admin');
    
    // Если токен отсутствует, но мы считаем, что пользователь аутентифицирован, 
    // это несоответствие - перенаправляем на страницу входа
    if (!loading && isAuthenticated && !storedToken) {
      console.error('Несоответствие: isAuthenticated=true, но нет токена в localStorage');
      navigate('/admin/login');
    }
    
    // Если флаг isAdmin не соответствует тому, что в хранилище, используем значение из хранилища
    if (!loading && isAuthenticated && Boolean(isAdmin) !== (storedIsAdmin === 'true')) {
      console.warn('Несоответствие прав администратора между контекстом и localStorage');
    }
  }, [isAuthenticated, isAdmin, loading, user, navigate]);

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
    console.log('Пользователь не авторизован, перенаправляем на /admin/login');
    return <Navigate to="/admin/login" replace />;
  }

  // Если пользователь не администратор, перенаправляем на главную страницу
  if (!isAdmin) {
    // Добавляем сообщение об ошибке перед перенаправлением
    console.error('Пользователь не имеет прав администратора');
    alert('У вас нет прав администратора');
    return <Navigate to="/" replace />;
  }

  // Если пользователь администратор, показываем защищенный контент
  console.log('Доступ разрешен, отображаем административный контент');
  return children;
};

export default AdminRoute;