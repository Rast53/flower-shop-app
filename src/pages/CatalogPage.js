import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { flowerApi, categoryApi } from '../services/api';
import '../styles/CatalogPage.css';

/**
 * Компонент CatalogPage - страница каталога цветов с фильтрацией по категориям
 */
const CatalogPage = () => {
  const { category } = useParams(); // Получаем категорию из URL, если она указана
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // Состояние для хранения данных
  const [flowers, setFlowers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(category || 'all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Получаем параметры запроса из URL
  const queryParams = new URLSearchParams(location.search);
  const initialSort = queryParams.get('sort') || 'popularity';
  
  // Состояние для фильтрации и сортировки
  const [sortBy, setSortBy] = useState(initialSort);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  
  // Загружаем данные при изменении URL или параметров сортировки
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Загружаем категории, если их еще нет
        if (categories.length === 0) {
          const categoriesResponse = await categoryApi.getAll();
          setCategories(categoriesResponse.data);
        }
        
        // Формируем параметры запроса
        const params = {
          sort: sortBy,
          min_price: priceRange.min,
          max_price: priceRange.max
        };
        
        // Если выбрана конкретная категория, добавляем её в запрос
        if (activeCategory && activeCategory !== 'all') {
          params.category_id = activeCategory;
        }
        
        // Получаем цветы по параметрам
        const flowersResponse = await flowerApi.getAll(params);
        setFlowers(flowersResponse.data);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить данные каталога. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeCategory, sortBy, priceRange, location.search, category]);
  
  // Обработчик изменения категории
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    
    // Обновляем URL при изменении категории
    if (categoryId === 'all') {
      navigate('/catalog');
    } else {
      navigate(`/catalog/${categoryId}`);
    }
  };
  
  // Обработчик изменения сортировки
  const handleSortChange = (e) => {
    const sort = e.target.value;
    setSortBy(sort);
    
    // Обновляем URL при изменении сортировки
    const params = new URLSearchParams(location.search);
    params.set('sort', sort);
    navigate(`${location.pathname}?${params.toString()}`);
  };
  
  // Обработчик добавления товара в корзину
  const handleAddToCart = (flower) => {
    addToCart(flower, 1);
    
    // Показываем уведомление
    alert(`"${flower.name}" добавлен в корзину`);
  };
  
  // Если данные загружаются, показываем индикатор загрузки
  if (loading && flowers.length === 0) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Загрузка каталога...</p>
      </div>
    );
  }
  
  // Если произошла ошибка, показываем сообщение
  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="reload-button" onClick={() => window.location.reload()}>
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <h1>Каталог цветов</h1>
        <p>Выбирайте из нашей коллекции свежих цветов и букетов</p>
      </div>
      
      <div className="catalog-content">
        {/* Боковая панель с фильтрами */}
        <aside className="catalog-sidebar">
          <div className="filter-section">
            <h3>Категории</h3>
            <ul className="category-filters">
              <li>
                <button 
                  className={activeCategory === 'all' ? 'active' : ''}
                  onClick={() => handleCategoryChange('all')}
                >
                  Все категории
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button 
                    className={activeCategory === cat.id.toString() ? 'active' : ''}
                    onClick={() => handleCategoryChange(cat.id.toString())}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="filter-section">
            <h3>Цена</h3>
            <div className="price-range">
              <input 
                type="range" 
                min="0" 
                max="10000" 
                step="100"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
              />
              <div className="price-inputs">
                <input 
                  type="number" 
                  min="0" 
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                />
                <span>-</span>
                <input 
                  type="number" 
                  max="10000" 
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                />
              </div>
            </div>
          </div>
        </aside>
        
        {/* Основной контент с товарами */}
        <div className="catalog-main">
          <div className="catalog-controls">
            <div className="results-count">
              Найдено: <strong>{flowers.length}</strong> товаров
            </div>
            <div className="sort-controls">
              <label htmlFor="sort">Сортировать по:</label>
              <select 
                id="sort" 
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="popularity">Популярности</option>
                <option value="price_asc">Цена (по возрастанию)</option>
                <option value="price_desc">Цена (по убыванию)</option>
                <option value="name_asc">Названию (А-Я)</option>
                <option value="name_desc">Названию (Я-А)</option>
              </select>
            </div>
          </div>
          
          {/* Сетка товаров */}
          <div className="flowers-grid">
            {flowers.length > 0 ? (
              flowers.map((flower) => (
                <div key={flower.id} className="flower-card">
                  <Link to={`/product/${flower.id}`} className="flower-image">
                    <img
                      src={flower.image_url || '/images/flower-placeholder.jpg'}
                      alt={flower.name}
                    />
                  </Link>
                  <div className="flower-details">
                    <h3>
                      <Link to={`/product/${flower.id}`}>{flower.name}</Link>
                    </h3>
                    <div className="flower-price">
                      {flower.price.toLocaleString()} ₽
                    </div>
                    <div className="flower-actions">
                      <Link to={`/product/${flower.id}`} className="btn btn-secondary">
                        Подробнее
                      </Link>
                      <button 
                        className="btn btn-primary add-to-cart"
                        onClick={() => handleAddToCart(flower)}
                      >
                        В корзину
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>По вашему запросу ничего не найдено</p>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setActiveCategory('all');
                    setPriceRange({ min: 0, max: 10000 });
                    navigate('/catalog');
                  }}
                >
                  Сбросить фильтры
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;