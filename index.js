const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api', async (req, res) => {
    const { model: deviceModel } = req.body;
    if (!deviceModel) return res.status(400).json({ error: "No model" });

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `Find the current price in Ukraine (UAH) and a store link for: ${deviceModel}. 
        Return ONLY a JSON object: {"price": number, "url": "string"}. No extra text.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        
        console.log("RAW RESPONSE FROM AI:", text);

        // Регулярний вираз для пошуку JSON { ... }
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            // Очищаємо ціну, якщо ШІ раптом прислав рядок "5000 грн" замість числа
            const cleanPrice = parseInt(String(data.price).replace(/\D/g, '')) || 0;
            
            res.json({
                price: cleanPrice,
                url: data.url || "#"
            });
        } else {
            throw new Error("JSON not found in response");
        }

    } catch (error) {
        console.error("SERVER ERROR:", error.message);
        res.status(500).json({ price: 0, url: "#", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
