const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: "sk-DHVye2NdiZ62sYlq24REFW3AWLjw9rK3OcYYDzG96hvBLlLNNgwPgXJH8Vz4otLr",
    baseURL: "https://api.opencode.com/v1"
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
    const { message, model = "gpt-4o-mini", history = [] } = req.body;
    
    if (!message) {
        return res.status(400).json({ reply: '请输入消息内容' });
    }
    
    try {
        const stats = await getDbStats();
        
        let systemContext = `你是一个专业的健身房管理助手。请用中文回答，语气要亲切、专业。
${stats ? `当前健身房数据：总会员数 ${stats.totalMembers} 人，活跃会员 ${stats.activeMembers} 人，教练 ${stats.totalCoaches} 人。` : ''}`;
        
        const messages = [
            { role: "system", content: systemContext },
            ...history,
            { role: "user", content: message }
        ];
        
        const completion = await openai.chat.completions.create({
            model: model,
            messages: messages,
            temperature: 0.7,
            stream: false
        });
        
        const reply = completion.choices[0].message.content;
        res.json({ reply });
        
    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ reply: '抱歉，AI 助手遇到了一点问题。' });
    }
});

router.post('/chat/stream', async (req, res) => {
    const { message, model = "gpt-4o-mini", history = [] } = req.body;
    
    if (!message) {
        return res.status(400).json({ reply: '请输入消息内容' });
    }
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    try {
        const stats = await getDbStats();
        
        let systemContext = `你是一个专业的健身房管理助手。请用中文回答，语气要亲切、专业。
${stats ? `当前健身房数据：总会员数 ${stats.totalMembers} 人，活跃会员 ${stats.activeMembers} 人，教练 ${stats.totalCoaches} 人。` : ''}`;
        
        const messages = [
            { role: "system", content: systemContext },
            ...history,
            { role: "user", content: message }
        ];
        
        const stream = await openai.chat.completions.create({
            model: model,
            messages: messages,
            temperature: 0.7,
            stream: true
        });
        
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }
        
        res.write('data: [DONE]\n\n');
        res.end();
        
    } catch (error) {
        console.error('AI Stream Error:', error);
        res.write(`data: ${JSON.stringify({ error: '抱歉，AI 助手遇��了一点问题。' })}\n\n`);
        res.end();
    }
});

module.exports = router;