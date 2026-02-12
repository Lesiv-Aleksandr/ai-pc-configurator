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
        const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Знайди актуальну ціну в гривнях (UAH) та посилання на магазин в Україні для: ${model}. Відповідь надай суворо у форматі JSON: {"price": число, "url": "посилання"}. Без зайвого тексту.`;

        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, "").trim();
        res.json(JSON.parse(text));
    } catch (error) {
        res.status(500).json({ error: "AI Error" });
    }
});

module.exports = app;
