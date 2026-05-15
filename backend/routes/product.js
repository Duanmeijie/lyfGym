const express = require('express');
const { pool } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, category, page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    const [countResult] = await pool.query(
      sql.replace('SELECT *', 'SELECT COUNT(*) as total'),
      params
    );

    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
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
    const [totalResult] = await pool.query('SELECT COUNT(*) as count FROM products');

    const [stockResult] = await pool.query(
      'SELECT SUM(stock) as total_stock, SUM(price * stock) as total_stock_value FROM products'
    );

    const [categoryResult] = await pool.query(
      'SELECT COUNT(DISTINCT category) as count FROM products'
    );

    const [statusResult] = await pool.query(
      "SELECT status, COUNT(*) as count FROM products GROUP BY status"
    );

    res.json({
      code: 200,
      data: {
        totalCount: totalResult[0].count,
        totalStock: stockResult[0].total_stock || 0,
        totalStockValue: stockResult[0].total_stock_value || 0,
        categoryCount: categoryResult[0].count,
        statusBreakdown: statusResult
      }
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, category = 'general', price, cost, stock = 0, image_url, description, status = '上架' } = req.body;

    const [result] = await pool.query(
      'INSERT INTO products (name, category, price, cost, stock, image_url, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, category, price, cost, stock, image_url, description, status]
    );

    res.json({
      code: 200,
      data: { id: result.insertId, name, category, price, cost, stock, image_url, description, status },
      message: '添加成功'
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, cost, stock, image_url, description, status } = req.body;

    const [products] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
    if (products.length === 0) {
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }

    await pool.query(
      'UPDATE products SET name = ?, category = ?, price = ?, cost = ?, stock = ?, image_url = ?, description = ?, status = ? WHERE id = ?',
      [name, category, price, cost, stock, image_url, description, status, id]
    );

    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await pool.query('SELECT id, name FROM products WHERE id = ?', [id]);
    if (products.length === 0) {
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }

    const [orders] = await pool.query(
      "SELECT COUNT(*) as count FROM orders WHERE product_name = ? AND type = 'product'",
      [products[0].name]
    );
    if (orders[0].count > 0) {
      return res.status(400).json({
        code: 400,
        message: '该商品有关联的订单记录，无法删除'
      });
    }

    await pool.query('DELETE FROM products WHERE id = ?', [id]);

    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
