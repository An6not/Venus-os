const desktop = document.getElementById('desktop');
const phoneFrame = document.getElementById('phone-frame');

// Создаем полосу состояния
const statusBar = document.createElement('div');
statusBar.className = 'status-bar';
statusBar.innerHTML = `<span id="time">12:00</span><span id="battery">100%</span>`;
phoneFrame.appendChild(statusBar);

const timeEl = document.getElementById('time');
const batteryEl = document.getElementById('battery');

// Приложения
const apps = [
    {name: "Calculator", icon: "./Public/venus-os-component/Images/App-icons/Harmony/calculator.png"},
    {name: "Calendar", icon: "./Public/venus-os-component/Images/App-icons/Harmony/calendar.png"},
    {name: "Clock", icon: "./Public/venus-os-component/Images/App-icons/Harmony/clock.png"},
    {name: "Files", icon: "./Public/venus-os-component/Images/App-icons/Harmony/files.png"},
    {name: "Gallery", icon: "./Public/venus-os-component/Images/App-icons/Harmony/gallery.png"},
    {name: "Messages", icon: "./Public/venus-os-component/Images/App-icons/Harmony/messages.png"},
    {name: "Music", icon: "./Public/venus-os-component/Images/App-icons/Harmony/music.png"},
    {name: "Phone", icon: "./Public/venus-os-component/Images/App-icons/Harmony/phone.png"},
    {name: "Settings", icon: "./Public/venus-os-component/Images/App-icons/Harmony/settings.png"},
];

// Генерация иконок
apps.forEach(app => {
    const img = document.createElement('img');
    img.src = app.icon;
    img.alt = app.name;
    img.className = 'app-icon';
    img.addEventListener('click', () => openApp(app));
    desktop.appendChild(img);
});

// Обои
const wallpapers = [
    "./Public/venus-os-component/Images/Wallpaper/1.jpeg",
    "./Public/venus-os-component/Images/Wallpaper/2.jpeg"
];
let currentWallpaper = 0;
function changeWallpaper() {
    phoneFrame.style.backgroundImage = `url(${wallpapers[currentWallpaper]})`;
    currentWallpaper = (currentWallpaper + 1) % wallpapers.length;
}
changeWallpaper();

// Полоса состояния
function updateStatusBar() {
    const now = new Date();
    timeEl.textContent = now.getHours().toString().padStart(2,'0') + ":" + now.getMinutes().toString().padStart(2,'0');
    batteryEl.textContent = Math.floor(Math.random()*21 + 80) + "%"; 
}
setInterval(updateStatusBar, 1000);

// Создаем контейнер для приложений
const appWindow = document.createElement('div');
appWindow.className = 'app-window hidden';
phoneFrame.appendChild(appWindow);

const appHeader = document.createElement('div');
appHeader.className = 'app-header';
appHeader.innerHTML = `<span id="app-title">App</span><button id="close-app">X</button>`;
appWindow.appendChild(appHeader);

const appContent = document.createElement('div');
appContent.className = 'app-content';
appWindow.appendChild(appContent);

document.getElementById('close-app').addEventListener('click', () => {
    appWindow.classList.add('hidden');
});

// Открытие приложения
function openApp(app) {
    document.getElementById('app-title').textContent = app.name;
    appContent.innerHTML = `<p>Это приложение: ${app.name}</p>`;
    appWindow.classList.remove('hidden');
}
// Закрытие приложения
closeApp.addEventListener('click', () => {
    appWindow.classList.add('hidden');
});

// Обои (динамически)
const wallpapers = [
    "./Public/venus-os-component/Images/Wallpaper/1.jpeg",
    "./Public/venus-os-component/Images/Wallpaper/2.jpeg"
];

let currentWallpaper = 0;
function changeWallpaper() {
    phoneFrame.style.backgroundImage = `url(${wallpapers[currentWallpaper]})`;
    currentWallpaper = (currentWallpaper + 1) % wallpapers.length;
}
changeWallpaper();

// Полоса состояния (время, батарея)
function updateStatusBar() {
    const timeEl = document.getElementById('time');
    const batteryEl = document.getElementById('battery');
    const now = new Date();
    timeEl.textContent = now.getHours().toString().padStart(2,'0') + ":" + now.getMinutes().toString().padStart(2,'0');
    batteryEl.textContent = Math.floor(Math.random()*21 + 80) + "%"; // пример батареи
}
setInterval(updateStatusBar, 1000);
// Обои (динамически)
const wallpapers = [
    "./Public/venus-os-component/Images/wallpaper/1.jpeg",
    "./Public/venus-os-component/Images/wallpaper/2.jpeg"
];

let currentWallpaper = 0;
function changeWallpaper() {
    phoneFrame.style.backgroundImage = `url(${wallpapers[currentWallpaper]})`;
    currentWallpaper = (currentWallpaper + 1) % wallpapers.length;
}

// Установить начальный обои
changeWallpaper();

// Полоса состояния (время, батарея)
function updateStatusBar() {
    const timeEl = document.getElementById('time');
    const batteryEl = document.getElementById('battery');
    const now = new Date();
    timeEl.textContent = now.getHours().toString().padStart(2,'0') + ":" + now.getMinutes().toString().padStart(2,'0');
    batteryEl.textContent = Math.floor(Math.random()*21 + 80) + "%"; // пример батареи
}
setInterval(updateStatusBar, 1000);
