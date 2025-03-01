import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { flowerApi, categoryApi } from '../services/api';
import '../styles/HomePage.css';

const HomePage = () => {
  const [featuredFlowers, setFeaturedFlowers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Загружаем популярные цветы и категории параллельно
        const [flowersResponse, categoriesResponse] = await Promise.all([
          flowerApi.getAll(),
          categoryApi.getAll()
        ]);
        
        // Выбираем до 8 цветов для отображения
        const featured = flowersResponse.data.slice(0, 8);
        setFeaturedFlowers(featured);
        setCategories(categoriesResponse.data);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Загрузка...</p>
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
    <div className="home-page">
      {/* Главный баннер */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1>Свежие цветы для любого случая</h1>
          <p>Мы доставляем радость и красоту прямо к вашей двери</p>
          <div className="hero-buttons">
            <Link to="/catalog" className="btn btn-primary">Перейти в каталог</Link>
            <Link to="/contacts" className="btn btn-secondary">Связаться с нами</Link>
          </div>
        </div>
      </section>

      {/* Категории цветов */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Категории цветов</h2>
          <Link to="/catalog" className="view-all-link">Смотреть все</Link>
        </div>
        
        <div className="categories-grid">
          {categories.map(category => (
            <Link to={`/catalog/${category.id}`} key={category.id} className="category-card">
              <div className="category-image">
                <img src={category.image_url || '/images/category-placeholder.jpg'} alt={category.name} />
              </div>
              <h3>{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Популярные цветы */}
      <section className="featured-flowers-section">
        <div className="section-header">
          <h2>Популярные цветы</h2>
          <Link to="/catalog" className="view-all-link">Смотреть все</Link>
        </div>
        
        <div className="flowers-grid">
          {featuredFlowers.map(flower => (
            <div key={flower.id} className="flower-card">
              <Link to={`/product/${flower.id}`} className="flower-image">
                <img src={flower.image_url || '/images/flower-placeholder.jpg'} alt={flower.name} />
              </Link>
              <div className="flower-details">
                <h3>
                  <Link to={`/product/${flower.id}`}>{flower.name}</Link>
                </h3>
                <p className="flower-price">{flower.price} ₽</p>
                <Link to={`/product/${flower.id}`} className="btn btn-primary">
                  Подробнее
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Преимущества */}
      <section className="features-section">
        <div className="feature-item">
          <span className="material-icons">local_shipping</span>
          <h3>Быстрая доставка</h3>
          <p>Доставим свежие цветы в течение 2 часов по городу</p>
        </div>
        
        <div className="feature-item">
          <span className="material-icons">eco</span>
          <h3>Всегда свежие</h3>
          <p>Мы гарантируем свежесть и качество наших цветов</p>
        </div>
        
        <div className="feature-item">
          <span className="material-icons">volunteer_activism</span>
          <h3>Профессиональные флористы</h3>
          <p>Наши флористы создадут идеальный букет для любого случая</p>
        </div>
        
        <div className="feature-item">
          <span className="material-icons">payments</span>
          <h3>Удобная оплата</h3>
          <p>Оплата картой, наличными или онлайн через приложение</p>
        </div>
      </section>
      
      {/* Призыв к действию */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Заказывайте прямо сейчас</h2>
          <p>Получите скидку 10% на первый заказ с промокодом <strong>WELCOME</strong></p>
          <Link to="/catalog" className="btn btn-primary">Перейти в каталог</Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;