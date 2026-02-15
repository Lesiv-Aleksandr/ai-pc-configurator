const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('./'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.post('/api', async (req, res) => {
    try {
        console.log(`[SERVER] Пошук найнижчої ціни для: ${req.body.model}`);
        const modelAI = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `Знайти НАЙНИЖЧУ актуальну ціну в Україні для: ${req.body.model}. 
        Обов'язково перевір OLX.ua, Hotline.ua та Rozetka. 
        Надай відповідь СУВОРО у форматі JSON:
        {"price": число_без_копійок, "url": "посилання_на_пошук_на_цьому_ресурсі", "shop": "Назва_сайту"}
        Приклад: {"price": 3200, "url": "https://www.olx.ua/d/uk/list/q-ryzen-3600/", "shop": "OLX"}`;

        const result = await modelAI.generateContent(prompt);
        const rawResponse = result.response.text().trim();
        
        console.log("[GEMINI RAW]:", rawResponse);

        const jsonMatch = rawResponse.match(/\{.*\}/s);
        let data = { price: 0, url: "#", shop: "Не знайдено" };

        if (jsonMatch) {
            data = JSON.parse(jsonMatch[0]);
            // Виправляємо помилку з мільйонами (505060 -> 5050)
            data.price = parseInt(String(data.price).replace(/\D/g, '')) || 0;
            if (data.price > 250000) data.price = Math.round(data.price / 100);
        }

        res.json(data);
    } catch (e) {
        console.error("[SERVER ERROR]:", e.message);
        res.json({ price: 0, url: "#", shop: "Помилка" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Сервер на порту ${PORT}`));
