import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Провайдеры контекста
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Компоненты
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Страницы
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import OrdersHistoryPage from './pages/OrdersHistoryPage';
import AboutPage from './pages/AboutPage';
import ContactsPage from './pages/ContactsPage';
import DeliveryPage from './pages/DeliveryPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFlowers from './pages/admin/AdminFlowers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import NotFoundPage from './pages/NotFoundPage';

// Стили
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                {/* Публичные маршруты */}
                <Route path="/" element={<HomePage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/catalog/:category" element={<CatalogPage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                
                {/* Информационные страницы */}
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contacts" element={<ContactsPage />} />
                <Route path="/delivery" element={<DeliveryPage />} />
                
                {/* Защищенные маршруты для авторизованных пользователей */}
                <Route path="/checkout" element={
                  <PrivateRoute>
                    <CheckoutPage />
                  </PrivateRoute>
                } />
                <Route path="/order-success" element={
                  <PrivateRoute>
                    <OrderSuccessPage />
                  </PrivateRoute>
                } />
                <Route path="/profile" element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                } />
                <Route path="/orders" element={
                  <PrivateRoute>
                    <OrdersHistoryPage />
                  </PrivateRoute>
                } />
                
                {/* Защищенные маршруты для администраторов */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/products" element={
                  <AdminRoute>
                    <AdminFlowers />
                  </AdminRoute>
                } />
                <Route path="/admin/orders" element={
                  <AdminRoute>
                    <AdminOrders />
                  </AdminRoute>
                } />
                <Route path="/admin/users" element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                } />
                
                {/* Обработка несуществующих маршрутов */}
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;