const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api', async (req, res) => {
    const { model } = req.body;
    try {
        // Використовуємо актуальну модель 2026 року
        // ПРИМІТКА: Прибираємо об'єкт конфігурації версії, якщо він видає 404
        const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `Знайди середню ціну в гривнях (UAH) та посилання на магазин для: ${model}. 
        Відповідь надай СУВОРО у форматі JSON: {"price": число, "url": "посилання"}. 
        Тільки JSON, без тексту.`;

        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        let text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();

        res.json(JSON.parse(text));
    } catch (error) {
        console.error("AI Error:", error);
        // Додаємо деталізацію помилки у відповідь для діагностики
        res.status(500).json({ error: error.message, details: "Спробуйте змінити назву моделі на gemini-1.5-flash-latest" });
    }
});
