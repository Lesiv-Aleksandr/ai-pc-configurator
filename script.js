let components = [];

async function handleFormSubmit() {
    const type = document.getElementById('comp-type').value.trim();
    const model = document.getElementById('comp-model').value.trim();
    const submitBtn = document.getElementById('submit-btn');

    if (!type || !model) return alert("Заповніть всі поля!");

    submitBtn.disabled = true;
    submitBtn.innerText = "Gemini шукає ціну...";

    try {
        const response = await fetch('/api', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: model })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Помилка сервера');

        // Очищення ціни: прибираємо все крім цифр
        const cleanPrice = Number(String(data.price).replace(/[^0-9]/g, '')) || 0;

        // Перевірка посилання: додаємо https:// якщо його немає
        let finalUrl = data.url || "#";
        if (finalUrl !== "#" && !finalUrl.startsWith('http')) {
            finalUrl = `https://${finalUrl}`;
        }

        const newComp = {
            id: Date.now(),
            type: type.toUpperCase(),
            model: model,
            price: cleanPrice,
            url: finalUrl
        };

        components.push(newComp);
        updateUI();
        clearInputs();

    } catch (error) {
        alert(`Помилка: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Додати та знайти ціну";
    }
}

function updateUI() {
    const container = document.getElementById('components-container');
    const totalEl = document.getElementById('grand-total');
    if (!container) return;

    container.innerHTML = '';
    let total = 0;

    components.forEach(c => {
        total += c.price;
        container.innerHTML += `
            <div class="glass p-4 rounded-2xl flex justify-between items-center mb-3 animate-fade-in">
                <div>
                    <div class="text-xs text-blue-400 font-bold">${c.type}</div>
                    <div class="text-white font-semibold">${c.model}</div>
                    <a href="${c.url}" target="_blank" rel="noopener noreferrer" class="text-xs text-slate-400 underline hover:text-blue-300">
                        Переглянути в магазині
                    </a>
                </div>
                <div class="text-right">
                    <div class="text-xl text-white font-bold">${c.price.toLocaleString()} ₴</div>
                    <button onclick="deleteComp(${c.id})" class="text-xs text-red-500 hover:text-red-400 mt-1">Видалити</button>
                </div>
            </div>`;
    });

    if (totalEl) totalEl.innerText = `${total.toLocaleString()} ₴`;
}

function deleteComp(id) {
    components = components.filter(c => c.id !== id);
    updateUI();
}

function clearInputs() {
    document.getElementById('comp-model').value = '';
}
