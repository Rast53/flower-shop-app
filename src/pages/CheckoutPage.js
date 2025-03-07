import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { orderApi } from '../services/api';
import '../styles/CheckoutPage.css';
import { formatImageUrl, handleImageError } from '../utils/imageUtils';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, getTotalPrice } = useCart();
  const { currentUser, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    deliveryMethod: 'delivery',
    paymentMethod: 'card',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Если корзина пуста, перенаправляем на страницу корзины
    if (cartItems.length === 0) {
      navigate('/cart');
    }

    // Если пользователь авторизован, заполняем форму его данными
    if (isAuthenticated && currentUser) {
      console.log('Заполнение формы данными пользователя:', currentUser);
      setFormData(prevState => ({
        ...prevState,
        firstName: currentUser.first_name || '',
        lastName: currentUser.last_name || '',
        phone: currentUser.phone || '',
        email: currentUser.email || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        postalCode: currentUser.postal_code || ''
      }));
    }
  }, [cartItems, navigate, isAuthenticated, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    // Проверка имени
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Введите имя';
    }
    
    // Проверка телефона
    if (!formData.phone.trim()) {
      newErrors.phone = 'Введите номер телефона';
    } else if (!/^\+?[0-9]{10,12}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Введите корректный номер телефона';
    }
    
    // Проверка email
    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Введите корректный email';
    }
    
    // Если выбрана доставка, проверяем адрес и город
    if (formData.deliveryMethod === 'delivery') {
      if (!formData.address.trim()) {
        newErrors.address = 'Введите адрес доставки';
      }
      
      if (!formData.city.trim()) {
        newErrors.city = 'Введите город';
      }
    }
    
    return newErrors;
  };

  const nextStep = () => {
    const newErrors = validate();
    
    if (Object.keys(newErrors).length === 0) {
      setStep(2);
    } else {
      setErrors(newErrors);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const sendNotifications = async (order) => {
    // Здесь можно добавить логику отправки уведомлений администратору
    // Это можно реализовать через webhook Telegram, email или другие каналы

    // Для примера, просто логируем информацию о заказе
    console.log('Отправка уведомления администратору о новом заказе:', order);
    
    // В реальном проекте здесь может быть:
    // - Отправка запроса на Telegram Bot API
    // - Отправка email через API почтового сервиса
    // - Отправка SMS и т.д.
    
    // Имитация отправки уведомления
    try {
      // Можно реализовать webhook на сервере для отправки уведомлений
      // await fetch('https://your-notification-service.com/webhook', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     type: 'new_order',
      //     order_id: order.id,
      //     customer_name: `${formData.firstName} ${formData.lastName}`,
      //     customer_phone: formData.phone,
      //     total_amount: getTotalPrice() + deliveryPrice
      //   })
      // });
      console.log('Уведомление успешно отправлено');
    } catch (error) {
      console.error('Ошибка при отправке уведомления:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStep(1);
      return;
    }
    
    setLoading(true);
    
    try {
      // Формируем данные заказа в соответствии с API сервера
      const orderData = {
        // Информация о пользователе
        user_id: currentUser?.id, // Если пользователь авторизован
        contact_name: `${formData.firstName} ${formData.lastName}`.trim(),
        contact_phone: formData.phone,
        
        // Адрес доставки
        shipping_address: formData.deliveryMethod === 'delivery' 
          ? `${formData.city}, ${formData.postalCode}, ${formData.address}` 
          : 'Самовывоз',
        
        // Товары в заказе
        items: cartItems.map(item => ({
          flower_id: item.id,
          quantity: item.quantity
        })),
        
        // Дополнительная информация
        notes: formData.notes,
        payment_method: formData.paymentMethod
      };
      
      console.log('Отправка данных заказа на сервер:', orderData);
      
      // Отправляем заказ на сервер
      const response = await orderApi.create(orderData);
      console.log('Ответ сервера:', response.data);
      
      // Получаем ID созданного заказа
      const createdOrderId = response.data?.data?.id || response.data?.id || 'ORDER-' + Math.floor(Math.random() * 10000);
      
      // Отправляем уведомления о новом заказе
      await sendNotifications({
        id: createdOrderId,
        ...orderData
      });
      
      // Очищаем корзину
      clearCart();
      
      // Перенаправляем на страницу успешного оформления заказа
      navigate('/order-success', { 
        state: { 
          orderId: createdOrderId, 
          orderData 
        } 
      });
      
    } catch (error) {
      console.error('Ошибка при оформлении заказа:', error);
      alert('Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const deliveryPrice = formData.deliveryMethod === 'delivery' ? 300 : 0;
  const totalPrice = getTotalPrice() + deliveryPrice;

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>Оформление заказа</h1>
        <div className="checkout-steps">
          <div className={`checkout-step ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span className="step-title">Контактная информация</span>
          </div>
          <div className="step-divider"></div>
          <div className={`checkout-step ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <span className="step-title">Подтверждение заказа</span>
          </div>
        </div>
      </div>

      <div className="checkout-content">
        <div className="checkout-form-container">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="checkout-form">
                <div className="form-section">
                  <h2>Контактная информация</h2>
                  <div className="form-group">
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="firstName">Имя*</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={errors.firstName ? 'error' : ''}
                          placeholder="Введите ваше имя"
                        />
                        {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                      </div>
                      <div className="form-field">
                        <label htmlFor="lastName">Фамилия</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={errors.lastName ? 'error' : ''}
                          placeholder="Введите вашу фамилию"
                        />
                        {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="phone">Телефон*</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={errors.phone ? 'error' : ''}
                          placeholder="+7 (___) ___-__-__"
                        />
                        {errors.phone && <span className="error-message">{errors.phone}</span>}
                      </div>
                      <div className="form-field">
                        <label htmlFor="email">Email*</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={errors.email ? 'error' : ''}
                          placeholder="example@email.com"
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h2>Способ доставки</h2>
                  <div className="form-group">
                    <div className="radio-group">
                      <div className="radio-option">
                        <input
                          type="radio"
                          id="delivery"
                          name="deliveryMethod"
                          value="delivery"
                          checked={formData.deliveryMethod === 'delivery'}
                          onChange={handleChange}
                        />
                        <label htmlFor="delivery">
                          <span className="radio-title">Доставка курьером</span>
                          <span className="radio-price">300 ₽</span>
                        </label>
                      </div>
                      <div className="radio-option">
                        <input
                          type="radio"
                          id="pickup"
                          name="deliveryMethod"
                          value="pickup"
                          checked={formData.deliveryMethod === 'pickup'}
                          onChange={handleChange}
                        />
                        <label htmlFor="pickup">
                          <span className="radio-title">Самовывоз из магазина</span>
                          <span className="radio-price">Бесплатно</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {formData.deliveryMethod === 'delivery' && (
                    <div className="form-group">
                      <div className="form-field">
                        <label htmlFor="address">Адрес доставки*</label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className={errors.address ? 'error' : ''}
                          placeholder="Улица, дом, квартира"
                        />
                        {errors.address && <span className="error-message">{errors.address}</span>}
                      </div>
                      <div className="form-row">
                        <div className="form-field">
                          <label htmlFor="city">Город*</label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className={errors.city ? 'error' : ''}
                            placeholder="Город"
                          />
                          {errors.city && <span className="error-message">{errors.city}</span>}
                        </div>
                        <div className="form-field">
                          <label htmlFor="postalCode">Почтовый индекс</label>
                          <input
                            type="text"
                            id="postalCode"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleChange}
                            className={errors.postalCode ? 'error' : ''}
                            placeholder="Индекс"
                          />
                          {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-section">
                  <h2>Способ оплаты</h2>
                  <div className="form-group">
                    <div className="radio-group">
                      <div className="radio-option">
                        <input
                          type="radio"
                          id="card"
                          name="paymentMethod"
                          value="card"
                          checked={formData.paymentMethod === 'card'}
                          onChange={handleChange}
                        />
                        <label htmlFor="card">
                          <span className="radio-title">Оплата картой онлайн</span>
                        </label>
                      </div>
                      <div className="radio-option">
                        <input
                          type="radio"
                          id="cash"
                          name="paymentMethod"
                          value="cash"
                          checked={formData.paymentMethod === 'cash'}
                          onChange={handleChange}
                        />
                        <label htmlFor="cash">
                          <span className="radio-title">Оплата при получении</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h2>Комментарий к заказу</h2>
                  <div className="form-group">
                    <div className="form-field">
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Дополнительная информация к заказу..."
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <Link to="/cart" className="btn btn-secondary">Вернуться в корзину</Link>
                  <button type="button" className="btn btn-primary" onClick={nextStep}>Продолжить</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="order-summary">
                <div className="form-section">
                  <h2>Информация о заказе</h2>
                  <div className="customer-info">
                    <div className="info-row">
                      <span className="info-label">Имя:</span>
                      <span className="info-value">{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Телефон:</span>
                      <span className="info-value">{formData.phone}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{formData.email}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Способ доставки:</span>
                      <span className="info-value">
                        {formData.deliveryMethod === 'delivery' ? 'Доставка курьером' : 'Самовывоз'}
                      </span>
                    </div>
                    {formData.deliveryMethod === 'delivery' && (
                      <div className="info-row">
                        <span className="info-label">Адрес:</span>
                        <span className="info-value">
                          {formData.city}, {formData.address} {formData.postalCode ? `, ${formData.postalCode}` : ''}
                        </span>
                      </div>
                    )}
                    <div className="info-row">
                      <span className="info-label">Способ оплаты:</span>
                      <span className="info-value">
                        {formData.paymentMethod === 'card' ? 'Оплата картой онлайн' : 'Оплата при получении'}
                      </span>
                    </div>
                    {formData.notes && (
                      <div className="info-row">
                        <span className="info-label">Комментарий:</span>
                        <span className="info-value">{formData.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-section">
                  <h2>Товары в заказе</h2>
                  <div className="cart-items">
                    {cartItems.map(item => (
                      <div key={item.id} className="cart-item">
                        <div className="item-image">
                          <img 
                            src={formatImageUrl(item.image_url)} 
                            alt={item.name}
                            onError={handleImageError}
                          />
                        </div>
                        <div className="item-info">
                          <h3 className="item-name">{item.name}</h3>
                          <div className="item-details">
                            <span className="item-quantity">{item.quantity} шт.</span>
                            <span className="item-price">{(item.price * item.quantity).toLocaleString()} ₽</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-totals">
                  <div className="total-row">
                    <span>Стоимость товаров:</span>
                    <span>{getTotalPrice().toLocaleString()} ₽</span>
                  </div>
                  <div className="total-row">
                    <span>Доставка:</span>
                    <span>{deliveryPrice.toLocaleString()} ₽</span>
                  </div>
                  <div className="total-row grand-total">
                    <span>Итого к оплате:</span>
                    <span>{totalPrice.toLocaleString()} ₽</span>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={prevStep}>Назад</button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Оформление...' : 'Оформить заказ'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="checkout-sidebar">
          <div className="order-summary-box">
            <h2>Ваш заказ</h2>
            <div className="cart-summary">
              <div className="cart-items-count">
                {cartItems.length} {cartItems.length === 1 ? 'товар' : 
                  cartItems.length >= 2 && cartItems.length <= 4 ? 'товара' : 'товаров'}
              </div>
              <ul className="cart-items-list">
                {cartItems.map(item => (
                  <li key={item.id} className="cart-item-minimal">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity-price">
                      {item.quantity} шт. × {item.price.toLocaleString()} ₽
                    </span>
                  </li>
                ))}
              </ul>
              <div className="cart-subtotal">
                <span>Товары:</span>
                <span>{getTotalPrice().toLocaleString()} ₽</span>
              </div>
              <div className="cart-delivery">
                <span>Доставка:</span>
                <span>{deliveryPrice.toLocaleString()} ₽</span>
              </div>
              <div className="cart-total">
                <span>Итого:</span>
                <span>{totalPrice.toLocaleString()} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;