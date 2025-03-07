import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import { useAuth } from '../hooks/useAuth';
import '../styles/OrderSuccessPage.css';

/**
 * Компонент OrderSuccessPage - страница успешного оформления заказа
 */
const OrderSuccessPage = () => {
  const { tg } = useTelegram();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Получаем данные о заказе из состояния навигации
  const { orderId, orderData } = location.state || {};
  
  // При монтировании компонента обновляем UI Telegram Mini App
  useEffect(() => {
    if (tg) {
      // Показываем кнопку "Закрыть" в Telegram
      tg.MainButton.hide();
      tg.BackButton.hide();
      
      // Отправляем событие о завершении заказа
      tg.sendData(JSON.stringify({
        type: 'order_completed',
        payload: {
          success: true,
          order_id: orderId,
          timestamp: new Date().toISOString()
        }
      }));
    }
  }, [tg, orderId]);
  
  // Форматирование даты
  const formatDate = () => {
    return new Date().toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="order-success-page">
      <div className="success-container">
        <div className="success-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
              stroke="#28a745" 
              strokeWidth="2" 
              fill="#e6f7ee"
            />
            <path 
              d="M8 12L11 15L16 9" 
              stroke="#28a745" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        <h1>Заказ успешно оформлен!</h1>
        
        <p className="success-message">
          Спасибо за ваш заказ! {isAuthenticated ? 
            'Вы можете отслеживать статус заказа в личном кабинете.' : 
            'Мы отправили информацию о заказе на указанный email.'}
        </p>
        <p className="contact-info">
          В ближайшее время с вами свяжется наш менеджер для подтверждения деталей.
        </p>
        
        <div className="order-details">
          <p>Номер заказа: <strong>#{orderId || Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</strong></p>
          <p>Дата и время: <strong>{formatDate()}</strong></p>
          
          {orderData && (
            <>
              <p>Способ доставки: <strong>{orderData.shipping_address === 'Самовывоз' ? 'Самовывоз' : 'Доставка'}</strong></p>
              <p>Способ оплаты: <strong>{orderData.payment_method === 'card' ? 'Оплата картой' : 'Оплата при получении'}</strong></p>
              {orderData.contact_name && (
                <p>Получатель: <strong>{orderData.contact_name}</strong></p>
              )}
            </>
          )}
        </div>
        
        <div className="success-actions">
          {isAuthenticated ? (
            <div className="buttons-row">
              <Link to="/profile" className="btn btn-secondary">
                Перейти в личный кабинет
              </Link>
              <Link to="/" className="btn btn-primary">
                Вернуться на главную
              </Link>
            </div>
          ) : (
            <div className="buttons-row">
              <Link to="/login" className="btn btn-secondary">
                Войти в аккаунт
              </Link>
              <Link to="/" className="btn btn-primary">
                Вернуться на главную
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;