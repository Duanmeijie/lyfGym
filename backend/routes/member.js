const express = require('express');
const { pool } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, expiring_soon } = req.query;
    
    let sql = 'SELECT * FROM members WHERE 1=1';
    const params = [];
    
    if (search) {
      sql += ' AND (name LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (expiring_soon === 'true') {
      sql += ' AND days_left <= 7 AND days_left > 0 AND status = "有效"';
    }
    
    sql += ' ORDER BY id DESC';
    
    const [rows] = await pool.query(sql, params);
    
    res.json({ code: 200, data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, phone, type = '月卡', days_left = 30 } = req.body;
    
    const [existing] = await pool.query('SELECT id FROM members WHERE phone = ?', [phone]);
    if (existing.length > 0) {
      return res.status(400).json({ code: 400, message: '手机号已存在' });
    }
    
    const status = days_left > 0 ? '有效' : '过期';
    
    const [result] = await pool.query(
      'INSERT INTO members (name, phone, type, days_left, status) VALUES (?, ?, ?, ?, ?)',
      [name, phone, type, days_left, status]
    );
    
    res.json({ 
      code: 200, 
      data: { id: result.insertId, name, phone, type, days_left, status },
      message: '添加成功' 
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, type, days_left, status } = req.body;
    
    const [members] = await pool.query('SELECT id FROM members WHERE id = ?', [id]);
    if (members.length === 0) {
      return res.status(404).json({ code: 404, message: '会员不存在' });
    }
    
    if (phone) {
      const [existing] = await pool.query('SELECT id FROM members WHERE phone = ? AND id != ?', [phone, id]);
      if (existing.length > 0) {
        return res.status(400).json({ code: 400, message: '手机号已被其他会员使用' });
      }
    }
    
    const newDaysLeft = days_left !== undefined ? days_left : null;
    const newStatus = status || (newDaysLeft !== null && newDaysLeft > 0 ? '有效' : '过期');
    
    await pool.query(
      'UPDATE members SET name = ?, phone = ?, type = ?, days_left = ?, status = ? WHERE id = ?',
      [name, phone, type, newDaysLeft, newStatus, id]
    );
    
    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.post('/:id/recharge', async (req, res) => {
  try {
    const { id } = req.params;
    const { days } = req.body;
    
    const [members] = await pool.query('SELECT days_left FROM members WHERE id = ?', [id]);
    if (members.length === 0) {
      return res.status(404).json({ code: 404, message: '会员不存在' });
    }
    
    const newDays = (members[0].days_left || 0) + days;
    
    await pool.query(
      'UPDATE members SET days_left = ?, status = ? WHERE id = ?',
      [newDays, newDays > 0 ? '有效' : '过期', id]
    );
    
    res.json({ code: 200, message: '充值成功', data: { days_left: newDays } });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [members] = await pool.query('SELECT id, days_left FROM members WHERE id = ?', [id]);
    if (members.length === 0) {
      return res.status(404).json({ code: 404, message: '会员不存在' });
    }
    
    const [orders] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE member_id = ?', [id]);
    if (orders[0].count > 0) {
      return res.status(400).json({ 
        code: 400, 
        message: '该会员有购买记录，无法删除' 
      });
    }
    
    if (members[0].days_left > 0) {
      return res.status(400).json({ 
        code: 400, 
        message: '该会员卡尚有余额，无法删除' 
      });
    }
    
    await pool.query('DELETE FROM members WHERE id = ?', [id]);
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;