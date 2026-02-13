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
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Покращений запит: вимагаємо повне посилання з https
        const prompt = `Ти — експерт з комп'ютерного заліза. Знайди актуальну ціну в Україні (грн) та ПРЯМЕ РОБОЧЕ посилання на товар у магазинах (Telemart, Rozetka або Brain) для: ${deviceModel}. 
        Якщо точну ціну не знайдено, вкажи середню по ринку.
        Відповідь надай СУВОРО у форматі JSON: {"price": число, "url": "повне посилання з https://"}. 
        Тільки чистий JSON, без жодних пояснень.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            res.json(data);
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
