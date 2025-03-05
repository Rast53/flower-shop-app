import axios from 'axios';

// Базовый URL API
const API_BASE_URL = 'https://ra.nov.ru/api';

// Создаем экземпляр axios с настройками
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Автоматическая передача кук
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Добавляем перехватчик запросов для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    // Всегда получаем токен из localStorage (может быть обновлен)
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Добавляем отладочную информацию
    console.log('API Request:', { 
      url: config.url, 
      method: config.method,
      hasToken: !!token,
      headers: config.headers
    });
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Добавляем перехватчик ответов для обработки общих ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Обработка ошибки 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      console.warn('Ошибка авторизации 401: Перенаправляем на страницу входа');
      
      // Удаляем токен при ошибке авторизации
      localStorage.removeItem('authToken');
      localStorage.removeItem('user_is_admin');
      
      // Удаляем заголовок авторизации
      delete api.defaults.headers.common['Authorization'];
      
      // Перенаправляем на страницу входа
      // Проверяем URL, чтобы определить, куда перенаправлять - на админский вход или обычный
      const isAdminUrl = window.location.pathname.startsWith('/admin');
      const loginUrl = isAdminUrl ? '/admin/login' : '/login';
      
      // Используем setTimeout, чтобы перенаправление произошло после завершения текущей операции
      setTimeout(() => {
        window.location.href = loginUrl;
      }, 100);
    }
    
    // Логирование ошибок
    console.error('API Error:', error.response?.status, error.message);
    
    return Promise.reject(error);
  }
);

// Методы API для аутентификации
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  logout: () => api.post('/auth/logout'),
  validateToken: () => api.get('/auth/me'),
  telegramAuth: (telegramData) => api.post('/auth/telegram', telegramData)
};

// Методы API для категорий
export const categoryApi = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`)
};

// Методы API для цветов
export const flowerApi = {
  getAll: (params) => api.get('/flowers', { params }),
  getById: (id) => api.get(`/flowers/${id}`),
  create: (data) => api.post('/flowers', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  update: (id, data) => api.put(`/flowers/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  delete: (id) => api.delete(`/flowers/${id}`)
};

// Обратная совместимость
export const apiEndpoints = {
  categories: categoryApi,
  flowers: flowerApi,
  auth: authApi
};

// Для удобства использования
api.auth = authApi;
api.categories = categoryApi;
api.flowers = flowerApi;

// Оставим default export для основного использования
export default api;