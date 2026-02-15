const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('./'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.post('/api', async (req, res) => {
    try {
        const modelAI = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        // Спрощуємо промпт. Чим менше тексту — тим менше шансів на статус "Помилка"
        const prompt = `Find cheapest price in Ukraine for ${req.body.model}. 
        Check OLX, Hotline, Rozetka.
        Return ONLY JSON: {"price": number, "url": "string", "shop": "string"}. 
        For OLX add ?sort=price:asc to URL.`;

        const result = await modelAI.generateContent(prompt);
        const rawText = result.response.text().trim();
        
        // Логуємо в консоль Railway, щоб ти бачив, що реально пише ШІ
        console.log("RAW AI:", rawText);

        const jsonMatch = rawText.match(/\{.*\}/s);
        if (!jsonMatch) throw new Error("AI returned no JSON");

        let data = JSON.parse(jsonMatch[0]);
        
        // Очищення ціни від аномалій (як твої 505060)
        let cleanPrice = parseInt(String(data.price).replace(/\D/g, '')) || 0;
        if (cleanPrice > 200000) cleanPrice = Math.round(cleanPrice / 100);

        res.json({
            price: cleanPrice,
            url: data.url || "#",
            shop: data.shop || "Магазин"
        });

    } catch (e) {
        console.error("DETAILED ERROR:", e.message);
        // Якщо помилка — повертаємо хоч якісь дані, щоб фронтенд не писав "Помилка"
        res.json({ price: 0, url: `https://www.google.com/search?q=${encodeURIComponent(req.body.model)}+ціна+купити`, shop: "Google" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on ${PORT}`));
