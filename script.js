console.log("ВЕРСІЯ 3.0: Миттєве додавання + Fix");

let components = [];

async function handleFormSubmit() {
    const typeInput = document.getElementById('comp-type');
    const modelInput = document.getElementById('comp-model');
    
    const type = typeInput.value.trim();
    const model = modelInput.value.trim();
    
    if (!type || !model) return alert("Заповніть всі поля!");

    // 1. Створюємо об'єкт з унікальним ID
    const tempId = Date.now();
    const newComp = {
        id: tempId,
        type: type.toUpperCase(),
        model: model,
        price: 0,
        url: "#",
        loading: true
    };

    // 2. Додаємо в масив та малюємо "заглушку"
    components.push(newComp);
    updateUI();
    
    // Очищаємо тільки поле моделі для зручності
    modelInput.value = '';

    // 3. Запит до сервера
    try {
        const response = await fetch('/api', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: model })
        });

        if (!response.ok) throw new Error("Помилка сервера");
        const data = await response.json();

        // ОБРОБКА ЦІНИ: видаляємо все крім цифр
        const finalPrice = Number(String(data.price).replace(/[^0-9]/g, '')) || 0;
        
        // ОБРОБКА ПОСИЛАННЯ: якщо ШІ не дав посилання, робимо пошук у Google
        let finalUrl = data.url && data.url !== "#" ? data.url : `https://www.google.com/search?q=${encodeURIComponent(model)}+купити+україна`;
        
        if (!finalUrl.startsWith('http')) {
            finalUrl = `https://${finalUrl}`;
        }

        // 4. Оновлюємо дані в масиві
        const compIndex = components.findIndex(c => c.id === tempId);
        if (compIndex !== -1) {
            components[compIndex].price = finalPrice;
            components[compIndex].url = finalUrl;
            components[compIndex].loading = false;
            updateUI(); // Перемальовуємо з готовими даними
        }

    } catch (error) {
        console.error("Fetch error:", error);
        const compIndex = components.findIndex(c => c.id === tempId);
        if (compIndex !== -1) {
            components[compIndex].loading = false;
            components[compIndex].url = `https://www.google.com/search?q=${encodeURIComponent(model)}`;
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
        
        const priceText = c.loading 
            ? `<span class="text-blue-400 animate-pulse text-sm">Шукаємо ціну...</span>` 
            : `${c.price.toLocaleString()} ₴`;

        const linkHTML = c.loading 
            ? `<span class="text-xs text-slate-500 italic">Очікуйте...</span>`
            : `<a href="${c.url}" target="_blank" rel="noopener noreferrer" class="text-xs text-blue-400 underline hover:text-blue-300">Переглянути в магазині</a>`;

        container.innerHTML += `
            <div class="glass p-4 rounded-2xl flex justify-between items-center mb-3 border border-white/5 animate-fade-in">
                <div>
                    <div class="text-xs text-blue-500 font-bold">${c.type}</div>
                    <div class="text-white font-semibold text-sm md:text-base">${c.model}</div>
                    ${linkHTML}
                </div>
                <div class="text-right">
                    <div class="text-xl text-white font-bold">${priceText}</div>
                    <button onclick="deleteComp(${c.id})" class="text-xs text-red-500 mt-1 hover:underline">Видалити</button>
                </div>
            </div>`;
    });

    if (totalEl) {
        totalEl.innerText = total > 0 ? `${total.toLocaleString()} ₴` : "0 ₴";
    }
}

// Функція оновлення всіх цін одночасно
async function refreshAllPrices() {
    if (components.length === 0) return alert("Список порожній!");
    
    // Ставимо всім статус завантаження
    components = components.map(c => ({ ...c, loading: true }));
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
        } catch (e) {
            components[i].loading = false;
        }
        updateUI(); // Оновлюємо після кожного успішного запиту
    }
}

function deleteComp(id) {
    components = components.filter(c => c.id !== id);
    updateUI();
}
