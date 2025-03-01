import axios from 'axios';

// Определяем базовый URL для API в зависимости от окружения
const baseURL = process.env.NODE_ENV === 'production' 
  ? '/api'  // В продакшен используем относительный путь (проксируется через NGINX)
  : 'http://localhost:3000/api';  // Для разработки используем прямой URL

// Создаем экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если ошибка 401 (Unauthorized), выполняем выход
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Если страница не авторизация, перенаправляем на нее
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

// API для работы с цветами
export const flowerApi = {
  // Получить все цветы
  getAll: (categoryId = null) => {
    const params = categoryId ? { category_id: categoryId } : {};
    return api.get('/flowers', { params });
  },

  // Получить цветок по ID
  getById: (id) => api.get(`/flowers/${id}`),

  // Создать новый цветок (только для админа)
  create: (data) => api.post('/flowers', data),

  // Обновить цветок (только для админа)
  update: (id, data) => api.put(`/flowers/${id}`, data),

  // Удалить цветок (только для админа)
  delete: (id) => api.delete(`/flowers/${id}`),
};

// API для работы с категориями
export const categoryApi = {
  // Получить все категории
  getAll: () => api.get('/categories'),

  // Получить категорию по ID
  getById: (id) => api.get(`/categories/${id}`),

  // Создать новую категорию (только для админа)
  create: (data) => api.post('/categories', data),

  // Обновить категорию (только для админа)
  update: (id, data) => api.put(`/categories/${id}`, data),

  // Удалить категорию (только для админа)
  delete: (id) => api.delete(`/categories/${id}`),
};

// API для работы с заказами
export const orderApi = {
  // Создать новый заказ
  create: (data) => api.post('/orders', data),

  // Получить заказы пользователя (требуется авторизация)
  getUserOrders: () => api.get('/orders/user'),

  // Получить все заказы (только для админа)
  getAll: (status = null) => {
    const params = status ? { status } : {};
    return api.get('/orders', { params });
  },

  // Получить заказ по ID (только для админа)
  getById: (id) => api.get(`/orders/${id}`),

  // Обновить статус заказа (только для админа)
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),

  // Удалить заказ (только для админа)
  delete: (id) => api.delete(`/orders/${id}`),
};

// API для аутентификации и пользователей
export const authApi = {
  // Регистрация
  register: (data) => api.post('/auth/register', data),

  // Вход
  login: (data) => api.post('/auth/login', data),

  // Получить данные текущего пользователя (требуется авторизация)
  getMe: () => api.get('/auth/me'),

  // Обновить профиль пользователя (требуется авторизация)
  updateProfile: (data) => api.put('/auth/me', data),

  // Верификация Telegram пользователя
  verifyTelegram: (data) => api.post('/auth/verify-telegram', data),
};

export default {
  flower: flowerApi,
  category: categoryApi,
  order: orderApi,
  auth: authApi,
};