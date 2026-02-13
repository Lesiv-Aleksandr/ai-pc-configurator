const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// Роздаємо статичні файли (html, css, js) з поточної папки
app.use(express.static(path.join(__dirname, './')));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api', async (req, res) => {
    const { model: deviceModel } = req.body;
    
    if (!deviceModel) {
        return res.status(400).json({ error: "Назва моделі відсутня" });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Знайди актуальну ціну в Україні (грн) та посилання на магазин для: ${deviceModel}. 
        Відповідь надай СУВОРО у форматі JSON: {"price": число, "url": "посилання"}. 
        Тільки чистий JSON, без тексту.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Очищення від markdown ```json ... ```
        if (text.includes("```")) {
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        }

        res.json(JSON.parse(text));
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Помилка ШІ", details: error.message });
    }
});

// Railway автоматично надає PORT через змінні оточення
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер працює на порту ${PORT}`);
});
