import React, { useEffect, useState } from 'react';
import { useTelegram } from '../../hooks/useTelegram';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/AdminFlowers.css';

/**
 * Компонент AdminFlowers для Telegram Mini App
 * Управление каталогом цветов
 */
const AdminFlowers = () => {
  const { tg, hideMainButton } = useTelegram();
  const [flowers, setFlowers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingFlower, setEditingFlower] = useState(null);
  const navigate = useNavigate();

  // Скрываем основную кнопку Telegram и загружаем данные
  useEffect(() => {
    if (tg) {
      hideMainButton();
    }
    
    loadData();
  }, [tg, hideMainButton, currentPage, categoryFilter, stockFilter]);

  // Загрузка данных с сервера
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Загрузка цветов
      const response = await api.flowers.getAll({
        page: currentPage,
        category_id: categoryFilter || undefined,
        is_available: stockFilter !== 'all' ? stockFilter === 'in-stock' : undefined
      });
      
      if (response.data && response.data.data && response.data.data.flowers) {
        setFlowers(response.data.data.flowers);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      }
      
      // Загрузка категорий для фильтра
      if (categories.length === 0) {
        const categoriesResponse = await api.categories.getAll();
        if (categoriesResponse.data && categoriesResponse.data.data && categoriesResponse.data.data.categories) {
          setCategories(categoriesResponse.data.data.categories);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setLoading(false);
    }
  };

  // Обработка изменения поискового запроса
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Обработка изменения фильтра категорий
  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1); // Сброс страницы при изменении фильтра
  };

  // Обработка изменения фильтра наличия
  const handleStockFilterChange = (e) => {
    setStockFilter(e.target.value);
    setCurrentPage(1); // Сброс страницы при изменении фильтра
  };

  // Переход к странице добавления нового цветка
  const handleAddFlower = () => {
    navigate('/admin/flowers/add');
  };

  // Переход к странице редактирования цветка
  const handleEditFlower = (id) => {
    navigate(`/admin/flowers/edit/${id}`);
  };

  // Обработка удаления цветка
  const handleDeleteFlower = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот цветок?')) {
      try {
        await api.flowers.delete(id);
        loadData(); // Перезагрузка данных после удаления
      } catch (error) {
        console.error('Ошибка при удалении цветка:', error);
        alert('Не удалось удалить цветок. Пожалуйста, попробуйте еще раз.');
      }
    }
  };

  // Фильтрация цветов по поисковому запросу
  const filteredFlowers = flowers.filter(flower => 
    flower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (flower.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Переход на следующую страницу
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Переход на предыдущую страницу
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Переход на конкретную страницу
  const goToPage = (page) => {
    setCurrentPage(page);
  };

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
        <button className="btn btn-primary" onClick={handleAddFlower}>
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
          <select 
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
          >
            <option value="">Все категории</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          
          <select 
            value={stockFilter}
            onChange={handleStockFilterChange}
          >
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
                        src={flower.image_url || '/images/flower-placeholder.jpg'} 
                        alt={flower.name} 
                      />
                    </div>
                  </td>
                  <td>{flower.name}</td>
                  <td>{flower.category?.name || 'Без категории'}</td>
                  <td>{parseFloat(flower.price).toLocaleString()} ₽</td>
                  <td>
                    <span className={`status-badge ${flower.is_available ? 'in-stock' : 'out-of-stock'}`}>
                      {flower.is_available ? 'В наличии' : 'Нет в наличии'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn edit-btn" 
                        title="Редактировать"
                        onClick={() => handleEditFlower(flower.id)}
                      >
                        <span className="material-icons">edit</span>
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        title="Удалить"
                        onClick={() => handleDeleteFlower(flower.id)}
                      >
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
      
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn" 
            disabled={currentPage === 1}
            onClick={prevPage}
          >
            <span className="material-icons">chevron_left</span>
          </button>
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
          <button 
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={nextPage}
          >
            <span className="material-icons">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminFlowers; 