const mysql = require('mysql2/promise');

async function checkTables() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'lyf_gym_db'
  });
  
  const [tables] = await conn.query('SHOW TABLES');
  console.log('Existing tables:', tables);
  await conn.end();
}

checkTables().catch(e => console.error(e.message));