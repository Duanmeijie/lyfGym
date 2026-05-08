const express = require('express');
const { pool } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, specialty } = req.query;
    
    let sql = 'SELECT * FROM coaches WHERE 1=1';
    const params = [];
    
    if (search) {
      sql += ' AND (name LIKE ? OR specialty LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (specialty) {
      sql += ' AND specialty LIKE ?';
      params.push(`%${specialty}%`);
    }
    
    sql += ' ORDER BY id DESC';
    
    const [rows] = await pool.query(sql, params);
    
    const coaches = rows.map(c => ({
      ...c,
      is_gold: c.experience > 5
    }));
    
    res.json({ code: 200, data: coaches });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [coaches] = await pool.query('SELECT * FROM coaches WHERE id = ?', [id]);
    if (coaches.length === 0) {
      return res.status(404).json({ code: 404, message: '教练不存在' });
    }
    
    const [courses] = await pool.query(
      'SELECT * FROM courses WHERE coach_id = ? AND is_active = 1 ORDER BY start_date DESC',
      [id]
    );
    
    res.json({ 
      code: 200, 
      data: { 
        ...coaches[0],
        is_gold: coaches[0].experience > 5,
        courses 
      } 
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, specialty, bio, avatar_url, experience } = req.body;
    const is_gold = experience > 5;
    
    const [result] = await pool.query(
      'INSERT INTO coaches (name, specialty, bio, avatar_url, experience, is_gold) VALUES (?, ?, ?, ?, ?, ?)',
      [name, specialty, bio, avatar_url, experience, is_gold]
    );
    
    res.json({ 
      code: 200, 
      data: { id: result.insertId, name, specialty, bio, avatar_url, experience, is_gold },
      message: '添加成功' 
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialty, bio, avatar_url, experience } = req.body;
    const is_gold = experience > 5;
    
    await pool.query(
      'UPDATE coaches SET name = ?, specialty = ?, bio = ?, avatar_url = ?, experience = ?, is_gold = ? WHERE id = ?',
      [name, specialty, bio, avatar_url, experience, is_gold, id]
    );
    
    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [courses] = await pool.query(
      'SELECT id FROM courses WHERE coach_id = ? AND is_active = 1',
      [id]
    );
    
    if (courses.length > 0) {
      return res.status(400).json({ 
        code: 400, 
        message: '该教练名下有未完成的课程，请先转移课程后再删除' 
      });
    }
    
    await pool.query('DELETE FROM coaches WHERE id = ?', [id]);
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;