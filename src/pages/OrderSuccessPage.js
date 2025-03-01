import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import '../styles/OrderSuccessPage.css';

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Получаем данные заказа из состояния навигации
  const { orderId, orderData } = location.state || {};
  
  // Если нет данных заказа, перенаправляем на главную страницу
  React.useEffect(() => {
    if (!orderId || !orderData) {
      navigate('/');
    }
  }, [orderId, orderData, navigate]);

  // Если нет данных заказа, показываем сообщение о загрузке
  if (!orderId || !orderData) {
    return <div className="loading">Загрузка...</div>;
  }

  // Форматируем дату заказа
  const formatDate = () => {
    const date = new Date();
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="order-success-page">
      <div className="order-success-content">
        <div className="order-success-header">
          <div className="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M0 0h24v24H0V0z" fill="none"/>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1>Заказ успешно оформлен!</h1>
          <p className="success-message">
            Спасибо за заказ! Мы уже начали его обработку.
          </p>
        </div>

        <div className="order-details-card">
          <div className="order-info">
            <h2>Информация о заказе</h2>
            <div className="order-info-row">
              <span className="label">Номер заказа:</span>
              <span className="value order-id">{orderId}</span>
            </div>
            <div className="order-info-row">
              <span className="label">Дата оформления:</span>
              <span className="value">{formatDate()}</span>
            </div>
            <div className="order-info-row">
              <span className="label">Статус заказа:</span>
              <span className="value status">Новый</span>
            </div>
          </div>

          <div className="order-delivery-info">
            <h3>Информация о доставке</h3>
            <div className="info-box">
              <div className="info-item">
                <span className="label">Способ доставки:</span>
                <span className="value">
                  {orderData.delivery.method === 'delivery' ? 'Доставка курьером' : 'Самовывоз'}
                </span>
              </div>
              
              {orderData.delivery.method === 'delivery' ? (
                <>
                  <div className="info-item">
                    <span className="label">Адрес:</span>
                    <span className="value">{orderData.delivery.address}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Город:</span>
                    <span className="value">{orderData.delivery.city}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Индекс:</span>
                    <span className="value">{orderData.delivery.postalCode}</span>
                  </div>
                </>
              ) : (
                <div className="info-item">
                  <span className="label">Адрес самовывоза:</span>
                  <span className="value">ул. Цветочная, 1</span>
                </div>
              )}
            </div>
          </div>

          <div className="order-payment-info">
            <h3>Способ оплаты</h3>
            <div className="info-box">
              <div className="info-item">
                <span className="value payment-method">
                  {orderData.payment.method === 'card' 
                    ? 'Оплата банковской картой' 
                    : 'Оплата наличными при получении'}
                </span>
              </div>
            </div>
          </div>

          <div className="order-items-summary">
            <h3>Товары в заказе</h3>
            <div className="items-list">
              {orderData.items.map((item, index) => (
                <div className="order-item-row" key={index}>
                  <span className="item-name">
                    {item.name || `Товар #${item.flowerId}`}
                  </span>
                  <div className="item-details">
                    <span className="item-quantity">
                      {item.quantity} шт.
                    </span>
                    <span className="item-price">
                      {item.price} ₽
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="order-total">
              <span className="label">Итого:</span>
              <span className="value">{orderData.totalAmount} ₽</span>
            </div>
          </div>
        </div>

        <div className="whats-next">
          <h2>Что дальше?</h2>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Подтверждение заказа</h4>
                <p>Мы свяжемся с вами для подтверждения заказа в ближайшее время.</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Обработка заказа</h4>
                <p>Наши флористы соберут для вас букет из свежих цветов.</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Доставка</h4>
                <p>Мы доставим ваш заказ точно в срок или вы сможете забрать его из нашего магазина.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="order-actions">
          <Link to="/catalog" className="btn secondary">Вернуться в каталог</Link>
          <Link to="/" className="btn primary">На главную</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;