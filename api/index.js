const OpenAI = require("openai");
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Налаштування DeepSeek
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY // Змініть назву змінної у Vercel!
});

app.post('/api', async (req, res) => {
    const { model: deviceModel } = req.body;
    try {
        const response = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: "You are a helpful assistant that returns price and link in JSON format." },
                { role: "user", content: `Знайди ціну в UAH та посилання на магазин для: ${deviceModel}. Відповідь надай ТІЛЬКИ у форматі JSON: {"price": число, "url": "посилання"}. Без тексту.` }
            ],
            response_format: { type: 'json_object' } // DeepSeek підтримує цей режим!
        });

        const data = JSON.parse(response.choices[0].message.content);
        res.json(data);
    } catch (error) {
        console.error("DeepSeek Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
