/* ======================================================== */
/* === LOGIC.JS: ОБЩАЯ ЛОГИКА ИГР И ИНСТРУМЕНТОВ (NON-UI) === */
/* ======================================================== */

// --- Global utility classes and instances ---

/** Генератор случайных чисел LCG (для СИДОВ) */
class RNG {
    /**
     * Инициализирует RNG с заданным сидом.
     * @param {number} seed 
     */
    constructor(seed) {
        // Устанавливаем сид, убеждаемся, что он не равен 0 и находится в диапазоне LCG
        this.seed = (seed === 0) ? 1 : Math.abs(seed) % 233280;
    }

    /**
     * Возвращает следующее псевдослучайное число (0.0 <= x < 1.0).
     */
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
}

// --- TIC TAC TOE LOGIC (Использует tttAI из ai.js) ---
// Предполагаем, что tttAI уже определен в ai.js
const tttAI = new TicTacToe_AI();


// --- SNAKE LOGIC ---
const TILE_SIZE = 15;
const COLS = 300 / TILE_SIZE;
const ROWS = 300 / TILE_SIZE;
// Предполагаем, что snakeAI уже определен в ai.js
const snakeAI = new Snake_AI(COLS, ROWS);

/**
 * Инициализирует состояние игры Змейка.
 * @param {number|string} seed - Начальный сид для RNG.
 * @param {number} difficulty - Начальная сложность AI.
 * @param {number} currentDeathCount - Количество смертей для расчета AI Level.
 */
function initSnakeGame(seed, difficulty, currentDeathCount) {
    const seedNum = parseInt(seed) || 12345;
    const rng = new RNG(seedNum);
    const foodSkinRNG = new RNG(seedNum); 

    return {
        snake: [{x: 5, y: 5}],
        food: {x: 10, y: 10},
        direction: {x: 1, y: 0},
        score: 0,
        running: false,
        intervalId: null,
        deathCount: currentDeathCount,
        aiDifficulty: difficulty,
        aiLevel: calculateNewAiLevel(currentDeathCount), 
        seed: seedNum,
        rng: rng, 
        foodSkinRNG: foodSkinRNG,
        COLS: COLS,
        ROWS: ROWS
    };
}

/** Создает новую позицию для еды, используя RNG, избегая тела змеи. */
function spawnFood(gameState) {
    let newFood;
    const rng = gameState.rng;

    do {
        newFood = {
            x: Math.floor(rng.next() * gameState.COLS),
            y: Math.floor(rng.next() * gameState.ROWS)
        };
    } while (gameState.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    gameState.food = newFood;
}

/** Определяет уровень AI для отображения (просто для визуального прогресса) */
function calculateNewAiLevel(currentDeaths) {
    if (currentDeaths < 20) return 0; 
    if (currentDeaths < 40) return 1; 
    if (currentDeaths < 60) return 2; 
    if (currentDeaths < 80) return 3; 
    if (currentDeaths < 100) return 4;
    return 5; 
}


// --- BYTEBEAT / AUDIO LOGIC ---

/** Глобальное состояние аудио */
let audioState = {
    audioCtx: null,
    analyser: null,
    source: null, 
    scriptNode: null,
    t: 0,
    running: false,
    visualizerRunning: false,
    animationFrameId: null,
    bufferLength: 0,
    dataArray: null,
};

/**
 * Останавливает и очищает все аудио процессы (Bytebeat или File Playback).
 */
function stopAudio() {
    // Останавливаем воспроизведение файла
    if (audioState.source) {
        audioState.source.stop(0);
        audioState.source.disconnect();
        audioState.source = null;
    }
    
    // Закрываем AudioContext и ScriptNode
    if (audioState.audioCtx) {
        if (audioState.scriptNode) {
            audioState.scriptNode.disconnect();
            audioState.scriptNode = null;
        }
        
        audioState.audioCtx.close().then(() => {
            audioState.audioCtx = null;
            audioState.running = false;
            audioState.analyser = null;
            
            // Отменяем анимацию визуализатора
            if (audioState.animationFrameId) {
                cancelAnimationFrame(audioState.animationFrameId);
                audioState.visualizerRunning = false;
            }
        });
    } else {
        // Если AudioContext не был инициализирован, но анимация запущена
        if (audioState.animationFrameId) {
            cancelAnimationFrame(audioState.animationFrameId);
            audioState.visualizerRunning = false;
        }
    }
}

/**
 * Генерирует новый Bytebeat код или делает ремикс.
 * @param {string} baseCode - Базовый код для ремикса.
 */
function generateBytebeat(baseCode = null) {
    const operators = ['&', '|', '^', '+', '*', '>>', '<<', '%'];
    const terms = ['t', 't*4', 't>>8', 't/2', '(t%256)', '16', '128'];

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    // Если передан базовый код или решаем сгенерировать сложную формулу
    if (baseCode && baseCode.length > 5 || Math.random() < 0.5) {
        // 70% шанс сделать ремикс, если есть базовый код
        if (baseCode && baseCode.length > 5 && Math.random() < 0.7) {
            const newOp = pick(operators);
            const newTerm = pick(terms);
            return `(${baseCode}) ${newOp} ${newTerm}`;
        }
        
        // Генерация более сложных структур
        return `(t${pick(operators)}(t>>${Math.floor(Math.random() * 10)}))${pick(operators)}(t%${Math.floor(Math.random() * 256)})`;
    }

    // Простая генерация
    return `(t${pick(operators)}t) ${pick(operators)} (${pick(terms)})`;
}
