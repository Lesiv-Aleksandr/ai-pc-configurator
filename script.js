let components = [];

async function handleFormSubmit() {
    const typeInput = document.getElementById('comp-type');
    const modelInput = document.getElementById('comp-model');
    const type = typeInput.value.trim();
    const model = modelInput.value.trim();

    if (!type || !model) return alert("Заповніть поля!");

    const currentId = Date.now();
    const newComp = {
        id: currentId,
        type: type.toUpperCase(),
        model: model,
        price: 0,
        url: "#",
        loading: true
    };

    components.push(newComp);
    updateUI();
    modelInput.value = '';

    try {
        const response = await fetch('/api', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: model })
        });

        const data = await response.json();

        // Шукаємо наш компонент у масиві
        const idx = components.findIndex(c => c.id === currentId);
        if (idx !== -1) {
            components[idx].price = data.price || 0;
            
            // Якщо посилання "криве", робимо пошук в Google
            let link = data.url && data.url !== "#" ? data.url : `https://www.google.com/search?q=${encodeURIComponent(model)}+купити`;
            if (!link.startsWith('http')) link = 'https://' + link;
            
            components[idx].url = link;
            components[idx].loading = false;
            updateUI();
        }
    } catch (e) {
        console.error("Error updating price:", e);
        const idx = components.findIndex(c => c.id === currentId);
        if (idx !== -1) {
            components[idx].loading = false;
            updateUI();
        }
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
        const priceDisplay = c.loading ? `<span class="animate-pulse text-blue-400">Шукаю...</span>` : `${c.price.toLocaleString()} ₴`;
        const linkDisplay = c.loading ? `<span class="text-slate-500 italic">Очікуйте...</span>` : `<a href="${c.url}" target="_blank" class="text-blue-400 underline">В магазин</a>`;

        container.innerHTML += `
            <div class="glass p-4 rounded-2xl flex justify-between items-center mb-3">
                <div>
                    <div class="text-xs text-blue-500 font-bold">${c.type}</div>
                    <div class="text-white font-semibold">${c.model}</div>
                    ${linkDisplay}
                </div>
                <div class="text-right">
                    <div class="text-xl text-white font-bold">${priceDisplay}</div>
                    <button onclick="deleteComp(${c.id})" class="text-xs text-red-500">Видалити</button>
                </div>
            </div>`;
    });
    if (totalEl) totalEl.innerText = `${total.toLocaleString()} ₴`;
}

function deleteComp(id) {
    components = components.filter(c => c.id !== id);
    updateUI();
}
