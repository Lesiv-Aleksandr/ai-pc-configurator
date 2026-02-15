const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('./'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.post('/api', async (req, res) => {
    try {
        // Використовуємо стабільну 2.0 Flash
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const prompt = `Aktualna cina v UAH (Ukraine, Feb 2026) dlya: ${req.body.model}. 
        Napyshy TILKY CHYSLO. Bez tekstu. Jaksho cina 25000.50 - napyshy 25000.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim().replace(/\D/g, '');
        
        let price = parseInt(text) || 0;
        
        // Корекція розрядності (захист від помилок ШІ)
        if (price > 500000) price = Math.floor(price / 100);

        res.json({ 
            price, 
            url: `https://telemart.ua/ua/search/?q=${encodeURIComponent(req.body.model)}` 
        });
    } catch (e) {
        console.error("AI Error:", e.message);
        res.json({ price: 0, url: "#" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`Server OK on ${PORT}`));
