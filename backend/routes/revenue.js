const express = require('express');
const { pool } = require('../db');
const router = express.Router();

router.get('/summary', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const weekStr = startOfWeek.toISOString().split('T')[0];

    const [totalResult] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM orders WHERE status = "paid"'
    );

    const [todayResult] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM orders WHERE status = "paid" AND DATE(created_at) = ?',
      [today]
    );

    const [monthResult] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM orders WHERE status = "paid" AND DATE(created_at) >= ?',
      [startOfMonth]
    );

    const [weekResult] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM orders WHERE status = "paid" AND DATE(created_at) >= ?',
      [weekStr]
    );

    const [memberCount] = await pool.query('SELECT COUNT(*) as count FROM members');

    const [newMemberCount] = await pool.query(
      'SELECT COUNT(*) as count FROM members WHERE DATE(created_at) >= ?',
      [startOfMonth]
    );

    res.json({
      code: 200,
      data: {
        totalRevenue: totalResult[0].total,
        todayRevenue: todayResult[0].total,
        thisMonthRevenue: monthResult[0].total,
        thisWeekRevenue: weekResult[0].total,
        memberCount: memberCount[0].count,
        newMembersThisMonth: newMemberCount[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.get('/monthly', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COALESCE(SUM(amount), 0) as revenue
       FROM orders
       WHERE status = 'paid' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
       GROUP BY month
       ORDER BY month ASC`
    );

    res.json({ code: 200, data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.get('/daily', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DATE(created_at) as date, COALESCE(SUM(amount), 0) as revenue
       FROM orders
       WHERE status = 'paid' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    res.json({ code: 200, data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.get('/by-type', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT type, COALESCE(SUM(amount), 0) as revenue, COUNT(*) as count
       FROM orders
       WHERE status = 'paid'
       GROUP BY type
       ORDER BY revenue DESC`
    );

    res.json({ code: 200, data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.get('/top-products', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT product_name as name, COALESCE(SUM(amount), 0) as revenue, COUNT(*) as count
       FROM orders
       WHERE status = 'paid' AND product_name IS NOT NULL
       GROUP BY product_name
       ORDER BY revenue DESC
       LIMIT 10`
    );

    res.json({ code: 200, data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
