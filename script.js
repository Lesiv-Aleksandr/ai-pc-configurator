let components = [];

document.getElementById('comp-type').addEventListener('input', function(e) {
    const val = e.target.value;
    const options = document.getElementById('categories').options;
    for (let i = 0; i < options.length; i++) {
        if (options[i].value === val) {
            document.getElementById('comp-model').focus();
            break;
        }
    }
});

async function fetchPrice(model) {
    const res = await fetch('/api', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ model })
    });

    return await res.json();
}

async function handleFormSubmit() {
    const typeInput = document.getElementById('comp-type');
    const modelInput = document.getElementById('comp-model');
    const model = modelInput.value.trim();
    const type = typeInput.value.trim();

    if(!model || !type) return alert("Заповніть обидва поля!");

    const id = Date.now();
    components.push({ id, type, model, price: 0, loading: true, url: "#" });
    updateUI();
    modelInput.value = '';

    try {
        const data = await fetchPrice(model);

        const comp = components.find(c => c.id === id);
        if(comp) {
            comp.price = data.price || 0;
            comp.url = data.url || "#";
            comp.loading = false;
            updateUI();
        }

    } catch (err) {
        console.error("Error:", err);
    }
}

async function refreshPrice(id) {
    const comp = components.find(c => c.id === id);
    if(!comp || comp.loading) return;

    comp.loading = true;
    updateUI();

    try {
        const data = await fetchPrice(comp.model);
        comp.price = data.price || 0;
        comp.url = data.url || "#";
    } catch (err) {
        console.error("Refresh error:", err);
    }

    comp.loading = false;
    updateUI();
}

function updateUI() {
    const container = document.getElementById('components-container');

    if (components.length === 0) {
        container.innerHTML = `<div class="border-2 border-dashed border-white/5 rounded-3xl p-20 text-center text-slate-500 italic">Збірка порожня.</div>`;
        document.getElementById('grand-total').innerText = "0 ₴";
        return;
    }

    container.innerHTML = components.map(c => `
        <div class="glass p-5 rounded-3xl flex justify-between items-center border border-white/5">
            <div>
                <div class="text-blue-500 text-[10px] font-black uppercase tracking-wider">${c.type}</div>
                <div class="text-white font-bold text-lg">${c.model}</div>
                ${c.loading 
                    ? '<span class="text-xs text-slate-500 animate-pulse">AI шукає...</span>' 
                    : `<a href="${c.url}" target="_blank" class="text-xs text-blue-400 underline">В магазин</a>`}
            </div>
            <div class="text-right">
                <div class="text-2xl text-white font-black">
                    ${c.loading ? '...' : c.price.toLocaleString('uk-UA') + ' ₴'}
                </div>
                <div class="flex gap-2 justify-end mt-1">
                    <button onclick="refreshPrice(${c.id})" 
                        class="text-[10px] text-yellow-400 font-bold uppercase hover:text-yellow-300">
                        Оновити
                    </button>
                    <button onclick="deleteComp(${c.id})" 
                        class="text-[10px] text-red-500 font-bold uppercase hover:text-red-400">
                        Видалити
                    </button>
                </div>
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
