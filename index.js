app.post('/api', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        // Більш суворий промпт для точності
        const prompt = `Find the current price in Ukraine for ${req.body.model}. 
        Return ONLY the number in UAH. Do not include shipping. 
        Example: if it costs 15600 UAH, write 15600. No text.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        
        // Очищаємо від усього, крім цифр
        let price = parseInt(text.replace(/\D/g, '')) || 0;

        // Корекція: якщо ШІ помилився і видав ціну з копійками (напр. 5050000 замість 50500)
        if (price > 250000) { 
            price = Math.floor(price / 100); 
        }

        const searchUrl = `https://telemart.ua/ua/search/?q=${encodeURIComponent(req.body.model)}`;
        
        res.json({ price, url: searchUrl });
    } catch (error) {
        res.status(500).json({ price: 0, url: "#" });
    }
});
