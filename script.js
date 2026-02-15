let components = [];
const history = JSON.parse(localStorage.getItem('pc_history') || '{"types":[], "models":[]}');

// Оновлення підказок при завантаженні
updateDatalists();

async function handleFormSubmit() {
    const typeInput = document.getElementById('comp-type');
    const modelInput = document.getElementById('comp-model');
    const type = typeInput.value.trim();
    const model = modelInput.value.trim();

    if (!type || !model) return;

    // Зберігаємо в історію для підказок
    saveToHistory(type, model);

    const id = Date.now();
    components.push({ id, type, model, price: 0, loading: true });
    updateUI();

    typeInput.value = '';
    modelInput.value = '';

    await fetchPrice(id, model);
}

async function fetchPrice(id, model) {
    try {
        const res = await fetch('/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model })
        });
        const data = await res.json();
        
        const idx = components.findIndex(c => c.id === id);
        if (idx !== -1) {
            components[idx].price = data.price;
            components[idx].url = data.url;
            components[idx].loading = false;
            updateUI();
        }
    } catch (e) {
        console.error(e);
    }
}

async function refreshAllPrices() {
    for (let comp of components) {
        comp.loading = true;
        updateUI();
        await fetchPrice(comp.id, comp.model);
    }
}

function saveToHistory(type, model) {
    if (!history.types.includes(type)) history.types.push(type);
    if (!history.models.includes(model)) history.models.push(model);
    localStorage.setItem('pc_history', JSON.stringify(history));
    updateDatalists();
}

function updateDatalists() {
    document.getElementById('prev-types').innerHTML = history.types.map(t => `<option value="${t}">`).join('');
    document.getElementById('prev-models').innerHTML = history.models.map(m => `<option value="${m}">`).join('');
}

function updateUI() {
    const container = document.getElementById('components-container');
    container.innerHTML = components.map(c => `
        <div class="glass p-5 rounded-3xl flex justify-between items-center border border-white/5">
            <div>
                <div class="text-blue-500 text-[10px] font-bold uppercase">${c.type}</div>
                <div class="text-white font-bold">${c.model}</div>
                ${c.loading ? '<span class="text-xs text-slate-500">Оновлення...</span>' : `<a href="${c.url}" target="_blank" class="text-xs text-blue-400 underline">Магазин</a>`}
            </div>
            <div class="text-right">
                <div class="text-2xl font-black">${c.loading ? '...' : c.price.toLocaleString() + ' ₴'}</div>
                <button onclick="deleteComp(${c.id})" class="text-[10px] text-red-500 uppercase">Видалити</button>
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
