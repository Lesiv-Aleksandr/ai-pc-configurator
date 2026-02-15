app.post('/api', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // Просимо ШІ бути максимально простим
        const prompt = `Provide only the price in UAH for this PC component: ${req.body.model}. 
        Output format: JUST THE NUMBER. Nothing else.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log("RAW AI RESPONSE:", text); // Це ви побачите в логах Railway

        // Видаляємо все, крім цифр (наприклад, "Ціна: 5 000 грн" перетвориться на "5000")
        const priceOnly = text.replace(/\D/g, '');
        const finalPrice = parseInt(priceOnly) || 0;

        // Генеруємо посилання на пошук самостійно (це 100% робочий варіант)
        const searchUrl = `https://telemart.ua/ua/search/?q=${encodeURIComponent(req.body.model)}`;
        
        res.json({ 
            price: finalPrice, 
            url: searchUrl 
        });
    } catch (e) {
        console.error("DETAILED ERROR:", e);
        res.status(500).json({ price: 0, url: "#", error: e.message });
    }
});
