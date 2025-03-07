import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import api, { flowerApi, categoryApi } from '../services/api';
import { CartContext } from '../contexts/CartContext';
import PageLoader from '../components/PageLoader';
import { formatImageUrl, handleImageError } from '../utils/imageUtils';
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
  
  // Отладочный вывод для проверки параметров
  console.log('URL параметры:', { category, activeCategory, location: location.pathname });
  
  // Получаем параметры запроса из URL
  const queryParams = new URLSearchParams(location.search);
  const initialSort = queryParams.get('sort') || 'popularity';
  
  // Состояние для фильтрации и сортировки
  const [sortBy, setSortBy] = useState(initialSort);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  
  // Обновляем активную категорию при изменении URL параметра
  useEffect(() => {
    if (category) {
      const formattedCategory = formatCategoryId(category);
      console.log('Категория изменилась через URL:', category, 'форматированная:', formattedCategory);
      setActiveCategory(formattedCategory);
    } else {
      // Если категория не указана в URL, устанавливаем 'all'
      setActiveCategory('all');
    }
  }, [category]);
  
  // Подготавливаем функцию с учетом зависимостей
  const fetchFlowersByCategory = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      // Для "Все категории" не передаем параметр category_id вообще или передаем равным 'all'
      if (activeCategory === 'all') {
        console.log('Запрашиваем все цветы без фильтрации по категории');
        response = await flowerApi.getAll();
      } else {
        console.log('Запрашиваем цветы по категории:', activeCategory);
        response = await flowerApi.getAll({ category_id: activeCategory });
      }
      
      let rawFlowers = [];
      if (response.data && response.data.data && response.data.data.flowers) {
        // Данные в формате { data: { flowers: [...] } }
        rawFlowers = response.data.data.flowers;
      } else if (response.data && Array.isArray(response.data.data)) {
        // Данные в формате { data: [...] }
        rawFlowers = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Данные в формате [...] 
        rawFlowers = response.data;
      } else if (response.data && response.data.flowers && Array.isArray(response.data.flowers)) {
        // Данные в формате { flowers: [...] }
        rawFlowers = response.data.flowers;
      } else {
        console.error('Неожиданный формат данных:', response.data);
        setError('Ошибка загрузки данных: неверный формат ответа');
        return;
      }
      
      // Применяем фильтрацию по цене
      let filtered = rawFlowers.filter(flower => {
        const price = parseFloat(flower.price) || 0;
        return price >= priceRange.min && price <= priceRange.max;
      });
      
      // Применяем сортировку
      let sorted = [...filtered];
      switch (sortBy) {
        case 'price_asc':
          sorted.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
          break;
        case 'price_desc':
          sorted.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
          break;
        case 'name_asc':
          sorted.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          sorted.sort((a, b) => b.name.localeCompare(a.name));
          break;
        default: // popularity
          sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      }
      
      setFlowers(sorted);
    } catch (err) {
      console.error('Ошибка при запросе цветов:', err);
      setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, sortBy, priceRange]);
  
  // Используем эту функцию в useEffect
  useEffect(() => {
    // Загружаем категории один раз при монтировании
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        if (response.data && response.data.data) {
          setCategories(response.data.data);
        } else if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          console.error('Неожиданный формат данных категорий:', response.data);
        }
      } catch (err) {
        console.error('Ошибка при загрузке категорий:', err);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Запускаем загрузку цветов при изменении параметров
  useEffect(() => {
    fetchFlowersByCategory();
  }, [fetchFlowersByCategory]);
  
  // Обработчик изменения категории
  const handleCategoryChange = (categoryId) => {
    console.log('Выбрана категория:', categoryId);
    setActiveCategory(categoryId);
    
    // Обновляем URL при изменении категории
    if (categoryId === 'all') {
      navigate('/catalog');
    } else {
      navigate(`/catalog/${categoryId}`);
    }
  };
  
  // Функция для форматирования ID категории в нужный формат
  const formatCategoryId = (id) => {
    // Если это строка 'all', возвращаем как есть
    if (id === 'all') return 'all';
    
    // Если id не определен или null, возвращаем 'all'
    if (id === undefined || id === null) return 'all';
    
    // В логах сервера видно, что SQL-запрос использует строковые ID в WHERE условии,
    // так что всегда возвращаем строковое представление ID
    return String(id);
  };
  
  // Функция для безопасного поиска категории по ID
  const findCategoryById = (categoryId) => {
    if (!Array.isArray(categories)) {
      console.error('categories не является массивом:', categories);
      return null;
    }
    
    if (categoryId === undefined || categoryId === null) {
      return null;
    }
    
    const stringId = String(categoryId);
    return categories.find(cat => cat && cat.id !== undefined && String(cat.id) === stringId);
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
        {/* Отладочная информация */}
        {process.env.NODE_ENV === 'development' && (
          <div className="debug-info" style={{ fontSize: '12px', color: '#666', marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
            <p><strong>Отладочная информация:</strong></p>
            <p>Активная категория: {activeCategory} (тип: {typeof activeCategory})</p>
            <p>Загружено цветов: {flowers.length}</p>
            <p>Загружено категорий: {categories.length}</p>
            {categories.length > 0 && (
              <div>
                <p>Доступные категории:</p>
                <ul>
                  {categories.map(cat => (
                    <li key={cat.id}>ID: {cat.id} - {cat.name}</li>
                  ))}
                </ul>
              </div>
            )}
            <p>Статус загрузки: {loading ? 'Загрузка...' : 'Завершена'}</p>
            {error && <p style={{ color: 'red' }}>Ошибка: {error}</p>}
          </div>
        )}
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
              flowers.map((flower) => {
                // Проверяем наличие всех необходимых данных для отображения
                if (!flower || !flower.id || !flower.name) {
                  console.warn('Пропущен товар из-за отсутствия данных:', flower);
                  return null;
                }
                
                // Определяем цену в правильном формате
                const price = typeof flower.price === 'number' 
                  ? flower.price 
                  : parseFloat(flower.price) || 0;
                  
                // Определяем URL изображения
                const imageUrl = formatImageUrl(flower.image_url || '/images/flower-placeholder.jpg');
                
                return (
                  <div key={flower.id} className="flower-card">
                    <Link to={`/product/${flower.id}`} className="flower-image">
                      <img
                        src={imageUrl}
                        alt={flower.name}
                        onError={handleImageError}
                      />
                    </Link>
                    <div className="flower-details">
                      <h3>
                        <Link to={`/product/${flower.id}`}>{flower.name}</Link>
                      </h3>
                      <div className="flower-price">
                        {price.toLocaleString()} ₽
                      </div>
                      <div className="flower-category">
                        {flower.category && flower.category.name ? 
                          flower.category.name : 
                          (findCategoryById(flower.category_id)?.name || '')}
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
                );
              })
            ) : (
              <div className="no-results">
                <p>По вашему запросу ничего не найдено</p>
                {loading ? (
                  <div className="loading-indicator">Загрузка...</div>
                ) : (
                  <>
                    <p>Попробуйте:</p>
                    <ul>
                      <li>Выбрать другую категорию</li>
                      <li>Сбросить фильтры</li>
                    </ul>
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
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;