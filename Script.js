document.addEventListener('DOMContentLoaded', function() {
    // Элементы интерфейса
    const bootScreen = document.getElementById('boot-screen');
    const setupScreen = document.getElementById('setup-screen');
    const desktop = document.getElementById('desktop');
    const appWindow = document.getElementById('app-window');
    const appContent = document.querySelector('.app-content');
    const appTitle = document.querySelector('.app-title');
    const backBtn = document.querySelector('.back-btn');
    const setupCompleteBtn = document.getElementById('setup-complete');
    const dynamicIsland = document.getElementById('dynamicIsland');
    const islandText = document.getElementById('islandText');
    
    // Приложения
    const apps = {
        phone: {
            name: 'Телефон',
            content: `
                <div class="app-phone">
                    <h3>Телефон</h3>
                    <div class="dialer">
                        <input type="text" class="phone-number" placeholder="Введите номер" readonly style="width: 100%; padding: 15px; font-size: 18px; text-align: center; border: 1px solid #ddd; border-radius: 10px; margin-bottom: 20px;">
                        <div class="dialer-buttons">
                            <button>1</button><button>2</button><button>3</button>
                            <button>4</button><button>5</button><button>6</button>
                            <button>7</button><button>8</button><button>9</button>
                            <button>*</button><button>0</button><button>#</button>
                        </div>
                        <button class="call-btn">Позвонить</button>
                    </div>
                </div>
            `
        },
        messages: {
            name: 'Сообщения',
            content: `
                <div class="app-messages">
                    <h3>Сообщения</h3>
                    <div class="conversation-list">
                        <div class="conversation">
                            <div class="contact">Мама</div>
                            <div class="preview">Привет, как дела?</div>
                        </div>
                        <div class="conversation">
                            <div class="contact">Друг</div>
                            <div class="preview">Встречаемся сегодня?</div>
                        </div>
                        <div class="conversation">
                            <div class="contact">Работа</div>
                            <div class="preview">Завтра совещание в 10:00</div>
                        </div>
                    </div>
                </div>
            `
        },
        music: {
            name: 'Музыка',
            content: `
                <div class="app-music">
                    <h3>Музыка</h3>
                    <div class="now-playing">
                        <div class="album-cover"></div>
                        <div class="song-info">
                            <h4>Beautiful Day</h4>
                            <p>U2</p>
                        </div>
                        <div class="controls">
                            <button>⏮</button>
                            <button>⏯</button>
                            <button>⏭</button>
                        </div>
                    </div>
                    <div class="playlist">
                        <div class="conversation">Beautiful Day - U2</div>
                        <div class="conversation">Shape of You - Ed Sheeran</div>
                        <div class="conversation">Blinding Lights - The Weeknd</div>
                    </div>
                </div>
            `
        },
        gallery: {
            name: 'Галерея',
            content: `
                <div class="app-gallery">
                    <h3>Галерея</h3>
                    <div class="photo-grid">
                        <div class="photo" style="background: #ff6b6b;"></div>
                        <div class="photo" style="background: #4ecdc4;"></div>
                        <div class="photo" style="background: #45b7d1;"></div>
                        <div class="photo" style="background: #96ceb4;"></div>
                        <div class="photo" style="background: #feca57;"></div>
                        <div class="photo" style="background: #ff9ff3;"></div>
                    </div>
                </div>
            `
        },
        calculator: {
            name: 'Калькулятор',
            content: `
                <div class="app-calculator">
                    <h3>Калькулятор</h3>
                    <div class="calculator-display">0</div>
                    <div class="calculator-buttons">
                        <button>C</button><button>±</button><button>%</button><button>÷</button>
                        <button>7</button><button>8</button><button>9</button><button>×</button>
                        <button>4</button><button>5</button><button>6</button><button>-</button>
                        <button>1</button><button>2</button><button>3</button><button>+</button>
                        <button>0</button><button>.</button><button>⌫</button><button>=</button>
                    </div>
                </div>
            `
        },
        calendar: {
            name: 'Календарь',
            content: `
                <div class="app-calendar">
                    <h3>Календарь</h3>
                    <div class="calendar-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <button style="background: none; border: none; font-size: 18px; cursor: pointer;">‹</button>
                        <span style="font-weight: 600;">Ноябрь 2023</span>
                        <button style="background: none; border: none; font-size: 18px; cursor: pointer;">›</button>
                    </div>
                    <div class="calendar-grid">
                        <div class="day">Пн</div><div class="day">Вт</div><div class="day">Ср</div>
                        <div class="day">Чт</div><div class="day">Пт</div><div class="day">Сб</div>
                        <div class="day">Вс</div>
                        ${Array.from({length: 30}, (_, i) => `<div class="day">${i + 1}</div>`).join('')}
                    </div>
                </div>
            `
        },
        clock: {
            name: 'Часы',
            content: `
                <div class="app-clock">
                    <h3>Часы</h3>
                    <div class="clock-display" id="live-clock">12:30:45</div>
                    <div class="world-clocks">
                        <div class="world-clock">
                            <div class="city">Москва</div>
                            <div class="time">12:30</div>
                        </div>
                        <div class="world-clock">
                            <div class="city">Нью-Йорк</div>
                            <div class="time">04:30</div>
                        </div>
                        <div class="world-clock">
                            <div class="city">Токио</div>
                            <div class="time">18:30</div>
                        </div>
                    </div>
                </div>
            `
        },
        compass: {
            name: 'Компас',
            content: `
                <div class="app-compass">
                    <h3>Компас</h3>
                    <div class="compass-circle">
                        <div class="compass-needle">N</div>
                    </div>
                    <div class="compass-direction">Север</div>
                </div>
            `
        },
        files: {
            name: 'Файлы',
            content: `
                <div class="app-files">
                    <h3>Файлы</h3>
                    <div class="file-list">
                        <div class="file-item">
                            <div class="file-icon">📁</div>
                            <div class="file-name">Документы</div>
                        </div>
                        <div class="file-item">
                            <div class="file-icon">📁</div>
                            <div class="file-name">Изображения</div>
                        </div>
                        <div class="file-item">
                            <div class="file-icon">📁</div>
                            <div class="file-name">Музыка</div>
                        </div>
                        <div class="file-item">
                            <div class="file-icon">📁</div>
                            <div class="file-name">Видео</div>
                        </div>
                    </div>
                </div>
            `
        },
        settings: {
            name: 'Настройки',
            content: `
                <div class="app-settings">
                    <h3>Настройки</h3>
                    <div class="settings-list">
                        <div class="setting-item">Wi-Fi</div>
                        <div class="setting-item">Bluetooth</div>
                        <div class="setting-item">Экран</div>
                        <div class="setting-item">Звук</div>
                        <div class="setting-item">Батарея</div>
                        <div class="setting-item">Хранилище</div>
                    </div>
                </div>
            `
        }
    };

    // Инициализация
    function init() {
        // Запуск загрузочной анимации
        setTimeout(() => {
            bootScreen.classList.add('hidden');
            setupScreen.classList.remove('hidden');
        }, 3000);
        
        // Обработчики событий
        setupCompleteBtn.addEventListener('click', showDesktop);
        backBtn.addEventListener('click', closeApp);
        
        // Обработчики для иконок приложений
        document.querySelectorAll('.app-icon, .dock-icon').forEach(icon => {
            icon.addEventListener('click', function() {
                const appName = this.getAttribute('data-app');
                openApp(appName);
            });
        });
        
        // Обновление времени
        updateTime();
        setInterval(updateTime, 1000);
        
        // Обновление живых часов в приложении
        setInterval(updateLiveClock, 1000);
    }
    
    // Показать рабочий стол
    function showDesktop() {
        setupScreen.classList.add('hidden');
        desktop.classList.remove('hidden');
        closeApp();
        updateDynamicIsland('desktop');
    }
    
    // Открыть приложение
    function openApp(appName) {
        if (apps[appName]) {
            desktop.classList.add('hidden');
            appWindow.classList.remove('hidden');
            setTimeout(() => {
                appWindow.classList.add('open');
            }, 10);
            
            appTitle.textContent = apps[appName].name;
            appContent.innerHTML = apps[appName].content;
            
            updateDynamicIsland(appName);
            
            // Инициализация специфичных функций приложения
            initAppFeatures(appName);
        }
    }
    
    // Закрыть приложение
    function closeApp() {
        appWindow.classList.remove('open');
        setTimeout(() => {
            appWindow.classList.add('hidden');
            desktop.classList.remove('hidden');
            updateDynamicIsland('desktop');
        }, 300);
    }
    
    // Обновить динамический островок
    function updateDynamicIsland(context) {
        if (context === 'desktop') {
            dynamicIsland.classList.remove('expanded');
            updateTime();
        } else {
            dynamicIsland.classList.add('expanded');
            islandText.textContent = apps[context].name;
            
            // Через 2 секунды вернуть время
            setTimeout(() => {
                if (dynamicIsland.classList.contains('expanded')) {
                    updateTime();
                    dynamicIsland.classList.remove('expanded');
                }
            }, 2000);
        }
    }
    
    // Обновить время
    function updateTime() {
        const now = new Date();
        const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0');
        islandText.textContent = timeString;
    }
    
    // Обновить живые часы в приложении
    function updateLiveClock() {
        const liveClock = document.getElementById('live-clock');
        if (liveClock) {
            const now = new Date();
            const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                              now.getMinutes().toString().padStart(2, '0') + ':' + 
                              now.getSeconds().toString().padStart(2, '0');
            liveClock.textContent = timeString;
        }
    }
    
    // Инициализация специфичных функций приложений
    function initAppFeatures(appName) {
        switch(appName) {
            case 'calculator':
                initCalculator();
                break;
            case 'phone':
                initPhone();
                break;
        }
    }
    
    // Инициализация калькулятора
    function initCalculator() {
        const display = document.querySelector('.calculator-display');
        const buttons = document.querySelectorAll('.calculator-buttons button');
        let currentInput = '0';
        let previousInput = '';
        let operation = null;
        let resetScreen = false;
        
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                const value = this.textContent;
                
                if ('0123456789'.includes(value)) {
                    if (currentInput === '0' || resetScreen) {
                        currentInput = value;
                        resetScreen = false;
                    } else {
                        currentInput += value;
                    }
                    display.textContent = currentInput;
                } else if (value === 'C') {
                    currentInput = '0';
                    previousInput = '';
                    operation = null;
                    display.textContent = currentInput;
                } else if (value === '⌫') {
                    currentInput = currentInput.slice(0, -1) || '0';
                    display.textContent = currentInput;
                } else if (value === '=') {
                    if (operation && previousInput) {
                        currentInput = calculate(previousInput, currentInput, operation);
                        display.textContent = currentInput;
                        operation = null;
                        previousInput = '';
                        resetScreen = true;
                    }
                } else {
                    // Операции: +, -, ×, ÷
                    if (previousInput && currentInput && operation) {
                        currentInput = calculate(previousInput, currentInput, operation);
                        display.textContent = currentInput;
                    }
                    previousInput = currentInput;
                    operation = value;
                    resetScreen = true;
                }
            });
        });
        
        function calculate(a, b, op) {
            a = parseFloat(a);
            b = parseFloat(b);
            
            switch(op) {
                case '+': return (a + b).toString();
                case '-': return (a - b).toString();
                case '×': return (a * b).toString();
                case '÷': return (a / b).toString();
                default: return b.toString();
            }
        }
    }
    
    // Инициализация телефона
    function initPhone() {
        const phoneNumber = document.querySelector('.phone-number');
        const buttons = document.querySelectorAll('.dialer-buttons button');
        const callBtn = document.querySelector('.call-btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                if (phoneNumber.value === 'Введите номер') {
                    phoneNumber.value = '';
                }
                phoneNumber.value += this.textContent;
            });
        });
        
        callBtn.addEventListener('click', function() {
            if (phoneNumber.value) {
                alert(`Вызов номера: ${phoneNumber.value}`);
            }
        });
    }
    
    // Запуск инициализации
    init();
});
