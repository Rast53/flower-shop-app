import React from 'react';
import { Link } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import '../styles/NotFoundPage.css';

/**
 * Компонент NotFoundPage для Telegram Mini App
 * Отображается при переходе на несуществующий маршрут
 */
const NotFoundPage = () => {
  const { hideMainButton, hideBackButton } = useTelegram();
  
  // Скрываем кнопки Telegram при монтировании компонента
  React.useEffect(() => {
    hideMainButton();
    hideBackButton();
  }, [hideMainButton, hideBackButton]);

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