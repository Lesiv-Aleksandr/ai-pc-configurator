async function handleFormSubmit() {
    const type = document.getElementById('comp-type').value.trim();
    const model = document.getElementById('comp-model').value.trim();
    const submitBtn = document.getElementById('submit-btn');

    if (!type || !model) return alert("Введіть категорію та модель!");

    submitBtn.disabled = true;
    submitBtn.innerText = "AI шукає ціну...";

    try {
        const response = await fetch('/api', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: model })
        });

        if (!response.ok) throw new Error('Помилка сервера');

        const aiResult = await response.json();

        const newComp = {
            id: Date.now(),
            type: type.toUpperCase(),
            model: model,
            price: aiResult.price || 0,
            url: aiResult.url || "#"
        };

        components.push(newComp);
        updateUI();
        clearInputs();
    } catch (error) {
        console.error("Помилка при додаванні:", error);
        alert("ШІ не зміг отримати дані. Перевірте налаштування API.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Додати та знайти ціну";
    }
}
