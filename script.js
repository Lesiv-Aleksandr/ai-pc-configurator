let components = [];
// Завантаження історії з пам'яті браузера
const history = JSON.parse(localStorage.getItem('pc_history') || '{"types":[], "models":[]}');

updateDatalists();

async function handleFormSubmit() {
    const tInput = document.getElementById('comp-type');
    const mInput = document.getElementById('comp-model');
    const type = tInput.value.trim();
    const model = mInput.value.trim();

    if (!type || !model) return alert("Введіть назву та модель!");

    saveToHistory(type, model);

    const id = Date.now();
    components.push({ id, type, model, price: 0, loading: true, url: "#" });
    
    tInput.value = '';
    mInput.value = '';
    updateUI();

    await fetchSinglePrice(id, model);
}

async function fetchSinglePrice(id, model) {
    try {
        const response = await fetch('/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model })
        });
        const data = await response.json();
        
        const index = components.findIndex(c => c.id === id);
        if (index !== -1) {
            components[index].price = data.price;
            components[index].url = data.url;
            components[index].loading = false;
            updateUI();
        }
    } catch (err) {
        console.error("Помилка запиту:", err);
    }
}

async function refreshAllPrices() {
    for (let c of components) {
        c.loading = true;
        updateUI();
        await fetchSinglePrice(c.id, c.model);
    }
}

function saveToHistory(t, m) {
    if (!history.types.includes(t)) history.types.push(t);
    if (!history.models.includes(m)) history.models.push(m);
    localStorage.setItem('pc_history', JSON.stringify(history));
    updateDatalists();
}

function updateDatalists() {
    document.getElementById('type-list').innerHTML = history.types.map(x => `<option value="${x}">`).join('');
    document.getElementById('model-list').innerHTML = history.models.map(x => `<option value="${x}">`).join('');
}

function updateUI() {
    const container = document.getElementById('components-container');
    if (components.length === 0) {
        container.innerHTML = `<div class="text-center py-20 text-slate-600 italic">Список компонентів порожній...</div>`;
        document.getElementById('grand-total').innerText = "0 ₴";
        return;
    }

    container.innerHTML = components.map(c => `
        <div class="glass p-6 rounded-[2rem] flex justify-between items-center transition hover:border-white/20">
            <div>
                <div class="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-1">${c.type}</div>
                <div class="text-xl font-bold">${c.model}</div>
                ${c.loading ? '<div class="text-xs text-slate-500 animate-pulse mt-1">Оновлюю ціну...</div>' : 
                `<a href="${c.url}" target="_blank" class="text-xs text-blue-400 hover:text-blue-200 underline inline-block mt-1">Переглянути в магазині</a>`}
            </div>
            <div class="text-right">
                <div class="text-3xl font-black italic">${c.loading ? '...' : c.price.toLocaleString('uk-UA') + ' ₴'}</div>
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
