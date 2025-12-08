/* ======================================================== */
/* === AI.JS: ЛОГИКА ИСКУССТВЕННОГО ИНТЕЛЛЕКТА (AI CORE) === */
/* ======================================================== */

/**
 * AI CORE для Крестиков-Ноликов (Minimax)
 */
class TicTacToe_AI {
    constructor() {
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
    }

    /** Проверяет, есть ли победитель или ничья. */
    checkWin(board) {
        for (const [a, b, c] of this.winningCombinations) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
        }
        if (!board.includes(null)) return 'Draw';
        return null;
    }

    /**
     * Алгоритм Minimax для определения наилучшего хода.
     */
    minimax(board, depth, isMaximizing, player, opponent) {
        const result = this.checkWin(board);
        if (result === player) return 10 - depth;
        if (result === opponent) return depth - 10;
        if (result === 'Draw') return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = player;
                    let score = this.minimax(board, depth + 1, false, player, opponent);
                    board[i] = null;
                    bestScore = Math.max(bestScore, score);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = opponent;
                    let score = this.minimax(board, depth + 1, true, player, opponent);
                    board[i] = null;
                    bestScore = Math.min(bestScore, score);
                }
            }
            return bestScore;
        }
    }

    /**
     * Выбирает ход, используя Minimax с элементами случайности для настройки сложности (level 100 = Непобедим).
     * @param {string[]} board - Текущее состояние доски.
     * @param {string} player - Символ текущего игрока ('X' или 'O').
     * @param {number} level - Сложность AI (0-100).
     */
    findBestMove(board, player, level) {
        const opponent = player === 'X' ? 'O' : 'X';
        const isMaximizing = player === 'O'; 

        // Процент "случайного" (ошибочного) хода.
        const randomChance = 100 - level; 
        
        // 1. Шанс ошибки: делаем случайный безопасный ход
        if (Math.random() * 100 < randomChance) {
            const availableMoves = board.map((cell, index) => cell === null ? index : null).filter(i => i !== null);
            return availableMoves.length > 0 ? availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1;
        }

        // 2. Делаем лучший (Minimax) ход
        let bestScore = isMaximizing ? -Infinity : Infinity;
        let move = -1;

        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = player;
                // Рекурсивный вызов, ища идеальный ход
                let score = this.minimax(board, 0, !isMaximizing, player, opponent);
                board[i] = null;

                if (isMaximizing) {
                    if (score > bestScore) {
                        bestScore = score;
                        move = i;
                    }
                } else {
                    if (score < bestScore) {
                        bestScore = score;
                        move = i;
                    }
                }
            }
        }
        return move;
    }
}


/**
 * AI CORE для Змейки (Heuristic Search)
 */
class Snake_AI {
    constructor(cols, rows) {
        this.COLS = cols;
        this.ROWS = rows;
    }

    /** Проверка столкновения */
    checkCollision(pos, checkBody, gameState) {
        // Проверка границ
        if (pos.x < 0 || pos.x >= this.COLS || pos.y < 0 || pos.y >= this.ROWS) return true;
        // Проверка тела (исключая голову)
        if (checkBody) {
             for (let i = 1; i < gameState.snake.length; i++) {
                if (pos.x === gameState.snake[i].x && pos.y === gameState.snake[i].y) return true;
            }
        }
        return false;
    }

    /**
     * Возвращает следующий ход на основе эвристики (расстояние до еды, избегание стен/тела).
     * @param {object} gameState - Текущее состояние игры.
     * @param {number} difficulty - Сложность AI (0-100).
     */
    getNextMove(gameState, difficulty) {
        const head = gameState.snake[0];
        const food = gameState.food;
        const currentDirection = gameState.direction;
        
        let directions = [
            {x: 1, y: 0}, {x: -1, y: 0}, 
            {x: 0, y: 1}, {x: 0, y: -1}
        ];
        
        // Фильтр 1: Исключаем поворот на 180 градусов
        directions = directions.filter(dir => dir.x !== -currentDirection.x || dir.y !== -currentDirection.y);
        
        // Уровень 0-30: Высокий шанс случайного выбора среди безопасных (для симуляции "глупости")
        if (difficulty <= 30) {
             const safeMoves = directions.filter(dir => !this.checkCollision({x: head.x + dir.x, y: head.y + dir.y}, true, gameState));
             if (safeMoves.length > 0) {
                 return safeMoves[Math.floor(Math.random() * safeMoves.length)];
             }
             return currentDirection;
        }

        // --- Уровни 31-100: Эвристический поиск ---
        
        const scoreMove = (dir) => {
            const newHead = {x: head.x + dir.x, y: head.y + dir.y};
            
            // Приоритет 1: Избегание смерти (самый высокий штраф)
            if (this.checkCollision(newHead, true, gameState)) return -10000;

            // Приоритет 2: Движение к цели (меньшее расстояние -> больший счет)
            const distanceAfter = Math.abs(newHead.x - food.x) + Math.abs(newHead.y - food.y);
            let score = -distanceAfter;

            // Приоритет 3 (Сложность 70+): Избегание тупиков и замуровывания себя
            if (difficulty >= 70) {
                 let neighborCollisions = 0;
                 const checkNeighbors = [{x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}];
                 checkNeighbors.forEach(nDir => {
                     const neighborPos = {x: newHead.x + nDir.x, y: newHead.y + nDir.y};
                     // Проверка стен и тела, но исключая хвост (позволяет протиснуться)
                     if (this.checkCollision(neighborPos, false, gameState) || 
                         gameState.snake.slice(1, -1).some(s => s.x === neighborPos.x && s.y === neighborPos.y)) {
                         neighborCollisions++;
                     }
                 });
                 score -= neighborCollisions * 10;
            }

            return score;
        };

        let bestDir = currentDirection;
        let maxScore = -Infinity;
        
        directions.forEach(dir => {
            const score = scoreMove(dir);
            if (score > maxScore) {
                maxScore = score;
                bestDir = dir;
            }
        });
        
        // --- Реализация сложности (снижение качества) ---
        const randomErrorChance = (100 - difficulty) / 3; 
        
        if (Math.random() * 100 < randomErrorChance) {
             const safeMoves = directions.filter(dir => !this.checkCollision({x: head.x + dir.x, y: head.y + dir.y}, true, gameState));
             if (safeMoves.length > 0) {
                 // Возвращаем случайный безопасный ход вместо лучшего
                 return safeMoves[Math.floor(Math.random() * safeMoves.length)];
             }
        }
        
        // Если лучший ход ведет к гарантированной смерти, ищем любой безопасный ход.
        if (maxScore <= -10000) {
             const safeMoves = directions.filter(dir => !this.checkCollision({x: head.x + dir.x, y: head.y + dir.y}, true, gameState));
             return safeMoves.length > 0 ? safeMoves[0] : currentDirection;
        }

        return bestDir;
    }
}
