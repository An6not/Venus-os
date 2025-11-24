// Приложения для рабочего стола
const apps = [
    { id: 'phone', name: 'Телефон', emoji: '📞', color: '#4CAF50' },
    { id: 'messages', name: 'Сообщения', emoji: '💬', color: '#2196F3' },
    { id: 'camera', name: 'Камера', emoji: '📷', color: '#FF9800' },
    { id: 'photos', name: 'Фото', emoji: '🖼️', color: '#E91E63' },
    { id: 'music', name: 'Музыка', emoji: '🎵', color: '#9C27B0' },
    { id: 'weather', name: 'Погода', emoji: '☀️', color: '#FFC107' },
    { id: 'calendar', name: 'Календарь', emoji: '📅', color: '#F44336' },
    { id: 'settings', name: 'Настройки', emoji: '⚙️', color: '#607D8B' },
    { id: 'calculator', name: 'Калькулятор', emoji: '🧮', color: '#795548' },
    { id: 'notes', name: 'Заметки', emoji: '📝', color: '#FF5722' },
    { id: 'mail', name: 'Почта', emoji: '📧', color: '#009688' },
    { id: 'browser', name: 'Браузер', emoji: '🌐', color: '#3F51B5' }
];

// Инициализация рабочего стола
function initHomeScreen() {
    const appGrid = document.getElementById('appGrid');
    
    apps.forEach(app => {
        const appElement = document.createElement('div');
        appElement.className = 'app-icon';
        appElement.setAttribute('data-app', app.id);
        appElement.innerHTML = `
            <span class="app-emoji">${app.emoji}</span>
            <span class="app-name">${app.name}</span>
        `;
        appElement.addEventListener('click', () => openApp(app));
        appGrid.appendChild(appElement);
    });
}

// Открытие приложения
function openApp(app) {
    const appWindows = document.getElementById('appWindows');
    
    // Создаем оверлей
    let overlay = document.querySelector('.overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
    }
    overlay.classList.add('active');
    
    // Создаем окно приложения
    const appWindow = document.createElement('div');
    appWindow.className = 'app-window active';
    appWindow.id = `app-${app.id}`;
    
    // Содержимое приложения
    const appContent = getAppContent(app);
    
    appWindow.innerHTML = `
        <div class="app-header">
            <h3>${app.name}</h3>
            <button class="close-btn" onclick="closeApp('${app.id}')">×</button>
        </div>
        <div class="app-content">
            ${appContent}
        </div>
    `;
    
    appWindows.appendChild(appWindow);
    
    // Закрытие по клику на оверлей
    overlay.addEventListener('click', () => closeApp(app.id));
}

// Закрытие приложения
function closeApp(appId) {
    const appWindow = document.getElementById(`app-${appId}`);
    const overlay = document.querySelector('.overlay');
    
    if (appWindow) {
        appWindow.remove();
    }
    
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// Содержимое для разных приложений
function getAppContent(app) {
    const contents = {
        'phone': `
            <h2>📞 Телефон</h2>
            <div style="text-align: center; margin: 20px 0;">
                <div style="font-size: 48px; margin: 30px 0;">📞</div>
                <p>Наберите номер или выберите контакт</p>
                <div style="margin-top: 30px;">
                    <button style="padding: 15px 30px; font-size: 18px; background: #4CAF50; color: white; border: none; border-radius: 25px; cursor: pointer;">
                        Набрать номер
                    </button>
                </div>
            </div>
        `,
        'messages': `
            <h2>💬 Сообщения</h2>
            <div style="margin-top: 20px;">
                <div style="background: #f0f0f0; padding: 15px; border-radius: 10px; margin: 10px 0;">
                    <strong>Мама:</strong> Привет! Как дела?
                </div>
                <div style="background: #e3f2fd; padding: 15px; border-radius: 10px; margin: 10px 0; text-align: right;">
                    <strong>Вы:</strong> Всё хорошо!
                </div>
                <div style="background: #f0f0f0; padding: 15px; border-radius: 10px; margin: 10px 0;">
                    <strong>Друг:</strong> Во сколько встречаемся?
                </div>
            </div>
        `,
        'camera': `
            <h2>📷 Камера</h2>
            <div style="text-align: center; margin: 30px 0;">
                <div style="width: 200px; height: 200px; background: #333; border-radius: 10px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">
                    📷
                </div>
                <button style="padding: 15px 30px; font-size: 16px; background: #FF9800; color: white; border: none; border-radius: 25px; cursor: pointer; margin: 10px;">
                    Сделать фото
                </button>
            </div>
        `,
        'browser': `
            <h2>🌐 Браузер</h2>
            <div style="margin-top: 20px;">
                <input type="text" placeholder="Введите адрес..." style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px;">
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center;">
                    <p>Добро пожаловать в браузер!</p>
                    <p style="font-size: 48px; margin: 20px 0;">🌐</p>
                    <p>Введите адрес сайта чтобы начать</p>
                </div>
            </div>
        `,
        'music': `
            <h2>🎵 Музыка</h2>
            <div style="text-align: center; margin: 30px 0;">
                <div style="font-size: 64px; margin: 20px 0;">🎵</div>
                <p>Сейчас играет: Ваш плейлист</p>
                <div style="margin: 30px 0;">
                    <button style="padding: 15px; font-size: 24px; background: #9C27B0; color: white; border: none; border-radius: 50%; width: 60px; height: 60px; cursor: pointer; margin: 0 10px;">
                        ⏪
                    </button>
                    <button style="padding: 15px; font-size: 24px; background: #9C27B0; color: white; border: none; border-radius: 50%; width: 60px; height: 60px; cursor: pointer; margin: 0 10px;">
                        ▶️
                    </button>
                    <button style="padding: 15px; font-size: 24px; background: #9C27B0; color: white; border: none; border-radius: 50%; width: 60px; height: 60px; cursor: pointer; margin: 0 10px;">
                        ⏩
                    </button>
                </div>
            </div>
        `
    };
    
    return contents[app.id] || `
        <h2>${app.emoji} ${app.name}</h2>
        <p>Это приложение "${app.name}" находится в разработке.</p>
        <div style="text-align: center; margin: 40px 0;">
            <div style="font-size: 64px;">${app.emoji}</div>
            <p style="margin-top: 20px; color: #666;">Скоро здесь появится функционал!</p>
        </div>
    `;
}

// Обновление времени в статус баре
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    document.querySelector('.time').textContent = timeString;
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initHomeScreen();
    updateTime();
    setInterval(updateTime, 60000); // Обновлять время каждую минуту
});     icon.addEventListener('click', function() {
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
