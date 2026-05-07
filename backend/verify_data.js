const { pool } = require('./db');

async function verify() {
  const conn = await pool.getConnection();
  
  console.log('=== Coaches ===');
  const [coaches] = await conn.query('SELECT id, name, specialty, tags, experience, is_gold FROM coaches LIMIT 5');
  coaches.forEach(c => console.log(`- ${c.name}: ${c.specialty} (${c.experience}年)`));
  
  console.log('=== Members ===');
  const [members] = await conn.query('SELECT id, name, phone, type, days_left, status FROM members LIMIT 5');
  members.forEach(m => console.log(`- ${m.name}: ${m.type}, ${m.days_left}天, ${m.status}`));
  
  conn.release();
}

verify().catch(e => console.error(e.message));