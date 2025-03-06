import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api, { categoryApi, flowerApi } from '../services/api';
import '../styles/HomePage.css';
import PageLoader from '../components/PageLoader';
import { formatImageUrl, handleImageError } from '../utils/imageUtils';

/**
 * Компонент HomePage - главная страница цветочного магазина
 * Отображает баннер, категории, популярные товары и преимущества
 */
const HomePage = () => {
  // Состояние для хранения данных
  const [categories, setCategories] = useState([]);
  const [popularFlowers, setPopularFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Получаем данные пользователя из контекста Auth
  const { user } = useAuth();

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        const [categoriesRes, flowersRes] = await Promise.all([
          categoryApi.getAll().catch(err => ({ data: { data: { categories: [] } } })),
          api.get('/flowers').catch(err => ({ data: { data: [] } }))
        ]);
        
        // Проверяем наличие и структуру данных
        const categoriesData = categoriesRes.data?.data?.categories;
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        
        // Проверяем наличие и структуру данных для цветов
        const flowersData = flowersRes.data?.data;
        setPopularFlowers(Array.isArray(flowersData) ? flowersData : []);
        
        setError(null);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
        
        // В случае ошибки, устанавливаем пустые массивы, чтобы предотвратить ошибки рендеринга
        setCategories([]);
        setPopularFlowers([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Если данные загружаются, показываем индикатор загрузки
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Загрузка...</p>
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
    <div className="home-page">
      {/* Героический баннер */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Свежие цветы для любого случая</h1>
          <p className="hero-subtitle">
            Букеты и композиции ручной работы с доставкой в день заказа
          </p>
          <Link to="/catalog" className="hero-cta">
            Смотреть каталог
          </Link>
        </div>
      </section>

      {/* Категории цветов */}
      <section className="categories-section">
        <h2 className="section-title">Категории цветов</h2>
        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/catalog/${category.id}`}
              className="category-card"
            >
              <img 
                src={category.image_url || '/images/category-placeholder.jpg'} 
                alt={category.name}
              />
              <div className="category-name">{category.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Популярные товары */}
      <section className="popular-flowers-section">
        <h2 className="section-title">Популярные цветы</h2>
        <div className="flowers-grid">
          {popularFlowers.map(flower => (
            <div key={flower.id} className="flower-card">
              <Link to={`/product/${flower.id}`} className="flower-image">
                <img
                  src={formatImageUrl(flower.image_url)}
                  alt={flower.name}
                  onError={handleImageError}
                />
              </Link>
              <div className="flower-details">
                <h3>
                  <Link to={`/product/${flower.id}`}>{flower.name}</Link>
                </h3>
                <div className="flower-price">
                  {flower.price.toLocaleString()} ₽
                </div>
                <Link to={`/product/${flower.id}`} className="btn btn-primary">
                  Подробнее
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Преимущества */}
      <section className="advantages-section">
        <div className="advantage-item">
          <div className="advantage-icon">🚚</div>
          <h3 className="advantage-title">Быстрая доставка</h3>
          <p className="advantage-description">
            Доставляем букеты в течение 2 часов по всему городу
          </p>
        </div>
        
        <div className="advantage-item">
          <div className="advantage-icon">🌷</div>
          <h3 className="advantage-title">Свежие цветы</h3>
          <p className="advantage-description">
            Работаем только с проверенными поставщиками
          </p>
        </div>
        
        <div className="advantage-item">
          <div className="advantage-icon">💯</div>
          <h3 className="advantage-title">Гарантия качества</h3>
          <p className="advantage-description">
            Гарантируем свежесть цветов до 7 дней
          </p>
        </div>
        
        <div className="advantage-item">
          <div className="advantage-icon">🎁</div>
          <h3 className="advantage-title">Особые поводы</h3>
          <p className="advantage-description">
            Индивидуальный подход к каждому заказу
          </p>
        </div>
      </section>

      {/* Приветствие пользователя, если он авторизован */}
      {user && (
        <section className="cta-section">
          <div className="cta-content">
            <h2>Добро пожаловать, {user.name || 'пользователь'}!</h2>
            <p>
              Рады видеть вас снова в нашем магазине. У нас появились <strong>новые букеты</strong>, которые могут вас заинтересовать.
            </p>
            <Link to="/catalog" className="btn btn-primary">
              Посмотреть новинки
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;