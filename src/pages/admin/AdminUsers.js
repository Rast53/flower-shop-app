import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    // Скрываем основную кнопку Telegram при монтировании
    if (isTelegram) {
      window.Telegram.WebApp.MainButton.hide();
    }

    // Симуляция загрузки данных пользователей
    const loadUsers = setTimeout(() => {
      const mockUsers = [
        { 
          id: 1, 
          username: 'Elena_M', 
          name: 'Елена Михайлова', 
          phone: '+7 (910) 555-1234', 
          email: 'elena@example.com', 
          registrationDate: '2023-04-15', 
          lastActive: '2023-06-25',
          role: 'user',
          ordersCount: 8,
          totalSpent: 12350,
          status: 'active'
        },
        { 
          id: 2, 
          username: 'Alex_P', 
          name: 'Александр Петров', 
          phone: '+7 (925) 444-5678', 
          email: 'alex@example.com', 
          registrationDate: '2023-03-10', 
          lastActive: '2023-06-24',
          role: 'user',
          ordersCount: 5,
          totalSpent: 8720,
          status: 'active'
        },
        { 
          id: 3, 
          username: 'admin', 
          name: 'Администратор', 
          phone: '+7 (999) 999-9999', 
          email: 'admin@flowerapp.ru', 
          registrationDate: '2023-01-01', 
          lastActive: '2023-06-26',
          role: 'admin',
          ordersCount: 0,
          totalSpent: 0,
          status: 'active'
        },
        { 
          id: 4, 
          username: 'Maria_K', 
          name: 'Мария Кузнецова', 
          phone: '+7 (916) 333-8765', 
          email: 'maria@example.com', 
          registrationDate: '2023-05-02', 
          lastActive: '2023-06-10',
          role: 'user',
          ordersCount: 2,
          totalSpent: 3450,
          status: 'inactive'
        },
        { 
          id: 5, 
          username: 'Ivan_S', 
          name: 'Иван Смирнов', 
          phone: '+7 (903) 222-1122', 
          email: 'ivan@example.com', 
          registrationDate: '2023-02-18', 
          lastActive: '2023-06-22',
          role: 'user',
          ordersCount: 12,
          totalSpent: 24680,
          status: 'active'
        },
        { 
          id: 6, 
          username: 'Anna_V', 
          name: 'Анна Волкова', 
          phone: '+7 (905) 777-3344', 
          email: 'anna@example.com', 
          registrationDate: '2023-04-05', 
          lastActive: '2023-06-15',
          role: 'user',
          ordersCount: 4,
          totalSpent: 6890,
          status: 'active'
        },
        { 
          id: 7, 
          username: 'Dmitry_K', 
          name: 'Дмитрий Козлов', 
          phone: '+7 (926) 888-9900', 
          email: 'dmitry@example.com', 
          registrationDate: '2023-03-22', 
          lastActive: '2023-05-30',
          role: 'user',
          ordersCount: 1,
          totalSpent: 1500,
          status: 'blocked'
        }
      ];
      
      setUsers(mockUsers);
      setLoading(false);
    }, 1500);

    return () => {
      clearTimeout(loadUsers);
    };
  }, []);

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
  const changeUserStatus = (userId, newStatus) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
    
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, status: newStatus });
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