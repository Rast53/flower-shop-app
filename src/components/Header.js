import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import api, { categoryApi } from '../services/api';
import '../styles/Header.css';

const Header = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { totalItems } = useCart();
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();

  // Получаем категории при загрузке компонента
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await categoryApi.getAll();
        console.log('Ответ API:', response.data);
        setCategories(response.data.data.categories || []);
      } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
      }
    }
    
    fetchCategories();
  }, []);

  // Обработчик выхода из аккаунта
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Переключатель мобильного меню
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    // Закрываем активное выпадающее меню при переключении главного меню
    setActiveDropdown(null);
  };

  // Обработчик для переключения выпадающего меню
  const toggleDropdown = (dropdownName) => {
    if (activeDropdown === dropdownName) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdownName);
    }
  };

  // Закрытие всех меню при клике вне их
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <Link to="/">
            <h1>Цветочный Магазин</h1>
          </Link>
        </div>

        {/* Кнопка мобильного меню */}
        <button className="mobile-menu-button" onClick={toggleMenu}>
          <span className="menu-icon"></span>
        </button>

        {/* Навигация */}
        <nav className={`header-nav ${menuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            <li>
              <Link to="/" onClick={() => setMenuOpen(false)}>Главная</Link>
            </li>
            <li className={`dropdown ${activeDropdown === 'catalog' ? 'active' : ''}`}>
              <span 
                className="dropdown-toggle" 
                onClick={() => toggleDropdown('catalog')}
              >
                Каталог
              </span>
              <ul className={`dropdown-menu ${activeDropdown === 'catalog' ? 'show' : ''}`}>
                <li>
                  <Link to="/catalog" onClick={() => {
                    setMenuOpen(false);
                    setActiveDropdown(null);
                  }}>
                    Все цветы
                  </Link>
                </li>
                {Array.isArray(categories) && categories.map((category) => (
                  <li key={category.id}>
                    <Link 
                      to={`/catalog/${category.id}`}
                      onClick={() => {
                        setMenuOpen(false);
                        setActiveDropdown(null);
                      }}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            {isAdmin && (
              <li className={`dropdown ${activeDropdown === 'admin' ? 'active' : ''}`}>
                <span 
                  className="dropdown-toggle" 
                  onClick={() => toggleDropdown('admin')}
                >
                  Админ
                </span>
                <ul className={`dropdown-menu ${activeDropdown === 'admin' ? 'show' : ''}`}>
                  <li>
                    <Link to="/admin" onClick={() => {
                      setMenuOpen(false);
                      setActiveDropdown(null);
                    }}>
                      Панель
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/flowers" onClick={() => {
                      setMenuOpen(false);
                      setActiveDropdown(null);
                    }}>
                      Цветы
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/categories" onClick={() => {
                      setMenuOpen(false);
                      setActiveDropdown(null);
                    }}>
                      Категории
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/orders" onClick={() => {
                      setMenuOpen(false);
                      setActiveDropdown(null);
                    }}>
                      Заказы
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/users" onClick={() => {
                      setMenuOpen(false);
                      setActiveDropdown(null);
                    }}>
                      Пользователи
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>

          {/* Пользовательское меню */}
          <div className="user-menu">
            <Link to="/cart" className="cart-icon" onClick={() => setMenuOpen(false)}>
              <span className="material-icons">shopping_cart</span>
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>
            
            {isAuthenticated ? (
              <div className={`dropdown ${activeDropdown === 'user' ? 'active' : ''}`}>
                <span 
                  className="dropdown-toggle user-toggle"
                  onClick={() => toggleDropdown('user')}
                >
                  <span className="material-icons">account_circle</span>
                  <span className="user-name">{user?.username || 'Пользователь'}</span>
                </span>
                <ul className={`dropdown-menu ${activeDropdown === 'user' ? 'show' : ''}`}>
                  <li>
                    <Link to="/profile" onClick={() => {
                      setMenuOpen(false);
                      setActiveDropdown(null);
                    }}>
                      Профиль
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" onClick={() => {
                      setMenuOpen(false);
                      setActiveDropdown(null);
                    }}>
                      Мои заказы
                    </Link>
                  </li>
                  <li>
                    <button onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                      setActiveDropdown(null);
                    }} className="logout-button">
                      Выйти
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" onClick={() => setMenuOpen(false)}>Вход</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}>Регистрация</Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;