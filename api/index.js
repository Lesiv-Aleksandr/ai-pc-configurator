const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api', async (req, res) => {
    const { model: deviceModel } = req.body;
    try {
        // Використовуємо актуальну модель 2026 року
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Знайди ціну в UAH та посилання для: ${deviceModel}. 
        Відповідь надай СУВОРО у форматі JSON: {"price": число, "url": "посилання"}. 
        Тільки JSON, без тексту.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();

        res.json(JSON.parse(text));
    } catch (error) {
        console.error("Gemini 2.5 Error:", error.message);
        res.status(500).json({ error: "Помилка ШІ: " + error.message });
    }
});

module.exports = app;
