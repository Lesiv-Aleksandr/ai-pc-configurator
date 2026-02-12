async function fetchAIData(modelName) {
    try {
        const response = await fetch('/api', { // Звертаємось до Vercel API
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: modelName })
        });
        return await response.json();
    } catch (e) {
        console.error("Помилка:", e);
        return { price: 0, url: "#" };
    }
}