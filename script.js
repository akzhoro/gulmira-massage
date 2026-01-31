<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Панель управления - Записи клиентов</title>
    <link rel="stylesheet" href="style.css">
    <style>
        .filters-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-bottom: 40px;
            padding: 25px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        
        .filter-row {
            display: flex;
            gap: 20px;
            align-items: flex-end;
            flex-wrap: wrap;
        }
        
        .filter-group {
            flex: 1;
            min-width: 300px;
        }
        
        .filter-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--dark);
            font-size: 0.95rem;
        }
        
        .filter-select {
            width: 100%;
            padding: 12px 15px;
            border-radius: 8px;
            border: 2px solid #e0e0e0;
            font-family: 'Montserrat', sans-serif;
            font-size: 1rem;
            background: white;
            transition: 0.3s;
            cursor: pointer;
        }
        
        .filter-select:focus {
            border-color: var(--gold);
            outline: none;
            box-shadow: 0 0 0 3px rgba(179, 142, 77, 0.1);
        }
        
        .search-button {
            padding: 12px 30px;
            background: var(--gold);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: 0.3s;
            font-size: 1rem;
            height: 46px;
        }
        
        .search-button:hover {
            background: #9d7a41;
            transform: translateY(-2px);
        }
        
        .search-button:active {
            transform: translateY(0);
        }
        
        .active-filters {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #eee;
        }
        
        .filter-tag {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            background: white;
            border: 1px solid var(--gold);
            border-radius: 20px;
            font-size: 0.85rem;
            color: var(--dark);
        }
        
        .clear-tag {
            background: none;
            border: none;
            color: #dc3545;
            cursor: pointer;
            font-size: 1.2rem;
            line-height: 1;
            padding: 0;
            margin-left: 5px;
        }
        
        @media (max-width: 768px) {
            .filter-row {
                flex-direction: column;
            }
            
            .filter-group {
                min-width: 100%;
            }
            
            .search-button {
                width: 100%;
            }
        }
    </style>
    <script>
        if(localStorage.getItem('auth') !== 'true') window.location.href = 'admin.html';
    </script>
</head>
<body>
    <nav>
        <div class="logo">ЗАПИСИ КЛИЕНТОВ</div>
        <button onclick="logout()" class="btn" style="padding:10px 20px; font-size:0.8rem;">Выйти</button>
    </nav>
    <section>
        <div class="filters-container">
            <div class="filter-row">
                <div class="filter-group">
                    <label class="filter-label">💆 Фильтр по услуге</label>
                    <select id="serviceFilter" class="filter-select">
                        <option value="">Все услуги</option>
                        <option value="Детский общий массаж (0-5 лет)">Детский общий массаж (0-5 лет)</option>
                        <option value="Детский общий массаж (5-10 лет)">Детский общий массаж (5-10 лет)</option>
                        <option value="Детский общий массаж (10-15 лет)">Детский общий массаж (10-15 лет)</option>
                        <option value="Детский общий массаж (15-18 лет)">Детский общий массаж (15-18 лет)</option>
                        <option value="Женский общий массаж">Женский общий массаж</option>
                        <option value="Мужской общий массаж">Мужской общий массаж</option>
                        <option value="ШВЗ + Физио">ШВЗ + Физио</option>
                        <option value="Спина + Физио">Спина + Физио</option>
                        <option value="Антицеллюлитный ручной">Антицеллюлитный ручной</option>
                        <option value="Аппаратная коррекция фигуры">Аппаратная коррекция фигуры</option>
                        <option value="Аппаратный массаж лица">Аппаратный массаж лица</option>
                        <option value="Миофасциальный массаж">Миофасциальный массаж</option>
                        <option value="Массаж 5 Континентов">Массаж 5 Континентов</option>
                        <option value="Физио">Физио</option>
                    </select>
                </div>
                
                <button onclick="applyFilters()" class="search-button">🔍 Применить фильтр</button>
            </div>
            
            <div id="activeFilters" class="active-filters" style="display: none;">
                <!-- Активные фильтры будут добавляться сюда динамически -->
            </div>
        </div>
        
        <div id="bookingList"></div>
        
        <div id="totalCounter" style="margin-top: 30px; padding: 15px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 10px; text-align: center; border-left: 4px solid var(--gold);">
            <strong style="font-size: 1.2rem;">📊 Всего записей: <span id="totalCount">0</span></strong>
            <div id="filteredCount" style="font-size: 0.9rem; color: #666; margin-top: 5px; display: none;"></div>
        </div>
    </section>
    <script type="module" src="script.js"></script>
</body>
</html>
