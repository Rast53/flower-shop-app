import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Цветы в Кембридже</h3>
          <p>Мы предлагаем широкий ассортимент свежих цветов и букетов для любого случая и праздника.</p>
        </div>
        
        <div className="footer-section">
          <h3>Информация</h3>
          <ul className="footer-links">
            <li><Link to="/catalog">Каталог</Link></li>
            <li><Link to="/delivery">Доставка</Link></li>
            <li><Link to="/about">О нас</Link></li>
            <li><Link to="/contacts">Контакты</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Контакты</h3>
          <address>
            <p>г. Москва, ул. Цветочная, 123</p>
            <p>Телефон: <a href="tel:+74951234567">+7 (495) 123-45-67</a></p>
            <p>Email: <a href="mailto:info@flowerstore.ru">info@flowerstore.ru</a></p>
          </address>
        </div>
        
        <div className="footer-section">
          <h3>Мы в социальных сетях</h3>
          <div className="social-links">
            <a href="https://t.me/flowerstore" target="_blank" rel="noopener noreferrer" className="social-link">
              <span className="material-icons">telegram</span>
            </a>
            <a href="https://vk.com/flowerstore" target="_blank" rel="noopener noreferrer" className="social-link">
              <span className="material-icons">public</span>
            </a>
            <a href="https://www.instagram.com/flowerstore" target="_blank" rel="noopener noreferrer" className="social-link">
              <span className="material-icons">photo_camera</span>
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} Цветы в Кембридже. Все права защищены.</p>
        <div className="footer-bottom-links">
          <Link to="/privacy">Политика конфиденциальности</Link>
          <Link to="/terms">Условия использования</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;