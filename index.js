const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api', async (req, res) => {
    const { model: deviceModel } = req.body;
    
    if (!deviceModel) {
        return res.status(400).json({ error: "Назва моделі відсутня" });
    }

    try {
        // Використовуємо актуальну модель 2.5-flash
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Знайди ціну в Україні (грн) та посилання на товар: ${deviceModel}. 
        Відповідь надай СУВОРО у форматі JSON: {"price": число, "url": "рядок"}. 
        Тільки чистий JSON.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Надійний пошук JSON у тексті
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const cleanJson = JSON.parse(jsonMatch[0]);
            res.json(cleanJson);
        } else {
            throw new Error("ШІ надіслав дані у невірному форматі");
        }

    } catch (error) {
        console.error("AI Error:", error.message);
        res.status(500).json({ error: "Помилка ШІ", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер працює на порту ${PORT}`);
});
