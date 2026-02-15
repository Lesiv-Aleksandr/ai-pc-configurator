const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('./'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.post('/api', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        // Запитуємо тільки число, щоб не було помилок парсингу
        const prompt = `Надай тільки середню ціну в грн для комплектуючого: ${req.body.model}. 
        Напиши ТІЛЬКИ число (наприклад 15000), без жодного іншого тексту.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        
        // Очищення від будь-яких літер, залишаємо лише цифри
        let price = parseInt(text.replace(/\D/g, '')) || 0;

        // Посилання на пошук — найнадійніший варіант проти 404
        const searchUrl = `https://telemart.ua/ua/search/?q=${encodeURIComponent(req.body.model)}`;
        
        console.log(`Запит: ${req.body.model} | Ціна: ${price}`);
        
        res.json({ price, url: searchUrl });

    } catch (error) {
        console.error("AI Error:", error.message);
        res.status(500).json({ price: 0, url: "#" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер працює на порту ${PORT}`);
});
