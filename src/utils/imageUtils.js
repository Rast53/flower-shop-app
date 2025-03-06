/**
 * Утилиты для работы с изображениями
 */

/**
 * Функция для форматирования URL изображений
 * @param {string} imageUrl - URL изображения
 * @returns {string} - отформатированный URL
 */
export const formatImageUrl = (imageUrl) => {
  // Если изображения нет, возвращаем placeholder
  if (!imageUrl) return '/images/placeholder.jpg'; // Изображение по умолчанию с правильным путем
  
  // Конвертируем старый путь в новый для обратной совместимости
  if (imageUrl === '/placeholder.jpg') {
    return '/images/placeholder.jpg';
  }
  
  if (imageUrl === '/images/flower-placeholder.jpg' || 
      imageUrl === '/images/category-placeholder.jpg') {
    return '/images/placeholder.jpg';
  }
  
  // Если URL абсолютный (начинается с http:// или https://)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // Проверяем, является ли это URL от Yandex Object Storage
    if (imageUrl.includes('storage.yandexcloud.net') || 
        imageUrl.includes('storage.cloud.yandex.net') ||
        imageUrl.includes('object.storage.yandexcloud.net')) {
      
      // Извлекаем путь после имени бакета 'flower-shop-images'
      const bucketPattern = /flower-shop-images\/(.+)$/;
      const match = imageUrl.match(bucketPattern);
      
      if (match && match[1]) {
        return `/s3-images/${match[1]}`;
      }
    }
    return imageUrl;
  }
  
  // Если URL уже начинается с /s3-images, оставляем как есть
  if (imageUrl.startsWith('/s3-images/')) {
    return imageUrl;
  }
  
  // Если это путь к placeholder, возвращаем правильный путь
  if (imageUrl === '/placeholder.jpg') {
    return '/images/placeholder.jpg';
  }
  
  // Для относительных URL
  return imageUrl;
};

/**
 * Обработчик ошибок загрузки изображений
 * @param {Event} event - Событие ошибки
 */
export const handleImageError = (event) => {
  // Добавляем метку, чтобы избежать повторного вызова обработчика
  // и предотвратить бесконечный цикл
  if (event.target.dataset.handledError === 'true') {
    console.log('Уже обработано - предотвращаем цикл');
    return;
  }
  
  // Устанавливаем флаг, что ошибка уже обработана
  event.target.dataset.handledError = 'true';
  
  // Отключаем обработчик ошибок, чтобы не попасть в бесконечный цикл
  event.target.onerror = null;
  
  // Получаем текущий src
  const currentSrc = event.target.src || '';
  
  // Проверяем, уже ли мы используем placeholder, чтобы избежать зацикливания
  if (currentSrc.includes('/images/placeholder.jpg')) {
    console.log('Изображение-заглушка не загрузилось. Отображаем пустое изображение.');
    // Если placeholder также не загружается, устанавливаем data-URL с 1px пустым изображением
    event.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  } else {
    console.log('Ошибка загрузки изображения, заменяем на placeholder');
    event.target.src = '/images/placeholder.jpg';
  }
}; 