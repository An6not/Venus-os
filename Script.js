// --- 1. Настройка Canvas ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- 2. Сетевая часть (Socket.io) ---
const socket = io(); // Подключаемся к серверу

// Хранилище всех игроков
let players = {};

// Получаем состояние от сервера 60 раз в секунду
socket.on('state', (serverPlayers) => {
    players = serverPlayers;
    draw(); // Перерисовываем экран
});

// Наш ID (чтобы знать, кто из квадратиков - мы)
let myId = null;
socket.on('connect', () => {
    myId = socket.id;
});

// --- 3. Отрисовка ---
function draw() {
    // Очистка экрана
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Рисуем сетку для красоты
    drawGrid();

    // Рисуем всех игроков
    for (let id in players) {
        const p = players[id];
        ctx.fillStyle = p.color;
        
        // Если это мы, добавляем обводку
        if (id === myId) {
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(p.x, p.y, 40, 40);
        }
        
        ctx.fillRect(p.x, p.y, 40, 40);
        
        // Имя/ID над игроком
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(id.substring(0, 5), p.x, p.y - 10);
    }
}

function drawGrid() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=50) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for(let i=0; i<canvas.height; i+=50) {
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }
}

// --- 4. Управление (Джойстик) ---
const joyZone = document.getElementById('joystickZone');
const joyStick = document.getElementById('joystickStick');
let movement = { x: 0, y: 0 }; // Вектор движения

// Обработка касаний
joyZone.addEventListener('touchmove', handleTouch, { passive: false });
joyZone.addEventListener('touchstart', handleTouch, { passive: false });
joyZone.addEventListener('touchend', endTouch);

// Для теста на ПК - мышка
let isMouseDown = false;
joyZone.addEventListener('mousedown', (e) => { isMouseDown = true; handleTouch(e); });
window.addEventListener('mousemove', (e) => { if(isMouseDown) handleTouch(e); });
window.addEventListener('mouseup', () => { isMouseDown = false; endTouch(); });


function handleTouch(e) {
    e.preventDefault(); // Чтобы экран не скроллился
    
    // Получаем координаты касания или мыши
    let clientX, clientY;
    if(e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    // Центр джойстика
    const rect = joyZone.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Вектор от центра
    let dx = clientX - centerX;
    let dy = clientY - centerY;

    // Ограничиваем радиус движения стика
    const distance = Math.min(Math.hypot(dx, dy), rect.width / 2);
    const angle = Math.atan2(dy, dx);

    // Новые координаты стика
    const stickX = Math.cos(angle) * distance;
    const stickY = Math.sin(angle) * distance;

    // Двигаем визуальный стик
    joyStick.style.transform = `translate(${stickX}px, ${stickY}px)`;

    // Нормализуем данные для сервера (-1 до 1)
    movement.x = stickX / (rect.width / 2);
    movement.y = stickY / (rect.height / 2);
}

function endTouch() {
    movement = { x: 0, y: 0 };
    joyStick.style.transform = `translate(0px, 0px)`;
}

// Отправляем данные движения на сервер 60 раз в секунду
setInterval(() => {
    socket.emit('movement', movement);
}, 1000 / 60);


// --- 5. Полный экран ---
const btn = document.getElementById('fullscreenBtn');
btn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});
    
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
