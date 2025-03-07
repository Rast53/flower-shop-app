import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../services/api';
import '../styles/ProfilePage.css';

/**
 * Компонент ProfilePage - страница профиля пользователя
 */
const ProfilePage = () => {
  const { user: tgUser, tg } = useTelegram();
  const { isAuthenticated, logout, currentUser } = useAuth();
  
  // Состояние для хранения данных профиля
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    telegram_id: ''
  });
  
  // Состояние для отображения истории заказов
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Состояние для редактирования профиля
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState({ ...profile });
  
  // Загружаем данные профиля и историю заказов при монтировании компонента
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Получаем актуальные данные профиля из API
        try {
          // Импортируем authApi на случай, если он не был передан через пропсы
          const { authApi } = await import('../services/api');
          
          const profileResponse = await authApi.getProfile();
          console.log('Полученные данные профиля:', profileResponse.data);
          
          if (profileResponse.data && (profileResponse.data.user || profileResponse.data.data?.user)) {
            const userData = profileResponse.data.user || profileResponse.data.data.user;
            
            setProfile({
              name: userData.getName ? userData.getName() : 
                    (userData.first_name || userData.last_name) ? 
                    `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : 
                    userData.username || userData.email || 'Пользователь',
              phone: userData.phone || '',
              email: userData.email || '',
              address: userData.address || '',
              telegram_id: userData.telegram_id || tgUser?.id || ''
            });
          } else if (currentUser) {
            // Запасной вариант - используем данные из контекста Auth
            setProfile({
              name: currentUser.first_name && currentUser.last_name ? 
                    `${currentUser.first_name} ${currentUser.last_name}`.trim() : 
                    currentUser.username || currentUser.email || 'Пользователь',
              phone: currentUser.phone || '',
              email: currentUser.email || '',
              address: currentUser.address || '',
              telegram_id: currentUser.telegram_id || tgUser?.id || ''
            });
          }
        } catch (profileError) {
          console.error('Ошибка при получении профиля:', profileError);
          // Используем данные из контекста Auth как запасной вариант
          if (currentUser) {
            setProfile({
              name: currentUser.first_name && currentUser.last_name ? 
                    `${currentUser.first_name} ${currentUser.last_name}`.trim() : 
                    currentUser.username || currentUser.email || 'Пользователь',
              phone: currentUser.phone || '',
              email: currentUser.email || '',
              address: currentUser.address || '',
              telegram_id: currentUser.telegram_id || tgUser?.id || ''
            });
          }
        }
        
        // Получаем историю заказов пользователя
        try {
          const userId = currentUser?.id;
          if (userId) {
            // Используем userApi вместо прямого fetch запроса
            const { userApi } = await import('../services/api');
            const ordersResponse = await userApi.getUserOrders(userId);
            console.log('Полученные данные заказов:', ordersResponse.data);
            
            const ordersData = ordersResponse.data;
            
            if (ordersData.data && ordersData.data.orders) {
              // Форматируем заказы для отображения
              const formattedOrders = ordersData.data.orders.map(order => ({
                id: order.id,
                date: order.created_at,
                status: order.status || getStatusFromId(order.status_id),
                totalAmount: order.total_amount || 0,
                items: order.items ? order.items.map(item => ({
                  id: item.id,
                  name: item.flower ? item.flower.name : 'Товар',
                  quantity: item.quantity,
                  price: item.unit_price || item.price || 0
                })) : []
              }));
              
              setOrders(formattedOrders);
            }
          }
        } catch (orderError) {
          console.error('Ошибка при загрузке заказов:', orderError);
          // Если не удалось загрузить заказы, показываем пустой список
          setOrders([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке данных профиля:', error);
        setLoading(false);
        
        // Показываем сообщение об ошибке пользователю
        alert('Не удалось загрузить профиль. Пожалуйста, обновите страницу и попробуйте снова.');
      }
    };
    
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, currentUser, tgUser]);
  
  // Получение текста статуса по ID
  const getStatusFromId = (statusId) => {
    const statusMap = {
      1: 'new',
      2: 'processing',
      3: 'shipped',
      4: 'delivered',
      5: 'cancelled'
    };
    
    return statusMap[statusId] || 'pending';
  };
  
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
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    try {
      const updatedData = {
        first_name: editableProfile.name.split(' ')[0] || '',
        last_name: editableProfile.name.split(' ').slice(1).join(' ') || '',
        phone: editableProfile.phone,
        email: editableProfile.email,
        address: editableProfile.address
      };
      
      // Импортируем authApi динамически
      const { authApi } = await import('../services/api');
      
      // Отправляем данные на сервер
      const response = await authApi.updateProfile(updatedData);
      console.log('Ответ сервера при обновлении профиля:', response.data);
      
      // Обновляем локальные данные
      setProfile({ ...editableProfile });
      setIsEditing(false);
      
      // Уведомляем пользователя
      alert('Изменения сохранены!');
    } catch (error) {
      console.error('Ошибка при сохранении профиля:', error);
      
      // Показываем подробности ошибки, если они есть
      if (error.response && error.response.data && error.response.data.error) {
        alert(`Ошибка при сохранении профиля: ${error.response.data.error}`);
      } else {
        alert('Ошибка при сохранении профиля. Пожалуйста, попробуйте еще раз.');
      }
    }
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
      case 'new':
      case 'pending':
        return 'В обработке';
      case 'confirmed':
      case 'processing':
        return 'Подтвержден';
      case 'shipped':
        return 'Отправлен';
      case 'delivered':
        return 'Доставлен';
      case 'canceled':
      case 'cancelled':
        return 'Отменен';
      default:
        return 'Неизвестно';
    }
  };
  
  // Получение класса статуса для стилизации
  const getStatusClass = (status) => {
    switch (status) {
      case 'new':
      case 'pending':
        return 'status-pending';
      case 'confirmed':
      case 'processing':
        return 'status-confirmed';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'canceled':
      case 'cancelled':
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
                <span className="profile-value">{profile.phone || 'Не указан'}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Email:</span>
                <span className="profile-value">{profile.email || 'Не указан'}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Адрес доставки:</span>
                <span className="profile-value">{profile.address || 'Не указан'}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Telegram ID:</span>
                <span className="profile-value">{profile.telegram_id || tgUser?.id || 'Не указан'}</span>
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
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
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