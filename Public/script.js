
const appIcons = document.querySelectorAll('.app-icon');

appIcons.forEach(icon => {
    icon.addEventListener('click', () => {
        const appName = icon.dataset.app;
        alert(`Открытие приложения: ${appName}`);
        // Здесь позже можно добавить открытие окна приложения
    });
});
