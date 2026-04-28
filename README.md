# 🏋️ lyfGym 健身房管理系统

> 一个基于 Vue 3 + Express + MySQL 的健身房会员管理后台系统，支持会员管理、教练管理、数据可视化等功能。

---

## ✨ 核心特性

- 🔐 **安全登录** - 管理员账号登录认证
- 👥 **会员管理** - 会员信息 CRUD（添加、查看、删除）
- 🧑‍🤝‍🧑 **教练管理** - 教练信息管理与展示
- 📊 **数据看板** - 会员类型分布图表、新增会员趋势图
- 📱 **响应式设计** - 适配不同设备屏幕

---

## 🛠️ 技术栈详情

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | ^3.5.32 | 核心框架 |
| Vue Router | ^5.0.4 | 路由管理 |
| Pinia | ^3.0.4 | 状态管理 |
| Vite | ^8.0.8 | 构建工具 |
| ECharts | ^6.0.0 | 数据可视化 |
| axios | ^1.15.2 | HTTP 请求 |
| @iconify/vue | ^5.0.0 | 图标库 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Express | ^4.19.2 | Web 框架 |
| mysql2 | ^3.10.3 | MySQL 驱动 |
| cors | ^2.8.5 | 跨域资源共享 |
| dotenv | ^16.4.5 | 环境变量 |

### 数据库

| 技术 | 说明 |
|------|------|
| MySQL | 关系型数据库 |
| utf8mb4 | 字符编码 |

---

## 📂 项目目录结构

```
lyfGym/
├── frontend/                 # Vue 3 前端应用
│   ├── src/
│   │   ├── api/             # API 请求封装
│   │   │   ├── auth.js      # 登录接口
│   │   │   ├── coach.js    # 教练接口
│   │   │   └── member.js    # 会员接口
│   │   ├── components/      # 可复用组件
│   │   │   ├── MemberTypeChart.vue    # 会员类型饼图
│   │   │   └── NewMembersChart.vue    # 新增会员趋势图
│   │   ├── layouts/         # 布局组件
│   │   │   └── DashboardLayout.vue
│   │   ├── router/          # 路由配置
│   │   │   └── index.js
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── utils/          # 工具函数
│   │   │   └── request.js  # axios 封装
│   │   └── views/          # 页面视图
│   │       ├── LoginView.vue       # 登录页
│   │       ├── DashboardView.vue    # 数据看板
│   │       ├── CoachView.vue      # 教练管理
│   │       └── CourseView.vue     # 课程管理
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Express 后端服务
│   ├── routes/             # 路由处理
│   │   ├── auth.js         # 登录接口
│   │   ├── coach.js       # 教练 CRUD
│   │   ├── member.js      # 会员 CRUD
│   │   └── test.js        # 测试接口
│   ├── db.js              # MySQL 连接池
│   ├── server.js          # 服务入口
│   └── package.json
│
└── schema.sql              # 数据库 Schema
```

---

## 🚀 快速开始

### 前置要求

- Node.js >= 20.19.0
- MySQL >= 5.7

### 1. 数据库初始化

```bash
# 登录 MySQL
mysql -u root -p

# 执行 Schema 创建数据库和表
source schema.sql

# 或者直接导入
mysql -u root -p < schema.sql
```

### 2. 后端配置

```bash
cd backend

# 安装依赖
npm install

# 启动服务（默认端口 3000）
npm start
```

> ⚠️ **环境变量** - 首次使用请在 `backend/` 目录创建 `.env` 文件：

```bash
# .env 示例
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=lyf_gym_db
DB_PORT=3306
PORT=3000
```

### 3. 前端配置

```bash
cd frontend

# 安装依���
npm install

# 开发模式启动
npm run dev
```

> 前端默认访问地址：http://localhost:5173

### 4. 登录账号

```
用户名：admin
密码：123456
```

---

## 🗄️ 数据库说明

### 表结构

#### `users` - 用户表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| username | VARCHAR(50) | 用户名（唯一） |
| password | VARCHAR(255) | 密码 |
| created_at | TIMESTAMP | 创建时间 |

#### `members` - 会员表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR(100) | 姓名 |
| phone | VARCHAR(20) | 手机号（唯一） |
| type | ENUM('月卡','季卡','年卡') | 会员卡类型 |
| days_left | INT | 剩余天数 |
| status | ENUM('有效','过期') | 会员状态 |
| created_at | TIMESTAMP | 创建时间 |

#### `coaches` - 教练表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR(100) | 姓名 |
| specialty | VARCHAR(255) | 专业特长 |
| tags | VARCHAR(255) | 标签 |
| avatar_url | VARCHAR(500) | 头像 URL |
| experience | INT | 从业年限 |
| is_gold | BOOLEAN | 是否金牌教练 |
| created_at | TIMESTAMP | 创建时间 |

---

## 📸 截图演示

![登录页](./docs/login.png)
![数据看板](./docs/dashboard.png)
![会员管理](./docs/members.png)
![教练管理](./docs/coaches.png)

---

## 🔌 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 登录认证 |
| GET | /api/members | 获取会员列表 |
| POST | /api/members | 添加会员 |
| DELETE | /api/members/:id | 删除会员 |
| GET | /api/coaches | 获取教练列表 |
| POST | /api/coaches | 添加教练 |

---

## 📄 License

MIT License