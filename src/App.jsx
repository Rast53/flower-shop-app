import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrdersHistoryPage from './pages/OrdersHistoryPage';
import NotFoundPage from './pages/NotFoundPage';
// Импорт страниц администратора
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFlowers from './pages/admin/AdminFlowers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';
import AdminUsers from './pages/admin/AdminUsers';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            {/* Основные страницы */}
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<OrdersHistoryPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Страницы администратора */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/flowers" element={<AdminFlowers />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            
            {/* Страница 404 - должна быть последней */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
