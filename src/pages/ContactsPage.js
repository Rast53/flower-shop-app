import React, { useEffect } from 'react';
import '../styles/ContactsPage.css';

/**
 * Компонент ContactsPage для страницы "Контакты"
 * Отображает контактную информацию магазина
 */
const ContactsPage = () => {
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
    <div className="contacts-page">
      <div className="container">
        <h1 className="page-title">Контакты</h1>
        
        <section className="contact-info-section">
          <div className="contact-card">
            <div className="contact-icon">📞</div>
            <h3>Телефон</h3>
            <p>
              <a href="tel:+74951234567">+7 (495) 123-45-67</a>
            </p>
            <p className="contact-note">
              Ежедневно с 9:00 до 21:00
            </p>
          </div>
          
          <div className="contact-card">
            <div className="contact-icon">✉️</div>
            <h3>Email</h3>
            <p>
              <a href="mailto:info@flowerstore.ru">info@flowerstore.ru</a>
            </p>
            <p className="contact-note">
              Время ответа: до 24 часов
            </p>
          </div>
          
          <div className="contact-card">
            <div className="contact-icon">🏠</div>
            <h3>Адрес</h3>
            <p>
              г. Москва, ул. Цветочная, 123
            </p>
            <p className="contact-note">
              Ежедневно с 10:00 до 20:00
            </p>
          </div>
        </section>
        
        <section className="contact-form-section">
          <h2>Напишите нам</h2>
          <form className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Ваше имя*</label>
              <input type="text" id="name" name="name" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email*</label>
              <input type="email" id="email" name="email" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Тема сообщения</label>
              <input type="text" id="subject" name="subject" />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Сообщение*</label>
              <textarea id="message" name="message" rows="5" required></textarea>
            </div>
            
            <button type="submit" className="btn btn-primary">Отправить</button>
          </form>
        </section>
        
        <section className="map-section">
          <h2>Как нас найти</h2>
          <div className="map-placeholder">
            {/* Здесь будет интегрирована карта */}
            <div className="map-info">
              <p><strong>Адрес:</strong> г. Москва, ул. Цветочная, 123</p>
              <p><strong>Станция метро:</strong> Цветочная (500м)</p>
              <p><strong>Часы работы:</strong> 10:00-20:00 без выходных</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactsPage; 