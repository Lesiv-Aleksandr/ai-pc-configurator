const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// В api/index.js
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api', async (req, res) => {
    const { model } = req.body;
    try {
        // ВИДАЛЯЄМО { apiVersion: 'v1' } та використовуємо стабільну назву
        const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" }); 

        const prompt = `Знайди ціну в UAH та посилання для: ${model}. Відповідь надай ТІЛЬКИ у форматі JSON: {"price": число, "url": "посилання"}. Без жодного іншого тексту.`;
        
        const result = await geminiModel.generateContent(prompt);
 
        const response = await result.response;
        let text = response.text();

        // ОЧИЩЕННЯ: Видаляємо маркування Markdown (```json ... ```)
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            const data = JSON.parse(text);
            res.json(data);
        } catch (parseError) {
            console.error("Помилка JSON:", text);
            // Якщо ШІ натупив з форматом, повертаємо дефолтні дані, щоб сайт не падав
            res.json({ price: 1000, url: "https://google.com", error: "Format error" });
        }
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "API Key or Service error" });
    }
});

module.exports = app;
