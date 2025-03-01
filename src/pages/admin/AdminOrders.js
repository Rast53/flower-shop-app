import React, { useEffect, useState } from 'react';
import { useTelegram } from '../../hooks/useTelegram';
import '../../styles/AdminOrders.css';

/**
 * Компонент AdminOrders для Telegram Mini App
 * Управление заказами
 */
const AdminOrders = () => {
  const { tg, hideMainButton } = useTelegram();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Скрываем основную кнопку Telegram и загружаем данные
  useEffect(() => {
    if (tg) {
      hideMainButton();
    }

    // Имитация загрузки данных
    const loadOrders = setTimeout(() => {
      setOrders([
        {
          id: 1089,
          date: new Date('2025-02-28T14:30:00'),
          customer: {
            name: 'Иван Иванов',
            phone: '+7 (999) 123-45-67',
            telegram: '@ivanov',
          },
          items: [
            { id: 1, name: 'Букет "Весеннее настроение"', price: 3200, quantity: 1 },
            { id: 3, name: 'Букет роз "Классика"', price: 4500, quantity: 1 },
          ],
          total: 7700,
          status: 'pending',
          address: 'г. Москва, ул. Цветочная, д. 7, кв. 42',
          comment: 'Позвонить за час до доставки',
        },
        {
          id: 1088,
          date: new Date('2025-02-27T11:20:00'),
          customer: {
            name: 'Елена Петрова',
            phone: '+7 (999) 987-65-43',
            telegram: '@elena',
          },
          items: [
            { id: 2, name: 'Композиция "Нежность"', price: 2800, quantity: 1 },
          ],
          total: 2800,
          status: 'confirmed',
          address: 'г. Москва, ул. Ленина, д. 15, кв. 7',
          comment: '',
        },
        {
          id: 1087,
          date: new Date('2025-02-26T16:45:00'),
          customer: {
            name: 'Александр Смирнов',
            phone: '+7 (999) 456-78-90',
            telegram: '@alex',
          },
          items: [
            { id: 4, name: 'Букет "Солнечный день"', price: 3000, quantity: 2 },
          ],
          total: 6000,
          status: 'delivered',
          address: 'г. Москва, пр. Мира, д. 101, кв. 27',
          comment: 'Вручить лично',
        },
        {
          id: 1086,
          date: new Date('2025-02-25T09:15:00'),
          customer: {
            name: 'Мария Соколова',
            phone: '+7 (999) 111-22-33',
            telegram: '@maria',
          },
          items: [
            { id: 5, name: 'Корзина "Лето"', price: 5200, quantity: 1 },
            { id: 2, name: 'Композиция "Нежность"', price: 2800, quantity: 1 },
          ],
          total: 8000,
          status: 'canceled',
          address: 'г. Москва, ул. Садовая, д. 22, кв. 15',
          comment: 'Клиент отменил заказ',
        },
      ]);
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(loadOrders);
  }, [tg, hideMainButton]);

  // Обработка изменения поискового запроса
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Обработка изменения фильтра статуса
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Открытие деталей заказа
  const openOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  // Закрытие деталей заказа
  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  // Обработка изменения статуса заказа
  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    
    // Если изменен статус выбранного заказа, обновляем и его
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  // Получение списка статусов для выпадающего списка
  const getStatusOptions = () => {
    return [
      { value: 'pending', label: 'Ожидает' },
      { value: 'confirmed', label: 'Подтвержден' },
      { value: 'shipped', label: 'В пути' },
      { value: 'delivered', label: 'Доставлен' },
      { value: 'canceled', label: 'Отменен' },
    ];
  };

  // Получение текстового описания статуса
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'confirmed': return 'Подтвержден';
      case 'shipped': return 'В пути';
      case 'delivered': return 'Доставлен';
      case 'canceled': return 'Отменен';
      default: return 'Не определен';
    }
  };

  // Форматирование даты
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Фильтрация заказов по поисковому запросу и статусу
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.phone.includes(searchTerm) ||
      (order.customer.telegram && order.customer.telegram.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Если данные загружаются, показываем индикатор загрузки
  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loader"></div>
        <p>Загрузка заказов...</p>
      </div>
    );
  }

  return (
    <div className="admin-orders">
      <div className="admin-header">
        <h1>Управление заказами</h1>
        <div className="filters">
          <div className="search-box">
            <span className="material-icons">search</span>
            <input
              type="text"
              placeholder="Поиск по номеру заказа, имени или телефону..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <select 
            className="status-filter" 
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="all">Все статусы</option>
            {getStatusOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Таблица заказов */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>№ заказа</th>
              <th>Дата</th>
              <th>Клиент</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{formatDate(order.date)}</td>
                  <td>
                    <div className="customer-info">
                      <span className="customer-name">{order.customer.name}</span>
                      <span className="customer-phone">{order.customer.phone}</span>
                    </div>
                  </td>
                  <td>{order.total.toLocaleString()} ₽</td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn view-btn" 
                        title="Просмотреть заказ"
                        onClick={() => openOrderDetails(order)}
                      >
                        <span className="material-icons">visibility</span>
                      </button>
                      <button 
                        className="action-btn edit-status-btn" 
                        title="Изменить статус"
                      >
                        <span className="material-icons">edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-results">
                  <span className="material-icons">assignment</span>
                  <p>Заказы не найдены. Попробуйте изменить параметры поиска.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Модальное окно с деталями заказа */}
      {selectedOrder && (
        <div className="order-details-modal">
          <div className="modal-overlay" onClick={closeOrderDetails}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Заказ #{selectedOrder.id}</h2>
              <button className="close-btn" onClick={closeOrderDetails}>
                <span className="material-icons">close</span>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-info-section">
                <h3>Информация о заказе</h3>
                <div className="info-grid">
                  <div className="info-row">
                    <span className="info-label">Дата заказа:</span>
                    <span className="info-value">{formatDate(selectedOrder.date)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Статус:</span>
                    <div className="status-select">
                      <select 
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                      >
                        {getStatusOptions().map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Сумма заказа:</span>
                    <span className="info-value">{selectedOrder.total.toLocaleString()} ₽</span>
                  </div>
                </div>
              </div>
              
              <div className="customer-info-section">
                <h3>Информация о клиенте</h3>
                <div className="info-grid">
                  <div className="info-row">
                    <span className="info-label">ФИО:</span>
                    <span className="info-value">{selectedOrder.customer.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Телефон:</span>
                    <span className="info-value">{selectedOrder.customer.phone}</span>
                  </div>
                  {selectedOrder.customer.telegram && (
                    <div className="info-row">
                      <span className="info-label">Telegram:</span>
                      <span className="info-value">{selectedOrder.customer.telegram}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">Адрес доставки:</span>
                    <span className="info-value">{selectedOrder.address}</span>
                  </div>
                  {selectedOrder.comment && (
                    <div className="info-row">
                      <span className="info-label">Комментарий:</span>
                      <span className="info-value">{selectedOrder.comment}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="order-items-section">
                <h3>Состав заказа</h3>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Наименование</th>
                      <th>Цена</th>
                      <th>Кол-во</th>
                      <th>Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.price.toLocaleString()} ₽</td>
                        <td>{item.quantity}</td>
                        <td>{(item.price * item.quantity).toLocaleString()} ₽</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="total-label">Итого:</td>
                      <td className="total-value">{selectedOrder.total.toLocaleString()} ₽</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={closeOrderDetails}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders; 