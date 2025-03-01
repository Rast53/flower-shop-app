import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import { useAuth } from '../hooks/useAuth';
import '../styles/ProfilePage.css';

/**
 * Компонент ProfilePage - страница профиля пользователя
 */
const ProfilePage = () => {
  const { user, tg } = useTelegram();
  const { isAuthenticated, logout } = useAuth();
  
  // Состояние для хранения данных профиля
  const [profile, setProfile] = useState({
    name: user?.first_name || '',
    phone: '',
    email: '',
    address: ''
  });
  
  // Состояние для отображения истории заказов
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Состояние для редактирования профиля
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState({ ...profile });
  
  // Загружаем данные профиля и историю заказов при монтировании компонента
  useEffect(() => {
    // В реальном проекте здесь будет запрос к API
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Имитация получения данных с сервера
        // В реальном проекте здесь будет запрос к API
        setTimeout(() => {
          // Данные профиля
          setProfile({
            name: user?.first_name || 'Пользователь Telegram',
            phone: '+7 (999) 123-45-67',
            email: 'user@example.com',
            address: 'Москва, ул. Цветочная, д. 1, кв. 123'
          });
          
          // История заказов
          setOrders([
            {
              id: 'ORD-1001',
              date: '2023-05-15T10:30:00',
              status: 'delivered',
              totalAmount: 3500,
              items: [
                { id: 1, name: 'Букет роз "Нежность"', quantity: 1, price: 2500 },
                { id: 2, name: 'Открытка', quantity: 1, price: 1000 }
              ]
            },
            {
              id: 'ORD-995',
              date: '2023-05-02T14:20:00',
              status: 'delivered',
              totalAmount: 4200,
              items: [
                { id: 3, name: 'Букет тюльпанов "Весна"', quantity: 1, price: 4200 }
              ]
            },
            {
              id: 'ORD-982',
              date: '2023-04-22T09:15:00',
              status: 'delivered',
              totalAmount: 6700,
              items: [
                { id: 4, name: 'Корзина полевых цветов', quantity: 1, price: 5200 },
                { id: 5, name: 'Ваза "Кристалл"', quantity: 1, price: 1500 }
              ]
            }
          ]);
          
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Ошибка при загрузке данных профиля:', error);
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, user]);
  
  // Включаем режим редактирования профиля
  const handleEditProfile = () => {
    setEditableProfile({ ...profile });
    setIsEditing(true);
  };
  
  // Обработчик изменения полей формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Сохраняем изменения профиля
  const handleSaveProfile = (e) => {
    e.preventDefault();
    
    // В реальном проекте здесь будет запрос на сохранение данных
    setProfile({ ...editableProfile });
    setIsEditing(false);
    
    // Уведомляем пользователя
    alert('Изменения сохранены!');
  };
  
  // Отменяем редактирование
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Получение статуса заказа на русском
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'В обработке';
      case 'confirmed':
        return 'Подтвержден';
      case 'shipped':
        return 'Отправлен';
      case 'delivered':
        return 'Доставлен';
      case 'canceled':
        return 'Отменен';
      default:
        return 'Неизвестно';
    }
  };
  
  // Получение класса статуса для стилизации
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'confirmed':
        return 'status-confirmed';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'canceled':
        return 'status-canceled';
      default:
        return '';
    }
  };
  
  // Если пользователь не аутентифицирован, показываем заглушку
  if (!isAuthenticated) {
    return (
      <div className="profile-page">
        <div className="not-authenticated">
          <h2>Необходима авторизация</h2>
          <p>Для доступа к профилю необходимо войти в аккаунт</p>
          <Link to="/login" className="btn btn-primary">
            Войти
          </Link>
        </div>
      </div>
    );
  }
  
  // Если данные загружаются, показываем индикатор загрузки
  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Загрузка данных профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1 className="page-title">Личный кабинет</h1>
      
      <div className="profile-content">
        {/* Информация о пользователе */}
        <div className="profile-section user-info">
          <div className="section-header">
            <h2>Персональные данные</h2>
            {!isEditing && (
              <button 
                className="btn btn-secondary edit-btn"
                onClick={handleEditProfile}
              >
                Редактировать
              </button>
            )}
          </div>
          
          {!isEditing ? (
            // Отображение данных профиля
            <div className="profile-details">
              <div className="profile-row">
                <span className="profile-label">Имя:</span>
                <span className="profile-value">{profile.name}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Телефон:</span>
                <span className="profile-value">{profile.phone}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Email:</span>
                <span className="profile-value">{profile.email}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Адрес доставки:</span>
                <span className="profile-value">{profile.address}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Telegram ID:</span>
                <span className="profile-value">{user?.id || 'Не указан'}</span>
              </div>
            </div>
          ) : (
            // Форма редактирования профиля
            <form onSubmit={handleSaveProfile} className="edit-profile-form">
              <div className="form-group">
                <label htmlFor="name">Имя</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  value={editableProfile.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Телефон</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone"
                  value={editableProfile.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={editableProfile.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Адрес доставки</label>
                <textarea 
                  id="address" 
                  name="address"
                  value={editableProfile.address}
                  onChange={handleInputChange}
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Отменить
                </button>
                <button type="submit" className="btn btn-primary">
                  Сохранить
                </button>
              </div>
            </form>
          )}
        </div>
        
        {/* История заказов */}
        <div className="profile-section order-history">
          <div className="section-header">
            <h2>История заказов</h2>
          </div>
          
          {orders.length > 0 ? (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-id">
                      <span>№ {order.id}</span>
                    </div>
                    <div className="order-date">
                      {formatDate(order.date)}
                    </div>
                    <div className={`order-status ${getStatusClass(order.status)}`}>
                      {getStatusText(order.status)}
                    </div>
                  </div>
                  
                  <div className="order-items-list">
                    {order.items.map(item => (
                      <div key={item.id} className="order-item">
                        <div className="item-name">
                          {item.name}
                        </div>
                        <div className="item-details">
                          <span className="item-quantity">{item.quantity} шт.</span>
                          <span className="item-price">{item.price.toLocaleString()} ₽</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="order-footer">
                    <div className="order-total">
                      <span>Итого:</span>
                      <span className="total-amount">{order.totalAmount.toLocaleString()} ₽</span>
                    </div>
                    <div className="order-actions">
                      <button className="btn btn-secondary btn-sm">
                        Повторить заказ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-orders">
              <p>У вас пока нет заказов</p>
              <Link to="/catalog" className="btn btn-primary">
                Перейти в каталог
              </Link>
            </div>
          )}
        </div>
        
        {/* Кнопка выхода */}
        <div className="logout-section">
          <button 
            className="btn btn-danger"
            onClick={logout}
          >
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;