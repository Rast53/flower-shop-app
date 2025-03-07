import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/AdminUsers.css';

// Проверка, находимся ли мы в среде Telegram
const isTelegram = window.Telegram && window.Telegram.WebApp;

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Скрываем основную кнопку Telegram при монтировании
    if (isTelegram) {
      window.Telegram.WebApp.MainButton.hide();
    }

    loadUsers();
  }, []);

  // Загрузка пользователей из API
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Проверяем токен авторизации
      const token = localStorage.getItem('authToken');
      const isAdminFlag = localStorage.getItem('user_is_admin');
      
      console.log('AdminUsers: Текущий статус авторизации:', { 
        token: token ? 'Присутствует' : 'Отсутствует',
        isAdmin: isAdminFlag
      });
      
      if (!token) {
        console.error('AdminUsers: Токен авторизации отсутствует. Перенаправляем на страницу входа.');
        navigate('/admin/login');
        return;
      }
      
      console.log('AdminUsers: Запрос на получение пользователей...');
      const response = await api.users.getAll();
      console.log('AdminUsers: Ответ API:', response);
      
      // Определяем правильную структуру ответа
      let usersData = null;
      
      if (response.data && response.data.data && response.data.data.users) {
        console.log('AdminUsers: Формат пользователей - вложенные объекты');
        usersData = response.data.data.users;
      } else if (response.data && Array.isArray(response.data.data)) {
        console.log('AdminUsers: Формат пользователей - массив в data');
        usersData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        console.log('AdminUsers: Формат пользователей - прямой массив');
        usersData = response.data;
      } else if (response.data && response.data.users && Array.isArray(response.data.users)) {
        console.log('AdminUsers: Формат пользователей - объект с users');
        usersData = response.data.users;
      }
      
      if (usersData && Array.isArray(usersData)) {
        console.log('AdminUsers: Получены пользователи:', usersData.length);
        
        // Обогащение данных пользователей дополнительной информацией
        const enrichedUsers = await Promise.all(
          usersData.map(async (user) => {
            try {
              // Запрашиваем информацию о заказах пользователя для подсчета статистики
              const ordersResponse = await api.users.getUserOrders(user.id, { count_only: true });
              
              // Попытка извлечь количество заказов и общую сумму
              let ordersCount = 0;
              let totalSpent = 0;
              
              if (ordersResponse.data && ordersResponse.data.data) {
                if (ordersResponse.data.data.pagination) {
                  ordersCount = ordersResponse.data.data.pagination.totalItems || 0;
                }
                if (ordersResponse.data.data.totalSpent) {
                  totalSpent = ordersResponse.data.data.totalSpent;
                }
              }
              
              // Формируем обогащенные данные пользователя
              return {
                ...user,
                ordersCount: user.ordersCount || ordersCount,
                totalSpent: user.totalSpent || totalSpent
              };
            } catch (error) {
              console.error(`AdminUsers: Ошибка при получении данных заказов для пользователя ${user.id}:`, error);
              return {
                ...user,
                ordersCount: user.ordersCount || 0,
                totalSpent: user.totalSpent || 0
              };
            }
          })
        );
        
        setUsers(enrichedUsers);
      } else {
        console.warn('AdminUsers: Неверный формат данных пользователей:', response.data);
        setError('Не удалось загрузить пользователей. Неверный формат данных.');
      }
    } catch (error) {
      console.error('AdminUsers: Ошибка загрузки пользователей:', error);
      setError('Не удалось загрузить пользователей. Проверьте подключение к интернету.');
      
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

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  // Функция для обработки поиска
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Отфильтрованные пользователи на основе поискового запроса
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.phone.includes(searchTerm)
    );
  });

  // Функция для открытия модального окна с подробностями пользователя
  const openUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  // Функция для закрытия модального окна
  const closeUserDetails = () => {
    setShowUserDetails(false);
    setSelectedUser(null);
  };

  // Функция для изменения статуса пользователя
  const changeUserStatus = async (userId, newStatus) => {
    try {
      setLoading(true);
      console.log(`AdminUsers: Изменение статуса пользователя ${userId} на ${newStatus}`);
      
      const response = await api.users.updateStatus(userId, newStatus);
      console.log('AdminUsers: Ответ API:', response);
      
      // Обновляем локальные данные пользователя
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, status: newStatus });
      }
      
      // Показываем уведомление об успешном обновлении
      alert(`Статус пользователя успешно изменен на "${getUserStatusText(newStatus)}"`);
    } catch (error) {
      console.error('AdminUsers: Ошибка при изменении статуса пользователя:', error);
      alert('Не удалось изменить статус пользователя. Пожалуйста, попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  // Получение класса для статуса пользователя
  const getUserStatusClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'blocked': return 'status-blocked';
      default: return '';
    }
  };

  // Получение текста для статуса пользователя
  const getUserStatusText = (status) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'inactive': return 'Неактивен';
      case 'blocked': return 'Заблокирован';
      default: return status;
    }
  };

  // Функция для форматирования суммы
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="admin-users">
      <div className="admin-header">
        <h1>Управление пользователями</h1>
        
        <div className="filters">
          <div className="search-box">
            <span className="material-icons">search</span>
            <input
              type="text"
              placeholder="Поиск пользователей..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="admin-error-message">
          <span className="material-icons">error</span>
          <p>{error}</p>
          <button 
            className="btn btn-secondary" 
            onClick={loadUsers}
          >
            Повторить загрузку
          </button>
        </div>
      )}

      {loading ? (
        <div className="admin-loading-container">
          <div className="admin-loader"></div>
          <p>Загрузка пользователей...</p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Контакты</th>
                <th>Роль</th>
                <th>Заказы</th>
                <th>Регистрация</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <span className="user-name">{user.name}</span>
                        <span className="user-username">@{user.username}</span>
                      </div>
                    </td>
                    <td>
                      <div className="user-contacts">
                        <div>{user.email}</div>
                        <div className="user-phone">{user.phone}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                        {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                      </span>
                    </td>
                    <td>
                      <div className="user-orders">
                        <div>{user.ordersCount} заказов</div>
                        <div className="user-spent">{formatCurrency(user.totalSpent)}</div>
                      </div>
                    </td>
                    <td>{formatDate(user.registrationDate)}</td>
                    <td>
                      <span className={`status-badge ${getUserStatusClass(user.status)}`}>
                        {getUserStatusText(user.status)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => openUserDetails(user)}
                          title="Просмотр деталей"
                        >
                          <span className="material-icons">visibility</span>
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            className="action-btn edit-status-btn"
                            onClick={() => changeUserStatus(
                              user.id,
                              user.status === 'active' ? 'blocked' : 'active'
                            )}
                            title={user.status === 'active' ? 'Заблокировать' : 'Активировать'}
                          >
                            <span className="material-icons">
                              {user.status === 'active' ? 'block' : 'check_circle'}
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-results">
                    <span className="material-icons">search_off</span>
                    <h3>Пользователи не найдены</h3>
                    <p>Попробуйте изменить параметры поиска</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showUserDetails && selectedUser && (
        <div className="user-details-modal">
          <div className="modal-overlay" onClick={closeUserDetails}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Информация о пользователе</h2>
              <button className="close-btn" onClick={closeUserDetails}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="user-details-section">
                <h3>Личные данные</h3>
                <div className="info-grid">
                  <div className="info-row">
                    <span className="info-label">Имя</span>
                    <span className="info-value">{selectedUser.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Имя пользователя</span>
                    <span className="info-value">@{selectedUser.username}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email</span>
                    <span className="info-value">{selectedUser.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Телефон</span>
                    <span className="info-value">{selectedUser.phone}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Дата регистрации</span>
                    <span className="info-value">{formatDate(selectedUser.registrationDate)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Последняя активность</span>
                    <span className="info-value">{formatDate(selectedUser.lastActive)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Роль</span>
                    <span className="info-value">
                      <span className={`role-badge ${selectedUser.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                        {selectedUser.role === 'admin' ? 'Администратор' : 'Пользователь'}
                      </span>
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Статус</span>
                    <span className="info-value">
                      <div className="status-select">
                        {selectedUser.role === 'admin' ? (
                          <span className={`status-badge ${getUserStatusClass(selectedUser.status)}`}>
                            {getUserStatusText(selectedUser.status)}
                          </span>
                        ) : (
                          <select
                            value={selectedUser.status}
                            onChange={(e) => changeUserStatus(selectedUser.id, e.target.value)}
                          >
                            <option value="active">Активен</option>
                            <option value="inactive">Неактивен</option>
                            <option value="blocked">Заблокирован</option>
                          </select>
                        )}
                      </div>
                    </span>
                  </div>
                </div>
              </div>

              <div className="user-stats-section">
                <h3>Статистика</h3>
                <div className="info-grid">
                  <div className="info-row">
                    <span className="info-label">Всего заказов</span>
                    <span className="info-value">{selectedUser.ordersCount}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Общая сумма покупок</span>
                    <span className="info-value">{formatCurrency(selectedUser.totalSpent)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => navigate(`/admin/orders?user=${selectedUser.id}`)}>
                Просмотреть заказы пользователя
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers; 