import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTelegram } from '../../hooks/useTelegram';
import api from '../../services/api';
import '../../styles/FlowerForm.css';
import { formatImageUrl, handleImageError } from '../../utils/imageUtils';

/**
 * Компонент формы для добавления/редактирования цветка
 */
const FlowerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tg } = useTelegram();
  const isEditing = !!id;
  
  const [flower, setFlower] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    image_url: '',
    category_id: '',
    is_available: true
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    // Устанавливаем заголовок в Telegram
    if (tg) {
      tg.setHeaderColor('#FFFFFF');
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate('/admin/flowers'));
      
      return () => {
        tg.BackButton.hide();
        tg.BackButton.offClick();
      };
    }
    
    // Загружаем категории
    loadCategories();
    
    // Если редактируем существующий цветок, загружаем его данные
    if (isEditing) {
      loadFlower();
    }
  }, [isEditing, id, tg, navigate]);

  // Загрузка категорий
  const loadCategories = async () => {
    try {
      const response = await api.categories.getAll();
      if (response.data && response.data.data) {
        const cats = Array.isArray(response.data.data)
        ? response.data.data
        : response.data.data.categories;
        setCategories(cats || []);
        }
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  // Загрузка данных цветка для редактирования
  const loadFlower = async () => {
    try {
      setLoading(true);
      const response = await api.flowers.getById(id);
      
      if (response.data && response.data.data && response.data.data.flower) {
        const flowerData = response.data.data.flower;
        setFlower({
          name: flowerData.name || '',
          description: flowerData.description || '',
          price: flowerData.price || '',
          stock_quantity: flowerData.stock_quantity || '',
          image_url: flowerData.image_url || '',
          category_id: flowerData.category_id || '',
          is_available: flowerData.is_available !== undefined ? flowerData.is_available : true
        });
        
        if (flowerData.image_url) {
          setImagePreview(flowerData.image_url);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки данных цветка:', error);
      setLoading(false);
      navigate('/admin/flowers');
    }
  };

  // Обработка изменения полей формы
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFlower({
      ...flower,
      [name]: newValue
    });
    
    // Очищаем ошибку для этого поля
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Обработка изменения изображения
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFlower({
          ...flower,
          imageFile: file
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Валидация формы
  const validateForm = () => {
    const newErrors = {};
    
    if (!flower.name.trim()) {
      newErrors.name = 'Название обязательно';
    }
    
    if (!flower.price) {
      newErrors.price = 'Цена обязательна';
    } else if (isNaN(parseFloat(flower.price)) || parseFloat(flower.price) <= 0) {
      newErrors.price = 'Цена должна быть положительным числом';
    }
    
    if (!flower.category_id) {
      newErrors.category_id = 'Выберите категорию';
    }
    
    if (flower.stock_quantity && (isNaN(parseInt(flower.stock_quantity)) || parseInt(flower.stock_quantity) < 0)) {
      newErrors.stock_quantity = 'Количество должно быть положительным числом';
    }
    
    if (!flower.image_url && !flower.imageFile && !isEditing) {
      newErrors.image_url = 'Изображение обязательно';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Проверка наличия токена перед отправкой запроса
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Ошибка авторизации. Пожалуйста, войдите снова.');
        navigate('/admin/login');
        return;
      }
      
      // Подготовка данных формы
      const formData = new FormData();
      formData.append('name', flower.name);
      formData.append('description', flower.description);
      formData.append('price', flower.price);
      formData.append('stock_quantity', flower.stock_quantity);
      formData.append('category_id', flower.category_id);
      formData.append('is_available', flower.is_available);
      
      if (flower.imageFile) {
        formData.append('image', flower.imageFile);
      } else if (flower.image_url) {
        formData.append('image_url', flower.image_url);
      }
      
      let response;
      
      if (isEditing) {
        response = await api.flowers.update(id, formData);
      } else {
        response = await api.flowers.create(formData);
      }
      
      if (response.data) {
        navigate('/admin/flowers');
      }
    } catch (error) {
      console.error('Ошибка при сохранении цветка:', error);
      
      // Обработка ошибок авторизации
      if (error.response && error.response.status === 401) {
        alert('Ошибка авторизации. Пожалуйста, войдите снова.');
        localStorage.removeItem('authToken');
        navigate('/admin/login');
        return;
      }
      
      // Отображение ошибок от сервера
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert('Произошла ошибка при сохранении цветка. Пожалуйста, попробуйте еще раз.');
      }
      
      setSubmitting(false);
    }
  };

  // Отмена и возврат к списку
  const handleCancel = () => {
    navigate('/admin/flowers');
  };

  if (loading) {
    return (
      <div className="form-loading">
        <div className="loader"></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="flower-form-container">
      <div className="form-header">
        <h1>{isEditing ? 'Редактирование цветка' : 'Добавление нового цветка'}</h1>
      </div>
      
      <form className="flower-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Название*</label>
          <input
            type="text"
            id="name"
            name="name"
            value={flower.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="category_id">Категория*</label>
          <select
            id="category_id"
            name="category_id"
            value={flower.category_id}
            onChange={handleChange}
            className={errors.category_id ? 'error' : ''}
          >
            <option value="">Выберите категорию</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category_id && <div className="error-message">{errors.category_id}</div>}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Цена (₽)*</label>
            <input
              type="number"
              id="price"
              name="price"
              value={flower.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={errors.price ? 'error' : ''}
            />
            {errors.price && <div className="error-message">{errors.price}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="stock_quantity">Количество в наличии</label>
            <input
              type="number"
              id="stock_quantity"
              name="stock_quantity"
              value={flower.stock_quantity}
              onChange={handleChange}
              min="0"
              className={errors.stock_quantity ? 'error' : ''}
            />
            {errors.stock_quantity && <div className="error-message">{errors.stock_quantity}</div>}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            name="description"
            value={flower.description}
            onChange={handleChange}
            rows="4"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_available"
              checked={flower.is_available}
              onChange={handleChange}
            />
            <span>В наличии</span>
          </label>
        </div>
        
        <div className="form-group">
          <label>Изображение {!isEditing && '*'}</label>
          <div className="image-upload-container">
            <div className="image-preview">
              {imagePreview && (
                <img 
                  src={imagePreview} 
                  alt="Предпросмотр" 
                  onError={handleImageError}
                />
              )}
            </div>
            <div className="upload-controls">
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className={errors.image_url ? 'error' : ''}
              />
              <p className="upload-hint">Рекомендуемый размер: 800x600 пикселей</p>
              {errors.image_url && <div className="error-message">{errors.image_url}</div>}
            </div>
          </div>
        </div>
        
        <div className="form-group image-url-input">
          <label htmlFor="image_url">Или укажите URL изображения</label>
          <input
            type="text"
            id="image_url"
            name="image_url"
            value={flower.image_url}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={submitting}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner"></span>
                <span>Сохранение...</span>
              </>
            ) : (
              isEditing ? 'Сохранить изменения' : 'Добавить цветок'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlowerForm; 