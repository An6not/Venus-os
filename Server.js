// server.js
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

// Отдаем файлы из папки пользователю
app.set('port', 5000);
app.use(express.static(__dirname));

// --- ИГРОВАЯ ЛОГИКА СЕРВЕРА ---
let players = {};

io.on('connection', (socket) => {
    console.log('Новый игрок подключился:', socket.id);

    // Создаем нового игрока
    players[socket.id] = {
        x: 300,
        y: 300,
        color: '#' + Math.floor(Math.random()*16777215).toString(16) // Случайный цвет
    };

    // Слушаем движение от игрока
    socket.on('movement', (data) => {
        const player = players[socket.id] || {};
        
        // Простая скорость (5 пикселей за кадр)
        const speed = 5;
        
        if (data.x) player.x += data.x * speed;
        if (data.y) player.y += data.y * speed;
        
        // Не даем уйти за границы (условные 2000x2000)
        // player.x = Math.max(0, Math.min(2000, player.x));
    });

    // Когда игрок уходит
    socket.on('disconnect', () => {
        delete players[socket.id];
    });
});

// Отправляем состояние игры всем игрокам 60 раз в секунду
setInterval(() => {
    io.sockets.emit('state', players);
}, 1000 / 60);

// Запуск
server.listen(5000, () => {
    console.log('Сервер запущен на порту 5000');
    console.log('Открой в браузере: http://localhost:5000');
});
              
