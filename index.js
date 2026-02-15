const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('./'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.post('/api', async (req, res) => {
    try {
        const modelAI = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `Aktualna cina v UAH dlya ${req.body.model} v Ukraini. Napyshy TILKY CHYSLO bez tekstu. Jaksho cina 25000.50 - napyshy 25000.`;

        const result = await modelAI.generateContent(prompt);
        let text = result.response.text().trim().replace(/\D/g, '');
        
        let price = parseInt(text) || 0;

        // Корекція розрядності: якщо ціна > 250к за одну деталь, скоріш за все AI помилився з нулями
        if (price > 250000) price = Math.round(price / 100);

        // Повне посилання на пошук в Telemart
        const searchUrl = `https://telemart.ua/ua/search/?q=${encodeURIComponent(req.body.model)}`;

        res.json({ price, url: searchUrl });
    } catch (e) {
        console.error("AI Error:", e.message);
        res.status(200).json({ price: 0, url: "#" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Сервер на порту ${PORT}`));
