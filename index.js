const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('./'));

// Обов'язково перевіряємо ключ
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.post('/api', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.json({ price: 0, url: "#", error: "Ключ API не налаштовано" });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Напиши тільки ціну в гривнях для ${req.body.model}. Тільки число, без тексту.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        
        // Витягуємо тільки цифри
        const price = parseInt(text.replace(/\D/g, '')) || 0;
        const searchUrl = `https://telemart.ua/ua/search/?q=${encodeURIComponent(req.body.model)}`;
        
        res.json({ price: price, url: searchUrl });
    } catch (e) {
        console.error("AI Error:", e);
        res.json({ price: 0, url: "#" });
    }
});

// Railway вимагає слухати порт, який він надає через process.env.PORT
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Сервер працює на порту ${PORT}`);
});
