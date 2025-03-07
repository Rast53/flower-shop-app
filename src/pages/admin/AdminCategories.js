import React, { useEffect, useState } from 'react';
import { useTelegram } from '../../hooks/useTelegram';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/AdminCategories.css';

/**
 * Компонент AdminCategories для Telegram Mini App
 * Управление категориями цветов
 */
const AdminCategories = () => {
  const { tg, hideMainButton } = useTelegram();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Скрываем основную кнопку Telegram и загружаем данные
  useEffect(() => {
    if (tg) {
      hideMainButton();
    }

    loadCategories();
  }, [tg, hideMainButton]);

  // Загрузка категорий из API
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Проверяем токен авторизации
      const token = localStorage.getItem('authToken');
      const isAdminFlag = localStorage.getItem('user_is_admin');
      
      console.log('AdminCategories: Текущий статус авторизации:', { 
        token: token ? 'Присутствует' : 'Отсутствует',
        isAdmin: isAdminFlag
      });
      
      if (!token) {
        console.error('AdminCategories: Токен авторизации отсутствует. Перенаправляем на страницу входа.');
        navigate('/admin/login');
        return;
      }
      
      console.log('AdminCategories: Запрос на получение категорий...');
      const response = await api.categories.getAll();
      console.log('AdminCategories: Ответ API:', response);
      
      // Определяем правильную структуру ответа
      let categoriesData = null;
      
      if (response.data && Array.isArray(response.data.data)) {
        console.log('AdminCategories: Формат категорий - массив в data');
        categoriesData = response.data.data;
      } else if (response.data && response.data.data && response.data.data.categories) {
        console.log('AdminCategories: Формат категорий - вложенные объекты');
        categoriesData = response.data.data.categories;
      } else if (response.data && Array.isArray(response.data)) {
        console.log('AdminCategories: Формат категорий - прямой массив');
        categoriesData = response.data;
      }
      
      if (categoriesData && Array.isArray(categoriesData)) {
        console.log('AdminCategories: Получены категории:', categoriesData.length);
        
        // Подсчет количества товаров в каждой категории
        const categoriesWithProductCount = await Promise.all(
          categoriesData.map(async (category) => {
            try {
              // Запрос на подсчет цветов в категории
              const flowersResponse = await api.flowers.getAll({ 
                category_id: category.id,
                count_only: true
              });
              
              // Попытка извлечь количество товаров из разных форматов ответа
              let productsCount = 0;
              if (flowersResponse.data && flowersResponse.data.data && flowersResponse.data.data.pagination) {
                productsCount = flowersResponse.data.data.pagination.totalItems || 0;
              } else if (flowersResponse.data && flowersResponse.data.count) {
                productsCount = flowersResponse.data.count;
              }
              
              return {
                ...category,
                productsCount: productsCount
              };
            } catch (error) {
              console.error(`AdminCategories: Ошибка при подсчете товаров для категории ${category.id}:`, error);
              return {
                ...category,
                productsCount: 0
              };
            }
          })
        );
        
        setCategories(categoriesWithProductCount);
      } else {
        console.warn('AdminCategories: Неверный формат данных категорий:', response.data);
        setError('Не удалось загрузить категории. Неверный формат данных.');
      }
    } catch (error) {
      console.error('AdminCategories: Ошибка загрузки категорий:', error);
      setError('Не удалось загрузить категории. Проверьте подключение к интернету.');
      
      // Проверяем, связана ли ошибка с авторизацией
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user_is_admin');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Обработчик для редактирования категории
  const handleEdit = (category) => {
    setCurrentCategory({ ...category });
    setEditMode(true);
  };

  // Обработчик для создания новой категории
  const handleCreate = () => {
    setCurrentCategory({ id: null, name: '', slug: '', productsCount: 0 });
    setEditMode(true);
  };

  // Обработчик для изменения полей формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory(prev => ({ ...prev, [name]: value }));
  };

  // Обработчик для генерации slug из названия
  const generateSlug = () => {
    if (currentCategory?.name) {
      const slug = currentCategory.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      setCurrentCategory(prev => ({ ...prev, slug }));
    }
  };

  // Обработчик для сохранения категории
  const handleSave = async () => {
    try {
      setLoading(true);
      
      if (currentCategory.id) {
        // Редактирование существующей категории
        console.log('AdminCategories: Обновление категории:', currentCategory);
        const response = await api.categories.update(currentCategory.id, {
          name: currentCategory.name,
          slug: currentCategory.slug
        });
        console.log('AdminCategories: Ответ API при обновлении:', response);
      } else {
        // Создание новой категории
        console.log('AdminCategories: Создание новой категории:', currentCategory);
        const response = await api.categories.create({
          name: currentCategory.name,
          slug: currentCategory.slug
        });
        console.log('AdminCategories: Ответ API при создании:', response);
      }
      
      // Перезагружаем список категорий
      await loadCategories();
      
      // Сброс режима редактирования
      setEditMode(false);
      setCurrentCategory(null);
    } catch (error) {
      console.error('AdminCategories: Ошибка при сохранении категории:', error);
      alert('Не удалось сохранить категорию. Пожалуйста, попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик для отмены редактирования
  const handleCancel = () => {
    setEditMode(false);
    setCurrentCategory(null);
  };

  // Обработчик для удаления категории
  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      try {
        setLoading(true);
        console.log('AdminCategories: Удаление категории:', id);
        const response = await api.categories.delete(id);
        console.log('AdminCategories: Ответ API при удалении:', response);
        
        // Перезагружаем список категорий
        await loadCategories();
      } catch (error) {
        console.error('AdminCategories: Ошибка при удалении категории:', error);
        alert('Не удалось удалить категорию. Возможно, в ней есть товары.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Если данные загружаются, показываем индикатор загрузки
  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loader"></div>
        <p>Загрузка категорий...</p>
      </div>
    );
  }

  return (
    <div className="admin-categories">
      <div className="admin-header">
        <h1>Управление категориями</h1>
        {!editMode && (
          <button className="btn btn-primary" onClick={handleCreate}>
            <span className="material-icons">add</span> Добавить категорию
          </button>
        )}
      </div>
      
      {error && (
        <div className="admin-error-message">
          <span className="material-icons">error</span>
          <p>{error}</p>
          <button 
            className="btn btn-secondary" 
            onClick={loadCategories}
          >
            Повторить загрузку
          </button>
        </div>
      )}
      
      {editMode ? (
        <div className="category-form">
          <h2>{currentCategory.id ? 'Редактирование категории' : 'Создание категории'}</h2>
          <div className="form-group">
            <label htmlFor="name">Название категории</label>
            <input
              type="text"
              id="name"
              name="name"
              value={currentCategory.name}
              onChange={handleInputChange}
              placeholder="Например: Розы"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="slug">Slug (URL)</label>
            <div className="slug-input">
              <input
                type="text"
                id="slug"
                name="slug"
                value={currentCategory.slug}
                onChange={handleInputChange}
                placeholder="Например: roses"
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={generateSlug}
                title="Сгенерировать из названия"
              >
                <span className="material-icons">autorenew</span>
              </button>
            </div>
          </div>
          
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={handleCancel}>
              Отмена
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={!currentCategory.name || !currentCategory.slug}
            >
              Сохранить
            </button>
          </div>
        </div>
      ) : (
        <div className="categories-table-container">
          <table className="categories-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Slug</th>
                <th>Товаров</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map(category => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.name}</td>
                    <td>{category.slug || '-'}</td>
                    <td>{category.productsCount}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn edit-btn" 
                          title="Редактировать"
                          onClick={() => handleEdit(category)}
                        >
                          <span className="material-icons">edit</span>
                        </button>
                        <button 
                          className="action-btn delete-btn" 
                          title="Удалить"
                          onClick={() => handleDelete(category.id)}
                          disabled={category.productsCount > 0}
                        >
                          <span className="material-icons">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-results">
                    <span className="material-icons">category</span>
                    <p>Категории отсутствуют. Создайте первую категорию.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCategories; 