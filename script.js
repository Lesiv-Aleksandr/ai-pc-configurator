let components = [];

// Авто-перехід на модель після вибору категорії
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
        const res = await fetch('/api', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ model })
        });
        const data = await res.json();

        const idx = components.findIndex(c => c.id === id);
        if(idx !== -1) {
            components[idx].price = data.price || 0;
            components[idx].url = data.url;
            components[idx].loading = false;
            updateUI();
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

function updateUI() {
    const container = document.getElementById('components-container');
    if (components.length === 0) {
        container.innerHTML = `<div class="border-2 border-dashed border-white/5 rounded-3xl p-20 text-center text-slate-500 italic">Збірка порожня.</div>`;
        document.getElementById('grand-total').innerText = "0 ₴";
        return;
    }

    container.innerHTML = components.map(c => `
        <div class="glass p-5 rounded-3xl flex justify-between items-center border border-white/5 animate-fade-in">
            <div>
                <div class="text-blue-500 text-[10px] font-black uppercase tracking-wider">${c.type}</div>
                <div class="text-white font-bold text-lg">${c.model}</div>
                ${c.loading ? '<span class="text-xs text-slate-500 animate-pulse">AI шукає...</span>' : 
                `<a href="${c.url}" target="_blank" class="text-xs text-blue-400 underline">В магазин</a>`}
            </div>
            <div class="text-right">
                <div class="text-2xl text-white font-black">${c.loading ? '...' : c.price.toLocaleString('uk-UA') + ' ₴'}</div>
                <button onclick="deleteComp(${c.id})" class="text-[10px] text-red-500 font-bold uppercase hover:text-red-400 mt-1">Видалити</button>
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
