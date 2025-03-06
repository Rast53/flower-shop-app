import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useTelegram } from '../hooks/useTelegram';
import { formatImageUrl, handleImageError } from '../utils/imageUtils';
import '../styles/CartPage.css';

/**
 * Компонент CartPage - страница корзины с отображением товаров и оформлением заказа
 */
const CartPage = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, totalItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, tg } = useTelegram();
  
  // Состояние для хранения данных заказа
  const [orderData, setOrderData] = useState({
    name: user?.first_name || '',
    phone: '',
    email: '',
    address: '',
    comment: '',
    deliveryMethod: 'delivery',
    paymentMethod: 'card',
  });
  
  // Состояние для отображения формы заказа
  const [isCheckout, setIsCheckout] = useState(false);
  
  // Обработчик изменения количества товара
  const handleQuantityChange = (productId, quantity) => {
    if (quantity >= 1 && quantity <= 99) {
      updateQuantity(productId, quantity);
    }
  };
  
  // Обработчик удаления товара из корзины
  const handleRemoveItem = (productId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар из корзины?')) {
      removeFromCart(productId);
    }
  };
  
  // Обработчик изменения полей формы заказа
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Обработчик отправки заказа
  const handleSubmitOrder = (e) => {
    e.preventDefault();
    
    // Здесь будет логика отправки заказа на сервер
    console.log('Данные заказа:', {
      customer: orderData,
      items: cart,
      totalPrice: totalPrice
    });
    
    // Отправляем данные в Telegram WebApp
    if (tg && tg.initDataUnsafe?.user) {
      tg.sendData(JSON.stringify({
        type: 'order',
        payload: {
          customer: orderData,
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          totalPrice: totalPrice
        }
      }));
    }
    
    // Очищаем корзину и перенаправляем на страницу успешного заказа
    clearCart();
    navigate('/order-success');
  };
  
  // Переключение на форму заказа
  const proceedToCheckout = () => {
    window.scrollTo(0, 0);
    setIsCheckout(true);
  };
  
  // Если корзина пуста и не в режиме оформления заказа, показываем сообщение
  if (cart.length === 0 && !isCheckout) {
    return (
      <div className="empty-cart">
        <h2>Ваша корзина пуста</h2>
        <p>Добавьте товары из каталога, чтобы оформить заказ</p>
        <Link to="/catalog" className="btn btn-primary">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="page-title">
        {isCheckout ? 'Оформление заказа' : 'Корзина'}
      </h1>
      
      {!isCheckout ? (
        // Отображение товаров в корзине
        <>
          <div className="cart-header">
            <div className="cart-column product-info">Товар</div>
            <div className="cart-column product-price">Цена</div>
            <div className="cart-column product-quantity">Количество</div>
            <div className="cart-column product-total">Итого</div>
            <div className="cart-column product-remove"></div>
          </div>
          
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="product-info">
                  <div className="product-image">
                    <img 
                      src={formatImageUrl(item.image_url)} 
                      alt={item.name}
                      onError={handleImageError}
                    />
                  </div>
                  <div className="product-details">
                    <Link to={`/product/${item.id}`} className="product-name">
                      {item.name}
                    </Link>
                    {item.parameters && item.parameters.color && (
                      <span className="product-color">
                        Цвет: {item.parameters.color}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="product-price">
                  {item.price.toLocaleString()} ₽
                </div>
                
                <div className="product-quantity">
                  <div className="quantity-control">
                    <button 
                      className="quantity-btn decrement"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <input 
                      type="number" 
                      min="1" 
                      max="99"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                    />
                    <button 
                      className="quantity-btn increment"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={item.quantity >= 99}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="product-total">
                  {(item.price * item.quantity).toLocaleString()} ₽
                </div>
                
                <div className="product-remove">
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemoveItem(item.id)}
                    title="Удалить товар"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-footer">
            <div className="cart-actions">
              <Link to="/catalog" className="btn btn-secondary">
                Продолжить покупки
              </Link>
              <button 
                className="btn btn-danger"
                onClick={() => {
                  if (window.confirm('Вы уверены, что хотите очистить корзину?')) {
                    clearCart();
                  }
                }}
              >
                Очистить корзину
              </button>
            </div>
            
            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>Товаров в корзине:</span>
                <span>{totalItems} шт.</span>
              </div>
              
              <div className="cart-summary-row total">
                <span>Итого:</span>
                <span className="cart-total-price">{totalPrice.toLocaleString()} ₽</span>
              </div>
              
              <button 
                className="btn btn-primary checkout-btn"
                onClick={proceedToCheckout}
              >
                Оформить заказ
              </button>
            </div>
          </div>
        </>
      ) : (
        // Форма оформления заказа
        <div className="checkout-container">
          <div className="checkout-form-container">
            <form onSubmit={handleSubmitOrder} className="checkout-form">
              <div className="form-section">
                <h3>Контактные данные</h3>
                
                <div className="form-group">
                  <label htmlFor="name">Имя*</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name"
                    value={orderData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Телефон*</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone"
                    value={orderData.phone}
                    onChange={handleInputChange}
                    placeholder="+7 (___) ___-__-__"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    value={orderData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-section">
                <h3>Доставка</h3>
                
                <div className="form-group radio-group">
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="delivery" 
                      name="deliveryMethod"
                      value="delivery"
                      checked={orderData.deliveryMethod === 'delivery'}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="delivery">Доставка</label>
                  </div>
                  
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="pickup" 
                      name="deliveryMethod"
                      value="pickup"
                      checked={orderData.deliveryMethod === 'pickup'}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="pickup">Самовывоз</label>
                  </div>
                </div>
                
                {orderData.deliveryMethod === 'delivery' && (
                  <div className="form-group">
                    <label htmlFor="address">Адрес доставки*</label>
                    <textarea 
                      id="address" 
                      name="address"
                      value={orderData.address}
                      onChange={handleInputChange}
                      placeholder="Укажите полный адрес доставки"
                      required
                    ></textarea>
                  </div>
                )}
              </div>
              
              <div className="form-section">
                <h3>Способ оплаты</h3>
                
                <div className="form-group radio-group">
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="card" 
                      name="paymentMethod"
                      value="card"
                      checked={orderData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="card">Картой онлайн</label>
                  </div>
                  
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="cash" 
                      name="paymentMethod"
                      value="cash"
                      checked={orderData.paymentMethod === 'cash'}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="cash">Наличными при получении</label>
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h3>Комментарий к заказу</h3>
                
                <div className="form-group">
                  <textarea 
                    id="comment" 
                    name="comment"
                    value={orderData.comment}
                    onChange={handleInputChange}
                    placeholder="Если у вас есть особые пожелания к заказу, напишите их здесь"
                  ></textarea>
                </div>
              </div>
              
              <div className="checkout-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setIsCheckout(false)}
                >
                  Вернуться в корзину
                </button>
                <button type="submit" className="btn btn-primary">
                  Подтвердить заказ
                </button>
              </div>
            </form>
          </div>
          
          <div className="order-summary">
            <h3>Ваш заказ</h3>
            
            <div className="order-items">
              {cart.map(item => (
                <div key={item.id} className="order-item">
                  <div className="order-item-name">
                    {item.name} × {item.quantity}
                  </div>
                  <div className="order-item-price">
                    {(item.price * item.quantity).toLocaleString()} ₽
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-total">
              <span>Итого:</span>
              <span>{totalPrice.toLocaleString()} ₽</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;