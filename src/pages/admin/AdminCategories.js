import React, { useEffect, useState } from 'react';
import { useTelegram } from '../../hooks/useTelegram';
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

  // Скрываем основную кнопку Telegram и загружаем данные
  useEffect(() => {
    if (tg) {
      hideMainButton();
    }

    // Имитация загрузки данных
    const loadCategories = setTimeout(() => {
      setCategories([
        { id: 1, name: 'Розы', slug: 'roses', productsCount: 12 },
        { id: 2, name: 'Тюльпаны', slug: 'tulips', productsCount: 8 },
        { id: 3, name: 'Композиции', slug: 'compositions', productsCount: 15 },
        { id: 4, name: 'Корзины', slug: 'baskets', productsCount: 7 },
        { id: 5, name: 'Букеты', slug: 'bouquets', productsCount: 20 },
      ]);
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(loadCategories);
  }, [tg, hideMainButton]);

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
  const handleSave = () => {
    if (currentCategory.id) {
      // Редактирование существующей категории
      setCategories(prev =>
        prev.map(cat => (cat.id === currentCategory.id ? currentCategory : cat))
      );
    } else {
      // Создание новой категории
      const newCategory = {
        ...currentCategory,
        id: Date.now(), // Имитация генерации ID
      };
      setCategories(prev => [...prev, newCategory]);
    }
    // Сброс режима редактирования
    setEditMode(false);
    setCurrentCategory(null);
  };

  // Обработчик для отмены редактирования
  const handleCancel = () => {
    setEditMode(false);
    setCurrentCategory(null);
  };

  // Обработчик для удаления категории
  const handleDelete = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      setCategories(prev => prev.filter(cat => cat.id !== id));
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
                    <td>{category.slug}</td>
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