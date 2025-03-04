import React, { useEffect } from 'react';
import '../styles/DeliveryPage.css';

/**
 * Компонент DeliveryPage для страницы "Доставка"
 * Отображает информацию о способах доставки
 */
const DeliveryPage = () => {
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
    <div className="delivery-page">
      <div className="container">
        <h1 className="page-title">Доставка</h1>
        
        <section className="delivery-section">
          <h2>Способы доставки</h2>
          
          <div className="delivery-card">
            <div className="delivery-icon">🚚</div>
            <div className="delivery-content">
              <h3>Курьерская доставка</h3>
              <p>
                Мы доставляем букеты по Москве и Московской области собственной службой доставки. 
                Наши курьеры бережно обращаются с букетами и доставляют их в назначенное время.
              </p>
              <div className="delivery-details">
                <p><strong>Стоимость:</strong> 300 ₽ по Москве в пределах МКАД</p>
                <p><strong>Сроки:</strong> в течение 2-3 часов с момента оформления заказа</p>
              </div>
            </div>
          </div>
          
          <div className="delivery-card">
            <div className="delivery-icon">🏬</div>
            <div className="delivery-content">
              <h3>Самовывоз</h3>
              <p>
                Вы можете самостоятельно забрать ваш заказ из нашего магазина. 
                При самовывозе вы можете убедиться в качестве букета перед его получением.
              </p>
              <div className="delivery-details">
                <p><strong>Стоимость:</strong> Бесплатно</p>
                <p><strong>Адрес:</strong> г. Москва, ул. Цветочная, 123</p>
                <p><strong>Время работы:</strong> 10:00-20:00 без выходных</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="delivery-section">
          <h2>Зоны доставки</h2>
          <div className="delivery-zone-info">
            <div className="zone-item">
              <h3>Москва (в пределах МКАД)</h3>
              <p><strong>Стоимость:</strong> 300 ₽</p>
              <p><strong>Время доставки:</strong> 2-3 часа</p>
            </div>
            
            <div className="zone-item">
              <h3>Московская область (до 10 км от МКАД)</h3>
              <p><strong>Стоимость:</strong> 500 ₽</p>
              <p><strong>Время доставки:</strong> 3-4 часа</p>
            </div>
            
            <div className="zone-item">
              <h3>Московская область (от 10 до 30 км от МКАД)</h3>
              <p><strong>Стоимость:</strong> 800 ₽</p>
              <p><strong>Время доставки:</strong> 4-5 часов</p>
            </div>
          </div>
        </section>
        
        <section className="delivery-section">
          <h2>Важная информация</h2>
          <ul className="delivery-notes">
            <li>
              Доставка осуществляется ежедневно с 9:00 до 21:00.
            </li>
            <li>
              При оформлении заказа укажите точный адрес и контактный телефон.
            </li>
            <li>
              Курьер свяжется с вами за 30-60 минут до доставки.
            </li>
            <li>
              Возможна доставка в точное время (интервал 1 час) с дополнительной оплатой 200 ₽.
            </li>
            <li>
              Срочная доставка в течение 1 часа - 500 ₽ (только по Москве в пределах МКАД).
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default DeliveryPage; 