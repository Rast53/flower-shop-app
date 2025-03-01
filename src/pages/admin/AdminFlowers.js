import React, { useEffect, useState } from 'react';
import { useTelegram } from '../../hooks/useTelegram';
import '../../styles/AdminFlowers.css';

/**
 * Компонент AdminFlowers для Telegram Mini App
 * Управление каталогом цветов
 */
const AdminFlowers = () => {
  const { tg, hideMainButton } = useTelegram();
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Скрываем основную кнопку Telegram и загружаем данные
  useEffect(() => {
    if (tg) {
      hideMainButton();
    }

    // Имитация загрузки данных
    const loadFlowers = setTimeout(() => {
      setFlowers([
        {
          id: 1,
          name: 'Букет "Весеннее настроение"',
          price: 3200,
          category: 'Розы',
          inStock: true,
          imageUrl: '/images/flower1.jpg'
        },
        {
          id: 2,
          name: 'Композиция "Нежность"',
          price: 2800,
          category: 'Композиции',
          inStock: true,
          imageUrl: '/images/flower2.jpg'
        },
        {
          id: 3,
          name: 'Букет роз "Классика"',
          price: 4500,
          category: 'Розы',
          inStock: true,
          imageUrl: '/images/flower3.jpg'
        },
        {
          id: 4,
          name: 'Букет "Солнечный день"',
          price: 3000,
          category: 'Тюльпаны',
          inStock: true,
          imageUrl: '/images/flower4.jpg'
        },
        {
          id: 5,
          name: 'Корзина "Лето"',
          price: 5200,
          category: 'Корзины',
          inStock: false,
          imageUrl: '/images/flower5.jpg'
        }
      ]);
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(loadFlowers);
  }, [tg, hideMainButton]);

  // Обработка изменения поискового запроса
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Фильтрация цветов по поисковому запросу
  const filteredFlowers = flowers.filter(flower => 
    flower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flower.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Если данные загружаются, показываем индикатор загрузки
  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loader"></div>
        <p>Загрузка каталога цветов...</p>
      </div>
    );
  }

  return (
    <div className="admin-flowers">
      <div className="admin-header">
        <h1>Управление цветами</h1>
        <button className="btn btn-primary">
          <span className="material-icons">add</span> Добавить цветок
        </button>
      </div>
      
      <div className="admin-tools">
        <div className="search-box">
          <span className="material-icons">search</span>
          <input
            type="text"
            placeholder="Поиск по названию или категории..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="filter-options">
          <select defaultValue="">
            <option value="">Все категории</option>
            <option value="roses">Розы</option>
            <option value="compositions">Композиции</option>
            <option value="tulips">Тюльпаны</option>
            <option value="baskets">Корзины</option>
          </select>
          
          <select defaultValue="all">
            <option value="all">Все товары</option>
            <option value="in-stock">В наличии</option>
            <option value="out-of-stock">Нет в наличии</option>
          </select>
        </div>
      </div>
      
      <div className="flowers-table-container">
        <table className="flowers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Изображение</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Цена</th>
              <th>Наличие</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredFlowers.length > 0 ? (
              filteredFlowers.map(flower => (
                <tr key={flower.id}>
                  <td>{flower.id}</td>
                  <td>
                    <div className="flower-thumbnail">
                      <img 
                        src={flower.imageUrl || '/images/flower-placeholder.jpg'} 
                        alt={flower.name} 
                      />
                    </div>
                  </td>
                  <td>{flower.name}</td>
                  <td>{flower.category}</td>
                  <td>{flower.price.toLocaleString()} ₽</td>
                  <td>
                    <span className={`status-badge ${flower.inStock ? 'in-stock' : 'out-of-stock'}`}>
                      {flower.inStock ? 'В наличии' : 'Нет в наличии'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit-btn" title="Редактировать">
                        <span className="material-icons">edit</span>
                      </button>
                      <button className="action-btn delete-btn" title="Удалить">
                        <span className="material-icons">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-results">
                  <span className="material-icons">search_off</span>
                  <p>Цветы не найдены. Попробуйте изменить параметры поиска.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="pagination">
        <button className="pagination-btn" disabled>
          <span className="material-icons">chevron_left</span>
        </button>
        <div className="pagination-numbers">
          <button className="pagination-number active">1</button>
          <button className="pagination-number">2</button>
          <button className="pagination-number">3</button>
        </div>
        <button className="pagination-btn">
          <span className="material-icons">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

export default AdminFlowers; 