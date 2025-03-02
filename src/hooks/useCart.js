import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';

// Хук для использования контекста корзины
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart должен использоваться внутри CartProvider');
  }
  return context;
};

// Реэкспортируем CartProvider
export { CartProvider } from '../contexts/CartContext';

export default useCart;