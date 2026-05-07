-- 创建lyf_gym_db数据库
CREATE DATABASE IF NOT EXISTS lyf_gym_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用lyf_gym_db数据库
USE lyf_gym_db;

-- 创建users表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建courses表（课程/团课表）
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  coach_id INT,
  day_of_week VARCHAR(10),
  start_time TIME,
  end_time TIME,
  max_capacity INT DEFAULT 20,
  booked_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coach_id) REFERENCES coaches(id)
);

-- 创建products表（商品表）
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2),
  stock INT DEFAULT 0,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);