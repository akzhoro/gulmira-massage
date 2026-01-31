import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- КОНФИГУРАЦИЯ FIREBASE ---
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

/** * ПОЛНЫЙ КАТАЛОГ УСЛУГ (14 ПОЗИЦИЙ)
 * Названия очищены от нумерации, добавлены описания и цены.
 */
const SERVICES_DATA = [
    { name: "Детский общий массаж (0-5 лет)", price: "60.000", info: "Курс 10 сеансов. Укрепление иммунитета и развитие моторики." },
    { name: "Детский общий массаж (5-10 лет)", price: "80.000", info: "Курс 10 сеансов. Коррекция осанки и снятие гипертонуса." },
    { name: "Детский общий массаж (10-15 лет)", price: "100.000", info: "Курс 10 сеансов. Поддержка спины в период активного роста." },
    { name: "Детский общий массаж (15-18 лет)", price: "150.000", info: "Курс 10 сеансов. Глубокая проработка мышечного каркаса." },
    { name: "Женский общий массаж", price: "180.000", info: "Курс 10 сеансов (90 мин). Релакс, лимфодренаж и снятие стресса." },
    { name: "Мужской общий массаж", price: "220.000", info: "Курс 10 сеансов (90 мин). Силовая техника для восстановления мышц." },
    { name: "ШВЗ + Физио", price: "10.000", info: "Разовый сеанс. Лечение болей в шейно-воротниковой зоне." },
    { name: "Спина + Физио", price: "12.000", info: "Разовый сеанс. Глубокий массаж спины с аппаратным прогревом." },
    { name: "Антицеллютный ручной массаж", price: "200.000", info: "Курс 10 сеансов (90 мин). Моделирование фигуры и детокс." },
    { name: "Аппаратная коррекция фигуры", price: "220.000", info: "Курс 10 сеансов (180 мин). Мощный комплексный подход." },
    { name: "Аппаратный массаж лица", price: "150.000", info: "Курс 10 сеансов. Безоперационная подтяжка и лифтинг." },
    { name: "Миофасциальный массаж", price: "200.000", info: "Курс 10 сеансов (90 мин). Работа с фасциями для гибкости тела." },
    { name: "Массаж 5 Континентов", price: "35.000", info: "Разовый сеанс (120 мин). Элитный ритуал восстановления." },
    { name: "Физио процедура (локально)", price: "8.000", info: "Разовый сеанс. Аппаратное воздействие на проблемную зону." }
];

// --- ИНИЦИАЛИЗАЦИЯ ИНТЕРФЕЙСА ---
document.addEventListener('DOMContentLoaded', () => {
    renderServices();
    loadReviews();
    initAdminPanel();
    
    // Плавная прокрутка
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        });
    });
});

// ГЕНЕРАЦИЯ КАРТОЧЕК И ВЫПАДАЮЩЕГО СПИСКА
function renderServices() {
    const grid = document.getElementById('servicesGrid');
    const select = document.getElementById('serviceSelect');
    if (!grid || !select) return;

    grid.innerHTML = '';
    select.innerHTML = '<option value="" disabled selected>Выберите услугу</option>';

    SERVICES_DATA.forEach(service => {
        // Карточка для главной
        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `
            <div class="service-content">
                <h3>${service.name}</h3>
                <p class="service-info">${service.info}</p>
                <div class="service-price">${service.price} тг</div>
                <button class="btn-select" onclick="scrollToBooking('${service.name}')">Записаться</button>
            </div>
        `;
        grid.appendChild(card);

        // Опция в форме
        const opt = document.createElement('option');
        opt.value = service.name;
        opt.textContent = service.name;
        select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
        const selected = SERVICES_DATA.find(s => s.name === e.target.value);
        const display = document.getElementById('priceDisplay');
        if (selected && display) {
            display.style.display = 'block';
            document.getElementById('currentPrice').textContent = selected.price;
        }
    });
}

window.scrollToBooking = (name) => {
    const select = document.getElementById('serviceSelect');
    if (select) {
        select.value = name;
        select.dispatchEvent(new Event('change'));
        document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    }
};

// --- ФОРМА ЗАПИСИ ---
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.onsubmit = async (e) => {
        e.preventDefault();
        const btn = bookingForm.querySelector('button');
        btn.disabled = true;
        btn.textContent = "Отправка...";

        const payload = {
            name: bookingForm.name.value,
            phone: bookingForm.phone.value,
            date: bookingForm.date.value,
            service: bookingForm.service.value,
            comment: bookingForm.comment.value || "",
            createdAt: new Date()
        };

        try {
            await addDoc(collection(db, "bookings"), payload);
            document.getElementById('bookingMsg').style.display = 'block';
            bookingForm.reset();
            document.getElementById('priceDisplay').style.display = 'none';
        } catch (err) {
            alert("Ошибка сети. Попробуйте еще раз.");
        } finally {
            btn.disabled = false;
            btn.textContent = "Забронировать";
        }
    };
}

// --- ОТЗЫВЫ ---
async function loadReviews() {
    const list = document.getElementById('reviewsList');
    if (!list) return;

    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    list.innerHTML = '';

    snap.forEach(doc => {
        const r = doc.data();
        list.innerHTML += `
            <div class="review-card">
                <p>"${r.text}"</p>
                <div class="review-author">${r.name}</div>
            </div>
        `;
    });
}

const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
    reviewForm.onsubmit = async (e) => {
        e.preventDefault();
        await addDoc(collection(db, "reviews"), {
            name: reviewForm.revName.value,
            text: reviewForm.revText.value,
            createdAt: new Date()
        });
        reviewForm.reset();
        loadReviews();
    };
}

// --- АДМИНКА ---
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

async function initAdminPanel() {
    const adminList = document.getElementById('adminBookingList');
    if (!adminList) return;

    const refresh = async () => {
        const snap = await getDocs(query(collection(db, "bookings"), orderBy("createdAt", "desc")));
        adminList.innerHTML = '';

        snap.forEach(item => {
            const d = item.data();
            const wa = `https://wa.me/${d.phone.replace(/\D/g, '')}?text=Здравствуйте, ${d.name}! Подтверждаю вашу запись на ${d.service}`;
            
            adminList.innerHTML += `
                <div class="admin-item">
                    <div class="admin-info">
                        <strong>${d.name}</strong> (${d.phone})<br>
                        <span>Услуга: ${d.service} | Дата: ${d.date}</span><br>
                        <small>${d.comment}</small>
                    </div>
                    <div class="admin-btns">
                        <a href="${wa}" target="_blank" class="btn-wa">WhatsApp</a>
                        <button onclick="deleteBooking('${item.id}')" class="btn-del">X</button>
                    </div>
                </div>
            `;
        });
    };

    window.deleteBooking = async (id) => {
        if(confirm("Удалить запись?")) {
            await deleteDoc(doc(db, "bookings", id));
            refresh();
        }
    };
    refresh();
}

// Мобильное меню
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');
if (burger) {
    burger.onclick = () => {
        nav.classList.toggle('nav-active');
        burger.classList.toggle('toggle');
    };
}
