async function fetchAIData(modelName) {
    try {
        // ПРАВИЛЬНО: просто /api (Vercel сам зрозуміє, що це його внутрішній сервер)
        const response = await fetch('/api', { 
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
