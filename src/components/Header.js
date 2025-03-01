import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { categoryApi } from '../services/api';
import '../styles/Header.css';

const Header = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { totalItems } = useCart();
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Получаем категории при загрузке компонента
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        setCategories(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
      }
    };

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
  };

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
            <li className="dropdown">
              <span className="dropdown-toggle">Каталог</span>
              <ul className="dropdown-menu">
                <li>
                  <Link to="/catalog" onClick={() => setMenuOpen(false)}>
                    Все цветы
                  </Link>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link 
                      to={`/catalog/${category.id}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            {isAdmin && (
              <li className="dropdown">
                <span className="dropdown-toggle">Админ</span>
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/admin" onClick={() => setMenuOpen(false)}>
                      Панель
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/flowers" onClick={() => setMenuOpen(false)}>
                      Цветы
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/categories" onClick={() => setMenuOpen(false)}>
                      Категории
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/orders" onClick={() => setMenuOpen(false)}>
                      Заказы
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
              <div className="dropdown">
                <span className="dropdown-toggle user-toggle">
                  <span className="material-icons">account_circle</span>
                  <span className="user-name">{user?.name || 'Пользователь'}</span>
                </span>
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/profile" onClick={() => setMenuOpen(false)}>
                      Профиль
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" onClick={() => setMenuOpen(false)}>
                      Мои заказы
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="logout-button">
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