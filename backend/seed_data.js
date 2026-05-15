require('dotenv').config();
const { pool } = require('./db');

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(start, end) {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split('T')[0];
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function padZero(n) {
  return n.toString().padStart(2, '0');
}

function formatTime(h, m) {
  return `${padZero(h)}:${padZero(m)}:00`;
}

const SURNAMES = ['张', '李', '王', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '林', '何', '高', '梁', '郑', '罗', '宋', '谢', '唐', '韩', '曹', '许', '邓', '萧', '冯', '曾', '程', '蔡', '彭', '潘', '袁', '董', '余', '苏'];
const GIVEN_NAMES = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞', '平', '刚', '桂英', '文', '华', '飞', '玉兰', '斌', '玲', '国强', '志强', '海燕', '佳', '鑫', '浩', '宇', '晨', '博', '毅', '辰'];

const PHONE_PREFIXES = ['130', '131', '132', '133', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159', '170', '176', '177', '178', '180', '181', '182', '183', '184', '186', '187', '188', '189'];

function generateChineseName() {
  const surname = randomChoice(SURNAMES);
  const givenLen = Math.random() > 0.4 ? 2 : 1;
  let given = '';
  for (let i = 0; i < givenLen; i++) {
    given += randomChoice(GIVEN_NAMES);
  }
  return surname + given;
}

function generatePhone() {
  return randomChoice(PHONE_PREFIXES) + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
}

const MEMBER_TYPES = ['月卡', '季卡', '年卡'];
const MEMBER_STATUSES = ['有效', '过期', '冻结'];
const GENDERS = ['男', '女'];

const MEMBER_EMERGENCY_NAMES = ['张建国', '李秀梅', '王德明', '刘淑芳', '陈志远', '杨桂兰', '赵海涛', '周玉珍'];

const COACH_NAMES = ['张浩然', '李思远', '王嘉欣', '刘子涵', '陈雨桐', '杨泽宇', '赵雅琪', '周俊杰'];
const COACH_SPECIALTIES = ['增肌', '减脂', '普拉提', '拳击', '瑜伽', 'CrossFit', '力量训练', '康复训练'];
const COACH_CERTIFICATIONS = [
  'ACE-CPT国际认证教练',
  'NSCA-CSCS体能训练专家',
  'NASM-CES运动纠正专家',
  'ACSM-EP运动生理学家',
  '国家体育总局高级教练员',
  'IFBB国际健身教练',
  'RYS200瑜伽教练认证',
  'Polestar普拉提认证教练'
];
const COACH_EMAILS = [
  'zhanghr@lyfgym.com',
  'lisy@lyfgym.com',
  'wangjx@lyfgym.com',
  'liuzh@lyfgym.com',
  'chenyt@lyfgym.com',
  'yangzy@lyfgym.com',
  'zhaoyq@lyfgym.com',
  'zhoujj@lyfgym.com'
];
const COACH_BIOS = [
  '从事健身行业12年，擅长增肌塑形和力量训练，曾获得省级健美比赛亚军。教学风格严谨细致，注重基础动作的标准化训练，已帮助超过500名学员达成健身目标。',
  '国家一级运动员出身，专攻减脂和体能训练。曾为国家队运动员制定训练计划，擅长通过科学训练方法帮助学员高效减脂，塑造完美体型。',
  '普拉提认证教练，从事普拉提教学8年。擅长利用普拉提器械进行核心训练和体态矫正，对产后恢复和脊柱健康有深入研究。',
  '职业拳击运动员退役，从事拳击教学6年。将拳击训练与体能训练完美结合，课程氛围活跃富有激情，深受年轻学员喜爱。',
  '瑜伽修行者，拥有500小时高级瑜伽教练认证。教学风格柔和细腻，注重呼吸与动作的协调，擅长流瑜伽、阴瑜伽和冥想课程。',
  'CrossFit Level 2认证教练，多次参加CrossFit赛事并获得优异成绩。推崇功能性训练理念，通过高强度多样化训练全面提升身体素质。',
  '专注力量训练15年，拥有多项国际力量举认证。精通深蹲、硬拉、卧推等大重量训练技术，擅长为高级训练者定制力量突破方案。',
  '运动康复学硕士，曾任三甲医院康复科治疗师。擅长运动损伤评估与康复训练，帮助学员在安全前提下科学恢复运动功能。'
];

const COURSE_NAMES = ['燃脂搏击', '流瑜伽', '普拉提核心', 'HIIT高强度', '杠铃塑形', '动感单车', '有氧操', '力量举基础', '拳击体能', '阴瑜伽', 'CrossFit综合', '康复拉伸', '尊巴热舞', '水中健身', 'TRX悬挂训练'];
const COURSE_TYPES = ['团课', '私教', '特色课'];
const COURSE_TIMES = [
  { start: '09:00', end: '10:00', duration: 1.0 },
  { start: '10:30', end: '11:30', duration: 1.0 },
  { start: '14:00', end: '15:00', duration: 1.0 },
  { start: '14:00', end: '15:30', duration: 1.5 },
  { start: '15:30', end: '16:30', duration: 1.0 },
  { start: '15:30', end: '16:00', duration: 0.5 },
  { start: '18:00', end: '19:00', duration: 1.0 },
  { start: '18:00', end: '19:30', duration: 1.5 },
  { start: '19:30', end: '20:30', duration: 1.0 },
  { start: '19:30', end: '21:00', duration: 1.5 },
  { start: '19:30', end: '21:30', duration: 2.0 }
];
const COURSE_DESCRIPTIONS = [
  '结合拳击动作的高强度燃脂课程，适合所有健身水平',
  '通过流畅的瑜伽体式串联，提升身体柔韧性和力量',
  '专注于核心肌群的普拉提训练，改善体态和稳定性',
  '高强度间歇训练，快速提升心肺功能和燃脂效率',
  '使用杠铃进行全身塑形训练，增强肌肉线条',
  '在动感音乐中骑行，享受燃脂的快感',
  '经典有氧操课程，简单易学，快乐健身',
  '系统学习深蹲、硬拉、卧推等基础力量动作',
  '结合拳击技巧的体能训练，释放压力提升体能',
  '深度拉伸放松，缓解肌肉紧张和压力',
  '综合功能性训练，全面提升身体素质',
  '针对运动后的肌肉恢复和柔韧性提升',
  '拉丁风格的有氧舞蹈课程，快乐燃脂',
  '水中运动低冲击高消耗，保护关节',
  '利用悬挂训练系统进行全身抗阻力训练'
];
const COURSE_NAMES_WITH_DESC = COURSE_NAMES.map((name, i) => ({ name, desc: COURSE_DESCRIPTIONS[i] }));

const PRODUCT_CATEGORIES = {
  '营养补剂': [
    { name: '乳清蛋白粉（巧克力味）', price: 399, cost: 220, desc: '优质乳清蛋白，每份含25g蛋白质，巧克力口味口感醇厚' },
    { name: 'BCAA支链氨基酸', price: 199, cost: 100, desc: '2:1:1黄金比例支链氨基酸，训练中饮用减少肌肉分解' },
    { name: '肌酸粉', price: 159, cost: 80, desc: '一水肌酸粉，提升力量输出和训练表现' },
    { name: '左旋肉碱胶囊', price: 129, cost: 55, desc: '促进脂肪代谢，适合减脂期使用' }
  ],
  '运动装备': [
    { name: '专业健身手套', price: 89, cost: 35, desc: '防滑耐磨健身手套，掌心加厚保护' },
    { name: '运动毛巾（速干）', price: 49, cost: 20, desc: '超细纤维速干运动毛巾，柔软吸水' },
    { name: '健身水壶750ml', price: 69, cost: 28, desc: 'BPA-free运动水壶，刻度清晰便于饮水管理' },
    { name: '瑜伽垫（加厚）', price: 299, cost: 130, desc: '6mm加厚TPE瑜伽垫，防滑环保' }
  ],
  '健身服饰': [
    { name: '男士运动短袖T恤', price: 129, cost: 55, desc: '速干透气面料，宽松版型适合健身穿着' },
    { name: '女士运动紧身裤', price: 199, cost: 90, desc: '高腰紧身瑜伽裤，弹力面料舒适不紧绷' },
    { name: '运动短裤（男士）', price: 99, cost: 40, desc: '运动短裤，内衬设计方便运动' },
    { name: '运动内衣（女士）', price: 169, cost: 75, desc: '中强度支撑运动内衣，舒适透气' }
  ]
};

const ANNOUNCEMENTS = [
  {
    title: '关于2026年端午节营业时间调整的通知',
    content: '尊敬的会员朋友们：2026年端午节期间（6月7日-6月9日），本健身房营业时间调整为9:00-20:00，期间所有团课照常进行。6月10日起恢复正常营业时间（7:00-22:00）。祝大家端午安康！',
    type: '公告',
    priority: '重要',
    status: '已发布'
  },
  {
    title: '夏日燃脂挑战赛火热报名中',
    content: '夏天来了！健身房将于6月1日启动"夏日燃脂挑战赛"，为期8周。报名费199元/人，完成挑战者可获得价值599元的大礼包。冠军还将获得半年免费会员卡！详情请咨询前台。',
    type: '活动',
    priority: '重要',
    status: '已发布'
  },
  {
    title: '团课课程表更新（6月版）',
    content: '6月起，我们对团课课程表进行了优化调整。新增了周四晚上的普拉提核心课程和周日下午的CrossFit综合训练。部分课程时间有所调整，请会员朋友们留意最新课表。',
    type: '通知',
    priority: '普通',
    status: '已发布'
  },
  {
    title: '紧急通知：5月20日设备检修暂停营业',
    content: '为提升服务质量，健身房将于5月20日（周三）全天进行设备检修和全面消毒，当天暂停营业一天。所有会员卡有效期将自动顺延一天。给您带来的不便敬请谅解！',
    type: '公告',
    priority: '紧急',
    status: '已发布'
  },
  {
    title: '会员推荐有礼活动',
    content: '老会员推荐新会员办理年卡，双方各赠送一个月会员时长！推荐越多赠送越多，上不封顶。活动有效期至2026年7月31日。',
    type: '活动',
    priority: '普通',
    status: '已发布'
  }
];

const ACTIVITY_ACTIONS = [
  { action: 'login', target_type: 'user', detail: '用户登录系统' },
  { action: 'create_member', target_type: 'member', detail: '新增会员' },
  { action: 'update_member', target_type: 'member', detail: '更新会员信息' },
  { action: 'recharge_member', target_type: 'member', detail: '会员充值' },
  { action: 'create_coach', target_type: 'coach', detail: '新增教练' },
  { action: 'update_coach', target_type: 'coach', detail: '更新教练信息' },
  { action: 'create_course', target_type: 'course', detail: '新增课程' },
  { action: 'update_course', target_type: 'course', detail: '更新课程信息' },
  { action: 'create_order', target_type: 'order', detail: '创建订单' },
  { action: 'create_announcement', target_type: 'announcement', detail: '发布公告' }
];

async function truncateTables() {
  console.log('[INFO] Clearing existing data...');
  const conn = await pool.getConnection();
  try {
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
    const tables = [
      'activity_logs',
      'check_ins',
      'member_body_records',
      'announcements',
      'bookings',
      'orders',
      'products',
      'courses',
      'coaches',
      'members',
      'users'
    ];
    for (const table of tables) {
      await conn.execute(`TRUNCATE TABLE ${table}`);
    }
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('[OK] All tables truncated successfully');
  } finally {
    conn.release();
  }
}

async function generateUsers() {
  console.log('[INFO] Generating users...');
  const conn = await pool.getConnection();
  try {
    const users = [
      { username: 'admin', password: '123456', role: 'admin', real_name: '系统管理员' },
      { username: 'manager', password: '123456', role: 'manager', real_name: '王经理' }
    ];
    for (const u of users) {
      await conn.execute(
        'INSERT INTO users (username, password, role, real_name) VALUES (?, ?, ?, ?)',
        [u.username, u.password, u.role, u.real_name]
      );
    }
    console.log(`[OK] Generated ${users.length} users`);
  } catch (err) {
    console.error('[ERROR] Insert user failed:', err.message);
  } finally {
    conn.release();
  }
}

async function generateMembers() {
  console.log('[INFO] Generating members...');
  const conn = await pool.getConnection();
  try {
    const usedPhones = new Set();
    for (let i = 0; i < 30; i++) {
      try {
        let name = generateChineseName();
        let phone = generatePhone();
        while (usedPhones.has(phone)) {
          phone = generatePhone();
        }
        usedPhones.add(phone);

        const type = randomChoice(MEMBER_TYPES);
        let daysLeft;
        if (type === '月卡') daysLeft = randomInt(0, 30);
        else if (type === '季卡') daysLeft = randomInt(0, 90);
        else daysLeft = randomInt(0, 365);

        let status;
        const statusRoll = Math.random();
        if (daysLeft <= 0) {
          status = '过期';
        } else if (statusRoll < 0.12) {
          status = '冻结';
        } else {
          status = '有效';
        }

        const gender = randomChoice(GENDERS);
        const weight = randomFloat(gender === '男' ? 60 : 50, gender === '男' ? 100 : 75, 1);
        const bodyFat = randomFloat(gender === '男' ? 12 : 18, gender === '男' ? 28 : 35, 1);

        const birthYear = randomInt(1970, 2000);
        const birthMonth = randomInt(1, 12);
        const birthDay = randomInt(1, 28);
        const birthday = `${birthYear}-${padZero(birthMonth)}-${padZero(birthDay)}`;

        const emergencyName = randomChoice(MEMBER_EMERGENCY_NAMES);
        const emergencyPhone = generatePhone();

        const daysAgo = randomInt(0, 60);
        const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

        await conn.execute(
          `INSERT INTO members (name, phone, type, days_left, status, weight, body_fat, gender, birthday, emergency_contact, emergency_phone, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [name, phone, type, daysLeft, status, weight, bodyFat, gender, birthday, emergencyName, emergencyPhone, createdAt]
        );
      } catch (err) {
        console.error('[ERROR] Insert member failed:', err.message);
      }
    }
    console.log('[OK] Generated 30 members');
  } finally {
    conn.release();
  }
}

async function generateCoaches() {
  console.log('[INFO] Generating coaches...');
  const conn = await pool.getConnection();
  try {
    const coaches = [];
    const specCopy = [...COACH_SPECIALTIES];
    for (let i = 0; i < 8; i++) {
      const name = COACH_NAMES[i];
      const primarySpec = specCopy[i % specCopy.length];
      let specs = [primarySpec];
      if (Math.random() > 0.4) {
        const second = randomChoice(COACH_SPECIALTIES.filter(s => s !== primarySpec));
        specs.push(second);
      }
      const specialty = [...new Set(specs)].join('、');
      const experience = randomInt(2, 15);
      const isGold = experience > 5;
      const phone = generatePhone();
      const email = COACH_EMAILS[i];
      const certification = randomChoice(COACH_CERTIFICATIONS);
      const bio = COACH_BIOS[i];
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

      coaches.push({ name, specialty, bio, avatarUrl, experience, isGold, phone, email, certification });
    }

    for (const c of coaches) {
      await conn.execute(
        `INSERT INTO coaches (name, specialty, bio, avatar_url, experience, is_gold, phone, email, certification)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.name, c.specialty, c.bio, c.avatarUrl, c.experience, c.isGold, c.phone, c.email, c.certification]
      );
    }
    console.log(`[OK] Generated ${coaches.length} coaches`);
  } catch (err) {
    console.error('[ERROR] Insert coach failed:', err.message);
  } finally {
    conn.release();
  }
}

async function generateCourses() {
  console.log('[INFO] Generating courses...');
  const conn = await pool.getConnection();
  try {
    const [coachRows] = await conn.query('SELECT id FROM coaches');
    const coachIds = coachRows.map(r => r.id);

    const now = new Date();
    const futureDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const pastDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

    for (let i = 0; i < 15; i++) {
      try {
        const courseData = COURSE_NAMES_WITH_DESC[i];
        const coachId = randomChoice(coachIds);
        const type = randomChoice(COURSE_TYPES);
        const timeSlot = randomChoice(COURSE_TIMES);

        const isPast = i < 3;
        const date = isPast
          ? randomDate(pastDate, new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000))
          : randomDate(now, futureDate);

        const d = new Date(date);
        const dayOfWeek = dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1];

        const maxCapacity = randomInt(10, 30);
        const bookedCount = randomInt(0, maxCapacity);
        const isActive = !isPast || Math.random() > 0.3;
        const price = type === '私教' ? randomInt(150, 299) : randomInt(0, 99);

        await conn.execute(
          `INSERT INTO courses (name, coach_id, type, day_of_week, start_date, start_time, end_time, duration_hours, max_capacity, booked_count, is_active, description, price)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            courseData.name, coachId, type, dayOfWeek, date,
            timeSlot.start, timeSlot.end, timeSlot.duration,
            maxCapacity, bookedCount, isActive, courseData.desc, price
          ]
        );
      } catch (err) {
        console.error('[ERROR] Insert course failed:', err.message);
      }
    }
    console.log('[OK] Generated 15 courses');
  } finally {
    conn.release();
  }
}

async function generateProducts() {
  console.log('[INFO] Generating products...');
  const conn = await pool.getConnection();
  try {
    let count = 0;
    for (const [category, items] of Object.entries(PRODUCT_CATEGORIES)) {
      for (const item of items) {
        try {
          const stock = randomInt(10, 200);
          const status = Math.random() > 0.15 ? '上架' : '下架';
          await conn.execute(
            `INSERT INTO products (name, category, price, cost, stock, description, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [item.name, category, item.price, item.cost, stock, item.desc, status]
          );
          count++;
        } catch (err) {
          console.error('[ERROR] Insert product failed:', err.message);
        }
      }
    }
    console.log(`[OK] Generated ${count} products`);
  } finally {
    conn.release();
  }
}

async function generateOrders() {
  console.log('[INFO] Generating orders...');
  const conn = await pool.getConnection();
  try {
    const [memberRows] = await conn.query('SELECT id, name FROM members');
    const memberIds = memberRows.map(r => r.id);

    const now = new Date();
    const paymentMethods = ['现金', '微信', '支付宝', '银行卡'];
    const orderStatuses = ['paid', 'paid', 'paid', 'paid', 'refunded'];

    const productItems = [];
    for (const [, items] of Object.entries(PRODUCT_CATEGORIES)) {
      productItems.push(...items);
    }

    const membershipProductNames = ['月卡会员', '季卡会员', '年卡会员'];
    const membershipAmounts = [299, 699, 1999];

    for (let i = 0; i < 30; i++) {
      try {
        const memberId = randomChoice(memberIds);
        const orderType = randomChoice(['membership', 'product', 'course']);

        const daysAgo = randomInt(0, 90);
        const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        const timestamp = orderDate.getTime();
        const randDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const orderNo = `ORD${timestamp}${randDigits}`;

        let productName;
        let amount;
        let status;

        if (orderType === 'membership') {
          const idx = randomInt(0, 2);
          productName = membershipProductNames[idx];
          amount = membershipAmounts[idx];
          status = 'paid';
        } else if (orderType === 'product') {
          const item = randomChoice(productItems);
          productName = item.name;
          amount = item.price;
          status = randomChoice(orderStatuses);
        } else {
          productName = randomChoice(COURSE_NAMES);
          amount = randomInt(99, 299);
          status = randomChoice(orderStatuses);
        }

        const paymentMethod = randomChoice(paymentMethods);
        const createdAt = orderDate.toISOString().slice(0, 19).replace('T', ' ');

        await conn.execute(
          `INSERT INTO orders (member_id, order_no, type, product_name, amount, payment_method, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [memberId, orderNo, orderType, productName, amount, paymentMethod, status, createdAt]
        );
      } catch (err) {
        console.error('[ERROR] Insert order failed:', err.message);
      }
    }
    console.log('[OK] Generated 30 orders');
  } finally {
    conn.release();
  }
}

async function generateBookings() {
  console.log('[INFO] Generating bookings...');
  const conn = await pool.getConnection();
  try {
    const [memberRows] = await conn.query('SELECT id FROM members');
    const [courseRows] = await conn.query('SELECT id FROM courses');
    const memberIds = memberRows.map(r => r.id);
    const courseIds = courseRows.map(r => r.id);

    const usedPairs = new Set();
    const now = new Date();
    const bookingStatuses = ['booked', 'completed', 'cancelled'];

    for (let i = 0; i < 20; i++) {
      try {
        let memberId = randomChoice(memberIds);
        let courseId = randomChoice(courseIds);
        let pairKey = `${memberId}-${courseId}`;

        let attempts = 0;
        while (usedPairs.has(pairKey) && attempts < 15) {
          memberId = randomChoice(memberIds);
          courseId = randomChoice(courseIds);
          pairKey = `${memberId}-${courseId}`;
          attempts++;
        }
        if (usedPairs.has(pairKey)) continue;
        usedPairs.add(pairKey);

        const daysAgo = randomInt(0, 45);
        const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

        let status;
        const statusRoll = Math.random();
        if (statusRoll < 0.5) status = 'booked';
        else if (statusRoll < 0.85) status = 'completed';
        else status = 'cancelled';

        await conn.execute(
          `INSERT INTO bookings (member_id, course_id, status, created_at)
           VALUES (?, ?, ?, ?)`,
          [memberId, courseId, status, createdAt]
        );
      } catch (err) {
        console.error('[ERROR] Insert booking failed:', err.message);
      }
    }
    console.log('[OK] Generated 20 bookings');
  } finally {
    conn.release();
  }
}

async function generateAnnouncements() {
  console.log('[INFO] Generating announcements...');
  const conn = await pool.getConnection();
  try {
    for (const a of ANNOUNCEMENTS) {
      try {
        const daysAgo = randomInt(0, 60);
        const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        await conn.execute(
          `INSERT INTO announcements (title, content, type, priority, status, created_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [a.title, a.content, a.type, a.priority, a.status, 1, createdAt]
        );
      } catch (err) {
        console.error('[ERROR] Insert announcement failed:', err.message);
      }
    }
    console.log(`[OK] Generated ${ANNOUNCEMENTS.length} announcements`);
  } finally {
    conn.release();
  }
}

async function generateBodyRecords() {
  console.log('[INFO] Generating member body records...');
  const conn = await pool.getConnection();
  try {
    const [memberRows] = await conn.query('SELECT id, gender FROM members');
    let count = 0;

    for (const member of memberRows) {
      try {
        const recordCount = randomInt(1, 3);
        const baseWeight = randomFloat(member.gender === '男' ? 62 : 52, member.gender === '男' ? 95 : 73, 1);
        const baseBodyFat = randomFloat(member.gender === '男' ? 14 : 20, member.gender === '男' ? 26 : 33, 1);

        for (let j = 0; j < recordCount; j++) {
          const daysAgo = randomInt(0, 60);
          const recordDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

          const weightVariation = randomFloat(-3, 3, 1);
          const weight = parseFloat((baseWeight + weightVariation).toFixed(1));
          const bodyFat = parseFloat((baseBodyFat + randomFloat(-2, 2, 1)).toFixed(1));
          const muscleMass = randomFloat(25, 50, 1);
          const bmi = parseFloat((weight / Math.pow(randomFloat(1.6, 1.85, 2), 2)).toFixed(1));
          const waistline = randomFloat(65, 100, 1);
          const notes = j === 0 ? '初次测量' : j === 1 ? '月度复测' : '季度复测';

          await conn.execute(
            `INSERT INTO member_body_records (member_id, weight, body_fat, muscle_mass, bmi, waistline, record_date, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [member.id, weight, bodyFat, muscleMass, bmi, waistline, recordDate, notes]
          );
          count++;
        }
      } catch (err) {
        console.error('[ERROR] Insert body record failed:', err.message);
      }
    }
    console.log(`[OK] Generated ${count} body records`);
  } finally {
    conn.release();
  }
}

async function generateCheckIns() {
  console.log('[INFO] Generating check-ins...');
  const conn = await pool.getConnection();
  try {
    const [memberRows] = await conn.query('SELECT id FROM members');
    const memberIds = memberRows.map(r => r.id);
    const sources = ['前台', '自助', 'App'];
    const now = new Date();

    for (let i = 0; i < 40; i++) {
      try {
        const memberId = randomChoice(memberIds);
        const daysAgo = randomInt(0, 29);
        const checkDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        const checkHour = randomInt(8, 21);
        const checkMin = randomChoice([0, 15, 30, 45]);
        const checkTime = formatTime(checkHour, checkMin);
        const source = randomChoice(sources);
        const createdAt = checkDate.toISOString().slice(0, 19).replace('T', ' ');

        await conn.execute(
          `INSERT INTO check_ins (member_id, check_in_date, check_in_time, source, created_at)
           VALUES (?, ?, ?, ?, ?)`,
          [memberId, formatDate(checkDate), checkTime, source, createdAt]
        );
      } catch (err) {
        console.error('[ERROR] Insert check-in failed:', err.message);
      }
    }
    console.log('[OK] Generated 40 check-ins');
  } finally {
    conn.release();
  }
}

async function generateActivityLogs() {
  console.log('[INFO] Generating activity logs...');
  const conn = await pool.getConnection();
  try {
    const [memberRows] = await conn.query('SELECT id FROM members LIMIT 5');
    const [coachRows] = await conn.query('SELECT id FROM coaches LIMIT 3');
    const [courseRows] = await conn.query('SELECT id FROM courses LIMIT 3');
    const [orderRows] = await conn.query('SELECT id FROM orders LIMIT 3');

    const targetIdsByType = {
      member: memberRows.map(r => r.id),
      coach: coachRows.map(r => r.id),
      course: courseRows.map(r => r.id),
      order: orderRows.map(r => r.id),
      user: [1],
      announcement: [1]
    };

    const now = new Date();

    for (let i = 0; i < 10; i++) {
      try {
        const act = randomChoice(ACTIVITY_ACTIONS);
        const targetIds = targetIdsByType[act.target_type] || [1];
        const targetId = randomChoice(targetIds);
        const daysAgo = randomInt(0, 60);
        const minutesAgo = randomInt(0, 1440);
        const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - minutesAgo * 60 * 1000)
          .toISOString().slice(0, 19).replace('T', ' ');

        await conn.execute(
          `INSERT INTO activity_logs (user_id, action, target_type, target_id, detail, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [1, act.action, act.target_type, targetId, act.detail, createdAt]
        );
      } catch (err) {
        console.error('[ERROR] Insert activity log failed:', err.message);
      }
    }
    console.log('[OK] Generated 10 activity logs');
  } finally {
    conn.release();
  }
}

async function showStats() {
  const conn = await pool.getConnection();
  try {
    const queries = {
      'Users': 'SELECT COUNT(*) as cnt FROM users',
      'Members': 'SELECT COUNT(*) as cnt FROM members',
      'Coaches': 'SELECT COUNT(*) as cnt FROM coaches',
      'Courses': 'SELECT COUNT(*) as cnt FROM courses',
      'Products': 'SELECT COUNT(*) as cnt FROM products',
      'Orders': 'SELECT COUNT(*) as cnt FROM orders',
      'Bookings': 'SELECT COUNT(*) as cnt FROM bookings',
      'Announcements': 'SELECT COUNT(*) as cnt FROM announcements',
      'Body Records': 'SELECT COUNT(*) as cnt FROM member_body_records',
      'Check-ins': 'SELECT COUNT(*) as cnt FROM check_ins',
      'Activity Logs': 'SELECT COUNT(*) as cnt FROM activity_logs'
    };

    console.log('');
    console.log('='.repeat(40));
    console.log('[STATS] Database Stats:');
    for (const [label, sql] of Object.entries(queries)) {
      const [rows] = await conn.query(sql);
      console.log(`  ${label}: ${rows[0].cnt}`);
    }
    console.log('='.repeat(40));
  } finally {
    conn.release();
  }
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
  await generateUsers();
  await generateMembers();
  await generateCoaches();
  await generateCourses();
  await generateProducts();
  await generateOrders();
  await generateBookings();
  await generateAnnouncements();
  await generateBodyRecords();
  await generateCheckIns();
  await generateActivityLogs();
  await showStats();

  console.log('');
  console.log('[OK] Data seeding completed!');
  process.exit(0);
}

main();
