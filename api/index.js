const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Ініціалізація Gemini з вашим ключем
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api', async (req, res) => {
    const { model: deviceModel } = req.body;
    
    if (!deviceModel) {
        return res.status(400).json({ error: "Назва моделі відсутня" });
    }

    try {
        // Використовуємо саме 2.5-flash, як ми з'ясували
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Знайди актуальну ціну в Україні (грн) та посилання на магазин для: ${deviceModel}. 
        Відповідь надай СУВОРО у форматі JSON: {"price": число, "url": "посилання"}. 
        Тільки чистий JSON, без тексту до або після нього.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Очищення відповіді від можливих markdown-тегів ```json ... ```
        if (text.includes("```")) {
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        }

        const data = JSON.parse(text);
        res.json(data);

    } catch (error) {
        console.error("Gemini 2.5 Error:", error);
        res.status(500).json({ 
            error: "Помилка ШІ", 
            details: error.message 
        });
    }
});

module.exports = app;
