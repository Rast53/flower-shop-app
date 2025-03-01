import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { flowerApi } from '../services/api';
import { useCart } from '../hooks/useCart';
import '../styles/ProductPage.css';

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const [flower, setFlower] = useState(null);
  const [category, setCategory] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedFlowers, setRelatedFlowers] = useState([]);

  useEffect(() => {
    const fetchFlower = async () => {
      try {
        setLoading(true);
        
        // Получаем данные о цветке
        const response = await flowerApi.getById(id);
        setFlower(response.data);
        
        // Если есть категория, получаем данные о ней
        if (response.data.category_id) {
          const categoryResponse = await fetch(`/api/categories/${response.data.category_id}`);
          const categoryData = await categoryResponse.json();
          setCategory(categoryData);
          
          // Получаем связанные цветы из той же категории
          const relatedResponse = await flowerApi.getAll(response.data.category_id);
          
          // Исключаем текущий цветок из списка связанных и ограничиваем 4 элементами
          const filtered = relatedResponse.data
            .filter(item => item.id !== parseInt(id))
            .slice(0, 4);
            
          setRelatedFlowers(filtered);
        }
        
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке данных о цветке:', err);
        setError('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlower();
  }, [id]);

  // Увеличение количества
  const incrementQuantity = () => {
    if (flower && quantity < flower.stock_quantity) {
      setQuantity(prevQuantity => prevQuantity + 1);
    }
  };

  // Уменьшение количества
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };

  // Обработчик изменения количества
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && flower && value <= flower.stock_quantity) {
      setQuantity(value);
    }
  };

  // Добавление товара в корзину
  const handleAddToCart = () => {
    if (flower) {
      addToCart(flower, quantity);
      // Можно добавить уведомление о добавлении товара в корзину
    }
  };

  // Обработчик кнопки "Купить сейчас"
  const handleBuyNow = () => {
    if (flower) {
      addToCart(flower, quantity);
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Загрузка информации о товаре...</p>
      </div>
    );
  }

  if (error || !flower) {
    return (
      <div className="error-container">
        <p className="error-message">{error || 'Товар не найден'}</p>
        <Link to="/catalog" className="btn btn-primary">
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="product-page">
      <div className="breadcrumbs">
        <Link to="/">Главная</Link> &gt; 
        <Link to="/catalog">Каталог</Link> &gt; 
        {category && <Link to={`/catalog/${category.id}`}>{category.name}</Link>} &gt; 
        <span>{flower.name}</span>
      </div>
      
      <div className="product-container">
        <div className="product-gallery">
          <div className="main-image">
            <img src={flower.image_url || '/images/flower-placeholder.jpg'} alt={flower.name} />
          </div>
        </div>
        
        <div className="product-info">
          <h1 className="product-title">{flower.name}</h1>
          
          <div className="product-meta">
            {category && (
              <div className="product-category">
                Категория: <Link to={`/catalog/${category.id}`}>{category.name}</Link>
              </div>
            )}
            <div className="product-id">
              Артикул: {flower.id}
            </div>
          </div>
          
          <div className="product-price">
            {flower.price} ₽
          </div>
          
          <div className="product-stock">
            <span className={`stock-status ${flower.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {flower.stock_quantity > 0 ? 'В наличии' : 'Нет в наличии'}
            </span>
            {flower.stock_quantity > 0 && <span className="stock-quantity">({flower.stock_quantity} шт.)</span>}
          </div>
          
          <div className="product-description">
            <h3>Описание</h3>
            <p>{flower.description || 'Описание отсутствует'}</p>
          </div>
          
          {flower.stock_quantity > 0 && (
            <div className="product-actions">
              <div className="quantity-controls">
                <button 
                  className="quantity-btn decrement" 
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input 
                  type="number" 
                  min="1" 
                  max={flower.stock_quantity} 
                  value={quantity} 
                  onChange={handleQuantityChange}
                  className="quantity-input"
                />
                <button 
                  className="quantity-btn increment" 
                  onClick={incrementQuantity}
                  disabled={quantity >= flower.stock_quantity}
                >
                  +
                </button>
              </div>
              
              <div className="action-buttons">
                <button 
                  className="btn btn-primary"
                  onClick={handleAddToCart}
                >
                  Добавить в корзину
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={handleBuyNow}
                >
                  Купить сейчас
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {relatedFlowers.length > 0 && (
        <div className="related-products">
          <h2>Похожие товары</h2>
          <div className="related-products-grid">
            {relatedFlowers.map(relatedFlower => (
              <div key={relatedFlower.id} className="related-product-card">
                <Link to={`/product/${relatedFlower.id}`} className="related-product-image">
                  <img src={relatedFlower.image_url || '/images/flower-placeholder.jpg'} alt={relatedFlower.name} />
                </Link>
                <div className="related-product-details">
                  <h3>
                    <Link to={`/product/${relatedFlower.id}`}>{relatedFlower.name}</Link>
                  </h3>
                  <p className="related-product-price">{relatedFlower.price} ₽</p>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => addToCart(relatedFlower, 1)}
                  >
                    В корзину
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;