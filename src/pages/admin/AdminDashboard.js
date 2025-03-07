import React, { useEffect, useState } from 'react';
import { useTelegram } from '../../hooks/useTelegram';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/AdminDashboard.css';

/**
 * Компонент AdminDashboard для Telegram Mini App
 * Главная страница административной панели
 */
const AdminDashboard = () => {
  const { tg, hideMainButton } = useTelegram();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    newOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalCategories: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    recentOrders: [],
    popularProducts: [],
    ordersByStatus: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Скрываем основную кнопку Telegram при загрузке компонента
  useEffect(() => {
    if (tg) {
      hideMainButton();
    }
    
    loadDashboardData();
  }, [tg, hideMainButton]);

  // Функция загрузки данных дашборда
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Проверяем токен авторизации
      const token = localStorage.getItem('authToken');
      const isAdminFlag = localStorage.getItem('user_is_admin');
      
      if (!token) {
        console.error('AdminDashboard: Токен авторизации отсутствует. Перенаправляем на страницу входа.');
        navigate('/admin/login');
        return;
      }
      
      console.log('AdminDashboard: Запрос статистики...');
      const response = await api.get('/admin/dashboard/stats');
      console.log('AdminDashboard: Ответ API:', response);
      
      // Проверяем наличие данных в ответе
      if (response.data && response.data.data) {
        setDashboardData(response.data.data);
      } else {
        console.error('AdminDashboard: Неверный формат данных в ответе:', response.data);
        setError('Не удалось загрузить данные дашборда. Неверный формат ответа.');
      }
    } catch (error) {
      console.error('AdminDashboard: Ошибка загрузки данных:', error);
      setError('Не удалось загрузить данные дашборда. Проверьте подключение к интернету.');
      
      // Проверяем, связана ли ошибка с авторизацией
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user_is_admin');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Форматирование валюты
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Расчет времени с момента события
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    if (minutes < 60) {
      return `${minutes} ${getMinutesWord(minutes)} назад`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} ${getHoursWord(hours)} назад`;
    }
    
    const days = Math.floor(hours / 24);
    return `${days} ${getDaysWord(days)} назад`;
  };
  
  // Склонение слова "минута"
  const getMinutesWord = (minutes) => {
    if (minutes % 10 === 1 && minutes % 100 !== 11) {
      return 'минуту';
    } else if ([2, 3, 4].includes(minutes % 10) && ![12, 13, 14].includes(minutes % 100)) {
      return 'минуты';
    } else {
      return 'минут';
    }
  };
  
  // Склонение слова "час"
  const getHoursWord = (hours) => {
    if (hours % 10 === 1 && hours % 100 !== 11) {
      return 'час';
    } else if ([2, 3, 4].includes(hours % 10) && ![12, 13, 14].includes(hours % 100)) {
      return 'часа';
    } else {
      return 'часов';
    }
  };
  
  // Склонение слова "день"
  const getDaysWord = (days) => {
    if (days % 10 === 1 && days % 100 !== 11) {
      return 'день';
    } else if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) {
      return 'дня';
    } else {
      return 'дней';
    }
  };
  
  // Получение статуса заказа в читаемом формате
  const getOrderStatusText = (status) => {
    switch (status) {
      case 'new': return 'Новый заказ';
      case 'processing': return 'Заказ в обработке';
      case 'shipped': return 'Заказ отправлен';
      case 'delivered': return 'Заказ доставлен';
      case 'cancelled': return 'Заказ отменен';
      default: return `Заказ: ${status}`;
    }
  };
  
  // Получение иконки для статуса заказа
  const getOrderStatusIcon = (status) => {
    switch (status) {
      case 'new': return 'shopping_cart';
      case 'processing': return 'pending_actions';
      case 'shipped': return 'local_shipping';
      case 'delivered': return 'done_all';
      case 'cancelled': return 'cancel';
      default: return 'receipt_long';
    }
  };

  // Текущая дата для отображения в дашборде
  const currentDate = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Если данные загружаются, показываем индикатор загрузки
  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loader"></div>
        <p>Загрузка панели управления...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Панель управления</h1>
        <p className="admin-date">{currentDate}</p>
      </div>
      
      {error && (
        <div className="admin-error-message">
          <span className="material-icons">error</span>
          <p>{error}</p>
          <button 
            className="btn btn-secondary" 
            onClick={loadDashboardData}
          >
            Повторить загрузку
          </button>
        </div>
      )}
      
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">shopping_bag</span>
          </div>
          <div className="stat-info">
            <h3>Заказы</h3>
            <p className="stat-value">{dashboardData.totalOrders}</p>
          </div>
        </div>
        
        <div className="stat-card new-orders">
          <div className="stat-icon">
            <span className="material-icons">notifications_active</span>
          </div>
          <div className="stat-info">
            <h3>Новые заказы</h3>
            <p className="stat-value">{dashboardData.newOrders}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">local_florist</span>
          </div>
          <div className="stat-info">
            <h3>Товары</h3>
            <p className="stat-value">{dashboardData.totalProducts}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">people</span>
          </div>
          <div className="stat-info">
            <h3>Пользователи</h3>
            <p className="stat-value">{dashboardData.totalUsers}</p>
          </div>
        </div>
      </div>
      
      <div className="admin-sections">
        <div className="admin-section">
          <h2>Финансы</h2>
          <div className="admin-card">
            <div className="finance-stats">
              <div className="finance-stat">
                <h3>Общий доход</h3>
                <p className="finance-value">{formatCurrency(dashboardData.totalRevenue)}</p>
              </div>
              <div className="finance-stat">
                <h3>Доход за 30 дней</h3>
                <p className="finance-value">{formatCurrency(dashboardData.monthlyRevenue)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="admin-section">
          <h2>Заказы по статусам</h2>
          <div className="admin-card">
            <div className="status-stats">
              <div className="status-stat">
                <span className="status-badge status-new">
                  Новые
                </span>
                <p className="status-value">{dashboardData.ordersByStatus.new || 0}</p>
              </div>
              <div className="status-stat">
                <span className="status-badge status-processing">
                  В обработке
                </span>
                <p className="status-value">{dashboardData.ordersByStatus.processing || 0}</p>
              </div>
              <div className="status-stat">
                <span className="status-badge status-shipped">
                  Отправлены
                </span>
                <p className="status-value">{dashboardData.ordersByStatus.shipped || 0}</p>
              </div>
              <div className="status-stat">
                <span className="status-badge status-delivered">
                  Доставлены
                </span>
                <p className="status-value">{dashboardData.ordersByStatus.delivered || 0}</p>
              </div>
              <div className="status-stat">
                <span className="status-badge status-cancelled">
                  Отменены
                </span>
                <p className="status-value">{dashboardData.ordersByStatus.cancelled || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="admin-sections">
        <div className="admin-section">
          <h2>Последние заказы</h2>
          <div className="admin-card">
            {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
              <ul className="activity-list">
                {dashboardData.recentOrders.map(order => (
                  <li key={order.id} className="activity-item" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                    <span className={`activity-icon material-icons status-${order.status}`}>
                      {getOrderStatusIcon(order.status)}
                    </span>
                    <div className="activity-content">
                      <p className="activity-text">
                        {getOrderStatusText(order.status)} #{order.id} • {formatCurrency(order.total)}
                      </p>
                      <p className="activity-customer">{order.customer}</p>
                      <p className="activity-time">{getTimeAgo(order.date)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-list">
                <span className="material-icons">inbox</span>
                <p>Заказы отсутствуют</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="admin-section">
          <h2>Популярные товары</h2>
          <div className="admin-card">
            {dashboardData.popularProducts && dashboardData.popularProducts.length > 0 ? (
              <ul className="popular-products">
                {dashboardData.popularProducts.map(product => (
                  <li key={product.id} className="product-item" onClick={() => navigate(`/admin/products/${product.id}`)}>
                    {product.image && (
                      <div className="product-image">
                        <img src={product.image} alt={product.name} />
                      </div>
                    )}
                    <div className="product-details">
                      <div className="product-name">{product.name}</div>
                      <div className="product-price">{formatCurrency(product.price)}</div>
                      <div className="product-sales">{product.sales} продаж</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-list">
                <span className="material-icons">local_florist</span>
                <p>Нет данных о продажах</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 