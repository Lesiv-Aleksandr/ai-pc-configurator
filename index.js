const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('./'));

// Ініціалізація з використанням ключа з налаштувань Railway
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.post('/api', async (req, res) => {
    try {
        // Використовуємо саме версію gemini-2.5-flash
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const deviceModel = req.body.model || "Unknown component";
        const prompt = `Ціна в грн для ${deviceModel}. Напиши тільки число.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        
        // Очищення результату: залишаємо лише цифри
        const price = parseInt(text.replace(/\D/g, '')) || 0;
        
        // Пряме посилання на пошук у Telemart
        const searchUrl = `https://telemart.ua/ua/search/?q=${encodeURIComponent(deviceModel)}`;
        
        res.json({ price: price, url: searchUrl });

    } catch (error) {
        console.error("AI Error:", error.message);
        // Повертаємо об'єкт з нулем, щоб фронтенд не "зависав"
        res.json({ price: 0, url: "#", error: error.message });
    }
});

// Налаштування порту для Railway (0.0.0.0 обов'язково для усунення 502)
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер працює на порту ${PORT}`);
});
