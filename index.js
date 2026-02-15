const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('./'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.post('/api', async (req, res) => {
    try {
        // Використовуємо 2.0 Flash — вона зараз найкраще підтримує пошук через API
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash" 
        });

        const deviceModel = req.body.model;
        
        // Промпт, який вимагає актуальних даних з українських магазинів
        const prompt = `Використовуй Google Search. Знайди реальну ціну в гривнях (UAH) для ${deviceModel} в магазинах України (Telemart, Rozetka, Hotline). 
        Відповідь надай ТІЛЬКИ у вигляді числа. Якщо знайдено кілька варіантів — виведи середню ціну. 
        Жодного тексту, тільки цифри.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        
        // Очищаємо відповідь від усього, крім цифр
        const price = parseInt(text.replace(/\D/g, '')) || 0;
        
        // Генеруємо посилання на пошук в Telemart
        const searchUrl = `https://telemart.ua/ua/search/?q=${encodeURIComponent(deviceModel)}`;
        
        console.log(`AI знайшов для ${deviceModel}: ${price} грн`);

        res.json({ price, url: searchUrl });

    } catch (error) {
        console.error("Серверна помилка:", error.message);
        res.status(500).json({ price: 0, url: "#", error: error.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущено на порту ${PORT}`);
});
