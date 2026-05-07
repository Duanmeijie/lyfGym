require('dotenv').config();
const { pool } = require('./db');

const MEMBER_COUNT = 20;
const COACH_COUNT = 5;

const MEMBER_TYPES = ['月卡', '季卡', '年卡'];
const MEMBER_STATUS = ['有效', '过期'];
const SPECIALTIES = ['增肌', '减脂', '普拉提', '拳击', '瑜伽', 'CrossFit', '力量训练'];
const TAGS = ['金牌教练', '资深教练', '明星教练', '认证教练', '5年+经验'];

const SURNAMES = ['张', '李', '王', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '林', '何', '高', '梁'];
const GIVEN_NAMES = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞'];
const COACH_TITLES = ['教练', '老师'];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateChineseName() {
  const surname = randomChoice(SURNAMES);
  const givenName = randomChoice(GIVEN_NAMES);
  const givenName2 = randomChoice(GIVEN_NAMES);
  return surname + givenName + givenName2;
}

function generateCoachName() {
  return randomChoice(SURNAMES) + randomChoice(GIVEN_NAMES) + randomChoice(COACH_TITLES);
}

function generatePhone() {
  const prefixes = ['130', '131', '132', '133', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159', '170', '176', '177', '178', '180', '181', '182', '183', '184', '186', '187', '188', '189'];
  return randomChoice(prefixes) + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
}

async function truncateTables() {
  console.log('[INFO] Clearing existing data...');
  const conn = await pool.getConnection();
  try {
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
    await conn.execute('TRUNCATE TABLE members');
    await conn.execute('TRUNCATE TABLE coaches');
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('[OK] Existing data cleared');
  } finally {
    conn.release();
  }
}

async function generateMembers() {
  console.log('[INFO] Generating members...');
  const conn = await pool.getConnection();
  
  for (let i = 0; i < MEMBER_COUNT; i++) {
    try {
      const name = generateChineseName();
      const phone = generatePhone();
      const type = randomChoice(MEMBER_TYPES);
      
      let daysLeft = 0;
      if (type === '月卡') daysLeft = randomInt(1, 30);
      else if (type === '季卡') daysLeft = randomInt(31, 90);
      else daysLeft = randomInt(91, 365);
      
      let status = randomChoice(MEMBER_STATUS);
      if (daysLeft <= 0) status = '过期';
      
      await conn.execute(
        'INSERT INTO members (name, phone, type, days_left, status) VALUES (?, ?, ?, ?, ?)',
        [name, phone, type, daysLeft, status]
      );
    } catch (err) {
      console.error('[ERROR] Insert member failed:', err.message);
    }
  }
  
  conn.release();
  console.log(`[OK] Generated ${MEMBER_COUNT} members`);
}

async function generateCoaches() {
  console.log('[INFO] Generating coaches...');
  const conn = await pool.getConnection();
  
  const count = randomInt(COACH_COUNT - 2, COACH_COUNT + 3);
  for (let i = 0; i < count; i++) {
    try {
      const name = generateCoachName();
      const selectedSpecs = [randomChoice(SPECIALTIES)];
      if (Math.random() > 0.5) selectedSpecs.push(randomChoice(SPECIALTIES));
      if (Math.random() > 0.7) selectedSpecs.push(randomChoice(SPECIALTIES));
      const specialty = [...new Set(selectedSpecs)].join('、');
      
      const tagsArr = [randomChoice(TAGS)];
      if (Math.random() > 0.6) tagsArr.push(randomChoice(TAGS));
      const tags = [...new Set(tagsArr)].join('、');
      
      const experience = randomInt(2, 10);
      const isGold = i < 2;
      
      await conn.execute(
        'INSERT INTO coaches (name, specialty, tags, experience, is_gold) VALUES (?, ?, ?, ?, ?)',
        [name, specialty, tags, experience, isGold]
      );
    } catch (err) {
      console.error('[ERROR] Insert coach failed:', err.message);
    }
  }
  
  conn.release();
  console.log(`[OK] Generated ${count} coaches`);
}

async function showStats() {
  const conn = await pool.getConnection();
  
  const [members] = await conn.query('SELECT COUNT(*) as cnt FROM members');
  const [coaches] = await conn.query('SELECT COUNT(*) as cnt FROM coaches');
  
  console.log('='.repeat(40));
  console.log('[STATS] Database Stats:');
  console.log(`  Members: ${members[0].cnt}`);
  console.log(`  Coaches: ${coaches[0].cnt}`);
  console.log('='.repeat(40));
  
  conn.release();
}

async function main() {
  console.log('='.repeat(40));
  console.log('[Gym Data Seeding Script]');
  console.log('='.repeat(40));
  
  try {
    const conn = await pool.getConnection();
    console.log('[OK] Database connected');
    conn.release();
  } catch (err) {
    console.error('[ERROR] Database connection failed:', err.message);
    process.exit(1);
  }
  
  await truncateTables();
  await generateMembers();
  await generateCoaches();
  await showStats();
  
  console.log('[OK] Data seeding completed!');
  process.exit(0);
}

main();