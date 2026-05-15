# 🏋️ lyfGym 健身房管理系统

> 一个基于 **Vue 3 + Express + MySQL** 的健身房管理后台系统，支持会员、教练、课程、商品、订单、预约、营收统计等完整功能。

---

## ✨ 核心特性

### 🔐 认证与权限
- 管理员登录认证（Token 认证）
- 路由守卫，未登录自动跳转登录页
- 用户信息管理 / 个人资料更新

### 👥 会员管理
- **会员列表**：搜索（姓名/手机号）、即将过期筛选（7天内）
- **新增/编辑会员**：手机号唯一性校验、多种会员卡类型
- **会员充值**：30/60/90/180/365天灵活充值
- **冻结/解冻**：灵活管理会员状态
- **删除会员**：数据合规性校验
- **会员详情页**：完整档案、体测趋势图表、预约历史、订单记录、签到记录
- **体测记录**：体重/体脂率/BMI趋势追踪（ECharts 折线图）

### 🧑‍🤝‍🧑 教练管理
- **卡片展示**：头像、姓名、擅长领域、经验年限、金牌标识
- **搜索功能**：按姓名/擅长领域搜索
- **详情弹窗**：查看详细简介及排课记录
- **预约课程**：跳转到课程页并筛选该教练课程
- **删除校验**：名下有未完成课程时禁止删除

### 📅 课程管理
- **统计卡片**：今日课程、活跃课程、总课时数
- **课程列表**：分页展示、教练/状态筛选
- **新增/编辑**：教练选择、时间冲突检测、容量校验
- **编辑限制**：已开始课程禁止修改时间
- **删除保护**：已有预约禁止删除

### 📋 预约管理（新增）
- **预约列表**：分页展示，会员/课程/状态多条件筛选
- **预约统计**：今日预约数、本周预约数、取消率
- **新增预约**：容量检测 + 防重复预约
- **状态管理**：预约 / 完成 / 取消

### 🏷️ 商品管理（新增）
- **商品列表**：搜索/分类筛选
- **商品统计**：总数、库存总价值、分类数量
- **新增/编辑**：名称、分类、价格、成本、库存、描述
- **上架/下架**：一键切换销售状态

### 🧾 订单管理（新增）
- **订单列表**：搜索/类型/状态/日期范围筛选
- **订单统计**：总收入、总订单数、今日订单
- **自动订单号**：ORD + 时间戳 + 随机数
- **多支付方式**：现金 / 微信 / 支付宝 / 银行卡

### 💰 营收统计（新增）
- **营收总览**：总收入、本月/本周/今日收入
- **月度趋势**：近12个月营收柱状图
- **收入构成**：会员卡/商品/课程分布饼图
- **产品排行**：Top10 商品收入排行

### 📢 公告管理（新增）
- **公告列表**：卡片式展示，类型/优先级/状态筛选
- **新增/编辑**：标题、内容、类型（公告/活动/通知）、优先级（普通/重要/紧急）
- **首页看板**：显示最新5条已发布公告

### 📊 数据看板（增强）
- 会员类型分布饼图 + 新增会员趋势折线图
- 会员总数、有效会员、即将过期、本月收入
- 近期课程预约进度条
- 最新公告列表
- 系统概况（教练/课程/商品/签到统计）
- 快捷操作导航

### 🤖 AI 智能助手
- 基于 AI 的健身问答助手
- 集成于页面侧边栏

---

## 🛠️ 技术栈详情

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | ^3.5.32 | 核心框架（Composition API + `<script setup>`） |
| Vue Router | ^5.0.4 | 路由管理 |
| Pinia | ^3.0.4 | 状态管理 |
| Vite | ^8.0.8 | 构建工具 |
| axios | ^1.15.2 | HTTP 请求封装 |
| ECharts | ^6.0.0 | 数据可视化图表 |
| vue-echarts | ^8.0.1 | Vue 3 的 ECharts 封装 |
| @iconify/vue | ^5.0.0 | 图标库 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | >=20 | 运行时 |
| Express | ^4.19.2 | Web 框架 |
| mysql2 | ^3.10.3 | MySQL 驱动（Promise） |
| cors | ^2.8.5 | 跨域资源共享 |
| dotenv | ^16.4.5 | 环境变量管理 |
| @faker-js/faker | ^10.4.0 | 测试数据生成 |

### 数据库

| 技术 | 说明 |
|------|------|
| MySQL >= 5.7 | 关系型数据库 |
| utf8mb4 | 字符编码（支持 Emoji） |
| 12张表 | users, members, coaches, courses, bookings, orders, products, member_body_records, announcements, check_ins, activity_logs |

---

## 📂 项目目录结构

```
lyfGym/
├── frontend/                      # Vue 3 前端应用
│   ├── src/
│   │   ├── api/                  # API 请求封装 (10个模块)
│   │   ├── components/           # 可复用组件
│   │   ├── layouts/              # 布局组件
│   │   ├── router/               # 路由配置 (10条路由)
│   │   ├── stores/               # Pinia 状态管理
│   │   ├── utils/                # 工具函数 (axios封装)
│   │   ├── views/                # 页面视图 (10个页面)
│   │   └── assets/               # 全局样式
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Express 后端服务
│   ├── routes/                   # 路由处理 (10个模块)
│   ├── db.js                     # MySQL 连接池
│   ├── seed_data.js              # 测试数据填充脚本
│   ├── server.js                 # 服务入口
│   └── package.json
│
├── docs/
│   └── requirements.md           # 详细需求文档
│
├── schema.sql                    # 数据库 Schema (12张表)
├── .env                          # 环境变量配置
└── README.md                     # 项目说明
```

---

## 🚀 快速开始

### 前置要求

- **Node.js** >= 20.19.0
- **MySQL** >= 5.7

### 1. 数据库初始化

```bash
# 登录 MySQL 执行 Schema
mysql -u root -p < schema.sql
```

### 2. 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

### 3. 配置环境变量

在项目根目录创建 `.env` 文件：

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=lyf_gym_db
DB_PORT=3306
PORT=3000
```

### 4. 填充测试数据（可选）

```bash
cd backend
node seed_data.js
```

### 5. 启动服务

```bash
# 终端 1 - 启动后端 (端口 3000)
cd backend
npm start

# 终端 2 - 启动前端 (端口 5173)
cd frontend
npm run dev
```

### 6. 登录

```
地址：http://localhost:5173
用户名：admin
密码：123456
```

---

## 🗄️ 数据库说明

### 表结构总览（12张表）

| 表名 | 说明 | 核心字段 |
|------|------|----------|
| users | 系统用户 | id, username, password, role |
| members | 会员信息 | id, name, phone, type, days_left, status, gender, birthday |
| coaches | 教练信息 | id, name, specialty, experience, is_gold, phone, email |
| courses | 课程/团课 | id, name, coach_id, type, start_date, time, max_capacity, price |
| bookings | 课程预约 | id, member_id, course_id, status (booked/cancelled/completed) |
| orders | 购买记录 | id, member_id, order_no, type, amount, payment_method |
| products | 商品 | id, name, category, price, cost, stock, status |
| member_body_records | 体测记录 | id, member_id, weight, body_fat, muscle_mass, bmi |
| announcements | 公告 | id, title, content, type, priority, status |
| check_ins | 签到记录 | id, member_id, check_in_date, check_in_time |
| activity_logs | 操作日志 | id, user_id, action, target_type, target_id |

---

## 🔌 API 接口文档

### 认证模块
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| GET | /api/auth/profile | 获取用户信息 |
| PUT | /api/auth/profile | 更新用户信息 |

### 会员模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/members | 会员列表（搜索/筛选） |
| POST | /api/members | 新增会员 |
| PUT | /api/members/:id | 更新会员 |
| DELETE | /api/members/:id | 删除会员 |
| POST | /api/members/:id/recharge | 会员充值 |
| GET | /api/members/:id/profile | 会员详情 |
| GET | /api/members/:id/body-records | 体测记录 |
| POST | /api/members/:id/body-records | 新增体测记录 |
| GET | /api/members/:id/bookings | 预约历史 |
| GET | /api/members/:id/orders | 订单记录 |
| GET | /api/members/:id/check-ins | 签到记录 |
| POST | /api/members/:id/check-in | 会员签到 |

### 教练模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/coaches | 教练列表 |
| GET | /api/coaches/:id | 教练详情 |
| POST | /api/coaches | 新增教练 |
| PUT | /api/coaches/:id | 更新教练 |
| DELETE | /api/coaches/:id | 删除教练 |

### 课程模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/courses | 课程列表（分页） |
| GET | /api/courses/stats | 课程统计 |
| POST | /api/courses | 新增课程 |
| PUT | /api/courses/:id | 更新课程 |
| DELETE | /api/courses/:id | 删除课程 |

### 预约模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/bookings | 预约列表 |
| GET | /api/bookings/stats | 预约统计 |
| POST | /api/bookings | 新增预约 |
| PUT | /api/bookings/:id | 更新预约状态 |
| DELETE | /api/bookings/:id | 删除预约 |

### 商品模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/products | 商品列表 |
| GET | /api/products/stats | 商品统计 |
| POST | /api/products | 新增商品 |
| PUT | /api/products/:id | 更新商品 |
| DELETE | /api/products/:id | 删除商品 |

### 订单模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/orders | 订单列表 |
| GET | /api/orders/stats | 订单统计 |
| POST | /api/orders | 新增订单 |
| PUT | /api/orders/:id | 更新订单 |
| DELETE | /api/orders/:id | 删除订单 |

### 营收统计
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/revenue/summary | 营收总览 |
| GET | /api/revenue/monthly | 月度趋势 |
| GET | /api/revenue/daily | 每日收入 |
| GET | /api/revenue/by-type | 收入构成 |
| GET | /api/revenue/top-products | 产品排行 |

### 公告模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/announcements | 公告列表 |
| GET | /api/announcements/latest | 最新公告 |
| POST | /api/announcements | 新增公告 |
| PUT | /api/announcements/:id | 更新公告 |
| DELETE | /api/announcements/:id | 删除公告 |

---

## 🧪 测试报告

### 构建测试
- 前端 Vite 构建：✅ **通过**（698 模块，563ms）
- 后端语法检查：✅ **通过**（所有路由模块加载正常）
- 数据库连接：✅ **通过**

### 代码质量
- 所有 Vue 组件 Diagnostics：✅ **0 错误**
- 所有后端路由 Diagnostics：✅ **0 错误**
- 所有 API 模块 Diagnostics：✅ **0 错误**

### 数据库测试数据
- `node seed_data.js` 可一键填充 11 张表约 200+ 条测试数据

---

## 📄 License

MIT License
