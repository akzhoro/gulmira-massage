import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// ТОЧНЫЙ СПИСОК 14 УСЛУГ
const SERVICES_DATA = {
    "1)Детский общий массаж (0-5 лет)": "60.000",
    "2)Детский общий массаж (5-10 лет)": "80.000",
    "3)Детский общий массаж (10-15 лет)": "100.000",
    "4)Детский общий массаж (15-18 лет)": "150.000",
    "5)Женский общий массаж": "180.000",
    "6)Мужской общий массаж": "220.000",
    "7)ШВЗ + Физио": "10.000",
    "8)Спина + Физио": "12.000",
    "9)Антицеллютный ручной": "200.000",
    "10)Аппаратная коррекция фигуры": "220.000",
    "11)Аппаратный массаж лица": "150.000",
    "12)Миофасциальный массаж": "200.000",
    "13)Массаж 5 Континентов": "35.000",
    "14)Физио": "8.000"
};

// --- Наполнение выбора услуг и цен ---
const serviceSelect = document.getElementById('serviceSelect');
const currentPrice = document.getElementById('currentPrice');
const priceDisplay = document.getElementById('priceDisplay');

if (serviceSelect) {
    Object.keys(SERVICES_DATA).forEach(s => {
        let opt = document.createElement('option');
        opt.value = s; opt.innerText = s;
        serviceSelect.appendChild(opt);
    });
    serviceSelect.onchange = () => {
        currentPrice.innerText = SERVICES_DATA[serviceSelect.value];
        priceDisplay.style.display = 'block';
    };
}

// Запрет прошлых дат
const datePicker = document.getElementById('datePicker');
if (datePicker) {
    datePicker.setAttribute('min', new Date().toISOString().split('T')[0]);
}

// --- Обработка записи ---
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.onsubmit = async (e) => {
        e.preventDefault();
        const btn = bookingForm.querySelector('button');
        btn.disabled = true; btn.innerText = "Отправка...";
        try {
            await addDoc(collection(db, "bookings"), {
                name: bookingForm.name.value,
                phone: bookingForm.phone.value,
                date: bookingForm.date.value,
                service: bookingForm.service.value,
                comment: bookingForm.comment.value || "",
                createdAt: new Date()
            });
            document.getElementById('bookingMsg').style.display = 'block';
            bookingForm.reset();
            priceDisplay.style.display = 'none';
        } catch (err) { alert("Ошибка!"); }
        finally { btn.disabled = false; btn.innerText = "Отправить данные"; }
    };
}

// --- Отзывы ---
const reviewsList = document.getElementById('reviewsList');
const loadReviews = async () => {
    if (!reviewsList) return;
    const snap = await getDocs(query(collection(db, "reviews"), orderBy("createdAt", "desc")));
    reviewsList.innerHTML = '';
    snap.forEach(d => {
        const data = d.data();
        reviewsList.innerHTML += `<div class="info-block"><p style="font-style:italic;">"${data.text}"</p><strong>— ${data.name}</strong></div>`;
    });
};
const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
    reviewForm.onsubmit = async (e) => {
        e.preventDefault();
        await addDoc(collection(db, "reviews"), {
            name: reviewForm.revName.value,
            text: reviewForm.revText.value,
            createdAt: new Date()
        });
        reviewForm.reset(); loadReviews();
    };
}
loadReviews();

// --- Админ-панель ---
window.login = () => {
    if(document.getElementById('user').value === "Gulmira" && document.getElementById('pass').value === "Aru-Ana-2020") {
        localStorage.setItem('auth', 'true'); window.location.href = "dashboard.html";
    } else { document.getElementById('msg').style.display = 'block'; }
};
window.logout = () => { localStorage.removeItem('auth'); window.location.href = "index.html"; };

const bList = document.getElementById('bookingList');
if (bList) {
    const loadAdmin = async () => {
        const snap = await getDocs(query(collection(db, "bookings"), orderBy("createdAt", "desc")));
        bList.innerHTML = '';
        snap.forEach(item => {
            const data = item.data();
            const cleanPhone = data.phone.replace(/\D/g, '');
            const waMsg = encodeURIComponent(`Здравствуйте, ${data.name}! Подтверждаю вашу запись в Aru-Ana на ${data.service} (${data.date}). Ждем вас!`);
            bList.innerHTML += `
                <div class="info-block" style="text-align:left; margin-bottom:15px;">
                    <strong>👤 ${data.name}</strong> — <a href="tel:${data.phone}">${data.phone}</a>
                    <div style="float:right;">
                        <a href="https://wa.me/${cleanPhone}?text=${waMsg}" target="_blank" style="color:green; font-weight:bold; text-decoration:none; margin-right:15px;">WhatsApp</a>
                        <button onclick="delRow('${item.id}')" style="color:red; border:none; background:none; cursor:pointer;">Удалить</button>
                    </div>
                    <br>📅 ${data.date} | 💆 ${data.service}
                    ${data.comment ? `<br><small style="color:#666;">💬 ${data.comment}</small>` : ''}
                </div>`;
        });
    };
    window.delRow = async (id) => { if(confirm("Удалить запись?")) { await deleteDoc(doc(db, "bookings", id)); loadAdmin(); } };
    loadAdmin();
}

// Бургер
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');
if (burger) { burger.onclick = () => { nav.classList.toggle('nav-active'); burger.classList.toggle('toggle'); }; }
