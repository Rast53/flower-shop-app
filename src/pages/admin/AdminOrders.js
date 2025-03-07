import React, { useEffect, useState } from 'react';
import { useTelegram } from '../../hooks/useTelegram';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/AdminOrders.css';

/**
 * Компонент AdminOrders для Telegram Mini App
 * Управление заказами
 */
const AdminOrders = () => {
  const { tg, hideMainButton } = useTelegram();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState(null);

  // Скрываем основную кнопку Telegram и загружаем данные
  useEffect(() => {
    if (tg) {
      hideMainButton();
    }

    loadOrders();
  }, [tg, hideMainButton]);

  // Функция загрузки заказов из API
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Проверяем токен авторизации
      const token = localStorage.getItem('authToken');
      const isAdminFlag = localStorage.getItem('user_is_admin');
      
      console.log('AdminOrders: Текущий статус авторизации:', { 
        token: token ? 'Присутствует' : 'Отсутствует',
        isAdmin: isAdminFlag
      });
      
      if (!token) {
        console.error('AdminOrders: Токен авторизации отсутствует. Перенаправляем на страницу входа.');
        navigate('/admin/login');
        return;
      }
      
      console.log('AdminOrders: Запрос на получение заказов...');
      const response = await api.get('/orders');
      console.log('AdminOrders: Ответ API:', response);
      
      let ordersData = [];
      
      // Определяем правильную структуру ответа
      if (response.data && Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        ordersData = response.data.data;
      } else if (response.data && response.data.orders && Array.isArray(response.data.orders)) {
        ordersData = response.data.orders;
      }
      
      // Форматируем данные заказов
      const formattedOrders = ordersData.map(order => {
        return {
          id: order.id,
          date: new Date(order.created_at || Date.now()),
          customer: {
            name: order.customer_name || order.user_name || 'Неизвестный клиент',
            phone: order.customer_phone || 'Не указан',
            telegram: order.telegram_user_id ? `@${order.telegram_user_id}` : '',
            email: order.user_email || ''
          },
          items: (order.items || []).map(item => ({
            id: item.id,
            name: item.flower_name || `Товар #${item.flower_id}`,
            price: parseFloat(item.price || item.price_per_unit || 0),
            quantity: item.quantity || 1
          })),
          total: parseFloat(order.total_amount || order.total_price || 0),
          status: order.status || 'pending',
          address: order.shipping_address || order.customer_address || 'Не указан',
          comment: order.notes || '',
          payment_method: order.payment_method || 'Наличные',
          payment_status: order.payment_status || 'pending'
        };
      });
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error('AdminOrders: Ошибка загрузки заказов:', error);
      setError('Не удалось загрузить заказы. Проверьте подключение к интернету.');
      
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
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setLoading(true);
      console.log(`AdminOrders: Изменение статуса заказа ${orderId} на ${newStatus}`);
      
      // Отправляем запрос на изменение статуса
      const response = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      console.log('AdminOrders: Ответ API:', response);
      
      // Обновляем состояние локально
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      // Если изменен статус выбранного заказа, обновляем и его
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      
      // Показываем уведомление об успешном обновлении
      alert(`Статус заказа успешно изменен на "${getStatusText(newStatus)}"`);
    } catch (error) {
      console.error('AdminOrders: Ошибка при изменении статуса заказа:', error);
      alert('Не удалось изменить статус заказа. Пожалуйста, попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  // Получение списка статусов для выпадающего списка
  const getStatusOptions = () => {
    return [
      { value: 'new', label: 'Новый' },
      { value: 'processing', label: 'В обработке' },
      { value: 'shipped', label: 'В пути' },
      { value: 'delivered', label: 'Доставлен' },
      { value: 'cancelled', label: 'Отменен' },
    ];
  };

  // Получение текстового описания статуса
  const getStatusText = (status) => {
    switch (status) {
      case 'new': return 'Новый';
      case 'processing': return 'В обработке';
      case 'shipped': return 'В пути';
      case 'delivered': return 'Доставлен';
      case 'cancelled': return 'Отменен';
      // Обратная совместимость со старыми статусами
      case 'pending': return 'Ожидает';
      case 'confirmed': return 'Подтвержден';
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
      (order.customer.phone && order.customer.phone.includes(searchTerm)) ||
      (order.customer.telegram && order.customer.telegram.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customer.email && order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
              placeholder="Поиск по номеру, имени, телефону..."
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
      
      {error && (
        <div className="admin-error-message">
          <span className="material-icons">error</span>
          <p>{error}</p>
          <button 
            className="btn btn-secondary" 
            onClick={loadOrders}
          >
            Повторить загрузку
          </button>
        </div>
      )}
      
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
                      {order.customer.telegram && (
                        <span className="customer-telegram">{order.customer.telegram}</span>
                      )}
                    </div>
                  </td>
                  <td>{order.total.toLocaleString()} ₽</td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => openOrderDetails(order)}
                    >
                      <span className="material-icons">visibility</span>
                      Детали
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-results">
                  <span className="material-icons">search_off</span>
                  <p>Заказы не найдены</p>
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
              <div className="order-info">
                <div className="info-group">
                  <span className="label">Дата и время:</span>
                  <span className="value">{formatDate(selectedOrder.date)}</span>
                </div>
                
                <div className="info-group">
                  <span className="label">Статус:</span>
                  <select
                    className={`status-select status-${selectedOrder.status}`}
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
                
                {selectedOrder.payment_method && (
                  <div className="info-group">
                    <span className="label">Метод оплаты:</span>
                    <span className="value">{selectedOrder.payment_method}</span>
                  </div>
                )}
                
                {selectedOrder.payment_status && (
                  <div className="info-group">
                    <span className="label">Статус оплаты:</span>
                    <span className="value">
                      {selectedOrder.payment_status === 'paid' ? 'Оплачен' : 
                       selectedOrder.payment_status === 'pending' ? 'Ожидает оплаты' : 
                       selectedOrder.payment_status === 'failed' ? 'Ошибка оплаты' : 
                       selectedOrder.payment_status === 'refunded' ? 'Возвращен' : 
                       selectedOrder.payment_status}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="customer-details">
                <h3>Информация о клиенте</h3>
                <div className="info-group">
                  <span className="label">Имя:</span>
                  <span className="value">{selectedOrder.customer.name}</span>
                </div>
                <div className="info-group">
                  <span className="label">Телефон:</span>
                  <span className="value">{selectedOrder.customer.phone}</span>
                </div>
                {selectedOrder.customer.telegram && (
                  <div className="info-group">
                    <span className="label">Telegram:</span>
                    <span className="value">{selectedOrder.customer.telegram}</span>
                  </div>
                )}
                {selectedOrder.customer.email && (
                  <div className="info-group">
                    <span className="label">Email:</span>
                    <span className="value">{selectedOrder.customer.email}</span>
                  </div>
                )}
                <div className="info-group">
                  <span className="label">Адрес доставки:</span>
                  <span className="value">{selectedOrder.address}</span>
                </div>
                {selectedOrder.comment && (
                  <div className="info-group">
                    <span className="label">Комментарий:</span>
                    <span className="value">{selectedOrder.comment}</span>
                  </div>
                )}
              </div>
              
              <div className="order-items">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders; 