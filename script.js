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

// ==================== МОБИЛЬНОЕ МЕНЮ ====================
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

// ==================== ЗАПИСЬ НА СЕАНС ====================
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    // Устанавливаем минимальную дату (сегодня)
    const today = new Date().toISOString().split('T')[0];
    bookingForm.date.min = today;
    
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = bookingForm.querySelector('button');
        const originalText = btn.innerText;
        btn.disabled = true;
        btn.innerText = "⏳ Отправка...";
        
        try {
            const selectedDate = bookingForm.date.value;
            const month = selectedDate.split('-')[1];
            
            await addDoc(collection(db, "bookings"), {
                name: bookingForm.name.value.trim(),
                phone: bookingForm.phone.value.trim(),
                date: selectedDate,
                service: bookingForm.service.value,
                createdAt: new Date(),
                month: month // Сохраняем месяц для фильтрации
            });
            
            // Показываем сообщение об успехе
            const msgElement = document.getElementById('bookingMsg');
            msgElement.style.display = 'block';
            msgElement.style.animation = 'fadeIn 0.5s';
            
            // Сбрасываем форму
            bookingForm.reset();
            
            // Скрываем сообщение через 5 секунд
            setTimeout(() => {
                msgElement.style.display = 'none';
            }, 5000);
            
        } catch (err) {
            console.error("Ошибка Firebase:", err);
            alert("Ошибка при отправке заявки. Пожалуйста, попробуйте позже.");
        } finally {
            btn.disabled = false;
            btn.innerText = originalText;
        }
    });
}

// ==================== АДМИН-ПАНЕЛЬ ====================
// Авторизация
window.login = () => {
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;
    if(u === "Gulmira" && p === "Aru-Ana-2020") {
        localStorage.setItem('auth', 'true');
        window.location.href = "dashboard.html";
    } else {
        const msgElement = document.getElementById('msg');
        msgElement.style.display = 'block';
        msgElement.style.animation = 'shake 0.5s';
        
        setTimeout(() => {
            msgElement.style.animation = '';
        }, 500);
    }
};

// Выход из системы
window.logout = () => {
    localStorage.removeItem('auth');
    window.location.href = "index.html";
};

// ==================== ФИЛЬТРАЦИЯ ЗАПИСЕЙ ====================
let allBookings = [];
let activeFilters = {
    month: '',
    service: ''
};

// Применение фильтров по кнопке
window.applyFilters = () => {
    console.log('applyFilters вызвана');
    
    const monthFilter = document.getElementById('monthFilter')?.value || '';
    const serviceFilter = document.getElementById('serviceFilter')?.value || '';
    
    console.log('Выбран месяц:', monthFilter);
    console.log('Выбрана услуга:', serviceFilter);
    
    // Сохраняем активные фильтры
    activeFilters.month = monthFilter;
    activeFilters.service = serviceFilter;
    
    // Обновляем отображение активных фильтров
    updateActiveFiltersDisplay();
    
    // Применяем фильтры к данным
    filterAndRenderBookings();
};

// Обновление отображения активных фильтров
const updateActiveFiltersDisplay = () => {
    const activeFiltersContainer = document.getElementById('activeFilters');
    if (!activeFiltersContainer) return;
    
    activeFiltersContainer.innerHTML = '';
    
    const hasActiveFilters = activeFilters.month || activeFilters.service;
    
    if (!hasActiveFilters) {
        activeFiltersContainer.style.display = 'none';
        return;
    }
    
    activeFiltersContainer.style.display = 'flex';
    
    // Добавляем тег для месяца
    if (activeFilters.month) {
        const monthNames = {
            '01': 'Январь', '02': 'Февраль', '03': 'Март', '04': 'Апрель',
            '05': 'Май', '06': 'Июнь', '07': 'Июль', '08': 'Август',
            '09': 'Сентябрь', '10': 'Октябрь', '11': 'Ноябрь', '12': 'Декабрь'
        };
        
        const monthTag = document.createElement('div');
        monthTag.className = 'filter-tag';
        monthTag.innerHTML = `
            📅 ${monthNames[activeFilters.month]}
            <button onclick="removeFilter('month')" class="clear-tag">×</button>
        `;
        activeFiltersContainer.appendChild(monthTag);
    }
    
    // Добавляем тег для услуги
    if (activeFilters.service) {
        const serviceTag = document.createElement('div');
        serviceTag.className = 'filter-tag';
        serviceTag.innerHTML = `
            💆 ${activeFilters.service}
            <button onclick="removeFilter('service')" class="clear-tag">×</button>
        `;
        activeFiltersContainer.appendChild(serviceTag);
    }
    
    // Добавляем кнопку сброса всех фильтров
    const clearAllTag = document.createElement('div');
    clearAllTag.className = 'filter-tag';
    clearAllTag.style.background = '#ffebee';
    clearAllTag.style.borderColor = '#dc3545';
    clearAllTag.innerHTML = `
        ❌ Очистить все
        <button onclick="clearAllFilters()" class="clear-tag" style="color: #dc3545;">×</button>
    `;
    activeFiltersContainer.appendChild(clearAllTag);
};

// Удаление конкретного фильтра
window.removeFilter = (filterType) => {
    activeFilters[filterType] = '';
    
    // Сбрасываем соответствующий select
    if (filterType === 'month') {
        document.getElementById('monthFilter').value = '';
    } else if (filterType === 'service') {
        document.getElementById('serviceFilter').value = '';
    }
    
    updateActiveFiltersDisplay();
    filterAndRenderBookings();
};

// Очистка всех фильтров
window.clearAllFilters = () => {
    activeFilters.month = '';
    activeFilters.service = '';
    
    document.getElementById('monthFilter').value = '';
    document.getElementById('serviceFilter').value = '';
    
    updateActiveFiltersDisplay();
    filterAndRenderBookings();
};

// Фильтрация и отображение записей
const filterAndRenderBookings = () => {
    console.log('filterAndRenderBookings вызвана');
    console.log('Всего записей:', allBookings.length);
    console.log('Активные фильтры:', activeFilters);
    
    let filtered = [...allBookings];
    
    // Фильтрация по месяцу
    if (activeFilters.month) {
        console.log('Фильтруем по месяцу:', activeFilters.month);
        filtered = filtered.filter(item => {
            if (!item.date) {
                console.log('У записи нет даты:', item);
                return false;
            }
            
            // Проверяем разные форматы даты
            let month;
            if (item.date.includes('-')) {
                // Формат YYYY-MM-DD
                month = item.date.split('-')[1];
            } else if (item.date.includes('.')) {
                // Формат DD.MM.YYYY
                month = item.date.split('.')[1];
            } else {
                // Попробуем создать Date объект
                try {
                    const dateObj = new Date(item.date);
                    month = String(dateObj.getMonth() + 1).padStart(2, '0');
                } catch (e) {
                    console.log('Не удалось разобрать дату:', item.date);
                    return false;
                }
            }
            
            console.log('Дата записи:', item.date, 'Месяц:', month);
            const result = month === activeFilters.month;
            console.log('Результат фильтрации:', result);
            return result;
        });
    }
    
    // Фильтрация по услуге
    if (activeFilters.service) {
        console.log('Фильтруем по услуге:', activeFilters.service);
        filtered = filtered.filter(item => {
            const result = item.service === activeFilters.service;
            console.log('Услуга:', item.service, 'Совпадение:', result);
            return result;
        });
    }
    
    console.log('После фильтрации осталось:', filtered.length, 'записей');
    renderBookings(filtered);
};

// ==================== УПРАВЛЕНИЕ ЗАПИСЯМИ ====================
const bookingList = document.getElementById('bookingList');
if (bookingList) {
    // Загрузка всех записей из Firebase
    const loadBookings = async () => {
        try {
            console.log('Загрузка записей из Firebase...');
            const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            allBookings = [];
            
            snap.forEach(item => {
                const data = item.data();
                console.log('Загружена запись:', data);
                
                // Нормализуем данные
                const normalizedData = {
                    id: item.id, 
                    name: data.name || 'Не указано',
                    phone: data.phone || 'Не указан',
                    date: data.date || '',
                    service: data.service || 'Не указана',
                    month: data.month || '', // Извлекаем сохранённый месяц
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
                };
                
                // Если месяц не сохранён, извлекаем из даты
                if (!normalizedData.month && normalizedData.date) {
                    if (normalizedData.date.includes('-')) {
                        normalizedData.month = normalizedData.date.split('-')[1];
                    }
                }
                
                allBookings.push(normalizedData);
            });
            
            console.log('Всего загружено записей:', allBookings.length);
            
            // Применяем активные фильтры при загрузке
            filterAndRenderBookings();
            
        } catch (error) {
            console.error("Ошибка загрузки записей:", error);
            bookingList.innerHTML = '<div class="info-block" style="text-align: center; color: #dc3545;">Ошибка загрузки данных. Проверьте консоль.</div>';
        }
    };
    
    // Отображение записей
    const renderBookings = (bookings) => {
        console.log('renderBookings вызвана с', bookings.length, 'записями');
        bookingList.innerHTML = '';
        
        if (bookings.length === 0) {
            let message = 'Записей не найдено';
            if (activeFilters.month || activeFilters.service) {
                message = 'Записей по выбранным фильтрам не найдено';
            }
            bookingList.innerHTML = `<div class="info-block" style="text-align: center; color: #666;">${message}</div>`;
            document.getElementById('totalCount').textContent = '0';
            document.getElementById('filteredCount').textContent = '';
            return;
        }
        
        bookings.forEach(item => {
            const div = document.createElement('div');
            div.className = 'info-block';
            div.style.position = 'relative';
            div.style.paddingRight = '100px';
            div.style.marginBottom = '20px';
            
            // Форматирование даты сеанса
            let formattedDate = 'Не указана';
            if (item.date) {
                try {
                    const dateObj = new Date(item.date);
                    if (!isNaN(dateObj.getTime())) {
                        formattedDate = dateObj.toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        });
                    }
                } catch (e) {
                    formattedDate = item.date;
                }
            }
            
            // Форматирование времени создания
            let formattedCreated = 'Не указано';
            if (item.createdAt) {
                try {
                    const createdDate = item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt);
                    if (!isNaN(createdDate.getTime())) {
                        formattedCreated = createdDate.toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    }
                } catch (e) {
                    console.log('Ошибка форматирования даты создания:', e);
                }
            }
            
            div.innerHTML = `
                <div style="margin-bottom: 10px;">
                    <strong style="font-size: 1.1rem; color: var(--dark);">👤 ${item.name}</strong>
                </div>
                <div style="margin-bottom: 8px;">
                    📞 <a href="tel:${item.phone}" style="color: var(--gold); text-decoration: none;">
                        ${item.phone}
                    </a>
                </div>
                <div style="margin-bottom: 8px;">
                    📅 <strong>Дата сеанса:</strong> ${formattedDate}
                </div>
                <div style="margin-bottom: 8px;">
                    💆 <strong>Услуга:</strong> ${item.service}
                </div>
                <div style="font-size: 0.85rem; color: #888; margin-top: 15px;">
                    📝 Запись создана: ${formattedCreated}
                </div>
                <button onclick="deleteRow('${item.id}')" 
                        style="position: absolute; top: 20px; right: 20px; background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: 0.3s;">
                    🗑️ Удалить
                </button>
            `;
            bookingList.appendChild(div);
        });
        
        // Обновляем счетчики
        document.getElementById('totalCount').textContent = allBookings.length;
        
        if (activeFilters.month || activeFilters.service) {
            document.getElementById('filteredCount').textContent = 
                `(Отфильтровано: ${bookings.length} из ${allBookings.length} записей)`;
            document.getElementById('filteredCount').style.display = 'block';
        } else {
            document.getElementById('filteredCount').style.display = 'none';
        }
    };
    
    // Удаление записи
    window.deleteRow = async (id) => {
        if(confirm("Вы уверены, что хотите удалить эту запись?")) {
            try {
                await deleteDoc(doc(db, "bookings", id));
                console.log('Запись удалена:', id);
                loadBookings();
            } catch (err) {
                console.error("Ошибка удаления:", err);
                alert("Ошибка при удалении записи");
            }
        }
    };
    
    // Загрузка записей при загрузке страницы
    loadBookings();
    
    // Автоматическое обновление каждые 30 секунд
    setInterval(loadBookings, 30000);
}

// ==================== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ====================
// Добавляем анимации в стили
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .fade-in {
        animation: fadeIn 0.5s ease-out;
    }
`;
document.head.appendChild(style);

// Плавная прокрутка для всех якорных ссылок
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Добавляем глобальную функцию для отладки
window.debugBookings = () => {
    console.log('=== ДЕБАГ ИНФОРМАЦИЯ ===');
    console.log('Всего записей:', allBookings.length);
    console.log('Активные фильтры:', activeFilters);
    console.log('Первые 5 записей:', allBookings.slice(0, 5));
    
    // Показываем все уникальные месяцы в данных
    const uniqueMonths = [...new Set(allBookings.map(item => {
        if (!item.date) return 'Нет даты';
        if (item.date.includes('-')) return item.date.split('-')[1];
        return 'Неизвестный формат';
    }))];
    console.log('Уникальные месяцы в данных:', uniqueMonths);
    
    // Показываем все уникальные услуги
    const uniqueServices = [...new Set(allBookings.map(item => item.service))];
    console.log('Уникальные услуги:', uniqueServices);
};
