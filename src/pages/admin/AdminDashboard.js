import React, { useEffect, useState } from 'react';
import { useTelegram } from '../../hooks/useTelegram';
import '../../styles/AdminDashboard.css';

/**
 * Компонент AdminDashboard для Telegram Mini App
 * Главная страница административной панели
 */
const AdminDashboard = () => {
  const { tg, hideMainButton } = useTelegram();
  const [stats, setStats] = useState({
    totalOrders: 0,
    newOrders: 0,
    totalProducts: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  // Скрываем основную кнопку Telegram при загрузке компонента
  useEffect(() => {
    if (tg) {
      hideMainButton();
    }
    
    // Загружаем статистику (имитация запроса к API)
    const loadStats = setTimeout(() => {
      setStats({
        totalOrders: 152,
        newOrders: 8,
        totalProducts: 76,
        totalUsers: 203
      });
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(loadStats);
  }, [tg, hideMainButton]);

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
      
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">shopping_bag</span>
          </div>
          <div className="stat-info">
            <h3>Всего заказов</h3>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
        </div>
        
        <div className="stat-card new-orders">
          <div className="stat-icon">
            <span className="material-icons">notifications_active</span>
          </div>
          <div className="stat-info">
            <h3>Новые заказы</h3>
            <p className="stat-value">{stats.newOrders}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">local_florist</span>
          </div>
          <div className="stat-info">
            <h3>Товары</h3>
            <p className="stat-value">{stats.totalProducts}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <span className="material-icons">people</span>
          </div>
          <div className="stat-info">
            <h3>Пользователи</h3>
            <p className="stat-value">{stats.totalUsers}</p>
          </div>
        </div>
      </div>
      
      <div className="admin-sections">
        <div className="admin-section">
          <h2>Последние действия</h2>
          <div className="admin-card">
            <ul className="activity-list">
              <li className="activity-item">
                <span className="activity-icon material-icons">shopping_cart</span>
                <div className="activity-content">
                  <p className="activity-text">Новый заказ #1089</p>
                  <p className="activity-time">15 минут назад</p>
                </div>
              </li>
              <li className="activity-item">
                <span className="activity-icon material-icons">person_add</span>
                <div className="activity-content">
                  <p className="activity-text">Новый пользователь: Анна С.</p>
                  <p className="activity-time">1 час назад</p>
                </div>
              </li>
              <li className="activity-item">
                <span className="activity-icon material-icons">edit</span>
                <div className="activity-content">
                  <p className="activity-text">Изменение товара: "Букет роз"</p>
                  <p className="activity-time">2 часа назад</p>
                </div>
              </li>
              <li className="activity-item">
                <span className="activity-icon material-icons">done_all</span>
                <div className="activity-content">
                  <p className="activity-text">Заказ #1087 выполнен</p>
                  <p className="activity-time">3 часа назад</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="admin-section">
          <h2>Популярные товары</h2>
          <div className="admin-card">
            <ul className="popular-products">
              <li className="product-item">
                <div className="product-name">Букет "Весеннее настроение"</div>
                <div className="product-sales">32 продажи</div>
              </li>
              <li className="product-item">
                <div className="product-name">Композиция "Нежность"</div>
                <div className="product-sales">28 продаж</div>
              </li>
              <li className="product-item">
                <div className="product-name">Букет роз "Классика"</div>
                <div className="product-sales">24 продажи</div>
              </li>
              <li className="product-item">
                <div className="product-name">Букет "Солнечный день"</div>
                <div className="product-sales">22 продажи</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 