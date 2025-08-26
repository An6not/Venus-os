// Current time and date functions
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    });
    const dateString = now.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    document.querySelector('.status-bar .time').textContent = timeString;
    document.querySelector('.aod-time').textContent = timeString;
    document.querySelector('.aod-date').textContent = dateString;
}

setInterval(updateTime, 60000);
updateTime();

// Power button handling
const powerButton = document.querySelector('.power-button');
const mainScreen = document.querySelector('.main-screen');
const aodScreen = document.querySelector('.aod-screen');
let isScreenOn = true;

powerButton.addEventListener('click', () => {
    isScreenOn = !isScreenOn;
    if (isScreenOn) {
        aodScreen.style.display = 'none';
        mainScreen.style.display = 'block';
    } else {
        aodScreen.style.display = 'flex';
        mainScreen.style.display = 'none';
    }
});

// Navigation mode switching
let isGestureMode = false;
const navButtons = document.querySelector('.nav-buttons');
const gestureBar = document.querySelector('.nav-gesture-bar');

function toggleNavigationMode() {
    isGestureMode = !isGestureMode;
    navButtons.style.display = isGestureMode ? 'none' : 'flex';
    gestureBar.style.display = isGestureMode ? 'block' : 'none';
}

// App animations
document.querySelectorAll('.app-icon').forEach(icon => {
    icon.addEventListener('click', function() {
        const appName = this.getAttribute('data-app');
        console.log(`Opening ${appName}...`);
        this.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 100);
    });
});

// Basic gestures (swipes)
let touchStartY = 0;
document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchmove', (e) => {
    const touchY = e.touches[0].clientY;
    const diff = touchStartY - touchY;
    if (diff < -50) {
        console.log('Opening notification center...');
    }
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateTime();
});
