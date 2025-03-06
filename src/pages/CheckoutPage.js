import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import '../styles/CheckoutPage.css';
import { formatImageUrl, handleImageError } from '../utils/imageUtils';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, getTotalPrice } = useCart();
  const { user, isAuthenticated } = useAuth();
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
    if (isAuthenticated && user) {
      setFormData(prevState => ({
        ...prevState,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        email: user.email || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || ''
      }));
    }
  }, [cartItems, navigate, isAuthenticated, user]);

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
    
    // Проверка фамилии
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Введите фамилию';
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
    
    // Если выбрана доставка, проверяем адрес, город и индекс
    if (formData.deliveryMethod === 'delivery') {
      if (!formData.address.trim()) {
        newErrors.address = 'Введите адрес доставки';
      }
      
      if (!formData.city.trim()) {
        newErrors.city = 'Введите город';
      }
      
      if (!formData.postalCode.trim()) {
        newErrors.postalCode = 'Введите почтовый индекс';
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
      // Создаем объект с данными заказа
      const orderData = {
        items: cartItems.map(item => ({
          flowerId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: getTotalPrice(),
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email
        },
        delivery: {
          method: formData.deliveryMethod,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode
        },
        payment: {
          method: formData.paymentMethod
        },
        notes: formData.notes,
        status: 'новый'
      };
      
      // Отправляем заказ на сервер
      // API-запрос создания заказа будет реализован позже
      // const response = await api.post('/orders', orderData);
      
      // Имитация задержки API-запроса
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Очищаем корзину
      clearCart();
      
      // Перенаправляем на страницу успешного оформления заказа
      navigate('/order-success', { 
        state: { 
          orderId: 'ORDER-' + Math.floor(Math.random() * 10000), 
          orderData 
        } 
      });
      
    } catch (error) {
      console.error('Ошибка при оформлении заказа:', error);
      // Обработка ошибок
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
                        />
                        {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                      </div>
                      <div className="form-field">
                        <label htmlFor="lastName">Фамилия*</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={errors.lastName ? 'error' : ''}
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
                          placeholder="+7XXXXXXXXXX"
                          className={errors.phone ? 'error' : ''}
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
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h2>Способ получения</h2>
                  <div className="form-group delivery-options">
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
                        <span className="radio-title">Доставка</span>
                        <span className="radio-description">Доставка курьером по адресу</span>
                      </label>
                      <span className="price">300 ₽</span>
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
                        <span className="radio-title">Самовывоз</span>
                        <span className="radio-description">Из нашего магазина по адресу ул. Цветочная, 1</span>
                      </label>
                      <span className="price">Бесплатно</span>
                    </div>
                  </div>
                </div>

                {formData.deliveryMethod === 'delivery' && (
                  <div className="form-section">
                    <h2>Адрес доставки</h2>
                    <div className="form-group">
                      <div className="form-field">
                        <label htmlFor="address">Адрес*</label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Улица, дом, квартира"
                          className={errors.address ? 'error' : ''}
                        />
                        {errors.address && <span className="error-message">{errors.address}</span>}
                      </div>
                    </div>
                    <div className="form-group">
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
                          />
                          {errors.city && <span className="error-message">{errors.city}</span>}
                        </div>
                        <div className="form-field">
                          <label htmlFor="postalCode">Почтовый индекс*</label>
                          <input
                            type="text"
                            id="postalCode"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleChange}
                            className={errors.postalCode ? 'error' : ''}
                          />
                          {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-section">
                  <h2>Способ оплаты</h2>
                  <div className="form-group payment-options">
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
                        <span className="radio-title">Банковская карта</span>
                        <span className="radio-description">Оплата онлайн банковской картой</span>
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
                        <span className="radio-title">Наличные</span>
                        <span className="radio-description">Оплата наличными при получении</span>
                      </label>
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
                        placeholder="Напишите, если у вас есть особые пожелания к заказу или доставке"
                        rows="3"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="form-buttons">
                  <Link to="/cart" className="btn secondary">Вернуться в корзину</Link>
                  <button type="button" className="btn primary" onClick={nextStep}>Продолжить</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="order-summary">
                <h2>Информация о заказе</h2>
                
                <div className="order-items">
                  <h3>Товары в заказе</h3>
                  {cartItems.map((item) => (
                    <div key={item.id} className="order-item">
                      <div className="order-item-image">
                        <img 
                          src={formatImageUrl(item.image)} 
                          alt={item.name} 
                          onError={handleImageError}
                        />
                      </div>
                      <div className="order-item-details">
                        <h4>{item.name}</h4>
                        <div className="order-item-meta">
                          <span className="order-item-price">{item.price} ₽</span>
                          <span className="order-item-quantity">x {item.quantity}</span>
                          <span className="order-item-total">{item.price * item.quantity} ₽</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="customer-info">
                  <h3>Данные получателя</h3>
                  <p><strong>ФИО:</strong> {formData.firstName} {formData.lastName}</p>
                  <p><strong>Телефон:</strong> {formData.phone}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                </div>
                
                <div className="delivery-info">
                  <h3>Доставка</h3>
                  <p><strong>Способ получения:</strong> {formData.deliveryMethod === 'delivery' ? 'Доставка курьером' : 'Самовывоз'}</p>
                  {formData.deliveryMethod === 'delivery' && (
                    <>
                      <p><strong>Адрес:</strong> {formData.address}</p>
                      <p><strong>Город:</strong> {formData.city}</p>
                      <p><strong>Индекс:</strong> {formData.postalCode}</p>
                    </>
                  )}
                  {formData.deliveryMethod === 'pickup' && (
                    <p><strong>Адрес самовывоза:</strong> ул. Цветочная, 1</p>
                  )}
                </div>
                
                <div className="payment-info">
                  <h3>Оплата</h3>
                  <p><strong>Способ оплаты:</strong> {formData.paymentMethod === 'card' ? 'Банковская карта' : 'Наличные при получении'}</p>
                </div>
                
                {formData.notes && (
                  <div className="notes-info">
                    <h3>Комментарий к заказу</h3>
                    <p>{formData.notes}</p>
                  </div>
                )}
                
                <div className="order-total">
                  <div className="order-total-row">
                    <span>Товары ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})</span>
                    <span>{getTotalPrice()} ₽</span>
                  </div>
                  <div className="order-total-row">
                    <span>Доставка</span>
                    <span>{deliveryPrice} ₽</span>
                  </div>
                  <div className="order-total-row final">
                    <span>Итого</span>
                    <span>{totalPrice} ₽</span>
                  </div>
                </div>
                
                <div className="form-buttons">
                  <button type="button" className="btn secondary" onClick={prevStep}>Назад</button>
                  <button 
                    type="submit" 
                    className="btn primary" 
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
          <div className="checkout-summary-card">
            <h2>Ваш заказ</h2>
            <div className="checkout-summary-items">
              {cartItems.map((item) => (
                <div key={item.id} className="checkout-summary-item">
                  <div className="checkout-item-info">
                    <span className="checkout-item-quantity">{item.quantity} ×</span>
                    <span className="checkout-item-name">{item.name}</span>
                  </div>
                  <span className="checkout-item-price">{item.price * item.quantity} ₽</span>
                </div>
              ))}
            </div>
            <div className="checkout-summary-totals">
              <div className="summary-row">
                <span>Товары ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})</span>
                <span>{getTotalPrice()} ₽</span>
              </div>
              <div className="summary-row">
                <span>Доставка</span>
                <span>{deliveryPrice} ₽</span>
              </div>
              <div className="summary-total">
                <span>Итого</span>
                <span>{totalPrice} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;