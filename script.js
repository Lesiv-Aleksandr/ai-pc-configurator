let components = [];

// Додавання нового компонента
async function handleFormSubmit() {
    const type = document.getElementById('comp-type').value.trim();
    const model = document.getElementById('comp-model').value.trim();
    const submitBtn = document.getElementById('submit-btn');

    if (!type || !model) return alert("Заповніть всі поля!");

    submitBtn.disabled = true;
    submitBtn.innerText = "Gemini шукає...";

    const data = await fetchAIPrice(model);
    
    if (data) {
        components.push({
            id: Date.now(),
            type: type.toUpperCase(),
            model: model,
            price: data.price,
            url: data.url
        });
        updateUI();
        clearInputs();
    }
    
    submitBtn.disabled = false;
    submitBtn.innerText = "Додати та знайти ціну";
}

// Запит до сервера
async function fetchAIPrice(modelName) {
    try {
        const response = await fetch('/api', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: modelName })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        // Форматування ціни та посилання
        const price = Number(String(data.price).replace(/[^0-9]/g, '')) || 0;
        let url = data.url || "#";
        if (url !== "#" && !url.startsWith('http')) {
            url = `https://${url}`;
        }

        return { price, url };
    } catch (error) {
        alert("Помилка: " + error.message);
        return null;
    }
}

// Оновлення інтерфейсу
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
                    <button onclick="deleteComp(${c.id})" class="text-xs text-red-500 mt-1">Видалити</button>
                </div>
            </div>`;
    });

    if (totalEl) totalEl.innerText = `${total.toLocaleString()} ₴`;
}

// РЕАЛЬНЕ оновлення всіх цін
async function refreshAllPrices() {
    if (components.length === 0) return alert("Список порожній!");
    
    const refreshBtn = document.querySelector('button[onclick="refreshAllPrices()"]');
    refreshBtn.disabled = true;
    refreshBtn.innerText = "Оновлюю все...";

    for (let i = 0; i < components.length; i++) {
        const newData = await fetchAIPrice(components[i].model);
        if (newData) {
            components[i].price = newData.price;
            components[i].url = newData.url;
        }
    }

    updateUI();
    refreshBtn.disabled = false;
    refreshBtn.innerHTML = '<i class="fas fa-sync-alt mr-2"></i> ОНОВИТИ ЦІНИ (AI SCAN)';
}

function deleteComp(id) {
    components = components.filter(c => c.id !== id);
    updateUI();
}

function clearInputs() {
    document.getElementById('comp-model').value = '';
}
