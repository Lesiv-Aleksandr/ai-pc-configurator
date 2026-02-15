console.log("ВЕРСІЯ 4.0: Стабільне оновлення ціни");

let components = [];

async function handleFormSubmit() {
    const typeInput = document.getElementById('comp-type');
    const modelInput = document.getElementById('comp-model');
    
    const type = typeInput.value.trim();
    const model = modelInput.value.trim();
    
    if (!type || !model) return alert("Заповніть всі поля!");

    // 1. Створюємо унікальний ID для цього конкретного запиту
    const currentId = Date.now();
    
    const newComp = {
        id: currentId,
        type: type.toUpperCase(),
        model: model,
        price: 0,
        url: "#",
        loading: true
    };

    // 2. Додаємо в масив та миттєво малюємо
    components.push(newComp);
    updateUI();
    modelInput.value = ''; // Очищаємо поле вводу

    try {
        // 3. Запит до вашого сервера Railway
        const response = await fetch('/api', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: model })
        });

        if (!response.ok) throw new Error("Сервер не відповів");
        const data = await response.json();

        // 4. Знаходимо саме ТУ деталь, яку додали (за ID)
        const targetIndex = components.findIndex(c => c.id === currentId);
        
        if (targetIndex !== -1) {
            // Очищаємо ціну від зайвих знаків
            const cleanPrice = Number(String(data.price).replace(/[^0-9]/g, '')) || 0;
            
            // Якщо ШІ не дав URL, робимо пошук в Google
            let cleanUrl = data.url && data.url !== "#" ? data.url : `https://www.google.com/search?q=${encodeURIComponent(model)}+купити`;
            if (!cleanUrl.startsWith('http')) cleanUrl = `https://${cleanUrl}`;

            // Оновлюємо дані в масиві
            components[targetIndex].price = cleanPrice;
            components[targetIndex].url = cleanUrl;
            components[targetIndex].loading = false;

            console.log(`Дані для ${model} отримано: ${cleanPrice} грн`);
            updateUI(); // Перемальовуємо список з новими даними
        }

    } catch (error) {
        console.error("Помилка оновлення:", error);
        const targetIndex = components.findIndex(c => c.id === currentId);
        if (targetIndex !== -1) {
            components[targetIndex].loading = false;
            components[targetIndex].price = 0;
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
        
        const priceHTML = c.loading 
            ? `<span class="text-blue-400 animate-pulse">Пошук...</span>` 
            : `${c.price.toLocaleString()} ₴`;

        const linkHTML = c.loading 
            ? `<span class="text-xs text-slate-500">Завантаження посилання...</span>`
            : `<a href="${c.url}" target="_blank" rel="noopener" class="text-xs text-blue-400 underline">В магазин</a>`;

        container.innerHTML += `
            <div class="glass p-4 rounded-2xl flex justify-between items-center mb-3 border border-white/5 animate-fade-in">
                <div>
                    <div class="text-xs text-blue-500 font-bold">${c.type}</div>
                    <div class="text-white font-semibold">${c.model}</div>
                    ${linkHTML}
                </div>
                <div class="text-right">
                    <div class="text-xl text-white font-bold">${priceHTML}</div>
                    <button onclick="deleteComp(${c.id})" class="text-xs text-red-500 hover:text-red-400">Видалити</button>
                </div>
            </div>`;
    });

    if (totalEl) totalEl.innerText = `${total.toLocaleString()} ₴`;
}

function deleteComp(id) {
    components = components.filter(c => c.id !== id);
    updateUI();
}

async function refreshAllPrices() {
    if (components.length === 0) return;
    alert("Оновлюю всі ціни через Gemini...");
    // Логіка оновлення вже існуючих елементів
    const oldComponents = [...components];
    components = [];
    updateUI();
    for(let item of oldComponents) {
        // Емулюємо додавання заново для кожного
        document.getElementById('comp-type').value = item.type;
        document.getElementById('comp-model').value = item.model;
        await handleFormSubmit();
    }
}
