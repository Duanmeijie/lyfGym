const express = require('express');
const { pool } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { member_id, course_id, status, page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    let sql = `
      SELECT b.*, m.name as member_name, m.phone as member_phone,
             c.name as course_name, c.start_date, c.start_time, c.end_time
      FROM bookings b
      LEFT JOIN members m ON b.member_id = m.id
      LEFT JOIN courses c ON b.course_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (member_id) {
      sql += ' AND b.member_id = ?';
      params.push(member_id);
    }

    if (course_id) {
      sql += ' AND b.course_id = ?';
      params.push(course_id);
    }

    if (status) {
      sql += ' AND b.status = ?';
      params.push(status);
    }

    const [countResult] = await pool.query(
      sql.replace(
        'SELECT b.*, m.name as member_name, m.phone as member_phone,\n             c.name as course_name, c.start_date, c.start_time, c.end_time',
        'SELECT COUNT(*) as total'
      ),
      params
    );

    sql += ' ORDER BY b.id DESC LIMIT ? OFFSET ?';
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
    const [todayBookings] = await pool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE DATE(created_at) = CURDATE()"
    );

    const [weekBookings] = await pool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE YEARWEEK(created_at) = YEARWEEK(CURDATE())"
    );

    const [totalBookings] = await pool.query(
      "SELECT COUNT(*) as count FROM bookings"
    );

    const [cancelledBookings] = await pool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE status = 'cancelled'"
    );

    const cancellationRate = totalBookings[0].count > 0
      ? ((cancelledBookings[0].count / totalBookings[0].count) * 100).toFixed(1)
      : 0;

    const [popularCourses] = await pool.query(
      `SELECT c.id, c.name, COUNT(b.id) as booking_count
       FROM courses c
       LEFT JOIN bookings b ON c.id = b.course_id
       GROUP BY c.id, c.name
       ORDER BY booking_count DESC
       LIMIT 5`
    );

    const [statusStats] = await pool.query(
      "SELECT status, COUNT(*) as count FROM bookings GROUP BY status"
    );

    res.json({
      code: 200,
      data: {
        todayCount: todayBookings[0].count,
        weekCount: weekBookings[0].count,
        totalCount: totalBookings[0].count,
        cancelledCount: cancelledBookings[0].count,
        cancellationRate: parseFloat(cancellationRate),
        popularCourses,
        statusStats
      }
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { member_id, course_id } = req.body;

    if (!member_id || !course_id) {
      return res.status(400).json({ code: 400, message: '会员和课程不能为空' });
    }

    const [members] = await pool.query('SELECT id FROM members WHERE id = ?', [member_id]);
    if (members.length === 0) {
      return res.status(404).json({ code: 404, message: '会员不存在' });
    }

    const [courses] = await pool.query('SELECT id, name, max_capacity, booked_count FROM courses WHERE id = ?', [course_id]);
    if (courses.length === 0) {
      return res.status(404).json({ code: 404, message: '课程不存在' });
    }

    const course = courses[0];
    if (course.booked_count >= course.max_capacity) {
      return res.status(400).json({ code: 400, message: '该课程已满员，无法预约' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM bookings WHERE member_id = ? AND course_id = ? AND status != "cancelled"',
      [member_id, course_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ code: 400, message: '您已预约过该课程' });
    }

    const [result] = await pool.query(
      'INSERT INTO bookings (member_id, course_id, status) VALUES (?, ?, "booked")',
      [member_id, course_id]
    );

    await pool.query(
      'UPDATE courses SET booked_count = booked_count + 1 WHERE id = ?',
      [course_id]
    );

    res.json({
      code: 200,
      data: { id: result.insertId, member_id, course_id, status: 'booked' },
      message: '预约成功'
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (bookings.length === 0) {
      return res.status(404).json({ code: 404, message: '预约记录不存在' });
    }

    const validStatuses = ['booked', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ code: 400, message: '无效的状态值' });
    }

    const oldStatus = bookings[0].status;

    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

    if (oldStatus !== 'cancelled' && status === 'cancelled') {
      await pool.query(
        'UPDATE courses SET booked_count = GREATEST(booked_count - 1, 0) WHERE id = ?',
        [bookings[0].course_id]
      );
    }

    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (bookings.length === 0) {
      return res.status(404).json({ code: 404, message: '预约记录不存在' });
    }

    if (bookings[0].status !== 'cancelled') {
      await pool.query(
        'UPDATE courses SET booked_count = GREATEST(booked_count - 1, 0) WHERE id = ?',
        [bookings[0].course_id]
      );
    }

    await pool.query('DELETE FROM bookings WHERE id = ?', [id]);

    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
