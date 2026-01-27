import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Твой конфиг, который ты скинул
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

// --- МЕНЮ БУРГЕР (Для всех страниц) ---
const initMenu = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    if (burger && nav) {
        burger.onclick = () => {
            nav.classList.toggle('nav-active');
            burger.classList.toggle('toggle');
        };
    }
};
initMenu();

// --- ВХОД / ВЫХОД ---
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

// --- ОТПРАВКА ЗАЯВКИ В FIREBASE ---
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.onsubmit = async (e) => {
        e.preventDefault();
        const btn = bookingForm.querySelector('button');
        btn.disabled = true;
        btn.innerText = "Отправка...";

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
        } catch (err) {
            alert("Ошибка базы данных! Проверьте вкладку Rules в Firebase.");
        } finally {
            btn.disabled = false;
            btn.innerText = "Записаться";
        }
    };
}

// --- АДМИНКА: ЗАГРУЗКА И УДАЛЕНИЕ ---
const bookingList = document.getElementById('bookingList');
if (bookingList) {
    const loadData = async () => {
        try {
            const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            bookingList.innerHTML = '';
            
            if (snap.empty) {
                bookingList.innerHTML = '<p>Новых записей пока нет.</p>';
            }

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
                        <button onclick="deleteItem('${item.id}')" style="background:#ff4d4d; color:white; border:none; padding:8px 12px; cursor:pointer; border-radius:5px;">Удалить</button>
                    </div>
                `;
                bookingList.appendChild(div);
            });
        } catch (e) {
            bookingList.innerHTML = '<p style="color:red">Ошибка доступа. Проверьте Rules в Firestore.</p>';
        }
    };

    window.deleteItem = async (id) => {
        if(confirm("Удалить запись клиента?")) {
            await deleteDoc(doc(db, "bookings", id));
            loadData();
        }
    };
    loadData();
}