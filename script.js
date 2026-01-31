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

// --- ПОЛНАЯ БАЗА УСЛУГ (14 ПОЗИЦИЙ) ---
const servicesDB = [
    { name: "Детский общий массаж (0-5 лет)", price: "60.000", info: "Курс из 10 сеансов. Направлен на укрепление иммунитета, профилактику дисплазии и гипертонуса." },
    { name: "Детский общий массаж (5-10 лет)", price: "80.000", info: "Курс из 10 сеансов. Коррекция осанки, снятие школьного напряжения, укрепление мышц." },
    { name: "Детский общий массаж (10-15 лет)", price: "100.000", info: "Курс из 10 сеансов. Работа со сколиозом, поддержка организма в период активного роста." },
    { name: "Детский общий массаж (15-18 лет)", price: "150.000", info: "Курс из 10 сеансов. Полноценная проработка спины и конечностей для подростков." },
    { name: "Женский общий массаж", price: "180.000", info: "Курс из 10 сеансов (по 90 мин). Глубокий релакс, лимфодренаж и работа с зажимами." },
    { name: "Мужской общий массаж", price: "220.000", info: "Курс из 10 сеансов (по 90 мин). Интенсивная силовая техника для снятия триггерных точек." },
    { name: "ШВЗ + Физио", price: "10.000", info: "Разовый сеанс. Проработка шейно-воротниковой зоны + аппаратная физиотерапия." },
    { name: "Спина + Физио", price: "12.000", info: "Разовый сеанс. Глубокий массаж всей спины с применением лечебного оборудования." },
    { name: "Антицеллютный ручной", price: "200.000", info: "Курс из 10 сеансов по 90 мин. Скульптурирование тела и выведение лишней жидкости." },
    { name: "Аппаратная коррекция фигуры", price: "220.000", info: "Курс из 10 сеансов. Длительность: 180 мин. Мощный микс ручного и аппаратного массажа." },
    { name: "Аппаратный массаж лица", price: "150.000", info: "Курс из 10 сеансов. Лифтинг-эффект, подтяжка овала и улучшение качества кожи." },
    { name: "Миофасциальный массаж", price: "200.000", info: "Курс из 10 сеансов. Глубокая работа с фасциями для восстановления свободы движений." },
    { name: "Массаж 5 Континентов", price: "35.000", info: "Разовый элитный ритуал (120 мин). Сочетание пяти мировых техник для полной детоксикации." },
    { name: "Физио", price: "8.000", info: "Разовый сеанс. Профессиональное аппаратное воздействие на проблемную зону." }
];

// --- 1. ГЕНЕРАЦИЯ ИНТЕРФЕЙСА УСЛУГ ---
const grid = document.getElementById('servicesGrid');
const select = document.getElementById('serviceSelect');

if (grid && select) {
    select.innerHTML = '<option value="" disabled selected>Выберите услугу из прайса</option>';
    
    servicesDB.forEach(s => {
        // Рендерим карточки на главную
        grid.innerHTML += `
            <div class="service-card">
                <h3>${s.name}</h3>
                <div class="service-price">${s.price} тг</div>
                <button class="details-btn" onclick="toggleDetails(this)">Подробнее</button>
                <div class="service-details">
                    <p style="color: #666; line-height: 1.6;">${s.info}</p>
                    <p style="margin-top: 15px; font-weight: 600;">Доступно к записи прямо сейчас.</p>
                </div>
            </div>`;
        
        // Наполняем выпадающий список в форме
        let opt = document.createElement('option');
        opt.value = s.name; opt.innerText = s.name;
        select.appendChild(opt);
    });

    // Обработка выбора услуги (показ цены)
    select.addEventListener('change', () => {
        const found = servicesDB.find(item => item.name === select.value);
        if (found) {
            document.getElementById('currentPrice').innerText = found.price;
            document.getElementById('priceDisplay').style.display = 'block';
        }
    });
}

// --- 2. ЛОГИКА ОНЛАЙН-ЗАПИСИ ---
const bForm = document.getElementById('bookingForm');
if (bForm) {
    // Ограничиваем выбор даты (нельзя выбрать прошлое)
    const dt = document.getElementById('datePicker');
    if (dt) dt.min = new Date().toISOString().split("T")[0];

    bForm.onsubmit = async (e) => {
        e.preventDefault();
        const btn = bForm.querySelector('button');
        btn.disabled = true; btn.innerText = "Обработка...";

        try {
            await addDoc(collection(db, "bookings"), {
                name: bForm.name.value,
                phone: bForm.phone.value,
                date: bForm.date.value,
                service: bForm.service.value,
                comment: bForm.comment.value || "",
                createdAt: new Date()
            });
            document.getElementById('bookingMsg').style.display = 'block';
            bForm.reset();
            document.getElementById('priceDisplay').style.display = 'none';
        } catch (err) {
            alert("Произошла ошибка при отправке. Пожалуйста, проверьте соединение.");
        } finally {
            btn.disabled = false; btn.innerText = "Подтвердить запись";
        }
    };
}

// --- 3. УПРАВЛЕНИЕ ОТЗЫВАМИ ---
const rList = document.getElementById('reviewsList');
const loadReviews = async () => {
    if (!rList) return;
    try {
        const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        rList.innerHTML = '';
        snap.forEach(d => {
            const data = d.data();
            rList.innerHTML += `
                <div class="info-block" style="background:#fff; border: 1px solid #f0f0f0;">
                    <p style="font-style: italic; color: #444; font-size: 1.1rem; margin-bottom: 20px;">"${data.text}"</p>
                    <strong style="color: var(--gold); border-top: 1px solid #eee; display: block; padding-top: 15px;">— ${data.name}</strong>
                </div>`;
        });
    } catch (e) { console.error("Ошибка при загрузке отзывов:", e); }
};

const rForm = document.getElementById('reviewForm');
if (rForm) {
    rForm.onsubmit = async (e) => {
        e.preventDefault();
        await addDoc(collection(db, "reviews"), {
            name: rForm.revName.value,
            text: rForm.revText.value,
            createdAt: new Date()
        });
        rForm.reset(); loadReviews();
    };
}
loadReviews();

// --- 4. АДМИНИСТРАТИВНАЯ ПАНЕЛЬ ---
window.login = () => {
    const user = document.getElementById('user').value;
    const pass = document.getElementById('pass').value;
    if(user === "Gulmira" && pass === "Aru-Ana-2020") {
        localStorage.setItem('auth', 'true');
        window.location.href = "dashboard.html";
    } else {
        document.getElementById('msg').style.display = 'block';
    }
};

window.logout = () => {
    localStorage.removeItem('auth');
    window.location.href = "index.html";
};

// Загрузка и фильтрация записей в дашборде
const admBookingContainer = document.getElementById('bookingList');
if (admBookingContainer) {
    const filterS = document.getElementById('filterService');
    const filterM = document.getElementById('filterMonth');

    // Наполняем фильтр услуг в админке
    servicesDB.forEach(s => {
        let opt = document.createElement('option');
        opt.value = s.name; opt.innerText = s.name;
        if(filterS) filterS.appendChild(opt);
    });

    const loadAdminData = async () => {
        const snap = await getDocs(query(collection(db, "bookings"), orderBy("createdAt", "desc")));
        admBookingContainer.innerHTML = '';
        
        snap.forEach(item => {
            const d = item.data();
            const month = d.date.split('-')[1];

            // Применяем фильтры
            if (filterS && filterS.value && d.service !== filterS.value) return;
            if (filterM && filterM.value && month !== filterM.value) return;

            const cleanPhone = d.phone.replace(/\D/g, '');
            const waMsg = encodeURIComponent(`Здравствуйте, ${d.name}! Вы записывались на ${d.service} (${d.date}). Хотим подтвердить ваш визит.`);

            admBookingContainer.innerHTML += `
                <div class="info-block" style="text-align:left; border-left: 5px solid var(--gold); position: relative;">
                    <div style="position: absolute; top: 20px; right: 20px; display: flex; gap: 10px;">
                        <a href="https://wa.me/${cleanPhone}?text=${waMsg}" target="_blank" style="background:#25D366; color:white; padding:8px 15px; border-radius:8px; text-decoration:none; font-size:0.9rem;">WhatsApp</a>
                        <button onclick="delBooking('${item.id}')" style="background:#ff4444; color:white; border:none; padding:8px 15px; border-radius:8px; cursor:pointer;">Удалить</button>
                    </div>
                    <strong style="font-size: 1.2rem;">${d.name}</strong><br>
                    <a href="tel:${d.phone}" style="color: var(--gold); text-decoration: none; font-weight: 600;">${d.phone}</a><br>
                    <p style="margin: 15px 0;">
                        📅 <strong>Дата:</strong> ${d.date}<br>
                        💆 <strong>Услуга:</strong> ${d.service}
                    </p>
                    ${d.comment ? `<div style="background:#f9f9f9; padding:15px; border-radius:10px; font-size:0.9rem; color:#666;">💬 ${d.comment}</div>` : ''}
                </div>`;
        });
    };

    if(filterS) filterS.onchange = loadAdminData;
    if(filterM) filterM.onchange = loadAdminData;

    window.delBooking = async (id) => {
        if(confirm("Вы уверены, что хотите удалить эту запись?")) {
            await deleteDoc(doc(db, "bookings", id));
            loadAdminData();
        }
    };
    loadAdminData();
}

// --- МОБИЛЬНОЕ МЕНЮ ---
const burger = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');
if (burger) {
    burger.onclick = () => {
        navLinks.classList.toggle('nav-active');
        burger.classList.toggle('toggle');
    };
}
// Плавная прокрутка для ссылок
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
    });
});
