const { Pool } = require('pg');
require('dotenv').config();

// Настройки подключения к базе данных
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'flower_shop'
};

console.log('Попытка подключения к базе данных с настройками:', {
  user: dbConfig.user,
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database
});

// Создаем пул подключений
const pool = new Pool(dbConfig);

async function checkConnection() {
  try {
    // Проверяем подключение
    const client = await pool.connect();
    console.log('Успешное подключение к базе данных!');
    
    // Проверяем существование таблицы users
    const usersResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    const usersTableExists = usersResult.rows[0].exists;
    console.log(`Таблица users ${usersTableExists ? 'существует' : 'не существует'}`);
    
    if (usersTableExists) {
      // Проверяем структуру таблицы users
      const columnsResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users';
      `);
      
      console.log('Структура таблицы users:');
      columnsResult.rows.forEach(row => {
        console.log(`- ${row.column_name}: ${row.data_type}`);
      });
      
      // Проверяем наличие пользователей
      const usersCountResult = await client.query('SELECT COUNT(*) FROM users;');
      console.log(`Количество пользователей в таблице: ${usersCountResult.rows[0].count}`);
      
      // Проверяем наличие администраторов
      const adminsCountResult = await client.query('SELECT COUNT(*) FROM users WHERE is_admin = TRUE;');
      console.log(`Количество администраторов: ${adminsCountResult.rows[0].count}`);
      
      // Проверяем пользователя с email rast@inbox.ru
      const userResult = await client.query('SELECT * FROM users WHERE email = $1;', ['rast@inbox.ru']);
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        console.log('Найден пользователь с email rast@inbox.ru:');
        console.log(`- ID: ${user.id}`);
        console.log(`- Имя: ${user.name}`);
        console.log(`- Email: ${user.email}`);
        console.log(`- Администратор: ${user.is_admin}`);
      } else {
        console.log('Пользователь с email rast@inbox.ru не найден');
      }
    }
    
    client.release();
  } catch (err) {
    console.error('Ошибка при подключении к базе данных:', err);
  } finally {
    // Закрываем пул подключений
    await pool.end();
  }
}

// Запускаем функцию
checkConnection(); 