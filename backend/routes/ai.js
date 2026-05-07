const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const getDbStats = async () => {
    try {
        const [members] = await pool.query('SELECT COUNT(*) as count FROM members');
        const [coaches] = await pool.query('SELECT COUNT(*) as count FROM coaches');
        const [activeMembers] = await pool.query("SELECT COUNT(*) as count FROM members WHERE status = '有效'");
        
        return {
            totalMembers: members[0].count,
            totalCoaches: coaches[0].count,
            activeMembers: activeMembers[0].count
        };
    } catch (e) {
        return null;
    }
};

router.post('/chat', async (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ reply: '请输入消息内容' });
    }
    
    try {
        const stats = await getDbStats();
        
        let systemContext = `你是一个专业的健身房管理助手。请用中文回答，语气要亲切、专业。
${stats ? `当前健身房数据：总会员数 ${stats.totalMembers} 人，活跃会员 ${stats.activeMembers} 人，教练 ${stats.totalCoaches} 人。` : ''}`;
        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemContext },
                { role: "user", content: message }
            ],
            max_tokens: 500
        });
        
        const reply = completion.choices[0].message.content;
        res.json({ reply });
        
    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ reply: '抱歉，AI 助手遇到了一点问题。' });
    }
});

module.exports = router;