# 🏋️ lyfGym 健身房管理系统

> 一个基于 **Vue 3 + Express + MySQL** 的健身房会员管理后台系统，支持会员管理、教练管理、课程管理、数据可视化等完整功能。

---

## ✨ 核心特性

### 🔐 认证与权限
- 管理员登录认证（JWT Token）
- 路由守卫，未登录自动跳转登录页
- Token 持久化存储

### 👥 会员管理
- **会员列表**：支持模糊搜索（姓名/手机号）、即将过期筛选（7天内）
- **新增会员**：手机号唯一性校验、会员卡类型选择（月卡/季卡/年卡）
- **编辑会员**：修改信息、有效期充值
- **会员冻结/解冻**：灵活管理会员状态
- **删除会员**：数据合规性校验（无购买记录且余额为0方可删除）
- 状态标签可视化（有效/过期/冻结）

### 🧑‍🤝‍🧑 教练管理
- **教练列表卡片展示**：头像、姓名、擅长领域、经验年限
- **金牌教练标识**：自动根据经验年限计算（>5年）
- **搜索功能**：按姓名/擅长领域搜索
- **新增/编辑教练**：头像URL、简介、经验年限
- **删除校验**：名下有未完成课程时禁止删除
- **查看详情**：弹出 Modal 查看详细简介及排课记录
- **预约课程**：点击跳转到课程页面并筛选该教练课程

### 📅 课程管理
- **数据统计卡片**：今日课程数、活跃课程数、总课时数
- **课程列表**：分页展示、教练/状态筛选
- **课程详情**：课程名称、教练、日期、时间、容量、状态
- **新增课程**：
  - 教练选择（下拉框）
  - 时间冲突检测（同一教练同一时间不能重复排课）
  - 容量校验（必须大于0）
- **编辑课程**：已开始课程禁止修改时间
- **删除课程**：已有预约禁止删除，需先取消预约

### 📊 数据看板
- 会员类型分布饼图（ECharts）
- 新增会员趋势折线图
- 关键指标卡片展示

### 🤖 AI 智能助手
- 基于 AI 的健身问答助手
- 集成于页面侧边栏

---

## 🛠️ 技术栈详情

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | ^3.5.32 | 核心框架 |
| Vue Router | ^5.0.4 | 路由管理 |
| Pinia | ^3.0.4 | 状态管理 |
| Vite | ^8.0.8 | 构建工具 |
| axios | ^1.15.2 | HTTP 请求 |
| ECharts | ^6.0.0 | 数据可视化 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | >=20 | 运行时 |
| Express | ^4.19.2 | Web 框架 |
| mysql2 | ^3.10.3 | MySQL 驱动 |
| cors | ^2.8.5 | 跨域资源共享 |
| dotenv | ^16.4.5 | 环境变量 |
| jsonwebtoken | - | JWT 认证 |

### 数据库

| 技术 | 说明 |
|------|------|
| MySQL >= 5.7 | 关系型数据库 |
| utf8mb4 | 字符编码（支持 Emoji） |

---

## 📂 项目目录结构

```
lyfGym/
├── frontend/                      # Vue 3 前端应用
│   ├── src/
│   │   ├── api/                  # API 请求封装
│   │   │   ├── auth.js           # 登录接口
│   │   │   ├── coach.js          # 教练接口
│   │   │   ├── member.js         # 会员接口
│   │   │   └── course.js         # 课程接口
│   │   ├── components/           # 可复用组件
│   │   │   ├── AiAssistant.vue   # AI 助手组件
│   │   │   ├── MemberTypeChart.vue   # 会员类型饼图
│   │   │   └── NewMembersChart.vue    # 新增会员趋势图
│   │   ├── layouts/              # 布局组件
│   │   │   └── DashboardLayout.vue    # 后台布局
│   │   ├── router/               # 路由配置
│   │   │   └── index.js
│   │   ├── stores/               # Pinia 状态管理
│   │   ├── utils/                # 工具函数
│   │   │   └── request.js        # axios 封装 + 拦截器
│   │   └── views/                # 页面视图
│   │       ├── LoginView.vue     # 登录页
│   │       ├── DashboardView.vue  # 数据看板
│   │       ├── MemberView.vue    # 会员管理
│   │       ├── CoachView.vue     # 教练管理
│   │       └── CourseView.vue    # 课程管理
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Express 后端服务
│   ├── routes/                   # 路由处理
│   │   ├── auth.js               # 登录认证
│   │   ├── coach.js              # 教练 CRUD + 详情/搜索
│   │   ├── member.js             # 会员 CRUD + 充值
│   │   ├── course.js             # 课程 CRUD + 统计/冲突检测
│   │   ├── ai.js                 # AI 接口
│   │   └── test.js               # 测试接口
│   ├── db.js                     # MySQL 连接池
│   ├── server.js                 # 服务入口
│   └── package.json
│
├── docs/                         # 项目文档
│   └── requirements.md           # 需求分析文档
│
├── schema.sql                    # 数据库 Schema
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

# 安装依赖
npm install

# 开发模式启动
npm run dev
```

> 前端默认访问地址：**http://localhost:5173**

### 4. 登录账号

```
用户名：admin
密码：123456
```

---

## 🗄️ 数据库说明

### 表结构总览

| 表名 | 说明 |
|------|------|
| users | 系统用户表 |
| members | 会员信息表 |
| coaches | 教练信息表 |
| courses | 课程/团课表 |
| bookings | 课程预约表 |
| orders | 会员购买记录表 |
| products | 商品表 |

### 核心表字段（详细见 schema.sql）

#### `members` - 会员表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR(100) | 姓名 |
| phone | VARCHAR(20) | 手机号（唯一） |
| type | ENUM | 会员卡类型 |
| days_left | INT | 剩余天数 |
| status | ENUM | 状态（有效/过期/冻结） |

#### `coaches` - 教练表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR(100) | 姓名 |
| specialty | VARCHAR(255) | 擅长领域 |
| bio | VARCHAR(1000) | 简介 |
| avatar_url | VARCHAR(500) | 头像 |
| experience | INT | 经验年限 |
| is_gold | BOOLEAN | 金牌标识 |

#### `courses` - 课程表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| name | VARCHAR(100) | 课程名称 |
| coach_id | BIGINT | 教练ID |
| type | VARCHAR(50) | 课程类型 |
| start_date | DATE | 课程日期 |
| start_time | TIME | 开始时间 |
| end_time | TIME | 结束时间 |
| duration_hours | DECIMAL | 时长 |
| max_capacity | INT | 最大人数 |
| is_active | TINYINT | 状态 |

---

## 🔌 API 接口文档

### 认证模块

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |

### 会员模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/members | 获取会员列表（支持搜索/筛选） |
| POST | /api/members | 新增会员 |
| PUT | /api/members/:id | 更新会员信息 |
| DELETE | /api/members/:id | 删除会员 |
| POST | /api/members/:id/recharge | 会员充值 |

### 教练模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/coaches | 获取教练列表（支持搜索） |
| GET | /api/coaches/:id | 获取教练详情+排课 |
| POST | /api/coaches | 新增教练 |
| PUT | /api/coaches/:id | 更新教练信息 |
| DELETE | /api/coaches/:id | 删除教练 |

### 课程模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/courses | 获取课程列表（分页/筛选） |
| GET | /api/courses/stats | 获取课程统计数据 |
| POST | /api/courses | 新增课程 |
| PUT | /api/courses/:id | 更新课程 |
| DELETE | /api/courses/:id | 删除课程 |

---

## 📄 License

MIT License