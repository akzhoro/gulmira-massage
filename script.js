// Бургер-меню
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');

if (burger) {
    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        // Анимация бургера
        burger.classList.toggle('toggle');
    });
}

// Авторизация
function login() {
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;
    
    // Твои данные: Gulmira / Aru-Ana-2020
    if(u === "Gulmira" && p === "Aru-Ana-2020") {
        localStorage.setItem('auth', 'true');
        window.location.href = "dashboard.html";
    } else {
        document.getElementById('msg').style.display = 'block';
    }
}

function logout() {
    localStorage.removeItem('auth');
    window.location.href = "index.html";
}