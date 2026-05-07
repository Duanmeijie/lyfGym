const mysql = require('mysql2/promise');

async function checkStructure() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'lyf_gym_db'
  });
  
  console.log('=== members ===');
  const [m] = await conn.query('DESCRIBE members');
  console.log(m.map(c => c.Field));
  
  console.log('=== coaches ===');
  const [c] = await conn.query('DESCRIBE coaches');
  console.log(c.map(c => c.Field));
  
  await conn.end();
}

checkStructure().catch(e => console.error(e.message));