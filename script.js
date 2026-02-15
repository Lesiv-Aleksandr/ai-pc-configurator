let components = [];

async function handleFormSubmit() {
    const modelInput = document.getElementById('comp-model');
    const typeInput = document.getElementById('comp-type');
    const model = modelInput.value.trim();
    const type = typeInput.value;

    if(!model) return;

    const id = Date.now();
    components.push({ id, type, model, price: 0, loading: true });
    updateUI();
    modelInput.value = '';

    console.log("Відправляю запит для:", model);

    try {
        const res = await fetch('/api', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ model })
        });
        
        const data = await res.json();
        console.log("Отримано дані:", data);

        const idx = components.findIndex(c => c.id === id);
        if(idx !== -1) {
            components[idx].price = data.price;
            components[idx].url = data.url;
            components[idx].loading = false;
            updateUI();
        }
    } catch (err) {
        console.error("Помилка запиту:", err);
    }
}

function updateUI() {
    const container = document.getElementById('components-container');
    container.innerHTML = components.map(c => `
        <div class="glass p-4 mb-3 flex justify-between animate-fade-in">
            <div>
                <div class="text-blue-400 text-xs font-bold">${c.type}</div>
                <div class="text-white font-semibold">${c.model}</div>
                ${c.loading ? '<span class="text-xs text-slate-500">Шукаю посилання...</span>' : `<a href="${c.url}" target="_blank" class="text-xs underline text-blue-400">Переглянути в магазині</a>`}
            </div>
            <div class="text-right">
                <div class="text-xl text-white font-bold">${c.loading ? '...' : c.price.toLocaleString() + ' ₴'}</div>
                <button onclick="deleteComp(${c.id})" class="text-xs text-red-500 mt-1">Видалити</button>
            </div>
        </div>
    `).join('');
    
    const total = components.reduce((sum, c) => sum + c.price, 0);
    document.getElementById('grand-total').innerText = total.toLocaleString() + ' ₴';
}

function deleteComp(id) {
    components = components.filter(c => c.id !== id);
    updateUI();
}
