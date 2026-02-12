const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api', async (req, res) => {
    const { model: deviceModel } = req.body;
    
    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { 
                        role: "system", 
                        content: "You are a price assistant. Return ONLY JSON format: {'price': number, 'url': 'string'}. Currency: UAH." 
                    },
                    { 
                        role: "user", 
                        content: `Знайди ціну та посилання для: ${deviceModel}` 
                    }
                ],
                stream: false,
                response_format: { type: 'json_object' }
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            const result = JSON.parse(data.choices[0].message.content);
            res.json(result);
        } else {
            throw new Error(data.error?.message || "Невідома помилка DeepSeek");
        }

    } catch (error) {
        console.error("DeepSeek Direct Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
