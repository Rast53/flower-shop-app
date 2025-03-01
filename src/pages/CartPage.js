import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import '../styles/CartPage.css';

const CartPage = () => {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    totalItems, 
    totalPrice, 
    isEmpty 
  } = useCart();
  
  const navigate = useNavigate();

  // Обработчик перехода к оформлению заказа
  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Пустая корзина
  if (isEmpty) {
    return (
      <div className="cart-page">
        <div className="cart-header">
          <h1>Корзина</h1>
        </div>
        <div className="empty-cart">
          <div className="empty-cart-icon">
            <span className="material-icons">shopping_cart</span>
          </div>
          <h2>Ваша корзина пуста</h2>
          <p>Добавьте товары в корзину, чтобы продолжить покупки.</p>
          <Link to="/catalog" className="btn btn-primary">
            Перейти в каталог
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Корзина</h1>
        <div className="cart-summary-info">
          <span>{totalItems} {totalItems === 1 ? 'товар' : totalItems < 5 ? 'товара' : 'товаров'}</span>
        </div>
      </div>
      
      <div className="cart-content">
        <div className="cart-items">
          <div className="cart-items-header">
            <div className="cart-item-product">Товар</div>
            <div className="cart-item-price">Цена</div>
            <div className="cart-item-quantity">Количество</div>
            <div className="cart-item-total">Сумма</div>
            <div className="cart-item-actions"></div>
          </div>
          
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-product">
                <div className="cart-item-image">
                  <img src={item.image_url || '/images/flower-placeholder.jpg'} alt={item.name} />
                </div>
                <div className="cart-item-details">
                  <h3>
                    <Link to={`/product/${item.id}`}>{item.name}</Link>
                  </h3>
                </div>
              </div>
              
              <div className="cart-item-price">
                {item.price} ₽
              </div>
              
              <div className="cart-item-quantity">
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn decrement" 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    min="1" 
                    value={item.quantity} 
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value > 0) {
                        updateQuantity(item.id, value);
                      }
                    }}
                    className="quantity-input"
                  />
                  <button 
                    className="quantity-btn increment" 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="cart-item-total">
                {(item.price * item.quantity).toFixed(2)} ₽
              </div>
              
              <div className="cart-item-actions">
                <button 
                  className="remove-item-btn"
                  onClick={() => removeFromCart(item.id)}
                  title="Удалить товар"
                >
                  <span className="material-icons">delete</span>
                </button>
              </div>
            </div>
          ))}
          
          <div className="cart-actions">
            <button className="btn btn-outline" onClick={clearCart}>
              Очистить корзину
            </button>
            <Link to="/catalog" className="btn btn-secondary">
              Продолжить покупки
            </Link>
          </div>
        </div>
        
        <div className="cart-summary">
          <div className="cart-summary-card">
            <h2>Итого</h2>
            
            <div className="summary-row">
              <span>Товары ({totalItems}):</span>
              <span>{totalPrice.toFixed(2)} ₽</span>
            </div>
            
            <div className="summary-row">
              <span>Доставка:</span>
              <span>Бесплатно</span>
            </div>
            
            <div className="summary-total">
              <span>Итого:</span>
              <span>{totalPrice.toFixed(2)} ₽</span>
            </div>
            
            <button 
              className="btn btn-primary checkout-btn"
              onClick={handleCheckout}
            >
              Оформить заказ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;