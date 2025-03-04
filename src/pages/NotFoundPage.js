import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFoundPage.css';

/**
 * Компонент NotFoundPage для Telegram Mini App
 * Отображается при переходе на несуществующий маршрут
 */
const NotFoundPage = () => {
  // Обработка Telegram функциональности только если она доступна
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      // Скрываем основную кнопку, если она доступна
      if (tg.MainButton && tg.MainButton.isVisible) {
        tg.MainButton.hide();
      }
      
      // Скрываем кнопку "Назад", если она доступна
      if (tg.BackButton && tg.BackButton.isVisible) {
        tg.BackButton.hide();
      }
    }
  }, []);

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-icon">
          <span className="material-icons">search_off</span>
        </div>
        <h1>404</h1>
        <h2>Страница не найдена</h2>
        <p>
          Запрашиваемая страница не существует или была перемещена.
        </p>
        <Link to="/" className="btn btn-primary">
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage; 