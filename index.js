const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('./'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.post('/api', async (req, res) => {
    try {
        // Підключаємо модель з підтримкою інструменту пошуку
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash", // Наразі 2.0 підтримує Google Search стабільніше
            tools: [{ googleSearch: {} }] 
        });
        
        const deviceModel = req.body.model;
        
        // Промпт, який змушує модель шукати в магазинах України
        const prompt = `Знайди актуальну ціну в магазинах України (Telemart, Rozetka або Hotline) для: ${deviceModel}. 
        Надай відповідь ТІЛЬКИ у форматі JSON: {"price": число, "source": "назва магазину"}. 
        Використовуй тільки реальні дані за лютий 2026 року.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        
        // Витягуємо JSON
        const jsonMatch = text.match(/\{.*\}/s);
        let price = 0;
        
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            price = parseInt(String(data.price).replace(/\D/g, '')) || 0;
        }

        const searchUrl = `https://telemart.ua/ua/search/?q=${encodeURIComponent(deviceModel)}`;
        
        res.json({ price, url: searchUrl });

    } catch (error) {
        console.error("AI Search Error:", error.message);
        res.json({ price: 0, url: "#" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`Server started on port ${PORT}`));
