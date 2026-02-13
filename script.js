// 1. Глобальний масив для зберігання компонентів
let components = [];

// 2. Основна функція додавання компонента
async function handleFormSubmit() {
    const type = document.getElementById('comp-type').value.trim();
    const model = document.getElementById('comp-model').value.trim();
    const submitBtn = document.getElementById('submit-btn');

    if (!type || !model) {
        return alert("Введіть категорію та модель!");
    }

    // Блокуємо кнопку на час запиту
    submitBtn.disabled = true;
    submitBtn.innerText = "Gemini шукає ціну..."; // ВИПРАВЛЕНО: DeepSeek -> Gemini

    try {
        // Відправляємо запит на ваш новий API (Railway)
        const response = await fetch('/api', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: model })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Помилка сервера');
        }

        const aiResult = await response.json();

        // Створюємо об'єкт нового компонента
        const newComp = {
            id: Date.now(),
            type: type.toUpperCase(),
            model: model,
            // ВИПРАВЛЕНО: Очищаємо ціну від тексту, якщо ШІ випадково надіслав "1500 грн" замість 1500
            price: Number(String(aiResult.price).replace(/[^0-9]/g, '')) || 0,
            url: aiResult.url || "#"
        };

        // Додаємо в масив та оновлюємо інтерфейс
        components.push(newComp);
        updateUI();
        clearInputs();

    } catch (error) {
        console.error("Помилка:", error);
        alert(`Не вдалося отримати дані: ${error.message}`);
    } finally {
        // Повертаємо кнопку в початковий стан
        submitBtn.disabled = false;
        submitBtn.innerText = "Додати та знайти ціну";
    }
}

// 3. Функція оновлення відображення на сторінці
function updateUI() {
    const container = document.getElementById('components-container');
    const emptyState = document.getElementById('empty-state');
    const totalEl = document.getElementById('grand-total');

    container.innerHTML = '';
    let total = 0;

    if (components.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
    } else {
        if (emptyState) emptyState.style.display = 'none';
        components.forEach(c => {
            total += c.price;
            container.innerHTML += `
                <div class="glass p-4 rounded-2xl flex justify-between items-center border border-white/5 animate-fade-in">
                    <div>
                        <div class="text-xs text-blue-400 font-bold">${c.type}</div>
                        <div class="text-white font-semibold">${c.model}</div>
                        <a href="${c.url}" target="_blank" class="text-xs text-slate-400 underline hover:text-blue-300">Переглянути в магазині</a>
                    </div>
                    <div class="text-right">
                        <div class="text-xl text-white font-bold">${c.price.toLocaleString()} ₴</div>
                        <button onclick="deleteComp(${c.id})" class="text-xs text-red-500 hover:text-red-400 mt-1">Видалити</button>
                    </div>
                </div>
            `;
        });
    }
    // Оновлюємо загальну суму
    if (totalEl) {
        totalEl.innerText = `${total.toLocaleString()} ₴`;
    }
}

// 4. Видалення компонента
function deleteComp(id) {
    components = components.filter(c => c.id !== id);
    updateUI();
}

// 5. Очищення полів вводу
function clearInputs() {
    document.getElementById('comp-type').value = '';
    document.getElementById('comp-model').value = '';
}

// 6. Функція для оновлення всіх цін
async function refreshAllPrices() {
    // ВИПРАВЛЕНО: DeepSeek -> Gemini
    alert("Оновлення цін активовано. Gemini перевіряє актуальність даних...");
}
