const express = require('express');
const { pool } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, type, member_id, status, start_date, end_date, page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    let sql = `
      SELECT o.*, m.name as member_name, m.phone as member_phone
      FROM orders o
      LEFT JOIN members m ON o.member_id = m.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND o.order_no LIKE ?';
      params.push(`%${search}%`);
    }

    if (type) {
      sql += ' AND o.type = ?';
      params.push(type);
    }

    if (member_id) {
      sql += ' AND o.member_id = ?';
      params.push(member_id);
    }

    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }

    if (start_date) {
      sql += ' AND DATE(o.created_at) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      sql += ' AND DATE(o.created_at) <= ?';
      params.push(end_date);
    }

    const [countResult] = await pool.query(
      sql.replace('SELECT o.*, m.name as member_name, m.phone as member_phone', 'SELECT COUNT(*) as total'),
      params
    );

    sql += ' ORDER BY o.id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), parseInt(offset));

    const [rows] = await pool.query(sql, params);

    res.json({
      code: 200,
      data: {
        list: rows,
        total: countResult[0].total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [todayRevenue] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as revenue FROM orders WHERE DATE(created_at) = CURDATE() AND status = 'paid'"
    );

    const [weekRevenue] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as revenue FROM orders WHERE YEARWEEK(created_at) = YEARWEEK(CURDATE()) AND status = 'paid'"
    );

    const [monthRevenue] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as revenue FROM orders WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) AND status = 'paid'"
    );

    const [revenueByType] = await pool.query(
      "SELECT type, COUNT(*) as count, COALESCE(SUM(amount), 0) as revenue FROM orders WHERE status = 'paid' GROUP BY type"
    );

    const [topMembers] = await pool.query(
      `SELECT o.member_id, m.name as member_name, m.phone as member_phone,
              COUNT(*) as order_count, COALESCE(SUM(o.amount), 0) as total_spent
       FROM orders o
       LEFT JOIN members m ON o.member_id = m.id
       WHERE o.status = 'paid' AND o.member_id IS NOT NULL
       GROUP BY o.member_id
       ORDER BY total_spent DESC
       LIMIT 10`
    );

    const [totalOrders] = await pool.query('SELECT COUNT(*) as count FROM orders');

    res.json({
      code: 200,
      data: {
        todayRevenue: todayRevenue[0].revenue,
        weekRevenue: weekRevenue[0].revenue,
        monthRevenue: monthRevenue[0].revenue,
        revenueByType,
        topMembers,
        totalOrders: totalOrders[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { member_id, type = 'membership', product_name, amount, payment_method = '现金', status = 'paid' } = req.body;

    if (member_id) {
      const [members] = await pool.query('SELECT id FROM members WHERE id = ?', [member_id]);
      if (members.length === 0) {
        return res.status(404).json({ code: 404, message: '会员不存在' });
      }
    }

    const now = new Date();
    const timestamp =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    const order_no = `ORD${timestamp}${random}`;

    const [result] = await pool.query(
      'INSERT INTO orders (member_id, order_no, type, product_name, amount, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [member_id || null, order_no, type, product_name, amount, payment_method, status]
    );

    res.json({
      code: 200,
      data: { id: result.insertId, order_no, member_id, type, product_name, amount, payment_method, status },
      message: '添加成功'
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { member_id, type, product_name, amount, payment_method, status } = req.body;

    const [orders] = await pool.query('SELECT id FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    if (member_id) {
      const [members] = await pool.query('SELECT id FROM members WHERE id = ?', [member_id]);
      if (members.length === 0) {
        return res.status(404).json({ code: 404, message: '会员不存在' });
      }
    }

    await pool.query(
      'UPDATE orders SET member_id = ?, type = ?, product_name = ?, amount = ?, payment_method = ?, status = ? WHERE id = ?',
      [member_id || null, type, product_name, amount, payment_method, status, id]
    );

    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await pool.query('SELECT id FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    await pool.query('DELETE FROM orders WHERE id = ?', [id]);

    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
