const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Створюємо клієнт без зайвих параметрів
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api', async (req, res) => {
    const { model: deviceModel } = req.body;
    try {
        // ВИКОРИСТОВУЄМО ТІЛЬКИ ЦЮ МОДЕЛЬ (вона основна у 2026)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const prompt = `Find price in UAH and shop link for: ${deviceModel}. Return ONLY JSON: {"price": number, "url": "string"}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();

        res.json(JSON.parse(text));
    } catch (error) {
        console.error("DEBUG ERROR:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
