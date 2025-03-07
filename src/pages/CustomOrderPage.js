import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { categoryApi, flowerApi } from '../services/api';
import '../styles/CustomOrderPage.css';
import PageLoader from '../components/PageLoader';
import { formatImageUrl, handleImageError } from '../utils/imageUtils';

/**
 * Компонент страницы для создания индивидуального заказа букета
 * Позволяет пользователю указать свои предпочтения и заказать букет по своим параметрам.
 */
const CustomOrderPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Состояния для формы
  const [formData, setFormData] = useState({
    occasion: '',
    budget: '',
    flowerTypes: [],
    colors: [],
    style: '',
    size: 'medium',
    additionalInfo: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    deliveryAddress: ''
  });
  
  // Состояния для данных
  const [flowerTypes, setFlowerTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Опции для форм
  const occasionOptions = [
    { value: 'birthday', label: 'День рождения' },
    { value: 'anniversary', label: 'Годовщина' },
    { value: 'wedding', label: 'Свадьба' },
    { value: 'celebration', label: 'Торжество' },
    { value: 'sympathy', label: 'Сочувствие' },
    { value: 'romance', label: 'Романтический подарок' },
    { value: 'other', label: 'Другое' }
  ];
  
  const budgetOptions = [
    { value: 'economy', label: 'Эконом (до 2000 ₽)' },
    { value: 'standard', label: 'Стандарт (2000-5000 ₽)' },
    { value: 'premium', label: 'Премиум (5000-10000 ₽)' },
    { value: 'luxury', label: 'Люкс (более 10000 ₽)' }
  ];
  
  const colorOptions = [
    { value: 'red', label: 'Красный', color: '#e53935' },
    { value: 'pink', label: 'Розовый', color: '#e84393' },
    { value: 'purple', label: 'Фиолетовый', color: '#9c27b0' },
    { value: 'blue', label: 'Синий', color: '#1e88e5' },
    { value: 'yellow', label: 'Желтый', color: '#fdd835' },
    { value: 'orange', label: 'Оранжевый', color: '#ff9800' },
    { value: 'white', label: 'Белый', color: '#f5f5f5' },
    { value: 'mixed', label: 'Разноцветный', color: 'linear-gradient(to right, red, orange, yellow, green, blue, purple)' }
  ];
  
  const styleOptions = [
    { value: 'classic', label: 'Классический' },
    { value: 'modern', label: 'Современный' },
    { value: 'rustic', label: 'Рустик' },
    { value: 'minimalist', label: 'Минималистичный' },
    { value: 'exotic', label: 'Экзотический' },
    { value: 'vintage', label: 'Винтажный' }
  ];
  
  const sizeOptions = [
    { value: 'small', label: 'Маленький' },
    { value: 'medium', label: 'Средний' },
    { value: 'large', label: 'Большой' },
    { value: 'extra_large', label: 'Очень большой' }
  ];
  
  // Загрузка данных при монтировании компонента
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Получаем категории и типы цветов
        const [categoriesRes, flowersRes] = await Promise.all([
          categoryApi.getAll().catch(err => ({ data: { data: { categories: [] } } })),
          flowerApi.getAll().catch(err => ({ data: { data: [] } }))
        ]);
        
        const categoriesData = categoriesRes.data?.data?.categories;
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        
        const flowersData = flowersRes.data?.data;
        setFlowerTypes(Array.isArray(flowersData) ? flowersData : []);
        
        // Если пользователь авторизован, предзаполняем контактные данные
        if (isAuthenticated && user) {
          setFormData(prev => ({
            ...prev,
            contactName: user.name || '',
            contactPhone: user.phone || '',
            contactEmail: user.email || '',
            deliveryAddress: user.address || ''
          }));
        }
        
        setError(null);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [isAuthenticated, user]);
  
  // Обработчики формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e, category) => {
    const { name, checked } = e.target;
    
    setFormData(prev => {
      if (checked) {
        return { ...prev, [category]: [...prev[category], name] };
      } else {
        return { ...prev, [category]: prev[category].filter(item => item !== name) };
      }
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Здесь будет логика отправки данных на сервер
      // Для примера просто имитируем задержку
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Успешная отправка
      setSuccessMessage('Спасибо за ваш заказ! Наш флорист свяжется с вами в ближайшее время для уточнения деталей.');
      
      // Редирект на страницу успешного заказа через 3 секунды
      setTimeout(() => {
        navigate('/order-success', { 
          state: { 
            isCustom: true,
            orderData: {
              ...formData,
              created_at: new Date().toISOString()
            }
          } 
        });
      }, 3000);
      
    } catch (error) {
      console.error('Ошибка при отправке формы:', error);
      setError('Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <PageLoader message="Загружаем варианты оформления..." />;
  }
  
  return (
    <div className="custom-order-page">
      <div className="page-header">
        <h1>Создайте свой идеальный букет</h1>
        <p className="subtitle">
          Укажите ваши предпочтения, и наши флористы создадут уникальный букет специально для вас
        </p>
      </div>
      
      {successMessage ? (
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Заказ принят!</h2>
          <p>{successMessage}</p>
          <div className="loader-small"></div>
          <p className="redirect-message">Переходим на страницу подтверждения заказа...</p>
        </div>
      ) : (
        <form className="custom-order-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message form-error">
              {error}
            </div>
          )}
          
          <div className="form-section">
            <h2>Информация о букете</h2>
            
            <div className="form-group">
              <label htmlFor="occasion">Повод</label>
              <select 
                id="occasion" 
                name="occasion" 
                value={formData.occasion} 
                onChange={handleInputChange}
                required
              >
                <option value="">Выберите повод</option>
                {occasionOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="budget">Бюджет</label>
              <select 
                id="budget" 
                name="budget" 
                value={formData.budget} 
                onChange={handleInputChange}
                required
              >
                <option value="">Выберите бюджет</option>
                {budgetOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Предпочитаемые цвета</label>
              <div className="color-options">
                {colorOptions.map(color => (
                  <div key={color.value} className="color-option">
                    <input 
                      type="checkbox" 
                      id={`color-${color.value}`} 
                      name={color.value}
                      checked={formData.colors.includes(color.value)}
                      onChange={e => handleCheckboxChange(e, 'colors')}
                    />
                    <label htmlFor={`color-${color.value}`}>
                      <span className="color-swatch" style={{
                        background: color.color,
                        border: color.value === 'white' ? '1px solid #ddd' : 'none'
                      }}></span>
                      {color.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label>Предпочитаемые типы цветов</label>
              <div className="flower-types-grid">
                {flowerTypes.slice(0, 12).map(flower => (
                  <div key={flower.id} className="flower-type-option">
                    <input 
                      type="checkbox" 
                      id={`flower-${flower.id}`} 
                      name={flower.id.toString()}
                      checked={formData.flowerTypes.includes(flower.id.toString())}
                      onChange={e => handleCheckboxChange(e, 'flowerTypes')}
                    />
                    <label htmlFor={`flower-${flower.id}`}>
                      <div className="flower-thumbnail">
                        <img 
                          src={formatImageUrl(flower.image_url)} 
                          alt={flower.name} 
                          onError={handleImageError}
                        />
                      </div>
                      <span>{flower.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="style">Стиль оформления</label>
              <select 
                id="style" 
                name="style" 
                value={formData.style} 
                onChange={handleInputChange}
              >
                <option value="">Выберите стиль</option>
                {styleOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="size">Размер букета</label>
              <div className="size-options">
                {sizeOptions.map(option => (
                  <div key={option.value} className="size-option">
                    <input 
                      type="radio" 
                      id={`size-${option.value}`} 
                      name="size"
                      value={option.value}
                      checked={formData.size === option.value}
                      onChange={handleInputChange}
                    />
                    <label htmlFor={`size-${option.value}`}>
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="additionalInfo">Дополнительная информация</label>
              <textarea 
                id="additionalInfo" 
                name="additionalInfo" 
                value={formData.additionalInfo} 
                onChange={handleInputChange}
                placeholder="Опишите любые дополнительные пожелания или требования"
                rows={4}
              />
            </div>
          </div>
          
          <div className="form-section">
            <h2>Контактная информация</h2>
            
            <div className="form-group">
              <label htmlFor="contactName">Имя</label>
              <input 
                type="text" 
                id="contactName" 
                name="contactName" 
                value={formData.contactName} 
                onChange={handleInputChange}
                required
                placeholder="Введите ваше имя"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="contactPhone">Телефон</label>
              <input 
                type="tel" 
                id="contactPhone" 
                name="contactPhone" 
                value={formData.contactPhone} 
                onChange={handleInputChange}
                required
                placeholder="+7 (___) ___-__-__"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="contactEmail">Email</label>
              <input 
                type="email" 
                id="contactEmail" 
                name="contactEmail" 
                value={formData.contactEmail} 
                onChange={handleInputChange}
                placeholder="email@example.com"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="deliveryAddress">Адрес доставки</label>
              <textarea 
                id="deliveryAddress" 
                name="deliveryAddress" 
                value={formData.deliveryAddress} 
                onChange={handleInputChange}
                required
                placeholder="Укажите полный адрес доставки"
                rows={2}
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary submit-btn" 
              disabled={submitting}
            >
              {submitting ? 'Отправка...' : 'Отправить заказ'}
            </button>
            
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Отмена
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CustomOrderPage; 