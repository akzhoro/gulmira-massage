import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/** * КОНФИГУРАЦИЯ БАЗЫ ДАННЫХ
 * Используем Firebase для хранения записей и отзывов в реальном времени.
 */
const firebaseConfig = {
    apiKey: "AIzaSyBR1RGxAbSxUhEDejPIhiHpGJMs0vXIG8U",
    authDomain: "gulmira-massage.firebaseapp.com",
    projectId: "gulmira-massage",
    storageBucket: "gulmira-massage.firebasestorage.app",
    messagingSenderId: "563481800920",
    appId: "1:563481800920:web:7b55dd3b51e20a3ff4a7ad"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ПОЛНЫЙ КАТАЛОГ УСЛУГ БЕЗ ЛИШНЕЙ НУМЕРАЦИИ
const CATALOG = [
    { id: "c1", name: "Детский общий массаж (0-5 лет)", price: 60000, duration: "40 мин", desc: "Курс 10 сеансов. Профилактика тонуса и укрепление иммунитета." },
    { id: "c2", name: "Детский общий массаж (5-10 лет)", price: 80000, duration: "50 мин", desc: "Курс 10 сеансов. Работа с осанкой и снятие школьного напряжения." },
    { id: "c3", name: "Детский общий массаж (10-15 лет)", price: 100000, duration: "60 мин", desc: "Курс 10 сеансов. Коррекция сколиоза и поддержка роста." },
    { id: "c4", name: "Детский общий массаж (15-18 лет)", price: 150000, duration: "60 мин", desc: "Курс 10 сеансов. Интенсивная проработка мышечного корсета." },
    { id: "w1", name: "Женский общий массаж", price: 180000, duration: "90 мин", desc: "Курс 10 сеансов. Лимфодренаж, релакс и снятие зажимов." },
    { id: "m1", name: "Мужской общий массаж", price: 220000, duration: "90 мин", desc: "Курс 10 сеансов. Глубокая силовая проработка триггерных точек." },
    { id: "sh1", name: "ШВЗ + Физио", price: 10000, duration: "40 мин", desc: "Разово. Снятие болей в шее и голове, улучшение кровотока." },
    { id: "sp1", name: "Спина + Физио", price: 12000, duration: "50 мин", desc: "Разово. Глубокий массаж всей спины с аппаратным прогревом." },
    { id: "ac1", name: "Антицеллютный ручной", price: 200000, duration: "90 мин", desc: "Курс 10 сеансов. Моделирование контуров и детокс." },
    { id: "ap1", name: "Аппаратная коррекция фигуры", price: 220000, duration: "180 мин", desc: "Курс 10 сеансов. 3 часа комплексного воздействия." },
    { id: "lf1", name: "Аппаратный массаж лица", price: 150000, duration: "60 мин", desc: "Курс 10 сеансов. Подтяжка овала и лифтинг эффект." },
    { id: "mf1", name: "Миофасциальный массаж", price: 200000, duration: "90 мин", desc: "Курс 10 сеансов. Работа с фасциями для полной свободы тела." },
    { id: "v5", name: "Массаж 5 Континентов", price: 35000, duration: "120 мин", desc: "Эксклюзив. Пять мировых техник в одном сеансе." },
    { id: "ph1", name: "Физио процедура", price: 8000, duration: "30 мин", desc: "Локальное лечение воспалений аппаратным методом." }
];

// --- 1. ИНИЦИАЛИЗАЦИЯ ИНТЕРФЕЙСА (ГЛАВНАЯ СТРАНИЦА) ---
function initMainPage() {
    const grid = document.getElementById('servicesGrid');
    const select = document.getElementById('serviceSelect');
    if (!grid || !select) return;

    // Очистка и наполнение
    grid.innerHTML = '';
    select.innerHTML = '<option value="" disabled selected>Выберите нужную услугу</option>';

    CATALOG.forEach(item => {
        // Создаем карточку
        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `
            <div class="card-inner">
                <h3>${item.name}</h3>
                <div class="card-price">${item.price.toLocaleString()} тг</div>
                <p class="card-duration">⏱ ${item.duration}</p>
                <div class="card-desc">${item.desc}</div>
                <a href="#booking" class="card-btn" onclick="preSelectService('${item.name}')">Выбрать</a>
            </div>
        `;
        grid.appendChild(card);

        // Добавляем в Select
        const opt = document.createElement('option');
        opt.value = item.name;
        opt.textContent = item.name;
        select.appendChild(opt);
    });
}

// Предвыбор услуги при нажатии на карточку
window.preSelectService = (name) => {
    const select = document.getElementById('serviceSelect');
    if (select) {
        select.value = name;
        updatePriceDisplay(name);
    }
};

function updatePriceDisplay(serviceName) {
    const priceBox = document.getElementById('priceDisplay');
    const priceVal = document.getElementById('currentPrice');
    const service = CATALOG.find(s => s.name === serviceName);
    if (service && priceBox && priceVal) {
        priceVal.textContent = service.price.toLocaleString();
        priceBox.classList.add('active');
    }
}

// --- 2. ОБРАБОТКА ФОРМЫ ЗАПИСИ ---
async function handleBooking(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button');
    const msg = document.getElementById('bookingMsg');

    const data = {
        name: form.name.value,
        phone: form.phone.value,
        date: form.date.value,
        service: form.service.value,
        comment: form.comment.value || "Нет комментария",
        createdAt: new Date()
    };

    btn.disabled = true;
    btn.textContent = "Отправка...";

    try {
        await addDoc(collection(db, "bookings"), data);
        msg.style.display = 'block';
        form.reset();
        document.getElementById('priceDisplay').classList.remove('active');
        setTimeout(() => msg.style.display = 'none', 5000);
    } catch (err) {
        alert("Ошибка при записи. Проверьте интернет.");
    } finally {
        btn.disabled = false;
        btn.textContent = "Записаться";
    }
}

// --- 3. СИСТЕМА ОТЗЫВОВ ---
async function loadReviews() {
    const container = document.getElementById('reviewsList');
    if (!container) return;

    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    container.innerHTML = '';

    snap.forEach(doc => {
        const r = doc.data();
        container.innerHTML += `
            <div class="review-item">
                <p class="rev-text">"${r.text}"</p>
                <div class="rev-meta">
                    <strong>${r.name}</strong>
                    <span>${new Date(r.createdAt.seconds * 1000).toLocaleDateString()}</span>
                </div>
            </div>
        `;
    });
}

async function handleReview(e) {
    e.preventDefault();
    const form = e.target;
    await addDoc(collection(db, "reviews"), {
        name: form.revName.value,
        text: form.revText.value,
        createdAt: new Date()
    });
    form.reset();
    loadReviews();
}

// --- 4. АДМИН-ПАНЕЛЬ (dashboard.html) ---
async function initAdmin() {
    const list = document.getElementById('bookingList');
    if (!list) return;

    const fService = document.getElementById('filterService');
    const fMonth = document.getElementById('filterMonth');

    // Заполнение фильтра
    CATALOG.forEach(s => {
        const o = document.createElement('option');
        o.value = s.name; o.textContent = s.name;
        fService.appendChild(o);
    });

    const refresh = async () => {
        const snap = await getDocs(query(collection(db, "bookings"), orderBy("createdAt", "desc")));
        list.innerHTML = '';

        snap.forEach(item => {
            const d = item.data();
            const m = d.date.split('-')[1];

            if (fService.value && d.service !== fService.value) return;
            if (fMonth.value && m !== fMonth.value) return;

            const wa = `https://wa.me/${d.phone.replace(/\D/g, '')}?text=Здравствуйте, ${d.name}! Подтверждаю запись на ${d.service}`;

            list.innerHTML += `
                <div class="admin-card">
                    <div class="admin-header">
                        <strong>${d.name}</strong>
                        <span class="status">Новая запись</span>
                    </div>
                    <p>📱 ${d.phone} | 📅 ${d.date}</p>
                    <p>💆 ${d.service}</p>
                    <p class="admin-comm">${d.comment}</p>
                    <div class="admin-actions">
                        <a href="${wa}" target="_blank" class="wa-btn">Написать в WhatsApp</a>
                        <button onclick="deleteEntry('${item.id}')" class="del-btn">Удалить</button>
                    </div>
                </div>
            `;
        });
    };

    fService.onchange = refresh;
    fMonth.onchange = refresh;
    window.deleteEntry = async (id) => {
        if(confirm("Удалить запись?")) {
            await deleteDoc(doc(db, "bookings", id));
            refresh();
        }
    };
    refresh();
}

// --- 5. ОБЩИЕ ФУНКЦИИ ---
window.login = () => {
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;
    if (u === "Gulmira" && p === "Aru-Ana-2020") {
        localStorage.setItem('auth', 'true');
        window.location.href = "dashboard.html";
    } else {
        document.getElementById('msg').style.display = 'block';
    }
};

window.logout = () => {
    localStorage.clear();
    window.location.href = "index.html";
};

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    initMainPage();
    loadReviews();
    initAdmin();

    const bf = document.getElementById('bookingForm');
    if (bf) bf.onsubmit = handleBooking;

    const rf = document.getElementById('reviewForm');
    if (rf) rf.onsubmit = handleReview;

    const sel = document.getElementById('serviceSelect');
    if (sel) sel.onchange = (e) => updatePriceDisplay(e.target.value);
    
    // Мобильное меню
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    if (burger) {
        burger.onclick = () => {
            nav.classList.toggle('nav-active');
            burger.classList.toggle('toggle');
        };
    }
});
