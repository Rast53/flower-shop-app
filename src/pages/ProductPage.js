import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { flowerApi } from '../services/api';
import '../styles/ProductPage.css';

/**
 * Компонент ProductPage - страница с подробной информацией о товаре
 */
const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // Состояние для хранения данных
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Загружаем данные о товаре при монтировании компонента
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        // Получаем информацию о товаре
        const response = await flowerApi.getById(id);
        setProduct(response.data);
        
        // Получаем связанные товары из той же категории
        if (response.data.category_id) {
          const relatedResponse = await flowerApi.getAll({
            category_id: response.data.category_id,
            exclude_id: id,
            limit: 4
          });
          setRelatedProducts(relatedResponse.data);
        }
        
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке товара:', err);
        setError('Не удалось загрузить информацию о товаре. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductData();
  }, [id]);
  
  // Обработчик изменения количества товара
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 99) {
      setQuantity(value);
    }
  };
  
  // Увеличение количества товара
  const incrementQuantity = () => {
    if (quantity < 99) {
      setQuantity(prev => prev + 1);
    }
  };
  
  // Уменьшение количества товара
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  // Добавление товара в корзину
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      
      // Показываем уведомление
      alert(`${quantity} шт. "${product.name}" добавлено в корзину`);
    }
  };
  
  // Если данные загружаются, показываем индикатор загрузки
  if (loading && !product) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Загрузка информации о товаре...</p>
      </div>
    );
  }
  
  // Если произошла ошибка, показываем сообщение
  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="reload-button" onClick={() => window.location.reload()}>
          Попробовать снова
        </button>
      </div>
    );
  }
  
  // Если товар не найден, показываем соответствующее сообщение
  if (!product) {
    return (
      <div className="not-found-container">
        <h2>Товар не найден</h2>
        <p>К сожалению, запрашиваемый вами товар не существует или был удален.</p>
        <Link to="/catalog" className="btn btn-primary">
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="product-page">
      {/* Хлебные крошки */}
      <div className="breadcrumbs">
        <Link to="/">Главная</Link>
        <span className="separator">/</span>
        <Link to="/catalog">Каталог</Link>
        {product.category && (
          <>
            <span className="separator">/</span>
            <Link to={`/catalog/${product.category_id}`}>{product.category.name}</Link>
          </>
        )}
        <span className="separator">/</span>
        <span className="current">{product.name}</span>
      </div>
      
      {/* Основная информация о товаре */}
      <div className="product-details">
        <div className="product-gallery">
          <div className="main-image">
            <img 
              src={product.image_url || '/images/flower-placeholder.jpg'} 
              alt={product.name}
            />
          </div>
        </div>
        
        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-meta">
            {product.in_stock ? (
              <span className="in-stock">В наличии</span>
            ) : (
              <span className="out-of-stock">Нет в наличии</span>
            )}
            
            {product.article && (
              <span className="product-article">Артикул: {product.article}</span>
            )}
          </div>
          
          <div className="product-price">
            {product.price ? product.price.toLocaleString() : '0'} ₽
            {product.old_price && (
              <span className="old-price">{product.old_price.toLocaleString()} ₽</span>
            )}
          </div>
          
          <div className="product-description">
            <p>{product.description}</p>
          </div>
          
          {product.parameters && Object.keys(product.parameters).length > 0 && (
            <div className="product-parameters">
              <h3>Характеристики</h3>
              <ul>
                {Object.entries(product.parameters).map(([key, value]) => (
                  <li key={key}>
                    <span className="parameter-name">{key}:</span>
                    <span className="parameter-value">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Блок с добавлением в корзину */}
          <div className="add-to-cart-block">
            <div className="quantity-control">
              <button 
                className="quantity-btn decrement" 
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                −
              </button>
              <input 
                type="number" 
                value={quantity} 
                onChange={handleQuantityChange}
                min="1" 
                max="99"
              />
              <button 
                className="quantity-btn increment" 
                onClick={incrementQuantity}
                disabled={quantity >= 99}
              >
                +
              </button>
            </div>
            
            <button 
              className="btn btn-primary add-to-cart"
              onClick={handleAddToCart}
              disabled={!product.in_stock}
            >
              {product.in_stock ? 'Добавить в корзину' : 'Товар закончился'}
            </button>
          </div>
          
          {/* Доставка и оплата */}
          <div className="product-delivery-info">
            <h3>Доставка и оплата</h3>
            <ul>
              <li>Доставка по Москве и области в течение 24 часов</li>
              <li>Возможность оплаты онлайн и при получении</li>
              <li>Гарантия свежести цветов до 7 дней</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Связанные товары */}
      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h2>Вам также может понравиться</h2>
          <div className="related-products-grid">
            {relatedProducts.map(related => (
              <div key={related.id} className="related-product-card">
                <Link to={`/product/${related.id}`} className="related-product-image">
                  <img 
                    src={related.image_url || '/images/flower-placeholder.jpg'} 
                    alt={related.name} 
                  />
                </Link>
                <div className="related-product-details">
                  <h3>
                    <Link to={`/product/${related.id}`}>{related.name}</Link>
                  </h3>
                  <div className="related-product-price">
                    {related.price ? related.price.toLocaleString() : '0'} ₽
                  </div>
                  <button 
                    className="btn btn-secondary add-to-cart-sm"
                    onClick={() => {
                      addToCart(related, 1);
                      alert(`"${related.name}" добавлен в корзину`);
                    }}
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