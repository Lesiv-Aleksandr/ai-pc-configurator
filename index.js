const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('./'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.post('/api', async (req, res) => {
    try {
        console.log(`--- НОВИЙ ЗАПИТ: ${req.body.model} ---`);
        const modelAI = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const prompt = `Знайти найнижчу ціну в Україні для: ${req.body.model}. 
        Ти ПОВИНЕН перевірити ціни на OLX, Hotline, E-Katalog, Rozetka.
        Поверни відповідь СУВОРО у форматі JSON:
        {"price": число, "url": "посилання на сторінку пошуку з найнижчою ціною", "shop": "назва сайту"}
        Приклад: {"price": 4500, "url": "https://www.olx.ua/...", "shop": "OLX"}`;

        const result = await modelAI.generateContent(prompt);
        const rawText = result.response.text().trim();
        
        console.log("СИРА ВІДПОВІДЬ ВІД GEMINI:", rawText);

        const jsonMatch = rawText.match(/\{.*\}/s);
        let data = { price: 0, url: "#", shop: "Не знайдено" };

        if (jsonMatch) {
            data = JSON.parse(jsonMatch[0]);
            // Очистка ціни
            data.price = parseInt(String(data.price).replace(/\D/g, '')) || 0;
            if (data.price > 500000) data.price = Math.round(data.price / 100);
        }

        console.log("ВІДПРАВЛЕНО НА ФРОНТЕНД:", data);
        res.json(data);
    } catch (e) {
        console.error("ПОМИЛКА НА СЕРВЕРІ:", e.message);
        res.json({ price: 0, url: "#", shop: "Error" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Smart Search Server started on ${PORT}`));
