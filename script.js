let components = [];
// Завантаження історії з локальної пам'яті браузера
const history = JSON.parse(localStorage.getItem('ai_pc_history') || '{"types":[], "models":[]}');

updateDatalists();

async function handleFormSubmit() {
    const tInput = document.getElementById('comp-type');
    const mInput = document.getElementById('comp-model');
    const type = tInput.value.trim();
    const model = mInput.value.trim();

    if (!type || !model) return;

    // Зберігаємо в історію
    if (!history.types.includes(type)) history.types.push(type);
    if (!history.models.includes(model)) history.models.push(model);
    localStorage.setItem('ai_pc_history', JSON.stringify(history));
    updateDatalists();

    const id = Date.now();
    components.push({ id, type, model, price: 0, loading: true, url: "#" });
    
    tInput.value = '';
    mInput.value = '';
    updateUI();

    await fetchPriceFromServer(id, model);
}

async function fetchPriceFromServer(id, model) {
    try {
        const response = await fetch('/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model })
        });
        const data = await response.json();
        
        const idx = components.findIndex(c => c.id === id);
        if (idx !== -1) {
            components[idx].price = data.price;
            components[idx].url = data.url;
            components[idx].loading = false;
            updateUI();
        }
    } catch (err) {
        console.error("Помилка:", err);
    }
}

async function refreshAllPrices() {
    for (let c of components) {
        c.loading = true;
        updateUI();
        await fetchPriceFromServer(c.id, c.model);
    }
}

function updateDatalists() {
    document.getElementById('type-history').innerHTML = history.types.map(t => `<option value="${t}">`).join('');
    document.getElementById('model-history').innerHTML = history.models.map(m => `<option value="${m}">`).join('');
}

function updateUI() {
    const container = document.getElementById('components-container');
    if (components.length === 0) {
        container.innerHTML = `<div class="text-center py-20 text-slate-600 italic">Список поки що порожній...</div>`;
        document.getElementById('grand-total').innerText = "0 ₴";
        return;
    }

    container.innerHTML = components.map(c => `
        <div class="glass p-6 rounded-[2rem] flex justify-between items-center transition hover:border-white/20">
            <div>
                <div class="text-blue-500 text-[10px] font-black uppercase mb-1">${c.type}</div>
                <div class="text-xl font-bold text-white">${c.model}</div>
                ${c.loading ? '<span class="text-xs text-slate-500 animate-pulse">Gemini шукає ціну...</span>' : 
                `<a href="${c.url}" target="_blank" class="text-xs text-blue-400 underline hover:text-blue-200">Переглянути в магазині</a>`}
            </div>
            <div class="text-right">
                <div class="text-3xl font-black italic text-white">${c.loading ? '...' : c.price.toLocaleString('uk-UA') + ' ₴'}</div>
                <button onclick="deleteComp(${c.id})" class="text-[10px] text-red-500 font-bold uppercase mt-2 hover:text-red-400">Видалити</button>
            </div>
        </div>
    `).join('');

    const total = components.reduce((sum, c) => sum + (c.price || 0), 0);
    document.getElementById('grand-total').innerText = total.toLocaleString('uk-UA') + ' ₴';
}

function deleteComp(id) {
    components = components.filter(c => c.id !== id);
    updateUI();
}
