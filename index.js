const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('./'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.post('/api', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0,
                responseMimeType: "application/json"
            }
        });

        const deviceModel = req.body.model;

        const prompt = `
        Оціни середню ринкову ціну в Україні для: ${deviceModel}.
        
        Поверни ТІЛЬКИ JSON у форматі:
        {
          "price": number
        }

        Без пояснень. Без тексту. Тільки JSON.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        let price = 0;

        try {
            const parsed = JSON.parse(text);
            if (typeof parsed.price === "number") {
                price = parsed.price;
            }
        } catch (e) {
            console.error("JSON parse error:", text);
        }

        const searchUrl = `https://telemart.ua/ua/search/?q=${encodeURIComponent(deviceModel)}`;

        res.json({ price, url: searchUrl });

    } catch (error) {
        console.error("Серверна помилка:", error.message);
        res.status(500).json({ price: 0, url: "#", error: error.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущено на порту ${PORT}`);
});
