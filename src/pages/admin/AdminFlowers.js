import React, { useEffect, useState } from 'react';
import { useTelegram } from '../../hooks/useTelegram';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatImageUrl, handleImageError } from '../../utils/imageUtils';
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
      console.log('Начинаем загрузку данных цветов...');
      setLoading(true);
      
      // Проверяем токен авторизации
      const token = localStorage.getItem('authToken');
      const isAdminFlag = localStorage.getItem('user_is_admin');
      
      console.log('Текущий статус авторизации:', { 
        token: token ? 'Присутствует' : 'Отсутствует',
        isAdmin: isAdminFlag
      });
      
      if (!token) {
        console.error('Токен авторизации отсутствует. Перенаправляем на страницу входа.');
        navigate('/admin/login');
        return;
      }
      
      // Загрузка цветов с подробным логированием
      console.log('Запрос на получение цветов с параметрами:', {
        page: currentPage,
        category_id: categoryFilter || undefined,
        is_available: stockFilter !== 'all' ? stockFilter === 'in-stock' : undefined
      });
      
      const response = await api.flowers.getAll({
        page: currentPage,
        category_id: categoryFilter || undefined,
        is_available: stockFilter !== 'all' ? stockFilter === 'in-stock' : undefined
      });
      
      console.log('Получен ответ от API:', response);
      
      // Определяем правильную структуру ответа для цветов
      let flowersData = null;
      let paginationData = null;
      
      if (response.data && response.data.data && response.data.data.flowers) {
        // Формат: { data: { data: { flowers: [...], pagination: {...} } } }
        console.log('Формат цветов: вложенные объекты');
        flowersData = response.data.data.flowers;
        paginationData = response.data.data.pagination;
      } else if (response.data && Array.isArray(response.data.data)) {
        // Формат: { data: [...цветы] }
        console.log('Формат цветов: массив в data');
        flowersData = response.data.data;
        paginationData = response.data.pagination;
      } else if (response.data && Array.isArray(response.data)) {
        // Формат: прямой массив
        console.log('Формат цветов: прямой массив');
        flowersData = response.data;
      } else if (response.data && response.data.flowers) {
        // Формат: { data: { flowers: [...] } }
        console.log('Формат цветов: объект с flowers');
        flowersData = response.data.flowers;
        paginationData = response.data.pagination;
      }
      
      if (flowersData && Array.isArray(flowersData)) {
        console.log('Получены данные о цветах:', flowersData.length);
        setFlowers(flowersData);
        if (paginationData) {
          setTotalPages(paginationData.totalPages || 1);
        } else {
          // Если нет данных о пагинации, устанавливаем 1 страницу
          setTotalPages(1);
          console.log('Данные о пагинации отсутствуют, установлена 1 страница');
        }
      } else {
        console.warn('Неверный формат данных в ответе API:', response.data);
      }
      
      // Загрузка категорий для фильтра
      if (categories.length === 0) {
        console.log('Загружаем категории...');
        const categoriesResponse = await api.categories.getAll();
        console.log('Ответ с категориями:', categoriesResponse);
        
        // Определяем правильную структуру ответа
        // Проверяем все возможные форматы ответа
        let categoriesData = null;
        
        if (categoriesResponse.data && Array.isArray(categoriesResponse.data.data)) {
          // Формат: { data: [...категории] }
          console.log('Формат категорий: массив в data');
          categoriesData = categoriesResponse.data.data;
        } else if (categoriesResponse.data && categoriesResponse.data.data && categoriesResponse.data.data.categories) {
          // Формат: { data: { data: { categories: [...] } } }
          console.log('Формат категорий: вложенные объекты');
          categoriesData = categoriesResponse.data.data.categories;
        } else if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
          // Формат: прямой массив в data
          console.log('Формат категорий: прямой массив');
          categoriesData = categoriesResponse.data;
        }
        
        if (categoriesData && Array.isArray(categoriesData)) {
          console.log('Получены категории:', categoriesData.length);
          setCategories(categoriesData);
        } else {
          console.warn('Неверный формат данных категорий:', categoriesResponse.data);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      
      // Проверяем, связана ли ошибка с авторизацией
      if (error.response && error.response.status === 401) {
        console.error('Ошибка авторизации (401). Перенаправляем на страницу входа.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user_is_admin');
        navigate('/admin/login');
      }
      
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
    try {
      console.log('AdminFlowers: Переход к редактированию цветка с ID:', id);
      
      // Проверяем токен перед редактированием
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('AdminFlowers: Отсутствует токен авторизации для редактирования');
        alert('Ошибка авторизации. Пожалуйста, войдите снова.');
        navigate('/admin/login');
        return;
      }
      
      // Предварительно проверяем, что цветок существует
      const flower = flowers.find(f => f.id === id);
      if (!flower) {
        console.error('AdminFlowers: Цветок с ID', id, 'не найден в списке');
        alert('Цветок не найден. Возможно, он был удален.');
        return;
      }
      
      // Переход на страницу редактирования
      navigate(`/admin/flowers/edit/${id}`);
    } catch (error) {
      console.error('AdminFlowers: Ошибка при переходе к редактированию цветка:', error);
      alert('Произошла ошибка. Пожалуйста, попробуйте снова.');
    }
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
                  <td className="flower-image-cell">
                    <img 
                      src={formatImageUrl(flower.image_url)} 
                      alt={flower.name}
                      onError={handleImageError}
                      className="flower-thumbnail-img"
                    />
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