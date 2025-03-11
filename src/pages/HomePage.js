import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api, { categoryApi, flowerApi } from '../services/api';
import '../styles/HomePage.css';
import PageLoader from '../components/PageLoader';
import { formatImageUrl, handleImageError } from '../utils/imageUtils';

/**
 * Компонент HomePage - главная страница цветочного магазина
 * Отображает баннер, основные услуги, категории, популярные товары и преимущества
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
        setPopularFlowers(Array.isArray(flowersData) ? flowersData.slice(0, 8) : []);
        
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
    return <PageLoader message="Загружаем для вас самые свежие цветы..." />;
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
      {/* <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Свежие цветы для особых моментов</h1>
          <p className="hero-subtitle">
            Превращаем ваши чувства в прекрасные букеты с доставкой в день заказа
          </p>
          <div className="hero-buttons">
            <Link to="/catalog" className="btn btn-primary">
              Смотреть каталог
            </Link>
            <Link to="/custom-order" className="btn btn-secondary">
              Заказать свой букет
            </Link>
          </div>
        </div>
      </section> */}

      {/* Основные услуги */}
      <section className="services-section">
        <h2 className="section-title">Наши услуги</h2>
        <div className="services-container">
          <div className="service-card">
            <div className="service-icon">💐</div>
            <h3>Готовые букеты</h3>
            <p>Выберите из нашей коллекции тщательно подобранных букетов, созданных профессиональными флористами</p>
            <Link to="/catalog" className="btn btn-outline">
              Смотреть каталог
            </Link>
          </div>
          
          <div className="service-card">
            <div className="service-icon">✨</div>
            <h3>Индивидуальный заказ</h3>
            <p>Создайте уникальный букет по вашим пожеланиям — выберите цветы, стиль и оформление</p>
            <Link to="/custom-order" className="btn btn-outline">
              Создать букет
            </Link>
          </div>
        </div>
      </section>

      {/* Категории цветов */}
      {/* <section className="categories-section">
        <h2 className="section-title">Категории цветов</h2>
        <div className="categories-grid">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Link
                key={category.id}
                to={`/catalog/${category.id}`}
                className="category-card"
              >
                <div className="category-image">
                  <img 
                    src={formatImageUrl(category.image_url) || '/images/category-placeholder.jpg'} 
                    alt={category.name}
                    onError={handleImageError}
                  />
                </div>
                <h3 className="category-name">{category.name}</h3>
              </Link>
            ))
          ) : (
            <p className="no-items-message">Категории загружаются...</p>
          )}
        </div>
      </section> */}

      {/* Популярные товары */}
      <section className="popular-flowers-section">
        <h2 className="section-title">Популярные букеты</h2>
        <div className="flowers-grid">
          {popularFlowers.length > 0 ? (
            popularFlowers.map(flower => (
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
            ))
          ) : (
            <p className="no-items-message">Популярные букеты загружаются...</p>
          )}
        </div>
        <div className="view-all-container">
          <Link to="/catalog" className="btn btn-secondary view-all-btn">
            Смотреть все букеты
          </Link>
        </div>
      </section>

      {/* Индивидуальный букет - CTA секция */}
      <section className="custom-bouquet-section">
        <div className="custom-bouquet-content">
          <h2>Создайте свой уникальный букет</h2>
          <p>
            Не нашли подходящий вариант в каталоге? Создайте букет, который точно
            выразит ваши чувства. Наши флористы воплотят ваши идеи в жизнь.
          </p>
          <ul className="custom-features">
            <li>✓ Выбор любых доступных цветов</li>
            <li>✓ Подбор стиля оформления</li>
            <li>✓ Добавление открытки с вашим текстом</li>
            <li>✓ Консультация флориста</li>
          </ul>
          <Link to="/custom-order" className="btn btn-primary">
            Заказать свой букет
          </Link>
        </div>
        <div className="custom-bouquet-image">
          <img src="https://storage.yandexcloud.net/flower-shop-images/flowers/Sborka.jpg" alt="Процесс создания букета" className="custom-bouquet-image" />
        </div>
      </section>

      {/* Преимущества */}
      <section className="advantages-section">
        <h2 className="section-title">Почему выбирают нас</h2>
        <div className="advantages-container">
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
        </div>
      </section>

      {/* Приветствие пользователя, если он авторизован */}
      {user && (
        <section className="cta-section">
          <div className="cta-content">
            <h2>Добро пожаловать, {user.name || 'пользователь'}!</h2>
            <p>
              Рады видеть вас снова. Посмотрите наши <strong>новинки</strong> или перейдите в 
              <strong> личный кабинет</strong> для просмотра ваших заказов.
            </p>
            <div className="cta-buttons">
              <Link to="/catalog" className="btn btn-primary">
                Посмотреть новинки
              </Link>
              <Link to="/profile" className="btn btn-secondary">
                Личный кабинет
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;