console.log("ВЕРСІЯ 2.0 ЗАПУЩЕНА"); // Для перевірки оновлення

let components = [];

async function handleFormSubmit() {
    const type = document.getElementById('comp-type').value.trim();
    const model = document.getElementById('comp-model').value.trim();
    const submitBtn = document.getElementById('submit-btn');

    if (!type || !model) return alert("Заповніть всі поля!");

    submitBtn.disabled = true;
    submitBtn.innerText = "Gemini шукає...";

    try {
        const response = await fetch('/api', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: model })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        // ОЧИЩЕННЯ ЦІНИ
        const price = Number(String(data.price).replace(/[^0-9]/g, '')) || 0;
        
        // ПЕРЕВІРКА ПОСИЛАННЯ (Абсолютна адреса)
        let rawUrl = data.url || "#";
        let finalUrl = rawUrl;
        
        if (rawUrl !== "#") {
            // Якщо немає http, додаємо його примусово
            if (!rawUrl.startsWith('http')) {
                finalUrl = `https://${rawUrl}`;
            }
        }

        components.push({
            id: Date.now(),
            type: type.toUpperCase(),
            model: model,
            price: price,
            url: finalUrl
        });

        updateUI();
        document.getElementById('comp-model').value = '';

    } catch (error) {
        alert("Помилка: " + error.message);
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
            <div class="glass p-4 rounded-2xl flex justify-between items-center mb-3">
                <div>
                    <div class="text-xs text-blue-400 font-bold">${c.type}</div>
                    <div class="text-white font-semibold">${c.model}</div>
                    <a href="${c.url}" target="_blank" rel="noopener noreferrer" class="external-link text-xs text-slate-400 underline">
                        Переглянути в магазині
                    </a>
                </div>
                <div class="text-right">
                    <div class="text-xl text-white font-bold">${c.price.toLocaleString()} ₴</div>
                    <button onclick="deleteComp(${c.id})" class="text-xs text-red-500">Видалити</button>
                </div>
            </div>`;
    });

    if (totalEl) totalEl.innerText = `${total.toLocaleString()} ₴`;
}

async function refreshAllPrices() {
    if (components.length === 0) return alert("Список порожній!");
    alert("Оновлення запущено. Зачекайте...");
    
    for (let i = 0; i < components.length; i++) {
        const response = await fetch('/api', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: components[i].model })
        });
        const data = await response.json();
        if (data.price) {
            components[i].price = Number(String(data.price).replace(/[^0-9]/g, '')) || 0;
            components[i].url = data.url.startsWith('http') ? data.url : `https://${data.url}`;
        }
    }
    updateUI();
}

function deleteComp(id) {
    components = components.filter(c => c.id !== id);
    updateUI();
}
