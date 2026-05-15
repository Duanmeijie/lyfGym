const express = require('express');
const { pool } = require('../db');
const router = express.Router({ mergeParams: true });

router.get('/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;

    const [members] = await pool.query('SELECT * FROM members WHERE id = ?', [id]);
    if (members.length === 0) {
      return res.status(404).json({ code: 404, message: '会员不存在' });
    }

    res.json({ code: 200, data: members[0] });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.get('/:id/body-records', async (req, res) => {
  try {
    const { id } = req.params;

    const [members] = await pool.query('SELECT id FROM members WHERE id = ?', [id]);
    if (members.length === 0) {
      return res.status(404).json({ code: 404, message: '会员不存在' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM member_body_records WHERE member_id = ? ORDER BY record_date DESC',
      [id]
    );

    res.json({ code: 200, data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.post('/:id/body-records', async (req, res) => {
  try {
    const { id } = req.params;
    const { weight, body_fat, muscle_mass, bmi, waist, hip, note, record_date } = req.body;

    const [members] = await pool.query('SELECT id FROM members WHERE id = ?', [id]);
    if (members.length === 0) {
      return res.status(404).json({ code: 404, message: '会员不存在' });
    }

    if (!record_date) {
      return res.status(400).json({ code: 400, message: '记录日期不能为空' });
    }

    const [result] = await pool.query(
      `INSERT INTO member_body_records (member_id, weight, body_fat, muscle_mass, bmi, waist, hip, note, record_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, weight || null, body_fat || null, muscle_mass || null, bmi || null, waist || null, hip || null, note || null, record_date]
    );

    res.json({
      code: 200,
      data: { id: result.insertId, member_id: id, weight, body_fat, muscle_mass, bmi, waist, hip, note, record_date },
      message: '添加成功'
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.get('/:id/bookings', async (req, res) => {
  try {
    const { id } = req.params;

    const [members] = await pool.query('SELECT id FROM members WHERE id = ?', [id]);
    if (members.length === 0) {
      return res.status(404).json({ code: 404, message: '会员不存在' });
    }

    const [rows] = await pool.query(
      `SELECT b.*, c.name as course_name, c.type as course_type,
              c.start_date, c.start_time, c.end_time, c.duration_hours
       FROM bookings b
       LEFT JOIN courses c ON b.course_id = c.id
       WHERE b.member_id = ?
       ORDER BY b.created_at DESC`,
      [id]
    );

    res.json({ code: 200, data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.get('/:id/orders', async (req, res) => {
  try {
    const { id } = req.params;

    const [members] = await pool.query('SELECT id FROM members WHERE id = ?', [id]);
    if (members.length === 0) {
      return res.status(404).json({ code: 404, message: '会员不存在' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM orders WHERE member_id = ? ORDER BY created_at DESC',
      [id]
    );

    res.json({ code: 200, data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.get('/:id/check-ins', async (req, res) => {
  try {
    const { id } = req.params;

    const [members] = await pool.query('SELECT id FROM members WHERE id = ?', [id]);
    if (members.length === 0) {
      return res.status(404).json({ code: 404, message: '会员不存在' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM check_ins WHERE member_id = ? ORDER BY check_in_date DESC, check_in_time DESC',
      [id]
    );

    res.json({ code: 200, data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.post('/:id/check-in', async (req, res) => {
  try {
    const { id } = req.params;

    const [members] = await pool.query('SELECT id FROM members WHERE id = ?', [id]);
    if (members.length === 0) {
      return res.status(404).json({ code: 404, message: '会员不存在' });
    }

    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0].slice(0, 5);

    const [existing] = await pool.query(
      'SELECT id FROM check_ins WHERE member_id = ? AND check_in_date = ?',
      [id, today]
    );
    if (existing.length > 0) {
      return res.status(400).json({ code: 400, message: '今日已签到，请勿重复签到' });
    }

    const [result] = await pool.query(
      'INSERT INTO check_ins (member_id, check_in_date, check_in_time) VALUES (?, ?, ?)',
      [id, today, nowTime]
    );

    res.json({
      code: 200,
      data: { id: result.insertId, member_id: id, check_in_date: today, check_in_time: nowTime },
      message: '签到成功'
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ code: 400, message: '今日已签到，请勿重复签到' });
    }
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
