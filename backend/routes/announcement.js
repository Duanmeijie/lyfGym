const express = require('express');
const { pool } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { type, priority, status, page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    let sql = 'SELECT a.*, u.real_name as created_by_name FROM announcements a LEFT JOIN users u ON a.created_by = u.id WHERE 1=1';
    const params = [];

    if (type) {
      sql += ' AND a.type = ?';
      params.push(type);
    }

    if (priority) {
      sql += ' AND a.priority = ?';
      params.push(priority);
    }

    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM announcements WHERE 1=1${type ? ' AND type = ?' : ''}${priority ? ' AND priority = ?' : ''}${status ? ' AND status = ?' : ''}`,
      params
    );

    sql += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
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

router.get('/latest', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, u.real_name as created_by_name
       FROM announcements a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.status = '已发布'
       ORDER BY a.created_at DESC
       LIMIT 5`
    );

    res.json({ code: 200, data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, content, type = '公告', priority = '普通', status = '已发布', created_by } = req.body;

    if (!title || !content) {
      return res.status(400).json({ code: 400, message: '标题和内容不能为空' });
    }

    const [result] = await pool.query(
      'INSERT INTO announcements (title, content, type, priority, status, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, type, priority, status, created_by || null]
    );

    res.json({
      code: 200,
      data: { id: result.insertId, title, content, type, priority, status },
      message: '创建成功'
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, priority, status } = req.body;

    const [announcements] = await pool.query('SELECT id FROM announcements WHERE id = ?', [id]);
    if (announcements.length === 0) {
      return res.status(404).json({ code: 404, message: '公告不存在' });
    }

    await pool.query(
      'UPDATE announcements SET title = ?, content = ?, type = ?, priority = ?, status = ? WHERE id = ?',
      [title, content, type, priority, status, id]
    );

    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [announcements] = await pool.query('SELECT id FROM announcements WHERE id = ?', [id]);
    if (announcements.length === 0) {
      return res.status(404).json({ code: 404, message: '公告不存在' });
    }

    await pool.query('DELETE FROM announcements WHERE id = ?', [id]);

    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
