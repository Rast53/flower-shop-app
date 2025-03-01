import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { orderApi } from '../services/api';

// Создаем контекст для корзины
const CartContext = createContext();

// Константа для ключа хранения в localStorage
const CART_STORAGE_KEY = 'flower_shop_cart';

// Провайдер контекста корзины
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загружаем корзину из localStorage при инициализации
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (err) {
      console.error('Ошибка при загрузке корзины из localStorage:', err);
    }
  }, []);

  // Сохраняем корзину в localStorage при изменении
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error('Ошибка при сохранении корзины в localStorage:', err);
    }
  }, [cart]);

  // Добавление товара в корзину
  const addToCart = useCallback((item, quantity = 1) => {
    setCart(prevCart => {
      // Проверяем, есть ли уже такой товар в корзине
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Если товар уже есть в корзине, увеличиваем количество
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + quantity
        };
        return updatedCart;
      } else {
        // Если товара нет в корзине, добавляем новый элемент
        return [...prevCart, { ...item, quantity }];
      }
    });
  }, []);

  // Удаление товара из корзины
  const removeFromCart = useCallback((itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  }, []);

  // Изменение количества товара в корзине
  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity <= 0) {
      // Если количество <= 0, удаляем товар из корзины
      removeFromCart(itemId);
      return;
    }
    
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.id === itemId);
      
      if (existingItemIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity
        };
        return updatedCart;
      }
      
      return prevCart;
    });
  }, [removeFromCart]);

  // Очистка корзины
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Отправка заказа
  const checkout = useCallback(async (orderData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Подготавливаем данные заказа
      const items = cart.map(item => ({
        flower_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));
      
      const orderPayload = {
        ...orderData,
        items
      };
      
      // Отправляем заказ на сервер
      const response = await orderApi.create(orderPayload);
      
      // После успешного оформления заказа очищаем корзину
      clearCart();
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при оформлении заказа');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cart, clearCart]);

  // Вычисляем общее количество товаров в корзине
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Вычисляем общую стоимость товаров в корзине
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Значение, которое будет доступно через контекст
  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    checkout,
    loading,
    error,
    totalItems,
    totalPrice,
    isEmpty: cart.length === 0
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Хук для использования контекста корзины
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart должен использоваться внутри CartProvider');
  }
  return context;
};

export default useCart;