import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/AdminLoginPage.css';
import api from '../../services/api';

/**
 * Компонент AdminLoginPage - страница входа для администраторов
 */
const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login, user, error: authError, logout } = useAuth();
  
  // Состояние для хранения данных формы
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // Состояние для отображения ошибок
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  
  // Обновляем formError, когда меняется authError
  useEffect(() => {
    if (authError) {
      setFormError(authError);
    }
  }, [authError]);
  
  // Обновляем проверку API
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await api.checkAvailability();
        if (response.status === 200) {
          setApiStatus('available');
        } else {
          setApiStatus('error');
        }
      } catch (error) {
        setApiStatus('unavailable');
      }
    };
    
    checkApiStatus();
  }, []);

  /**
   * Обработчик изменения полей ввода
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Сбрасываем ошибку при редактировании полей
    setFormError('');
  };

  /**
   * Сбрасывает состояние формы и очищает данные авторизации
   */
  const handleReset = () => {
    setFormData({
      email: '',
      password: ''
    });
    setFormError('');
    
    // Очищаем localStorage и перезагружаем страницу
    // для полного сброса состояния авторизации
    localStorage.removeItem('authToken');
    localStorage.removeItem('user_is_admin');
    window.location.reload();
  };

  /**
   * Обработчик отправки формы
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');
    
    // Валидация пустых полей
    if (!formData.email || !formData.password) {
      setFormError('Пожалуйста, заполните все поля');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Отправка запроса на вход администратора...');
      
      // Проверка наличия метода login
      if (!login || typeof login !== 'function') {
        console.error('Ошибка: login не является функцией', login);
        setFormError('Ошибка авторизации. Пожалуйста, обновите страницу и попробуйте снова.');
        return;
      }
      
      // Вызываем метод login, который теперь возвращает boolean
      const success = await login(formData.email, formData.password);
      console.log('Login success:', success);
      
      if (success) {
        console.log('Успешная авторизация, перенаправление на панель администратора');
        navigate('/admin/dashboard');
      } else {
        console.log('Ошибка авторизации');
        setFormError(authError || 'Ошибка авторизации. Проверьте данные или обратитесь к администратору.');
      }
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      setFormError('Ошибка при входе. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h1 className="admin-login-title">Вход для администраторов</h1>
        
        {apiStatus && (
          <div className={`admin-api-status admin-api-status-${apiStatus}`}>
            {apiStatus === 'checking' && '🔄 Проверка доступности API...'}
            {apiStatus === 'available' && '✅ API сервер доступен и работает.'}
            {apiStatus === 'error' && '⚠️ API сервер доступен, но вернул ошибку. Обратитесь к администратору.'}
            {apiStatus === 'unavailable' && (
              <div className="admin-api-status admin-api-status-unavailable">
                ❌ API сервер недоступен. Проверьте:
                <ul>
                  <li>Сертификаты SSL действительны и настроены</li>
                  <li>Бэкенд сервер запущен</li>
                  <li>Настройки CORS корректны</li>
                </ul>
              </div>
            )}
          </div>
        )}
        
        {formError && (
          <div className="admin-login-error">
            {formError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Введите ваш email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Введите ваш пароль"
              required
            />
          </div>
          
          <div className="admin-login-buttons">
            <button 
              type="submit" 
              className="admin-login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
            
            <button 
              type="button" 
              className="admin-reset-button"
              onClick={handleReset}
            >
              Сбросить
            </button>
          </div>
        </form>
        
        <div className="admin-login-footer">
          <Link to="/" className="admin-login-link">Вернуться на главную</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage; 