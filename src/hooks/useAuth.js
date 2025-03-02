import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// Хук для использования контекста аутентификации
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

// Реэкспортируем AuthProvider
export { AuthProvider } from '../contexts/AuthContext';

export default useAuth;