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
      
      // Добавляем отладочную информацию
      console.log(`Добавлен токен в запрос: ${config.url}`);
    } else {
      console.warn(`Отсутствует токен для запроса: ${config.url}`);
    }
    
    // Добавляем отладочную информацию
    console.log('API Request:', { 
      url: config.url, 
      method: config.method,
      hasToken: !!token,
      headers: config.headers,
      params: config.params, // Логируем параметры запроса
      data: config.data // Логируем данные для POST запросов
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
  telegramAuth: (telegramData) => api.post('/auth/telegram', telegramData),
  // Добавляем метод getProfile, который использует getMe или запрашивает /auth/profile
  getProfile: async () => {
    try {
      console.log('API: Запрос профиля пользователя');
      
      // Пробуем сначала запросить /auth/profile
      try {
        const response = await api.get('/auth/profile');
        console.log('API: Профиль пользователя получен через /auth/profile');
        return response;
      } catch (profileError) {
        console.log('API: Не удалось получить профиль через /auth/profile, используем /auth/me:', profileError.message);
        
        // Если метод /auth/profile недоступен, используем getMe
        const response = await api.get('/auth/me');
        console.log('API: Профиль пользователя получен через /auth/me');
        return response;
      }
    } catch (error) {
      console.error('API: Ошибка при получении профиля пользователя:', error);
      throw error;
    }
  }
};

// Методы API для категорий
export const categoryApi = {
  getAll: async () => {
    try {
      console.log('API: Запрос всех категорий');
      const response = await api.get('/categories');
      
      // Добавляем логирование для диагностики формата ответа
      console.log('API: Ответ категорий, статус:', response.status);
      
      if (response.data) {
        console.log('API: Структура данных категорий:', Object.keys(response.data));
        
        // Нормализация данных для консистентного формата
        if (response.data.data && Array.isArray(response.data.data)) {
          console.log('API: Формат категорий - data содержит массив');
          // Формат: { data: [...] }
        } else if (Array.isArray(response.data)) {
          console.log('API: Формат категорий - прямой массив');
          // Преобразуем формат { [...] } в { data: [...] } для консистентности
          response.data = { data: response.data, error: null };
        }
      }
      
      return response;
    } catch (error) {
      console.error('API: Ошибка получения категорий:', error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      console.log('API: Запрос категории по ID:', id);
      const response = await api.get(`/categories/${id}`);
      
      // Добавляем логирование для диагностики формата ответа
      console.log(`API: Получен ответ от /categories/${id}, статус:`, response.status);
      
      return response;
    } catch (error) {
      console.error('API: Ошибка получения категории по ID:', error);
      throw error;
    }
  },
  create: async (data) => {
    try {
      console.log('API: Создание категории:', data);
      const response = await api.post('/categories', data);
      
      console.log('API: Ответ при создании категории:', response);
      
      return response;
    } catch (error) {
      console.error('API: Ошибка создания категории:', error);
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      console.log(`API: Обновление категории ${id}:`, data);
      const response = await api.put(`/categories/${id}`, data);
      
      console.log('API: Ответ при обновлении категории:', response);
      
      return response;
    } catch (error) {
      console.error('API: Ошибка обновления категории:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      console.log(`API: Удаление категории ${id}`);
      const response = await api.delete(`/categories/${id}`);
      
      console.log('API: Ответ при удалении категории:', response);
      
      return response;
    } catch (error) {
      console.error('API: Ошибка удаления категории:', error);
      throw error;
    }
  }
};

// Методы API для цветов
export const flowerApi = {
  getAll: async (params) => {
    console.log('API: Запрос цветов с параметрами:', params);
    try {
      const response = await api.get('/flowers', { params });
      
      // Добавляем дополнительное логирование ответа
      console.log(`API: Получен ответ от /flowers, статус: ${response.status}`);
      console.log('API: Заголовки ответа:', response.headers);
      
      // Проверяем, есть ли данные в ответе
      if (response.data) {
        // Подробная информация о структуре данных
        console.log('API: Структура данных в ответе:', typeof response.data);
        if (typeof response.data === 'object') {
          console.log('API: Ключи в объекте ответа:', Object.keys(response.data));
          
          // Нормализация данных для консистентного формата
          if (Array.isArray(response.data)) {
            console.log('API: Формат цветов - прямой массив');
            // Преобразуем формат { [...] } в { data: { flowers: [...] } } для консистентности
            response.data = { 
              data: { 
                flowers: response.data,
                pagination: { totalPages: 1, currentPage: 1, totalItems: response.data.length }
              }, 
              error: null 
            };
          } else if (response.data.data && Array.isArray(response.data.data)) {
            console.log('API: Формат цветов - data содержит массив');
            // Преобразуем формат { data: [...] } в { data: { flowers: [...] } } для консистентности
            response.data = { 
              data: { 
                flowers: response.data.data,
                pagination: response.data.pagination || { totalPages: 1, currentPage: 1, totalItems: response.data.data.length }
              }, 
              error: null 
            };
          } else if (response.data.flowers && Array.isArray(response.data.flowers)) {
            console.log('API: Формат цветов - объект с flowers');
            // Преобразуем формат { flowers: [...] } в { data: { flowers: [...] } } для консистентности
            response.data = { 
              data: { 
                flowers: response.data.flowers,
                pagination: response.data.pagination || { totalPages: 1, currentPage: 1, totalItems: response.data.flowers.length }
              }, 
              error: null 
            };
          }
          
          // Проверяем наличие данных после нормализации
          if (response.data.data && response.data.data.flowers) {
            console.log('API: Количество цветов после нормализации:', response.data.data.flowers.length);
          }
        }
      }
      
      return response;
    } catch (error) {
      console.error('API: Ошибка при получении цветов:', error);
      // Подробная информация об ошибке
      if (error.response) {
        console.error('API: Статус ошибки:', error.response.status);
        console.error('API: Данные ошибки:', error.response.data);
        console.error('API: Заголовки ошибки:', error.response.headers);
      } else if (error.request) {
        console.error('API: Ошибка запроса (нет ответа от сервера):', error.request);
      } else {
        console.error('API: Ошибка настройки запроса:', error.message);
      }
      throw error;
    }
  },
  getById: async (id) => {
    console.log('API: Запрос цветка по ID:', id);
    try {
      // Не проверяем наличие токена для этого запроса
      const response = await api.get(`/flowers/${id}`);
      
      // Полное логирование для отладки
      console.log(`API: Получен ответ от /flowers/${id}, статус:`, response.status);
      console.log('API: Сырой ответ:', response);
      console.log('API: Данные ответа:', response.data);
      
      // Формат ответа сервера: { data: flowerData, error: null }
      // Где flowerData - это модель Flower с включенной моделью Category:
      /*
      flowerData = {
        id: number,
        name: string,
        description: string,
        price: decimal,
        stock_quantity: number,
        image_url: string,
        popularity: number,
        category_id: number,
        is_available: boolean,
        created_at: date,
        updated_at: date,
        category: {
          id: number,
          name: string,
          slug: string
        }
      }
      */
      
      // Проверяем корректность ответа
      if (response.data && response.data.data) {
        // Сервер возвращает цветок в поле data, без вложенности flower
        const flowerData = response.data.data;
        
        // Проверяем наличие ожидаемых полей
        if (flowerData.id && flowerData.name) {
          console.log('API: Цветок успешно получен:', flowerData.name);
          
          // Преобразуем формат для совместимости с остальным кодом: { data: { flower: {...} } }
          response.data = {
            data: {
              flower: flowerData
            },
            error: response.data.error
          };
        } else {
          console.warn('API: В ответе отсутствуют ожидаемые поля цветка');
        }
      } else {
        console.warn('API: Неожиданный формат ответа:', response.data);
      }
      
      return response;
    } catch (error) {
      console.error('API: Ошибка при получении цветка по ID:', error);
      
      // Детальное логирование ошибки для отладки
      if (error.response) {
        console.error('API: Статус ответа с ошибкой:', error.response.status);
        console.error('API: Данные ответа с ошибкой:', error.response.data);
      } else if (error.request) {
        console.error('API: Запрос отправлен, но ответ не получен:', error.request);
      } else {
        console.error('API: Ошибка при создании запроса:', error.message);
      }
      
      throw error;
    }
  },
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

// Методы API для пользователей
export const userApi = {
  getAll: async (params) => {
    try {
      console.log('API: Запрос пользователей с параметрами:', params);
      const response = await api.get('/users', { params });
      
      // Добавляем логирование для диагностики формата ответа
      console.log('API: Ответ пользователей, статус:', response.status);
      
      if (response.data) {
        console.log('API: Структура данных пользователей:', typeof response.data);
        
        // Нормализация данных для консистентного формата
        if (Array.isArray(response.data)) {
          console.log('API: Формат пользователей - прямой массив');
          // Преобразуем формат [...] в { data: { users: [...] } } для консистентности
          response.data = { 
            data: { 
              users: response.data, 
              pagination: { totalPages: 1, currentPage: 1, totalItems: response.data.length } 
            }, 
            error: null 
          };
        } else if (response.data.data && Array.isArray(response.data.data)) {
          console.log('API: Формат пользователей - data содержит массив');
          // Преобразуем формат { data: [...] } в { data: { users: [...] } } для консистентности
          response.data = { 
            data: { 
              users: response.data.data, 
              pagination: response.data.pagination || { totalPages: 1, currentPage: 1, totalItems: response.data.data.length } 
            }, 
            error: null 
          };
        } else if (response.data.users && Array.isArray(response.data.users)) {
          console.log('API: Формат пользователей - объект с users');
          // Формат { users: [...] } уже правильный
        }
        
        // Проверяем наличие данных после нормализации
        if (response.data.data && response.data.data.users) {
          console.log('API: Количество пользователей после нормализации:', response.data.data.users.length);
        }
      }
      
      return response;
    } catch (error) {
      console.error('API: Ошибка при получении пользователей:', error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      console.log('API: Запрос пользователя по ID:', id);
      const response = await api.get(`/users/${id}`);
      
      // Логирование ответа
      console.log(`API: Получен ответ от /users/${id}, статус:`, response.status);
      
      return response;
    } catch (error) {
      console.error('API: Ошибка при получении пользователя:', error);
      throw error;
    }
  },
  updateStatus: async (id, status) => {
    try {
      console.log(`API: Обновление статуса пользователя ${id} на ${status}`);
      const response = await api.patch(`/users/${id}/status`, { status });
      
      console.log('API: Ответ при обновлении статуса:', response);
      
      return response;
    } catch (error) {
      console.error('API: Ошибка при обновлении статуса пользователя:', error);
      throw error;
    }
  },
  getUserOrders: async (id, params) => {
    try {
      console.log(`API: Запрос заказов пользователя ${id}`);
      const response = await api.get(`/users/${id}/orders`, { params });
      
      console.log('API: Ответ с заказами пользователя:', response);
      
      return response;
    } catch (error) {
      console.error('API: Ошибка при получении заказов пользователя:', error);
      throw error;
    }
  }
};

// Методы API для заказов
export const orderApi = {
  // Получение списка заказов (для админов)
  getAll: async (params) => {
    try {
      console.log('API: Запрос всех заказов с параметрами:', params);
      const response = await api.get('/orders', { params });
      
      console.log('API: Ответ заказов, статус:', response.status);
      
      // Нормализация данных для консистентности
      if (response.data && !response.data.data) {
        response.data = { 
          data: { 
            orders: Array.isArray(response.data) ? response.data : [response.data] 
          }, 
          error: null 
        };
      }
      
      return response;
    } catch (error) {
      console.error('API: Ошибка при получении заказов:', error);
      throw error;
    }
  },
  
  // Получение заказа по ID
  getById: async (id) => {
    try {
      console.log('API: Запрос заказа по ID:', id);
      const response = await api.get(`/orders/${id}`);
      
      console.log(`API: Получен ответ от /orders/${id}, статус:`, response.status);
      
      return response;
    } catch (error) {
      console.error('API: Ошибка при получении заказа:', error);
      throw error;
    }
  },
  
  // Создание нового заказа
  create: async (orderData) => {
    try {
      console.log('API: Создание нового заказа:', orderData);
      const response = await api.post('/orders', orderData);
      
      console.log('API: Ответ при создании заказа, статус:', response.status);
      
      return response;
    } catch (error) {
      console.error('API: Ошибка при создании заказа:', error);
      throw error;
    }
  },
  
  // Обновление статуса заказа
  updateStatus: async (id, status) => {
    try {
      console.log(`API: Обновление статуса заказа ${id} на ${status}`);
      const response = await api.patch(`/orders/${id}/status`, { status });
      
      console.log('API: Ответ при обновлении статуса заказа:', response);
      
      return response;
    } catch (error) {
      console.error('API: Ошибка при обновлении статуса заказа:', error);
      throw error;
    }
  }
};

// Обратная совместимость
export const apiEndpoints = {
  categories: categoryApi,
  flowers: flowerApi,
  auth: authApi,
  users: userApi,
  orders: orderApi
};

// Для удобства использования
api.auth = authApi;
api.categories = categoryApi;
api.flowers = flowerApi;
api.users = userApi;
api.orders = orderApi;

// Оставим default export для основного использования
export default api;