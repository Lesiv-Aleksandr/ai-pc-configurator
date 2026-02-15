let components = [];
const history = JSON.parse(localStorage.getItem('ai_price_history') || '{"types":[], "models":[]}');

updateDatalists();

async function handleFormSubmit() {
    const tInput = document.getElementById('comp-type');
    const mInput = document.getElementById('comp-model');
    const type = tInput.value.trim();
    const model = mInput.value.trim();

    if (!type || !model) return;

    if (!history.types.includes(type)) history.types.push(type);
    if (!history.models.includes(model)) history.models.push(model);
    localStorage.setItem('ai_price_history', JSON.stringify(history));
    updateDatalists();

    const id = Date.now();
    components.push({ id, type, model, price: 0, loading: true, url: "#", shop: "Шукаю..." });
    updateUI();
    await fetchBestPrice(id, model);
}

async function fetchBestPrice(id, model) {
    try {
        const response = await fetch('/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model })
        });
        const data = await response.json();
        console.log("Відповідь ШІ:", data);

        const idx = components.findIndex(c => c.id === id);
        if (idx !== -1) {
            components[idx].price = data.price;
            components[idx].url = data.url;
            components[idx].shop = data.shop;
            components[idx].loading = false;
            updateUI();
        }
    } catch (err) {
        console.error("Помилка:", err);
    }
}

async function refreshAllPrices() {
    const btn = document.querySelector('.update-btn');
    btn.disabled = true;
    btn.innerText = "ЗАЧЕКАЙТЕ 5 СЕК...";
    
    for (let c of components) {
        c.loading = true;
        updateUI();
        await fetchBestPrice(c.id, c.model);
    }

    setTimeout(() => {
        btn.disabled = false;
        btn.innerText = "↻ ОНОВИТИ ВСІ ЦІНИ";
    }, 5000);
}

function updateDatalists() {
    document.getElementById('type-list').innerHTML = history.types.map(t => `<option value="${t}">`).join('');
    document.getElementById('model-list').innerHTML = history.models.map(m => `<option value="${m}">`).join('');
}

function updateUI() {
    const container = document.getElementById('components-container');
    container.innerHTML = components.map(c => `
        <div class="glass p-6 rounded-[2rem] flex justify-between items-center mb-4">
            <div>
                <div class="text-blue-500 text-[10px] font-black uppercase mb-1">${c.type}</div>
                <div class="text-xl font-bold text-white">${c.model}</div>
                ${c.loading ? '<span class="text-xs text-slate-500 animate-pulse">Аналіз ринку...</span>' : 
                `<a href="${c.url}" target="_blank" class="text-xs text-green-400 underline font-bold">Джерело: ${c.shop}</a>`}
            </div>
            <div class="text-right">
                <div class="text-3xl font-black italic text-white">${c.loading ? '...' : c.price.toLocaleString('uk-UA') + ' ₴'}</div>
                <button onclick="deleteComp(${c.id})" class="text-[10px] text-red-500 font-bold uppercase mt-2">Видалити</button>
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
