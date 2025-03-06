import React from 'react';
import '../styles/PageLoader.css';

/**
 * Компонент PageLoader - отображает индикатор загрузки на весь экран
 * Используется во время асинхронной загрузки данных
 */
const PageLoader = () => {
  return (
    <div className="page-loader-container">
      <div className="page-loader-spinner"></div>
      <p className="page-loader-text">Загрузка...</p>
    </div>
  );
};

export default PageLoader; 