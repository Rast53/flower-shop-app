import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { flowerApi, categoryApi } from '../services/api';
import { useCart } from '../hooks/useCart';
import '../styles/CatalogPage.css';

const CatalogPage = () => {
  const { categoryId } = useParams();
  const { addToCart } = useCart();
  
  const [flowers, setFlowers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('name_asc');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Загружаем категории при монтировании компонента
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        setCategories(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке категорий:', err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // Загружаем цветы с учетом выбранной категории
    const fetchFlowers = async () => {
      try {
        setLoading(true);
        
        let response;
        if (categoryId) {
          response = await flowerApi.getAll(categoryId);
          // Находим информацию о выбранной категории
          const category = categories.find(cat => cat.id === parseInt(categoryId));
          setSelectedCategory(category);
        } else {
          response = await flowerApi.getAll();
          setSelectedCategory(null);
        }
        
        setFlowers(response.data);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке цветов:', err);
        setError('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    if (categories.length > 0 || !categoryId) {
      fetchFlowers();
    }
  }, [categoryId, categories]);

  // Обработчик для добавления товара в корзину
  const handleAddToCart = (flower) => {
    addToCart(flower);
    // Можно добавить уведомление о добавлении товара в корзину
  };

  // Фильтрация и сортировка
  const filteredFlowers = flowers.filter(flower => 
    flower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flower.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedFlowers = [...filteredFlowers].sort((a, b) => {
    switch (sortOption) {
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Загрузка цветов...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()} className="reload-button">
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <div className="catalog-title">
          <h1>{selectedCategory ? selectedCategory.name : 'Все цветы'}</h1>
          {selectedCategory && (
            <p className="category-description">{selectedCategory.description}</p>
          )}
        </div>
      </div>
      
      <div className="catalog-content">
        {/* Боковая панель с категориями */}
        <aside className="catalog-sidebar">
          <div className="categories-filter">
            <h3>Категории</h3>
            <ul className="categories-list">
              <li>
                <Link 
                  to="/catalog" 
                  className={!categoryId ? 'active' : ''}
                >
                  Все цветы
                </Link>
              </li>
              {categories.map(category => (
                <li key={category.id}>
                  <Link 
                    to={`/catalog/${category.id}`}
                    className={categoryId === category.id?.toString() ? 'active' : ''}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        
        {/* Основной контент с товарами */}
        <div className="catalog-main">
          {/* Фильтры и поиск */}
          <div className="catalog-filters">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Поиск цветов..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="sort-options">
              <label htmlFor="sort">Сортировать по:</label>
              <select 
                id="sort" 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="name_asc">Название (А-Я)</option>
                <option value="name_desc">Название (Я-А)</option>
                <option value="price_asc">Цена (по возрастанию)</option>
                <option value="price_desc">Цена (по убыванию)</option>
              </select>
            </div>
          </div>
          
          {/* Сетка с товарами */}
          {sortedFlowers.length > 0 ? (
            <div className="flowers-grid">
              {sortedFlowers.map(flower => (
                <div key={flower.id} className="flower-card">
                  <Link to={`/product/${flower.id}`} className="flower-image">
                    <img src={flower.image_url || '/images/flower-placeholder.jpg'} alt={flower.name} />
                  </Link>
                  <div className="flower-details">
                    <h3>
                      <Link to={`/product/${flower.id}`}>{flower.name}</Link>
                    </h3>
                    <p className="flower-price">{flower.price} ₽</p>
                    <div className="flower-actions">
                      <Link to={`/product/${flower.id}`} className="btn btn-secondary btn-sm">
                        Подробнее
                      </Link>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAddToCart(flower)}
                      >
                        В корзину
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>Нет товаров, соответствующих вашему запросу</p>
              <button onClick={() => setSearchTerm('')} className="btn btn-primary">
                Сбросить фильтры
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;