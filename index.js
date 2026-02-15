const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('./'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.post('/api', async (req, res) => {
    try {
        const modelAI = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        // Покращений промпт для генерації посилань з фільтрами
        const prompt = `Знайти найнижчу актуальну ціну в Україні для: ${req.body.model}. 
        Ти повинен проаналізувати OLX, Hotline, Rozetka.
        Відповідь надай ТІЛЬКИ у форматі JSON:
        {"price": число, "url": "посилання_з_фільтром_найдешевшої_ціни", "shop": "Назва"}
        
        ВАЖЛИВО:
        1. Якщо це OLX, додавай у посилання параметри сортування за ціною (sort=price,asc).
        2. Якщо це Hotline, давай посилання на сторінку порівняння цін.`;

        const result = await modelAI.generateContent(prompt);
        const rawText = result.response.text().trim();
        const jsonMatch = rawText.match(/\{.*\}/s);
        
        let data = { price: 0, url: "#", shop: "Не знайдено" };

        if (jsonMatch) {
            data = JSON.parse(jsonMatch[0]);
            
            // Корекція ціни, щоб не було 505060 (ділимо на 100, якщо цифра космічна)
            data.price = parseInt(String(data.price).replace(/\D/g, '')) || 0;
            if (data.price > 250000) data.price = Math.round(data.price / 100);
            
            // Якщо ШІ дав просте посилання на OLX, ми самі додамо сортування "найдешевші"
            if (data.url.includes('olx.ua') && !data.url.includes('search%5Bsort%5D')) {
                data.url += "?search%5Bsort%5D=price%3Aasc";
            }
        }

        console.log("РЕЗУЛЬТАТ:", data);
        res.json(data);
    } catch (e) {
        res.json({ price: 0, url: "#", shop: "Помилка" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`Smart Search running on ${PORT}`));
