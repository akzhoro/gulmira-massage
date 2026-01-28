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

// --- ИСПРАВЛЕННОЕ МОБИЛЬНОЕ МЕНЮ ---
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');

if (burger) {
    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        burger.classList.toggle('toggle');
    });
}

// Закрытие меню при переходе по ссылке
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('nav-active');
        burger.classList.remove('toggle');
    });
});

// --- FIREBASE: ЗАПИСЬ ---
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = bookingForm.querySelector('button');
        btn.disabled = true; btn.innerText = "Отправка...";
        
        try {
            await addDoc(collection(db, "bookings"), {
                name: bookingForm.name.value,
                phone: bookingForm.phone.value,
                date: bookingForm.date.value,
                service: bookingForm.service.value,
                createdAt: new Date()
            });
            document.getElementById('bookingMsg').style.display = 'block';
            bookingForm.reset();
        } catch (err) { alert("Ошибка! Проверь Rules в Firebase."); }
        finally { btn.disabled = false; btn.innerText = "Отправить данные"; }
    });
}

// --- АДМИНКА (ВХОД И СПИСОК) ---
window.login = () => {
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;
    if(u === "Gulmira" && p === "Aru-Ana-2020") {
        localStorage.setItem('auth', 'true');
        window.location.href = "dashboard.html";
    } else { document.getElementById('msg').style.display = 'block'; }
};

window.logout = () => {
    localStorage.removeItem('auth');
    window.location.href = "index.html";
};

const bookingList = document.getElementById('bookingList');
if (bookingList) {
    const loadBookings = async () => {
        const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        bookingList.innerHTML = '';
        snap.forEach(item => {
            const data = item.data();
            const div = document.createElement('div');
            div.className = 'info-block';
            div.style.textAlign = 'left';
            div.innerHTML = `
                <strong>👤 ${data.name}</strong> — <a href="tel:${data.phone}">${data.phone}</a><br>
                📅 ${data.date} | 💆 ${data.service}
                <button onclick="deleteRow('${item.id}')" style="float:right; background:red; color:white; border:none; padding:5px 10px; cursor:pointer;">Удалить</button>
            `;
            bookingList.appendChild(div);
        });
    };
    window.deleteRow = async (id) => {
        if(confirm("Удалить?")) { await deleteDoc(doc(db, "bookings", id)); loadBookings(); }
    };
    loadBookings();
}
