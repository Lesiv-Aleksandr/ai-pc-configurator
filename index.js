const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('./'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.post('/api', async (req, res) => {
    try {
        console.log("Запит для моделі:", req.body.model);
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Price in UAH for ${req.body.model}. Write ONLY the number.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        
        console.log("ВІДПОВІДЬ ШІ:", text); // ПЕРЕВІРТЕ ЦЕ В RAILWAY LOGS

        // Очищаємо текст від букв, залишаємо тільки цифри
        const price = parseInt(text.replace(/\D/g, '')) || 0;
        const searchUrl = `https://telemart.ua/ua/search/?q=${encodeURIComponent(req.body.model)}`;
        
        res.json({ price: price, url: searchUrl });

    } catch (error) {
        console.error("ПОМИЛКА API:", error.message);
        res.json({ price: 0, url: "#", error: error.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер працює на порту ${PORT}`);
});
