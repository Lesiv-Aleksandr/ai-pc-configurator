console.log("ВЕРСІЯ 2.0 ЗАПУЩЕНА (Миттєве додавання)");

let components = [];

// Основна функція додавання
async function handleFormSubmit() {
    const type = document.getElementById('comp-type').value.trim();
    const model = document.getElementById('comp-model').value.trim();
    
    if (!type || !model) return alert("Заповніть всі поля!");

    // 1. Створюємо тимчасовий об'єкт (ціна 0, статус "Loading")
    const tempId = Date.now();
    const newComp = {
        id: tempId,
        type: type.toUpperCase(),
        model: model,
        price: null, // Сигнал, що ціна ще вантажиться
        url: "#",
        loading: true
    };

    // 2. Одразу додаємо в масив та оновлюємо екран
    components.push(newComp);
    updateUI();
    document.getElementById('comp-model').value = ''; // Очищаємо поле

    // 3. Запускаємо запит до ШІ у фоні
    try {
        const response = await fetch('/api', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: model })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        // Обробляємо отримані дані
        const finalPrice = Number(String(data.price).replace(/[^0-9]/g, '')) || 0;
        let finalUrl = data.url || "#";
        if (finalUrl !== "#" && !finalUrl.startsWith('http')) {
            finalUrl = `https://${finalUrl}`;
        }

        // 4. Знаходимо наш елемент у масиві та оновлюємо його
        const index = components.findIndex(c => c.id === tempId);
        if (index !== -1) {
            components[index].price = finalPrice;
            components[index].url = finalUrl;
            components[index].loading = false;
            updateUI(); // Перемальовуємо з реальною ціною
        }

    } catch (error) {
        console.error("Помилка фонового запиту:", error);
        // У разі помилки ставимо 0, щоб не висіло вічне завантаження
        const index = components.findIndex(c => c.id === tempId);
        if (index !== -1) {
            components[index].price = 0;
            components[index].loading = false;
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
        total += (c.price || 0);
        
        // Формуємо блок ціни залежно від того, вантажиться вона чи ні
        const priceDisplay = c.loading 
            ? `<span class="text-sm text-blue-300 animate-pulse">Шукаємо ціну...</span>` 
            : `${c.price.toLocaleString()} ₴`;

        const linkDisplay = c.loading || c.url === "#"
            ? `<span class="text-xs text-slate-600">Очікуйте...</span>`
            : `<a href="${c.url}" target="_blank" rel="noopener noreferrer" class="text-xs text-slate-400 underline hover:text-blue-300">В магазин</a>`;

        container.innerHTML += `
            <div class="glass p-4 rounded-2xl flex justify-between items-center mb-3 border border-white/5">
                <div>
                    <div class="text-xs text-blue-400 font-bold">${c.type}</div>
                    <div class="text-white font-semibold">${c.model}</div>
                    ${linkDisplay}
                </div>
                <div class="text-right">
                    <div class="text-xl text-white font-bold">${priceDisplay}</div>
                    <button onclick="deleteComp(${c.id})" class="text-xs text-red-500 mt-1 hover:text-red-400">Видалити</button>
                </div>
            </div>`;
    });

    if (totalEl) totalEl.innerText = `${total.toLocaleString()} ₴`;
}

// Функція оновлення всіх цін
async function refreshAllPrices() {
    if (components.length === 0) return alert("Список порожній!");
    
    // Ставимо всім статус завантаження
    components.forEach(c => c.loading = true);
    updateUI();

    for (let i = 0; i < components.length; i++) {
        try {
            const response = await fetch('/api', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: components[i].model })
            });
            const data = await response.json();
            
            components[i].price = Number(String(data.price).replace(/[^0-9]/g, '')) || 0;
            components[i].url = data.url.startsWith('http') ? data.url : `https://${data.url}`;
            components[i].loading = false;
            updateUI(); // Оновлюємо після кожної деталі
        } catch (e) {
            components[i].loading = false;
            updateUI();
        }
    }
}

function deleteComp(id) {
    components = components.filter(c => c.id !== id);
    updateUI();
}
