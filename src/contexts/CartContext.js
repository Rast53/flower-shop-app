import React, { createContext, useState, useEffect } from 'react';

// Создаем контекст корзины
export const CartContext = createContext();

/**
 * Провайдер контекста корзины
 * Управляет состоянием корзины покупок и предоставляет методы для добавления, 
 * обновления и удаления товаров из корзины
 */
export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // При загрузке компонента пытаемся восстановить состояние корзины из localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Ошибка при чтении корзины из localStorage:', error);
        // В случае ошибки очищаем локальное хранилище
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // При изменении корзины обновляем счетчики и сохраняем в localStorage
  useEffect(() => {
    // Обновляем общее количество товаров в корзине
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);
    setTotalItems(itemCount);

    // Обновляем общую сумму корзины
    const amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalAmount(amount);

    // Сохраняем корзину в localStorage
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  /**
   * Добавляет товар в корзину
   * @param {Object} product - Товар для добавления
   * @param {number} quantity - Количество (по умолчанию 1)
   */
  const addItem = (product, quantity = 1) => {
    setItems(currentItems => {
      // Проверяем, есть ли уже этот товар в корзине
      const existingItemIndex = currentItems.findIndex(item => item.id === product.id);

      if (existingItemIndex >= 0) {
        // Если товар уже есть, увеличиваем его количество
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return updatedItems;
      } else {
        // Если товара нет, добавляем новый
        return [...currentItems, { ...product, quantity }];
      }
    });
  };

  /**
   * Обновляет количество товара в корзине
   * @param {number} productId - ID товара
   * @param {number} quantity - Новое количество
   */
  const updateItemQuantity = (productId, quantity) => {
    // Если количество меньше или равно 0, удаляем товар
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(currentItems => {
      return currentItems.map(item => 
        item.id === productId ? { ...item, quantity } : item
      );
    });
  };

  /**
   * Удаляет товар из корзины
   * @param {number} productId - ID товара для удаления
   */
  const removeItem = (productId) => {
    setItems(currentItems => currentItems.filter(item => item.id !== productId));
  };

  /**
   * Очищает всю корзину
   */
  const clearCart = () => {
    setItems([]);
  };

  const value = {
    items,
    totalItems,
    totalAmount,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}; 