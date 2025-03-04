/**
 * Скрипт диагностики для проверки компонентов приложения:
 * - Доступность API сервера
 * - Доступность базы данных
 * - Правильность настроек окружения
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const fetch = require('node-fetch');

// Настройки
const LOCAL_API_URL = 'http://localhost:3000/api';
const PRODUCTION_API_URL = 'https://ra.nov.ru/api';
const SERVER_PROJECT_PATH = '../flower-shop-server';
const CLIENT_PROJECT_PATH = './';
const DOCKER_COMPOSE_PATH = './docker-compose.yml';

// ANSI цвета для вывода в консоль
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

/**
 * Заголовок диагностики
 */
function printHeader() {
  console.log(`${colors.bold}${colors.cyan}==========================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}= ДИАГНОСТИКА FLOWER SHOP ПРИЛОЖЕНИЯ   =${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}==========================================${colors.reset}`);
  console.log();
}

/**
 * Проверка статуса API сервера
 * @param {string} url - URL для проверки API. Если не указан, проверяются оба.
 */
async function checkApiStatus(url) {
  console.log(`${colors.bold}🔍 Проверка API сервера${colors.reset}`);
  
  const urls = url ? [url] : [LOCAL_API_URL, PRODUCTION_API_URL];
  const results = {};
  
  for (const apiUrl of urls) {
    console.log(`${colors.blue}Подключение к: ${apiUrl}${colors.reset}`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(apiUrl, { 
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      console.log(`${colors.green}✓ API сервер ${apiUrl} доступен. Статус: ${response.status}${colors.reset}`);
      
      let data = '';
      try {
        const text = await response.text();
        console.log(`${colors.blue}Ответ: ${text}${colors.reset}`);
        results[apiUrl] = { success: true, status: response.status, data: text };
      } catch (e) {
        console.log(`${colors.yellow}⚠ Ошибка при обработке ответа: ${e.message}${colors.reset}`);
        results[apiUrl] = { success: true, status: response.status, error: e.message };
      }
    } catch (error) {
      console.log(`${colors.red}✗ Ошибка подключения к API ${apiUrl}: ${error.message}${colors.reset}`);
      
      if (error.name === 'AbortError') {
        console.log(`${colors.yellow}⚠ Превышено время ожидания запроса (5 секунд)${colors.reset}`);
        results[apiUrl] = { success: false, error: 'timeout' };
      } else {
        if (error.code === 'ECONNREFUSED') {
          console.log(`${colors.red}  Сервер не запущен или не доступен${colors.reset}`);
        } else if (error.message.includes('certificate')) {
          console.log(`${colors.red}  Проблема с SSL сертификатом${colors.reset}`);
        }
        
        results[apiUrl] = { success: false, error: error.message, code: error.code };
      }
    }
  }
  
  return {
    success: Object.values(results).some(r => r.success),
    results
  };
}

/**
 * Проверка Docker окружения
 */
function checkDocker() {
  console.log(`${colors.bold}🔍 Проверка Docker${colors.reset}`);
  
  try {
    // Проверка наличия Docker
    const dockerVersion = execSync('docker --version', { encoding: 'utf8' });
    console.log(`${colors.green}✓ Docker установлен: ${dockerVersion.trim()}${colors.reset}`);
    
    // Проверка docker-compose
    try {
      const composeVersion = execSync('docker-compose --version', { encoding: 'utf8' });
      console.log(`${colors.green}✓ Docker Compose установлен: ${composeVersion.trim()}${colors.reset}`);
    } catch (error) {
      console.log(`${colors.yellow}⚠ Docker Compose не установлен или не найден${colors.reset}`);
    }
    
    // Проверка наличия docker-compose.yml
    if (fs.existsSync(DOCKER_COMPOSE_PATH)) {
      console.log(`${colors.green}✓ Файл docker-compose.yml найден${colors.reset}`);
      
      // Проверка содержимого docker-compose.yml
      const composeFile = fs.readFileSync(DOCKER_COMPOSE_PATH, 'utf8');
      
      if (composeFile.includes('flower-backend')) {
        console.log(`${colors.green}✓ Сервис flower-backend определен в docker-compose.yml${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠ Сервис flower-backend не найден в docker-compose.yml${colors.reset}`);
      }
    } else {
      console.log(`${colors.yellow}⚠ Файл docker-compose.yml не найден${colors.reset}`);
    }
    
    return { success: true };
  } catch (error) {
    console.log(`${colors.red}✗ Docker не установлен или не доступен${colors.reset}`);
    return { success: false, error: error.message };
  }
}

/**
 * Проверка наличия серверного проекта
 */
function checkServerProject() {
  console.log(`${colors.bold}🔍 Проверка серверного проекта${colors.reset}`);
  
  if (fs.existsSync(SERVER_PROJECT_PATH)) {
    console.log(`${colors.green}✓ Директория сервера найдена: ${SERVER_PROJECT_PATH}${colors.reset}`);
    
    // Проверка package.json
    const packageJsonPath = path.join(SERVER_PROJECT_PATH, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      console.log(`${colors.green}✓ Файл package.json найден${colors.reset}`);
      
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Проверка скриптов
        if (packageJson.scripts && packageJson.scripts.start) {
          console.log(`${colors.green}✓ Скрипт запуска: ${packageJson.scripts.start}${colors.reset}`);
        } else {
          console.log(`${colors.yellow}⚠ Скрипт 'start' не найден в package.json${colors.reset}`);
        }
        
        // Проверка зависимостей
        if (packageJson.dependencies) {
          console.log(`${colors.green}✓ Найдено ${Object.keys(packageJson.dependencies).length} зависимостей${colors.reset}`);
          
          // Проверка критичных зависимостей
          ['express', 'pg', 'dotenv'].forEach(dep => {
            if (packageJson.dependencies[dep]) {
              console.log(`${colors.green}  ✓ ${dep}: ${packageJson.dependencies[dep]}${colors.reset}`);
            } else {
              console.log(`${colors.yellow}  ⚠ ${dep} не найден в зависимостях${colors.reset}`);
            }
          });
        }
        
        // Проверка node_modules
        const nodeModulesPath = path.join(SERVER_PROJECT_PATH, 'node_modules');
        if (fs.existsSync(nodeModulesPath)) {
          console.log(`${colors.green}✓ Директория node_modules найдена${colors.reset}`);
        } else {
          console.log(`${colors.yellow}⚠ Директория node_modules не найдена. Необходимо выполнить npm install${colors.reset}`);
        }
        
        return { success: true, packageJson };
      } catch (e) {
        console.log(`${colors.red}✗ Ошибка при чтении package.json: ${e.message}${colors.reset}`);
        return { success: false, error: e.message };
      }
    } else {
      console.log(`${colors.red}✗ Файл package.json не найден${colors.reset}`);
      return { success: false, error: 'package.json not found' };
    }
  } else {
    console.log(`${colors.red}✗ Директория сервера не найдена: ${SERVER_PROJECT_PATH}${colors.reset}`);
    return { success: false, error: 'server directory not found' };
  }
}

/**
 * Проверка .env файлов
 */
function checkEnvFiles() {
  console.log(`${colors.bold}🔍 Проверка файлов конфигурации${colors.reset}`);
  
  // Проверка .env в клиентском приложении
  const clientEnvPath = path.join(CLIENT_PROJECT_PATH, '.env');
  if (fs.existsSync(clientEnvPath)) {
    console.log(`${colors.green}✓ Файл .env найден в клиентском приложении${colors.reset}`);
    
    const clientEnv = fs.readFileSync(clientEnvPath, 'utf8');
    console.log(`${colors.blue}  Содержимое (только ключи):${colors.reset}`);
    
    clientEnv.split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .forEach(line => {
        const key = line.split('=')[0];
        console.log(`${colors.blue}  - ${key}${colors.reset}`);
      });
  } else {
    console.log(`${colors.yellow}⚠ Файл .env не найден в клиентском приложении${colors.reset}`);
  }
  
  // Проверка .env в серверном приложении
  const serverEnvPath = path.join(SERVER_PROJECT_PATH, '.env');
  if (fs.existsSync(serverEnvPath)) {
    console.log(`${colors.green}✓ Файл .env найден в серверном приложении${colors.reset}`);
    
    const serverEnv = fs.readFileSync(serverEnvPath, 'utf8');
    
    // Проверка настроек базы данных
    const dbHost = serverEnv.match(/DB_HOST=(.+)/);
    if (dbHost) {
      console.log(`${colors.blue}  - DB_HOST: ${dbHost[1]}${colors.reset}`);
    } else {
      console.log(`${colors.yellow}  ⚠ DB_HOST не найден в .env сервера${colors.reset}`);
    }
    
    const dbPort = serverEnv.match(/DB_PORT=(.+)/);
    if (dbPort) {
      console.log(`${colors.blue}  - DB_PORT: ${dbPort[1]}${colors.reset}`);
    }
    
    const dbName = serverEnv.match(/DB_NAME=(.+)/);
    if (dbName) {
      console.log(`${colors.blue}  - DB_NAME: ${dbName[1]}${colors.reset}`);
    }
  } else {
    console.log(`${colors.yellow}⚠ Файл .env не найден в серверном приложении${colors.reset}`);
  }
  
  return { success: true };
}

/**
 * Запуск сервера
 */
async function startServer() {
  console.log(`${colors.bold}🚀 Запуск сервера${colors.reset}`);
  
  try {
    // Переходим в директорию сервера
    process.chdir(SERVER_PROJECT_PATH);
    console.log(`${colors.blue}Директория: ${process.cwd()}${colors.reset}`);
    
    // Проверяем node_modules
    if (!fs.existsSync('node_modules')) {
      console.log(`${colors.yellow}Установка зависимостей...${colors.reset}`);
      execSync('npm install', { stdio: 'inherit' });
    }
    
    console.log(`${colors.blue}Запуск сервера через npm start...${colors.reset}`);
    console.log(`${colors.blue}Сервер будет запущен в отдельном процессе${colors.reset}`);
    console.log(`${colors.yellow}Нажмите Ctrl+C для завершения${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}==========================================${colors.reset}`);
    
    // Запускаем сервер
    execSync('npm start', { stdio: 'inherit' });
    
    return { success: true };
  } catch (error) {
    console.log(`${colors.red}✗ Ошибка при запуске сервера: ${error.message}${colors.reset}`);
    return { success: false, error: error.message };
  }
}

/**
 * Тестирование авторизации
 * @param {string} url - URL API сервера
 * @param {object} credentials - Учетные данные для авторизации
 */
async function testAuth(url, credentials = { email: 'rast@inbox.ru', password: 'F123timer' }) {
  console.log(`${colors.bold}🔐 Тестирование авторизации на ${url}${colors.reset}`);
  console.log(`${colors.blue}Используем email: ${credentials.email}${colors.reset}`);
  
  try {
    const response = await fetch(`${url}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(credentials)
    });
    
    console.log(`${colors.cyan}Статус ответа: ${response.status}${colors.reset}`);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`${colors.green}✓ Авторизация успешна${colors.reset}`);
      console.log(`${colors.blue}Токен: ${data.token ? data.token.substring(0, 15) + '...' : 'не получен'}${colors.reset}`);
      
      if (data.user) {
        console.log(`${colors.blue}Пользователь: ${data.user.name || data.user.email}${colors.reset}`);
        console.log(`${colors.blue}Права администратора: ${data.user.is_admin ? 'Да' : 'Нет'}${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠ Данные пользователя отсутствуют в ответе${colors.reset}`);
      }
      
      return { success: true, data };
    } else {
      console.log(`${colors.red}✗ Ошибка авторизации: ${data.message || 'Неизвестная ошибка'}${colors.reset}`);
      return { success: false, error: data.message, status: response.status };
    }
  } catch (error) {
    console.log(`${colors.red}✗ Ошибка при попытке авторизации: ${error.message}${colors.reset}`);
    return { success: false, error: error.message };
  }
}

/**
 * Предложение решений проблем
 */
function suggestSolutions(results) {
  console.log(`${colors.bold}${colors.magenta}==========================================${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}= ВЫВОДЫ И РЕКОМЕНДАЦИИ                =${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}==========================================${colors.reset}`);
  
  // Проверка и рекомендации для API
  const localApiSuccess = results.apiStatus?.results?.[LOCAL_API_URL]?.success;
  const productionApiSuccess = results.apiStatus?.results?.[PRODUCTION_API_URL]?.success;
  
  if (localApiSuccess && productionApiSuccess) {
    console.log(`${colors.green}✓ Оба API сервера работают корректно${colors.reset}`);
  } else if (localApiSuccess) {
    console.log(`${colors.green}✓ Локальный API сервер работает${colors.reset}`);
    console.log(`${colors.red}✗ Продакшн API сервер недоступен${colors.reset}`);
    
    console.log(`${colors.yellow}  Рекомендации для продакшн сервера:${colors.reset}`);
    console.log(`${colors.yellow}  1. Проверьте настройки HTTPS и сертификаты${colors.reset}`);
    console.log(`${colors.yellow}  2. Проверьте доступность домена ra.nov.ru${colors.reset}`);
  } else if (productionApiSuccess) {
    console.log(`${colors.red}✗ Локальный API сервер недоступен${colors.reset}`);
    console.log(`${colors.green}✓ Продакшн API сервер работает${colors.reset}`);
    
    if (results.serverProject && results.serverProject.success) {
      console.log(`${colors.yellow}  Решение для запуска локального сервера:${colors.reset}`);
      console.log(`${colors.blue}  cd ${SERVER_PROJECT_PATH} && npm start${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}✗ Оба API сервера недоступны${colors.reset}`);
    
    if (results.serverProject && results.serverProject.success) {
      console.log(`${colors.yellow}  Решение для запуска локального сервера:${colors.reset}`);
      console.log(`${colors.blue}  cd ${SERVER_PROJECT_PATH} && npm start${colors.reset}`);
    }
    
    if (results.docker && results.docker.success) {
      console.log(`${colors.yellow}  Или запустите через Docker:${colors.reset}`);
      console.log(`${colors.blue}  docker-compose up -d${colors.reset}`);
    }
  }
  
  // Проверка Docker
  if (results.docker && !results.docker.success) {
    console.log(`${colors.yellow}⚠ Docker не установлен или не настроен${colors.reset}`);
    console.log(`${colors.yellow}  Решение: установите Docker или используйте прямой запуск${colors.reset}`);
  }
  
  // Рекомендации для дальнейших действий
  console.log(`${colors.bold}${colors.cyan}==========================================${colors.reset}`);
  console.log(`${colors.blue}Для запуска сервера выполните:${colors.reset}`);
  console.log(`${colors.blue}node diagnostics.js --start-server${colors.reset}`);
  
  // Рекомендации для возможных проблем с HTTPS
  if (!productionApiSuccess) {
    console.log(`${colors.cyan}Для решения проблем с HTTPS:${colors.reset}`);
    console.log(`${colors.blue}1. Убедитесь, что в src/services/api.js используются правильные настройки для HTTPS${colors.reset}`);
    console.log(`${colors.blue}2. Проверьте наличие и валидность SSL-сертификатов${colors.reset}`);
    console.log(`${colors.blue}3. Проверьте настройки NGINX для перенаправления HTTP на HTTPS${colors.reset}`);
  }
}

/**
 * Основная функция диагностики
 */
async function runDiagnostics() {
  printHeader();
  
  const results = {};
  
  // Проверка статуса API
  try {
    console.log(`${colors.magenta}Проверка API в различных окружениях${colors.reset}`);
    results.apiStatus = await checkApiStatus();
    
    // Показываем краткий результат 
    const localApiResult = results.apiStatus.results[LOCAL_API_URL];
    const productionApiResult = results.apiStatus.results[PRODUCTION_API_URL];
    
    console.log(`${colors.cyan}Итоги проверки API:${colors.reset}`);
    console.log(`- Локальный API (${LOCAL_API_URL}): ${localApiResult?.success ? colors.green + 'Доступен' : colors.red + 'Недоступен'}${colors.reset}`);
    console.log(`- Продакшн API (${PRODUCTION_API_URL}): ${productionApiResult?.success ? colors.green + 'Доступен' : colors.red + 'Недоступен'}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Ошибка при проверке API: ${error.message}${colors.reset}`);
    results.apiStatus = { success: false, error: error.message };
  }
  
  console.log(); // Пустая строка для разделения

  // Проверка Docker
  results.docker = checkDocker();
  
  console.log(); // Пустая строка для разделения
  
  // Проверка серверного проекта
  results.serverProject = checkServerProject();
  
  console.log(); // Пустая строка для разделения
  
  // Проверка .env файлов
  results.envFiles = checkEnvFiles();
  
  console.log(); // Пустая строка для разделения
  
  // Предложение решений
  suggestSolutions(results);
  
  return results;
}

/**
 * Точка входа в скрипт
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--start-server')) {
    await startServer();
  } else if (args.includes('--test-auth')) {
    // Определяем URL для тестирования
    const url = args.includes('--local') ? LOCAL_API_URL : 
                args.includes('--prod') ? PRODUCTION_API_URL : 
                LOCAL_API_URL;
    
    // Получаем учетные данные
    const credentials = {
      email: args.find(arg => arg.startsWith('--email='))?.split('=')[1] || 'rast@inbox.ru',
      password: args.find(arg => arg.startsWith('--password='))?.split('=')[1] || 'F123timer'
    };
    
    await testAuth(url, credentials);
  } else {
    await runDiagnostics();
  }
}

// Запуск основной функции
main().catch(error => {
  console.error(`${colors.red}Неожиданная ошибка: ${error.message}${colors.reset}`);
  process.exit(1);
}); 