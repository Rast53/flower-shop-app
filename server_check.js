const http = require('http');

// Функция для проверки доступности сервера
function checkServerStatus() {
  console.log('Проверка доступности сервера на http://localhost:3000/api...');
  
  // Отправляем GET-запрос на сервер
  const req = http.get('http://localhost:3000/api', (res) => {
    console.log(`Сервер ответил с кодом состояния: ${res.statusCode}`);
    
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('Сервер доступен и работает корректно.');
    } else {
      console.log('Сервер доступен, но вернул ошибку.');
    }
    
    // Получаем тело ответа
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Ответ сервера:', data.substring(0, 200) + (data.length > 200 ? '...' : ''));
    });
  });
  
  // Обработка ошибок
  req.on('error', (err) => {
    console.error('Ошибка при подключении к серверу:', err.message);
    console.log('\nВозможные причины и решения:');
    console.log('1. Сервер не запущен - запустите сервер командой "npm run server" или "node server.js"');
    console.log('2. Сервер запущен на другом порту - проверьте порт в конфигурации сервера');
    console.log('3. Брандмауэр блокирует соединение - проверьте настройки брандмауэра');
    console.log('4. Неверная конфигурация в файле api.js - проверьте URL-адрес API');
  });
  
  // Устанавливаем таймаут
  req.setTimeout(5000, () => {
    console.error('Тайм-аут при подключении к серверу');
    req.abort();
  });
}

// Запускаем проверку
checkServerStatus(); 