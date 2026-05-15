-- 创建lyf_gym_db数据库
CREATE DATABASE IF NOT EXISTS lyf_gym_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用lyf_gym_db数据库
USE lyf_gym_db;

-- 创建users表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  real_name VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建members表（会员表）
CREATE TABLE IF NOT EXISTS members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  avatar_url VARCHAR(500),
  type ENUM('月卡', '季卡', '年卡') DEFAULT '月卡',
  days_left INT DEFAULT 0,
  status ENUM('有效', '过期', '冻结') DEFAULT '有效',
  weight DECIMAL(5,1),
  body_fat DECIMAL(4,1),
  gender VARCHAR(10) DEFAULT '男',
  birthday DATE,
  emergency_contact VARCHAR(50),
  emergency_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建coaches表（教练表）
CREATE TABLE IF NOT EXISTS coaches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  specialty VARCHAR(255),
  bio VARCHAR(1000),
  avatar_url VARCHAR(500),
  experience INT DEFAULT 0,
  is_gold BOOLEAN DEFAULT FALSE,
  phone VARCHAR(20),
  email VARCHAR(100),
  certification VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建courses表（课程/团课表）
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  coach_id INT,
  type VARCHAR(50),
  day_of_week VARCHAR(10),
  start_date DATE,
  start_time TIME,
  end_time TIME,
  duration_hours DECIMAL(4,1),
  max_capacity INT DEFAULT 20,
  booked_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  description VARCHAR(1000),
  price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coach_id) REFERENCES coaches(id)
);

-- 创建bookings表（课程预约表）
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT,
  course_id INT,
  status ENUM('booked', 'cancelled', 'completed') DEFAULT 'booked',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- 创建orders表（购买记录表）
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT,
  order_no VARCHAR(50) UNIQUE,
  type ENUM('membership', 'product', 'course') DEFAULT 'membership',
  product_name VARCHAR(100),
  amount DECIMAL(10,2),
  payment_method VARCHAR(20) DEFAULT '现金',
  status ENUM('paid', 'refunded', 'pending') DEFAULT 'paid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- 创建products表（商品表）
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  price DECIMAL(10,2),
  cost DECIMAL(10,2),
  stock INT DEFAULT 0,
  image_url VARCHAR(500),
  description VARCHAR(1000),
  status ENUM('上架', '下架') DEFAULT '上架',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建member_body_records表（会员身体记录表）
CREATE TABLE IF NOT EXISTS member_body_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  weight DECIMAL(5,1),
  body_fat DECIMAL(4,1),
  muscle_mass DECIMAL(5,1),
  bmi DECIMAL(4,1),
  waistline DECIMAL(5,1),
  record_date DATE DEFAULT (CURRENT_DATE),
  notes VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- 创建announcements表（公告表）
CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type ENUM('公告', '活动', '通知') DEFAULT '公告',
  priority ENUM('普通', '重要', '紧急') DEFAULT '普通',
  status ENUM('已发布', '草稿', '已下线') DEFAULT '已发布',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 创建check_ins表（签到记录表）
CREATE TABLE IF NOT EXISTS check_ins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  check_in_date DATE DEFAULT (CURRENT_DATE),
  check_in_time TIME DEFAULT (CURRENT_TIME),
  source VARCHAR(20) DEFAULT '前台',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- 创建activity_logs表（操作日志表）
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id INT,
  detail VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
