const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('./'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.post('/api', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Average price in UAH for: ${req.body.model}. Output ONLY the number, no text.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        
        let price = parseInt(text.replace(/\D/g, '')) || 0;
        // Запобіжник від занадто довгих чисел
        if (price > 1000000) price = Math.floor(price / 100); 

        // Посилання на пошук для уникнення 404
        const searchUrl = `https://telemart.ua/ua/search/?q=${encodeURIComponent(req.body.model)}`;
        
        res.json({ price, url: searchUrl });
    } catch (error) {
        console.error("AI Error:", error.message);
        res.status(500).json({ price: 0, url: "#" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
