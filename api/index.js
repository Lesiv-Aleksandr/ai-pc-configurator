const OpenAI = require("openai");
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Налаштування клієнта DeepSeek
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  // Переконайтеся, що у Vercel назва змінної збігається з цією:
  apiKey: process.env.DEEPSEEK_API_KEY 
});

app.post('/api', async (req, res) => {
    const { model: deviceModel } = req.body;
    
    try {
        const response = await openai.chat.completions.create({
            model: "deepseek-chat", // Це правильна назва моделі для DeepSeek V3
            messages: [
                { 
                    role: "system", 
                    content: "You are a helpful assistant. Return output ONLY in JSON format: {'price': number, 'url': 'string'}. Use UAH for currency." 
                },
                { 
                    role: "user", 
                    content: `Знайди ціну в UAH та посилання на товар: ${deviceModel}` 
                }
            ],
            // Цей параметр гарантує, що ми отримаємо чистий JSON без тексту
            response_format: { type: 'json_object' }
        });

        const data = JSON.parse(response.choices[0].message.content);
        res.json(data);

    } catch (error) {
        console.error("DeepSeek Error:", error.message);
        res.status(500).json({ 
            error: "Помилка DeepSeek", 
            message: error.message 
        });
    }
});

module.exports = app;
