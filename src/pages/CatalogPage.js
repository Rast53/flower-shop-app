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
  
  // Загружаем данные при изменении URL или параметров сортировки
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      // Инициализация массива цветов
      let processedFlowers = [];
      
      try {
        // Если выбрана категория, загружаем цветы по категории
        console.log('Запрос на получение цветов, категория:', activeCategory);
        
        let flowersResponse;
        try {
          if (activeCategory && activeCategory !== 'all') {
            // Используем функцию форматирования ID категории
            const categoryId = formatCategoryId(activeCategory);
            console.log('Отправляем запрос с категорией:', categoryId, 'тип:', typeof categoryId);
            
            // Важно: отправляем ID как строку, так как в логах сервера видно, что он ожидает строковый ID
            flowersResponse = await flowerApi.getAll({ 
              category_id: String(categoryId)
            });
          } else {
            flowersResponse = await flowerApi.getAll();
          }
          
          console.log('Получен ответ API по цветам, статус:', flowersResponse.status);
          
          // Обработка ответа и извлечение данных
          if (flowersResponse.data) {
            // Изучаем структуру ответа API
            console.log('Структура ответа API (ключи):', Object.keys(flowersResponse.data));
            
            // Получаем данные из ответа в зависимости от его структуры
            let flowersData = [];
            
            // Сервер возвращает данные в формате { data: [...], error: null }
            if (flowersResponse.data.data) {
              flowersData = flowersResponse.data.data;
            } else if (Array.isArray(flowersResponse.data)) {
              flowersData = flowersResponse.data;
            } else if (flowersResponse.data.flowers) {
              flowersData = flowersResponse.data.flowers;
            } else if (flowersResponse.data.items) {
              flowersData = flowersResponse.data.items;
            }
            
            console.log('Получено цветов из запроса по категории:', flowersData.length);
            
            // Если нашли какие-то цветы, используем их
            if (flowersData.length > 0) {
              // Проверяем структуру данных цветка на соответствие серверной модели
              const sampleFlower = flowersData[0];
              console.log('Пример структуры цветка:', sampleFlower);
              
              // Преобразуем данные, если необходимо, чтобы они соответствовали модели Flower
              processedFlowers = flowersData.map(flower => ({
                id: flower.id,
                name: flower.name,
                description: flower.description,
                price: flower.price !== undefined ? flower.price : 0,
                stock_quantity: flower.stock_quantity,
                image_url: formatImageUrl(flower.image_url || '/images/flower-placeholder.jpg'),
                popularity: flower.popularity,
                category_id: flower.category_id,
                is_available: flower.is_available !== undefined ? flower.is_available : true,
                category: flower.category || null
              }));
            }
          }
        } catch (flowerError) {
          console.error('Ошибка при загрузке цветов по категории:', flowerError);
        }
        
        // Если не удалось получить цветы по категории, пробуем получить все цветы
        // и отфильтровать их на клиенте
        if (processedFlowers.length === 0 && activeCategory && activeCategory !== 'all') {
          console.log('Пробуем альтернативный подход: получение всех цветов и фильтрация по категории');
          
          try {
            const allFlowersResponse = await flowerApi.getAll();
            
            if (allFlowersResponse.data) {
              let allFlowers = [];
              
              if (allFlowersResponse.data.data) {
                allFlowers = allFlowersResponse.data.data;
              } else if (Array.isArray(allFlowersResponse.data)) {
                allFlowers = allFlowersResponse.data;
              } else if (allFlowersResponse.data.flowers) {
                allFlowers = allFlowersResponse.data.flowers;
              } else if (allFlowersResponse.data.items) {
                allFlowers = allFlowersResponse.data.items;
              } else if (allFlowersResponse.flowers && Array.isArray(allFlowersResponse.flowers)) {
                // Обработка случая, когда flowers находится в корне объекта ответа
                allFlowers = allFlowersResponse.flowers;
                console.log('Извлекаем цветы из корня объекта ответа:', allFlowers.length);
              }
              
              console.log(`Получено всего цветов: ${allFlowers.length}, фильтруем по категории ID=${activeCategory}`);
              
              // Проверяем, что allFlowers - это массив перед фильтрацией
              if (Array.isArray(allFlowers)) {
                // Фильтруем цветы по выбранной категории на клиенте
                const filteredFlowers = allFlowers.filter(flower => 
                  flower && (
                    (flower.category_id !== undefined && String(flower.category_id) === String(activeCategory)) ||
                    (flower.category && flower.category.id !== undefined && String(flower.category.id) === String(activeCategory))
                  )
                );
                
                console.log(`После фильтрации осталось ${filteredFlowers.length} цветов`);
                
                if (filteredFlowers.length > 0) {
                  processedFlowers = filteredFlowers;
                }
              } else if (allFlowers && allFlowers.flowers && Array.isArray(allFlowers.flowers)) {
                // Обработка случая, когда allFlowers - это объект с полем flowers (массив)
                console.log(`allFlowers не является массивом, но содержит массив flowers длиной ${allFlowers.flowers.length}`);
                
                const innerFlowers = allFlowers.flowers;
                const filteredFlowers = innerFlowers.filter(flower => 
                  flower && (
                    (flower.category_id !== undefined && String(flower.category_id) === String(activeCategory)) ||
                    (flower.category && flower.category.id !== undefined && String(flower.category.id) === String(activeCategory))
                  )
                );
                
                console.log(`После фильтрации осталось ${filteredFlowers.length} цветов`);
                
                if (filteredFlowers.length > 0) {
                  processedFlowers = filteredFlowers;
                }
              } else {
                console.error('allFlowers не является массивом:', allFlowers);
              }
            }
          } catch (allFlowersError) {
            console.error('Ошибка при загрузке всех цветов:', allFlowersError);
          }
        }
        
        // Получаем категории
        let categoriesResponse;
        try {
          categoriesResponse = await categoryApi.getAll();
          console.log('Ответ API по категориям:', categoriesResponse.data);
          
          // Сервер возвращает категории в формате { data: [...], error: null }
          const categoriesData = categoriesResponse.data.data || [];
          console.log('Получено категорий:', categoriesData.length);
          
          if (categoriesData.length > 0) {
            // Проверяем структуру данных категории
            const sampleCategory = categoriesData[0];
            console.log('Пример структуры категории:', sampleCategory);
            
            // Проверяем, содержит ли категория связанные цветы
            if (sampleCategory.flowers && Array.isArray(sampleCategory.flowers)) {
              console.log(`Категория ${sampleCategory.name} содержит ${sampleCategory.flowers.length} связанных цветов`);
            }
          }
          
          // Устанавливаем категории в состояние
          setCategories(categoriesData);
          
          // Если цветы всё ещё не получены, пробуем извлечь их из ответа категорий
          if (processedFlowers.length === 0 && activeCategory && activeCategory !== 'all') {
            console.log('Пробуем получить цветы из данных категорий');
            
            const currentCategory = categoriesData.find(cat => String(cat.id) === String(activeCategory));
            
            if (currentCategory && currentCategory.flowers && Array.isArray(currentCategory.flowers)) {
              console.log(`Найдена категория ${currentCategory.name} с ${currentCategory.flowers.length} цветами`);
              
              // Преобразуем цветы из категории в полноценные объекты в соответствии с моделью Flower
              const flowersFromCategory = currentCategory.flowers.map(flower => {
                // Проверяем, в каком формате пришли данные
                const isNestedFormat = flower['flowers.id'] !== undefined;
                
                return {
                  id: isNestedFormat ? flower['flowers.id'] : flower.id,
                  name: isNestedFormat ? flower['flowers.name'] : flower.name,
                  price: isNestedFormat ? flower['flowers.price'] : (flower.price || 0),
                  image_url: formatImageUrl(isNestedFormat ? flower['flowers.image_url'] : (flower.image_url || '/images/flower-placeholder.jpg')),
                  popularity: isNestedFormat ? flower['flowers.popularity'] : (flower.popularity || 0),
                  category_id: currentCategory.id,
                  category: {
                    id: currentCategory.id,
                    name: currentCategory.name,
                    slug: currentCategory.slug
                  }
                };
              });
              
              if (flowersFromCategory.length > 0) {
                console.log('Получены цветы из категории:', flowersFromCategory);
                processedFlowers = flowersFromCategory;
              }
            }
          }
        } catch (categoryError) {
          console.error('Ошибка при загрузке категорий:', categoryError);
        }
        
        // Заключительная обработка и установка полученных цветов
        console.log('Всего получено цветов после всех попыток:', processedFlowers.length);
        
        // Проверяем, что processedFlowers - это массив
        if (!Array.isArray(processedFlowers)) {
          console.error('processedFlowers не является массивом:', processedFlowers);
          processedFlowers = [];
        }
        
        // Проверяем наличие минимального набора полей
        const validFlowers = processedFlowers.filter(flower => 
          flower && flower.id && flower.name
        ).map(flower => ({
          ...flower,
          price: flower.price !== undefined ? flower.price : 0,
          image_url: flower.image_url || '/images/flower-placeholder.jpg'
        }));
        
        console.log('Валидных элементов:', validFlowers.length);
        setFlowers(validFlowers);
        
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        if (error.response && error.response.data && error.response.data.error) {
          setError(`Ошибка сервера: ${error.response.data.error}`);
        } else {
          setError("Ошибка при загрузке данных. Пожалуйста, попробуйте позже.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeCategory, sortBy, priceRange, location.search]);
  
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