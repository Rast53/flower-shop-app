/**
 * Утилита для логирования и диагностики
 */
class Logger {
  constructor(namespace) {
    this.namespace = namespace;
    this.logs = [];
    this.maxLogs = 100;
    
    // Загружаем предыдущие логи, если они есть
    this.loadLogs();
  }
  
  /**
   * Загрузка логов из localStorage
   */
  loadLogs() {
    try {
      const savedLogs = localStorage.getItem(`logs_${this.namespace}`);
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs);
      }
    } catch (error) {
      console.error('Ошибка при загрузке логов:', error);
      this.logs = [];
    }
  }
  
  /**
   * Сохранение логов в localStorage
   */
  saveLogs() {
    try {
      localStorage.setItem(`logs_${this.namespace}`, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Ошибка при сохранении логов:', error);
    }
  }
  
  /**
   * Добавление записи в лог
   */
  log(message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      data: data ? this._sanitizeData(data) : null
    };
    
    // Добавляем запись в начало массива
    this.logs.unshift(logEntry);
    
    // Ограничиваем количество логов
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    
    // Сохраняем логи
    this.saveLogs();
    
    // Выводим в консоль
    console.log(`[${this.namespace} ${timestamp}] ${message}`, data);
    
    return logEntry;
  }
  
  /**
   * Логирование ошибок
   */
  error(message, error = null) {
    const timestamp = new Date().toISOString();
    const errorData = error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : null;
    
    const logEntry = {
      timestamp,
      type: 'error',
      message,
      error: errorData
    };
    
    // Добавляем запись в начало массива
    this.logs.unshift(logEntry);
    
    // Ограничиваем количество логов
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    
    // Сохраняем логи
    this.saveLogs();
    
    // Выводим в консоль
    console.error(`[${this.namespace} ${timestamp}] ERROR: ${message}`, error);
    
    return logEntry;
  }
  
  /**
   * Получение всех логов
   */
  getLogs() {
    return this.logs;
  }
  
  /**
   * Очистка логов
   */
  clearLogs() {
    this.logs = [];
    this.saveLogs();
  }
  
  /**
   * Обработка данных перед сохранением
   * Защита от циклических ссылок и слишком больших объектов
   */
  _sanitizeData(data) {
    try {
      // Конвертируем в JSON и обратно для удаления циклических ссылок
      return JSON.parse(JSON.stringify(data));
    } catch (error) {
      return {
        error: 'Невозможно преобразовать данные для логирования',
        message: error.message
      };
    }
  }
}

/**
 * Создаем логгеры для разных частей приложения
 */
export const productLogger = new Logger('product');
export const apiLogger = new Logger('api');
export const cartLogger = new Logger('cart');
export const appLogger = new Logger('app');

/**
 * Экспортируем класс для создания кастомных логгеров
 */
export default Logger; 