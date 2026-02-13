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
    if (!deviceModel) return res.status(400).json({ error: "Назва моделі відсутня" });

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Ти — експерт з цін на ПК залізо в Україні. 
        Знайди АКТУАЛЬНУ ціну (грн) та ПРЯМЕ ПОВНЕ посилання на товар у великому магазині (Telemart, Rozetka або Brain) для: ${deviceModel}. 
        Відповідь надай СУВОРО у форматі JSON: {"price": число, "url": "повне посилання з https://"}. 
        Тільки чистий JSON.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            res.json(JSON.parse(jsonMatch[0]));
        } else {
            throw new Error("ШІ повернув некоректний формат");
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
