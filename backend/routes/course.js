const express = require('express');
const { pool } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, coach_id, status, start_date, end_date } = req.query;
    const offset = (page - 1) * pageSize;
    
    let sql = `
      SELECT c.*, co.name as coach_name, co.specialty as coach_specialty
      FROM courses c
      LEFT JOIN coaches co ON c.coach_id = co.id
      WHERE 1=1
    `;
    const params = [];
    
    if (coach_id) {
      sql += ' AND c.coach_id = ?';
      params.push(coach_id);
    }
    
    if (status === 'active') {
      sql += ' AND c.is_active = 1';
    } else if (status === 'ended') {
      sql += ' AND c.is_active = 0';
    }
    
    if (start_date) {
      sql += ' AND c.start_date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      sql += ' AND c.start_date <= ?';
      params.push(end_date);
    }
    
    sql += ' ORDER BY c.id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), parseInt(offset));
    
    const [rows] = await pool.query(sql, params);
    
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM courses');
    
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
    const today = new Date().toISOString().split('T')[0];
    
    const [todayResult] = await pool.query(
      'SELECT COUNT(*) as count FROM courses WHERE DATE(start_date) = ?',
      [today]
    );
    
    const [activeResult] = await pool.query(
      'SELECT COUNT(*) as count FROM courses WHERE is_active = 1'
    );
    
    const [hoursResult] = await pool.query(
      'SELECT SUM(duration_hours) as total FROM courses'
    );
    
    res.json({
      code: 200,
      data: {
        todayCount: todayResult[0].count || 0,
        activeCount: activeResult[0].count || 0,
        totalHours: hoursResult[0].total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, coach_id, type, start_date, start_time, end_time, duration_hours, max_capacity } = req.body;
    
    if (max_capacity <= 0) {
      return res.status(400).json({ code: 400, message: '容量必须大于0' });
    }
    
    const [existing] = await pool.query(
      `SELECT id FROM courses 
       WHERE coach_id = ? AND start_date = ? AND start_time = ? 
       AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))`,
      [coach_id, start_date, start_time, end_time, start_time, end_time, end_time]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ code: 400, message: '该教练在同一时间已有课程安排' });
    }
    
    const [result] = await pool.query(
      `INSERT INTO courses (name, coach_id, type, start_date, start_time, end_time, duration_hours, max_capacity, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [name, coach_id, type, start_date, start_time, end_time, duration_hours, max_capacity]
    );
    
    res.json({ 
      code: 200, 
      data: { id: result.insertId },
      message: '添加成功' 
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, start_date, start_time, end_time, max_capacity } = req.body;
    
    const [courses] = await pool.query('SELECT start_date, start_time FROM courses WHERE id = ?', [id]);
    if (courses.length === 0) {
      return res.status(404).json({ code: 404, message: '课程不存在' });
    }
    
    const courseStart = new Date(`${courses[0].start_date} ${courses[0].start_time}`);
    if (courseStart < new Date()) {
      return res.status(400).json({ code: 400, message: '课程已开始，无法修改时间' });
    }
    
    await pool.query(
      `UPDATE courses SET name = ?, start_date = ?, start_time = ?, end_time = ?, max_capacity = ? WHERE id = ?`,
      [name, start_date, start_time, end_time, max_capacity, id]
    );
    
    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [bookings] = await pool.query('SELECT id FROM bookings WHERE course_id = ? AND status != "cancelled"', [id]);
    if (bookings.length > 0) {
      return res.status(400).json({ code: 400, message: '该课程已有会员预约，请先取消预约再删除' });
    }
    
    await pool.query('DELETE FROM courses WHERE id = ?', [id]);
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;