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

// --- МЕНЮ БУРГЕР ---
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');
const navLinks = document.querySelectorAll('.nav-links li a');

if (burger) {
    burger.onclick = () => {
        nav.classList.toggle('nav-active');
        burger.classList.toggle('toggle');
    };
}

// Закрытие меню при клике на ссылку (чтобы перекинуло на нужный блок)
navLinks.forEach(link => {
    link.onclick = () => {
        if (nav.classList.contains('nav-active')) {
            nav.classList.remove('nav-active');
            burger.classList.remove('toggle');
        }
    };
});

// --- АВТОРИЗАЦИЯ ---
window.login = () => {
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;
    if(u === "Gulmira" && p === "Aru-Ana-2020") {
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

// --- ОНЛАЙН ЗАПИСЬ ---
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.onsubmit = async (e) => {
        e.preventDefault();
        const btn = bookingForm.querySelector('button');
        btn.disabled = true; btn.innerText = "Отправка...";
        try {
            const formData = new FormData(bookingForm);
            await addDoc(collection(db, "bookings"), {
                name: formData.get('name'),
                phone: formData.get('phone'),
                date: formData.get('date'),
                service: formData.get('service'),
                createdAt: new Date()
            });
            document.getElementById('bookingMsg').style.display = 'block';
            bookingForm.reset();
        } catch (error) {
            alert("Ошибка! Проверьте вкладку Rules в Firebase.");
        } finally {
            btn.disabled = false; btn.innerText = "Отправить заявку";
        }
    };
}

// --- АДМИНКА ---
const bookingList = document.getElementById('bookingList');
if (bookingList) {
    const loadData = async () => {
        const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        bookingList.innerHTML = '';
        snap.forEach((item) => {
            const data = item.data();
            const div = document.createElement('div');
            div.className = 'info-block';
            div.style.marginBottom = '15px';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong>👤 ${data.name}</strong> — <a href="tel:${data.phone}">${data.phone}</a><br>
                        📅 ${data.date} | 💆 ${data.service}
                    </div>
                    <button onclick="deleteItem('${item.id}')" style="background:#ff4d4d; color:white; border:none; padding:8px; cursor:pointer; border-radius:5px;">Удалить</button>
                </div>`;
            bookingList.appendChild(div);
        });
    };
    window.deleteItem = async (id) => {
        if(confirm("Удалить запись?")) { await deleteDoc(doc(db, "bookings", id)); loadData(); }
    };
    loadData();
}
