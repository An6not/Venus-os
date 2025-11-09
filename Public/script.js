window.addEventListener('DOMContentLoaded', () => {
    const desktop = document.getElementById('desktop');
    const phoneFrame = document.getElementById('phone-frame');

    const timeEl = document.getElementById('time');
    const batteryEl = document.getElementById('battery');

    // Настройка приложений
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

    // Генерация иконок на рабочем столе
    apps.forEach(app => {
        const img = document.createElement('img');
        img.src = app.icon;
        img.alt = app.name;
        img.classList.add('app-icon');
        img.addEventListener('click', () => openApp(app));
        desktop.appendChild(img);
    });

    // Окно приложения
    const appWindow = document.getElementById('app-window');
    const appTitle = document.getElementById('app-title');
    const appContent = document.getElementById('app-content');
    const closeApp = document.getElementById('close-app');

    closeApp.addEventListener('click', () => {
        appWindow.classList.add('hidden');
    });

    function openApp(app) {
        appTitle.textContent = app.name;
        appContent.innerHTML = `<p>Это приложение: ${app.name}</p>`;
        appWindow.classList.remove('hidden');
    }

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
});});

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
