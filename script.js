// 1. Обов'язково оголоси масив на самому початку!
let components = [];

async function handleFormSubmit() {
    const type = document.getElementById('comp-type').value.trim();
    const model = document.getElementById('comp-model').value.trim();
    const submitBtn = document.getElementById('submit-btn');

    if (!type || !model) return alert("Введіть категорію та модель!");

    submitBtn.disabled = true;
    submitBtn.innerText = "AI шукає ціну...";

    try {
        const response = await fetch('/api', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: model })
        });

        if (!response.ok) throw new Error('Помилка сервера');

        const aiResult = await response.json();

        const newComp = {
            id: Date.now(),
            type: type.toUpperCase(),
            model: model,
            price: aiResult.price || 0,
            url: aiResult.url || "#"
        };

        components.push(newComp);
        updateUI();
        clearInputs();
    } catch (error) {
        console.error("Помилка при додаванні:", error);
        alert("ШІ не зміг отримати дані. Перевірте налаштування API.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Додати та знайти ціну";
    }
}

// 2. Допоміжні функції (переконайся, що вони у тебе є)
function updateUI() {
    const container = document.getElementById('components-container');
    const emptyState = document.getElementById('empty-state');
    const totalEl = document.getElementById('grand-total');

    container.innerHTML = '';
    let total = 0;

    if (components.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        components.forEach(c => {
            total += c.price;
            container.innerHTML += `
                <div class="glass p-4 rounded-2xl flex justify-between items-center border border-white/5">
                    <div>
                        <div class="text-xs text-blue-400 font-bold">${c.type}</div>
                        <div class="text-white font-semibold">${c.model}</div>
                        <a href="${c.url}" target="_blank" class="text-xs text-slate-400 underline hover:text-blue-300">Купити в магазині</a>
                    </div>
                    <div class="text-right">
                        <div class="text-xl text-white font-bold">${c.price.toLocaleString()} ₴</div>
                        <button onclick="deleteComp(${c.id})" class="text-xs text-red-500 hover:text-red-400 mt-1">Видалити</button>
                    </div>
                </div>
            `;
        });
    }
    totalEl.innerText = `${total.toLocaleString()} ₴`;
}

function clearInputs() {
    document.getElementById('comp-type').value = '';
    document.getElementById('comp-model').value = '';
}

function deleteComp(id) {
    components = components.filter(c => c.id !== id);
    updateUI();
}
