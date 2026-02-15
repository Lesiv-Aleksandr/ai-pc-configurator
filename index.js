const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('./'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.post('/api', async (req, res) => {
    try {
        const modelAI = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        // Дуже точний запит, щоб ШІ не вигадував мільйони
        const prompt = `Current average price in UAH for ${req.body.model} in Ukraine stores. 
        Respond ONLY with the number. If price is 50,000 UAH, write 50000.`;

        const result = await modelAI.generateContent(prompt);
        let text = result.response.text().trim().replace(/\D/g, '');
        
        let price = parseInt(text) || 0;
        
        // Корекція розрядності: якщо ціна > 300к (для однієї деталі це забагато), 
        // ймовірно ШІ додав зайві нулі (копійки)
        if (price > 300000) price = Math.round(price / 100);

        // Повне посилання на Telemart з кодуванням пробілів
        const searchUrl = `https://telemart.ua/ua/search/?q=${encodeURIComponent(req.body.model)}`;

        res.json({ price, url: searchUrl });
    } catch (e) {
        console.error(e);
        res.json({ price: 0, url: "#" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on port ${PORT}`));
