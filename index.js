const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('./'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Напиши ціну в гривнях для ${req.body.model}. Відповідь дай тільки числом.`;
        
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/\D/g, ''); // Видаляємо все, крім цифр
        
        const price = parseInt(text) || 0;
        const searchUrl = `https://telemart.ua/ua/search/?q=${encodeURIComponent(req.body.model)}`;
        
        res.json({ price: price, url: searchUrl });
    } catch (e) {
        console.error(e);
        res.status(500).json({ price: 0, url: "#" });
    }
});

app.listen(process.env.PORT || 8080);
