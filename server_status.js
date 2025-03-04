// Утилита для проверки статуса сервера и диагностики проблем подключения
const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000/api';
const SERVER_PROJECT_PATH = '../flower-shop-server';

// Проверка статуса сервера
function checkServerStatus() {
  console.log('🔍 Проверка статуса сервера...');
  console.log(`🔗 Попытка подключения к: ${API_URL}`);

  return new Promise((resolve, reject) => {
    const req = http.get(API_URL, (res) => {
      console.log(`✅ Сервер доступен! Статус: ${res.statusCode}`);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          console.log('📄 Ответ сервера:', data);
          resolve(true);
        } catch (e) {
          console.log('⚠️ Ошибка разбора ответа:', e.message);
          resolve(true); // Сервер работает, но возвращает некорректный JSON
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Ошибка подключения:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        console.log('🔴 Сервер не запущен или недоступен на порту 3000');
        reject(false);
      } else {
        console.log('⚠️ Возможные причины:');
        console.log('1. Сервер запущен на другом порту');
        console.log('2. Блокировка фаерволом');
        console.log('3. Сетевая проблема');
        reject(false);
      }
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log('⏱️ Превышено время ожидания запроса (5 секунд)');
      reject(false);
    });
  });
}

// Проверка наличия серверного проекта
function checkServerProject() {
  console.log('\n🔍 Проверка наличия серверного проекта...');
  
  try {
    if (fs.existsSync(SERVER_PROJECT_PATH)) {
      console.log(`✅ Найден серверный проект: ${SERVER_PROJECT_PATH}`);
      
      // Проверка package.json
      const packageJsonPath = path.join(SERVER_PROJECT_PATH, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        console.log('✅ Файл package.json найден');
        
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          console.log('📋 Доступные скрипты:');
          Object.keys(packageJson.scripts || {}).forEach(script => {
            console.log(`   - ${script}: ${packageJson.scripts[script]}`);
          });
          return true;
        } catch (e) {
          console.error('❌ Ошибка разбора package.json:', e.message);
        }
      } else {
        console.log('❌ Файл package.json не найден');
      }
    } else {
      console.log(`❌ Серверный проект не найден по пути: ${SERVER_PROJECT_PATH}`);
      console.log('⚠️ Проверьте правильность пути к серверу в скрипте');
    }
  } catch (error) {
    console.error('❌ Ошибка при проверке серверного проекта:', error.message);
  }
  
  return false;
}

// Запуск сервера
function startServer() {
  console.log('\n🚀 Попытка запуска сервера...');
  
  try {
    process.chdir(SERVER_PROJECT_PATH);
    console.log(`✅ Перешел в директорию: ${SERVER_PROJECT_PATH}`);
    
    // Проверяем, установлены ли зависимости
    if (!fs.existsSync('node_modules')) {
      console.log('📦 Установка зависимостей...');
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ Зависимости установлены');
    }
    
    console.log('🚀 Запуск сервера через npm start...');
    console.log('🔔 Сервер будет запущен в отдельном процессе');
    console.log('⚠️ Закройте его вручную по завершении работы (Ctrl+C)');
    console.log('==================================================');
    
    // Запускаем сервер в интерактивном режиме
    execSync('npm start', { stdio: 'inherit' });
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка при запуске сервера:', error.message);
    return false;
  }
}

// Основная функция
async function main() {
  console.log('🔄 Запуск диагностики API-сервера...');
  
  try {
    // Сначала проверяем, запущен ли сервер
    const isServerRunning = await checkServerStatus().catch(() => false);
    
    if (isServerRunning) {
      console.log('\n✅ Сервер запущен и работает. Дополнительные действия не требуются.');
      return;
    }
    
    // Если сервер не запущен, проверяем серверный проект
    const isServerProjectValid = checkServerProject();
    
    if (isServerProjectValid) {
      console.log('\n⚠️ Сервер не запущен, но серверный проект найден');
      
      const startNow = true; // Для автоматического запуска можно изменить логику
      
      if (startNow) {
        startServer();
      } else {
        console.log('\n🚀 Для запуска сервера перейдите в директорию сервера и выполните:');
        console.log(`  cd ${SERVER_PROJECT_PATH}`);
        console.log('  npm start');
      }
    } else {
      console.log('\n❌ Не удалось найти или проверить серверный проект');
      console.log('⚠️ Проверьте правильность установки и настройки сервера');
    }
  } catch (error) {
    console.error('❌ Произошла неожиданная ошибка:', error.message);
  }
}

// Запуск основной функции
main(); 