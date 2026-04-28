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
  type ENUM('月卡', '季卡', '年卡') DEFAULT '月卡',
  days_left INT DEFAULT 0,
  status ENUM('有效', '过期') DEFAULT '有效',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建coaches表（教练表）
CREATE TABLE IF NOT EXISTS coaches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  specialty VARCHAR(255),
  tags VARCHAR(255),
  avatar_url VARCHAR(500),
  experience INT DEFAULT 0,
  is_gold BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入示例会员数据（可选）
-- INSERT INTO members (name, phone, type, days_left, status) VALUES
--   ('张三', '13800138001', '年卡', 120, '有效'),
--   ('李四', '13800138002', '月卡', 5, '有效');

-- 插入示例教练数据（可选）
-- INSERT INTO coaches (name, specialty, tags, experience, is_gold) VALUES
--   ('张教练', '增肌、力量训练', '金牌,5年经验', 5, TRUE);
