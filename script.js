/* --- КОНСТАНТЫ И ЭЛЕМЕНТЫ --- */
const screen = document.getElementById('screen');
const homeScreen = document.getElementById('homeScreen');
const appWindow = document.getElementById('appWindow');
const appContent = document.getElementById('appContent');
const homeBar = document.getElementById('homeBar');
const homeBarArea = document.getElementById('homeBarArea');

// Templates
const tplSettings = document.getElementById('tpl-settings');
const tplGeneric = document.getElementById('tpl-generic');

// State
let activeAppIcon = null; // Элемент иконки, из которой открыли
let isAppOpen = false;
let cleanupTimer = null; // Таймер для display: none

/* --- ФУНКЦИИ ОТКРЫТИЯ / ЗАКРЫТИЯ --- */

// Навешиваем клики на все иконки
document.querySelectorAll('.app-item').forEach(item => {
    item.addEventListener('click', (e) => {
        // Защита от открытия, если мы уже тянем жест
        if(isDragging) return;
        openApp(item);
    });
});

function openApp(iconEl) {
    // 1. Отмена предыдущей очистки (для спама)
    if (cleanupTimer) clearTimeout(cleanupTimer);
    
    activeAppIcon = iconEl;
    const appId = iconEl.dataset.app;

    // 2. Генерация контента
    if (appId === 'settings') {
        appContent.innerHTML = tplSettings.innerHTML;
        homeBar.classList.add('dark');
        appWindow.style.background = '#f2f2f7';
    } else {
        appContent.innerHTML = tplGeneric.innerHTML;
        appContent.querySelector('h1').innerText = iconEl.querySelector('.app-name').innerText;
        homeBar.classList.remove('dark');
        appWindow.style.background = '#fff';
    }

    // 3. Вычисляем координаты иконки
    const iconRect = iconEl.querySelector('.app-icon').getBoundingClientRect();
    const screenRect = screen.getBoundingClientRect();

    const startTop = iconRect.top - screenRect.top;
    const startLeft = iconRect.left - screenRect.left;
    const startWidth = iconRect.width;
    const startHeight = iconRect.height;

    // 4. Если приложение было полностью закрыто (display:none), ставим его на иконку
    // Если мы "спамим" (оно еще закрывается), мы просто разворачиваем его с текущего места
    if (appWindow.style.display === 'none' || appWindow.style.display === '') {
        appWindow.style.display = 'block';
        appWindow.classList.remove('animatable'); // Отключаем плавность для телепортации
        
        appWindow.style.top = `${startTop}px`;
        appWindow.style.left = `${startLeft}px`;
        appWindow.style.width = `${startWidth}px`;
        appWindow.style.height = `${startHeight}px`;
        appWindow.style.borderRadius = '13px';
        
        // Force Reflow (браузер должен понять, где мы стоим)
        void appWindow.offsetWidth;
    }

    // 5. Задаем финальные координаты (Весь экран) и включаем анимацию
    appWindow.classList.add('animatable'); // Включаем transition
    
    appWindow.style.top = '0px';
    appWindow.style.left = '0px';
    appWindow.style.width = '100%';
    appWindow.style.height = '100%';
    appWindow.style.borderRadius = '38px';
    
    // Эффекты
    appWindow.classList.add('open'); // Показать контент
    homeScreen.style.transform = 'scale(0.85)';
    homeScreen.style.opacity = '0';
    
    isAppOpen = true;
}

function closeApp() {
    if (!activeAppIcon) return;
    
    // Отменяем таймер очистки, если он вдруг был
    if (cleanupTimer) clearTimeout(cleanupTimer);

    // 1. Координаты иконки (куда возвращаться)
    const iconRect = activeAppIcon.querySelector('.app-icon').getBoundingClientRect();
    const screenRect = screen.getBoundingClientRect();
    
    const targetTop = iconRect.top - screenRect.top;
    const targetLeft = iconRect.left - screenRect.left;

    // 2. Скрываем контент сразу
    appWindow.classList.remove('open');
    homeBar.classList.remove('dark');

    // 3. Летим обратно
    appWindow.classList.add('animatable');
    
    // Важно: Сбрасываем трансформации от жестов (если они были)
    appWindow.style.transform = 'translate(0, 0) scale(1)'; 
    
    appWindow.style.top = `${targetTop}px`;
    appWindow.style.left = `${targetLeft}px`;
    appWindow.style.width = `${iconRect.width}px`;
    appWindow.style.height = `${iconRect.height}px`;
    appWindow.style.borderRadius = '13px';

    // 4. Возвращаем рабочий стол
    homeScreen.style.transform = 'scale(1)';
    homeScreen.style.opacity = '1';

    isAppOpen = false;

    // 5. Реальное скрытие элемента после завершения анимации
    cleanupTimer = setTimeout(() => {
        if (!isAppOpen) { // Проверка, вдруг успели открыть снова
            appWindow.style.display = 'none';
        }
    }, 500); // Время совпадает с transition в CSS
}

/* --- ЖЕСТЫ (SWIPE UP TO HOME) --- */
let startY = 0;
let currentY = 0;
let isDragging = false;

// Поддержка и мыши, и тачскрина
homeBarArea.addEventListener('mousedown', startDrag);
homeBarArea.addEventListener('touchstart', startDrag, {passive: false});

document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag, {passive: false});

document.addEventListener('mouseup', endDrag);
document.addEventListener('touchend', endDrag);

function startDrag(e) {
    if (!isAppOpen) return;
    isDragging = true;
    startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    
    // Отключаем плавную анимацию CSS во время перетаскивания руками
    // чтобы окно следовало за пальцем без задержек
    appWindow.classList.remove('animatable');
    appWindow.style.transition = 'none'; 
}

function drag(e) {
    if (!isDragging || !isAppOpen) return;
    e.preventDefault(); // Чтобы не скроллить страницу

    currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    const deltaY = currentY - startY;

    // Мы разрешаем тянуть только вверх (отрицательный deltaY)
    if (deltaY < 0) {
        // Математика для масштабирования окна
        // Чем выше тянем, тем меньше становится окно
        const progress = Math.min(Math.abs(deltaY) / 300, 1); // 0 to 1
        const scale = 1 - (progress * 0.4); // Мин масштаб 0.6
        const radius = 38 + (progress * 20); // Скругление увеличивается
        
        appWindow.style.transform = `translateY(${deltaY}px) scale(${scale})`;
        appWindow.style.borderRadius = `${radius}px`;
    }
}

function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;

    // Возвращаем плавность CSS для завершения действия
    appWindow.classList.add('animatable');
    appWindow.style.transition = 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)';

    const deltaY = currentY - startY;

    // Порог срабатывания: если протащили больше 100px вверх -> закрываем
    if (deltaY < -100) {
        closeApp();
    } else {
        // Если мало протащили -> пружиним обратно (открываемся)
        appWindow.style.transform = 'translate(0, 0) scale(1)';
        appWindow.style.borderRadius = '38px';
    }
}text_label: "Test Text:", reg_run_btn: "Check", reg_no_match: "No matches found.", reg_match_count: "Found {count} matches", reg_error: "Pattern Error", reg_index_label: "Index",
            ide_title: "Mini-IDE (HTML/CSS/JS)", ide_run_btn: "Update Preview", ide_preview_title: "Preview:",
            json_title: "JSON Formatter/Validator", json_input_label: "JSON Input:", json_format_btn: "Format/Validate", json_output_label: "Output (Formatted):", json_valid: "Valid JSON. Formatted.", json_error: "JSON Error",
            base64_title: "Base64 Encode/Decode", base64_input_label: "Input (Text/Base64):", base64_encode_btn: "Encode →", base64_decode_btn: "← Decode", base64_output_label: "Output:", base64_error: "Encoding/Decoding error.", base64_error_format: "Invalid Base64 format.",
            cipher_title: "Encryptor/Decryptor", cipher_key_placeholder: "Key/Shift", cipher_encrypt_btn: "Encrypt",
            hash_title: "Hasher", hash_placeholder: "Enter text", hash_output_label: "Hash:",
            rand_title: "Random Value Generator", rand_number_btn: "Number", rand_color_btn: "Color",
            img_editor_title: "Image Editor", img_editor_tools: "Crop, Scale", img_converter_title: "Image Converter", img_converter_convert_btn: "Convert",
            aud_gen_title: "Audio Generation (Sine/Square)", aud_gen_play_btn: "Play Tone", vid_player_title: "Video Player",
            gol_title: "Conway's Game of Life", gol_start_btn: "Start", gol_reset_btn: "Reset", gol_random_btn: "Random",
            tetris_title: "Tetris", pong_title: "Pong", '2048_title': "Block Puzzle (2048)", sand_sim_title: "Particle Sandbox", perc_title: "Simple Neural Net Demo (Perceptron)", perc_note: "Training AND/OR logic", perc_train_btn: "Train",
            os_mockup_title: "Dynamic Animation Check (OS Mockup)", os_mockup_note: "Click an icon to open an app. Drag the window down from the center to close it.",
            browser_title: "Browser Mockup + Download Simulation", browser_welcome_title: "Welcome to the MultiBrowser!", browser_note: "This is a mockup. You can simulate file downloads.", browser_simulate_btn: "Simulate File Download", browser_downloads_title: "Downloads:",
            window_system_title: "Casual Window System", window_system_open_btn: "Open New Window",
            lab_title: "Labyrinth Generator", pal_title: "Color Palette Generator", pal_generate_btn: "Generate", frac_title: "Fractal Generator", frac_mandelbrot: "Mandelbrot",
            arch_title: "LZW/DEFLATE Archiver", arch_input_placeholder: "Enter text to compress", arch_compress_btn: "Compress →", text_anal_title: "Text Analyzer", text_anal_input_placeholder: "Enter text for analysis", text_anal_analyze_btn: "Analyze", text_anal_output_label: "Word frequency: ...", pat_gen_title: "Pattern Generator",
            conv_title: "Converter °C to °F", conv_celsius_label: "Celsius (°C):", conv_output_label: "Result in Fahrenheit",
            counter_title: "Word and Character Counter", counter_placeholder: "Enter text here...", counter_chars: "Characters:", counter_words: "Words:",
            ttt_mode_pvp: "Player vs Player", ttt_mode_pva: "Player vs AI", ttt_mode_ava: "AI vs AI", ttt_diff_hard: "Impossible", ttt_diff_medium: "Medium", ttt_diff_easy: "Easy", ttt_current_turn: "Current Turn:",
            snake_difficulty_label: "AI Difficulty (0-100):", snake_food_label: "Food Skin:", snake_seed_label: "Seed:", snake_start_btn: "Start AI", snake_score_label: "Score:", snake_deaths_label: "Deaths:", snake_ai_level_label: "AI Level:",
            bytebeat_style_label: "Visualization Style:", bytebeat_style_bars: "Bars", bytebeat_style_wave: "Waveform", bytebeat_style_dots: "Dots", bytebeat_style_mirror: "Mirror Bars", bytebeat_generator_title: "Bytebeat Generator", bytebeat_formula_label: "Bytebeat Formula", bytebeat_generate_btn: "Generate Code", bytebeat_remix_btn: "Remix Code", bytebeat_sample_rate_label: "Clarity (Hz):", bytebeat_rate_high: "44100 Hz (High)", bytebeat_rate_low: "8000 Hz (Low / Garbage Effect)", bytebeat_play_btn: "Play Bytebeat", bytebeat_audio_file_title: "Audio File Visualizer", bytebeat_audio_file_label: "Select MP3/WAV file:", bytebeat_audio_play_btn: "Play and Visualize", bytebeat_visualizer_note: "Visualizer:",
            alert_pw_empty: "Select at least one character type!", alert_timer_done: "Time is up!", alert_audio_decode_error: "Error decoding audio file.", alert_audio_file_select: "Please select an audio file.", alert_game_over: "Game Over! Score: {score}. Deaths: {deaths}. AI Level: {level}.",
        },
        uk: {
            title: "Мультитул | Версія 0.8 Альфа", header_title: "Мультитул | 0.8 Альфа 🚀",
            cpu_label: "CPU:", ram_label: "RAM:", toggle_theme_btn: "💡 Змінити тему",
            
            nav_password_gen: "Генератор Паролів", nav_qr_generator: "QR/Штрих-код", nav_uuid_gen: "UUID/Нікнейми", nav_random_gen: "Генератор Значень", nav_labyrinth: "Генератор Лабіринтів", nav_color_palette: "Генератор Палітр", nav_fractal_gen: "Генератор Фракталів", nav_pattern_gen: "Генератор Патернів",
            nav_mini_ide: "Міні-IDE", nav_json_formatter: "JSON Форматер", nav_regexp_tester: "RegExp Тестер", nav_base64_converter: "Base64", nav_code_encrypt: "Шифратор", nav_hasher: "Гешер", nav_archiver: "Архіватор", nav_text_analyzer: "Аналізатор Тексту",
            nav_image_editor: "Редактор Зображень", nav_image_converter: "Конвертер Зображень", nav_audio_generator: "Аудіо-Генерація", nav_video_player: "Відеоплеєр", nav_bytebeat: "Bytebeat/Візуал",
            nav_game_of_life: "Життя Конвея", nav_tetris: "Тетріс", nav_pong: "Понг", nav_2048: "2048", nav_sand_sim: "Пісочниця Частинок", nav_perceptron: "Перцептрон", nav_tictactoe: "Х/О", nav_snake: "Змійка (AI)",
            nav_browser: "Браузер", nav_os_mockup: "OS Анімації", nav_notepad: "Міні-Блокнот", nav_timer: "Таймер/Секундомір", nav_converter: "Конвертер С/F", nav_currency_converter: "Конвертер Валют", nav_counter: "Лічильник Слів", nav_calculator: "Калькулятор", nav_window_system: "Віконна Система",
            
            pwg_title: "Генератор Паролів", pwg_length_label: "Довжина:", pwg_upper: "Великі літери (A-Z)", pwg_lower: "Малі літери (a-z)", pwg_numbers: "Цифри (0-9)", pwg_symbols: "Символи (!@#$%^)", pwg_generate_btn: "Згенерувати", pwg_output_label: "Пароль:",
            qr_title: "QR-код/штрих-код генератор", qr_input_placeholder: "Введіть текст або URL",
            notepad_title: "Міні-Блокнот", notepad_placeholder: "Ваші нотатки зберігаються локально...",
            timer_title: "Таймер / Секундомір", timer_start_btn: "Старт", timer_stop_btn: "Стоп", timer_reset_btn: "Скидання", timer_set_label: "Встановити Таймер (секунди):",
            cur_title: "Конвертер Валют", cur_note: "Офлайн: USD/EUR/RUB (фіксовані курси).", cur_output_label: "Результат:",
            uuid_title: "Генератор UUID/Нікнеймів", uuid_nickname_btn: "Нікнейм",
            reg_title: "RegExp Тестер", reg_pattern_label: "Патерн (/.../):", reg_text_label: "Тестовий текст:", reg_run_btn: "Перевірити", reg_no_match: "Співпадінь не знайдено.", reg_match_count: "Знайдено {count} співпадінь", reg_error: "Помилка патерну", reg_index_label: "Індекс",
            ide_title: "Міні-IDE (HTML/CSS/JS)", ide_run_btn: "Оновити Попередній перегляд", ide_preview_title: "Попередній перегляд:",
            json_title: "JSON Форматер/Валідатор", json_input_label: "JSON Введення:", json_format_btn: "Форматувати/Валідувати", json_output_label: "Вивід (Formatted):", json_valid: "Валідний JSON. Форматовано.", json_error: "Помилка JSON",
            base64_title: "Base64 Encode/Decode", base64_input_label: "Введення (Текст/Base64):", base64_encode_btn: "Encode →", base64_decode_btn: "← Decode", base64_output_label: "Вивід:", base64_error: "Помилка кодування/декодування.", base64_error_format: "Невірний формат Base64.",
            cipher_title: "Шифратор/Дешифратор", cipher_key_placeholder: "Ключ/Зсув", cipher_encrypt_btn: "Зашифрувати",
            hash_title: "Гешер", hash_placeholder: "Введіть текст", hash_output_label: "Геш:",
            rand_title: "Генератор випадкових значень", rand_number_btn: "Число", rand_color_btn: "Колір",
            img_editor_title: "Редактор зображень", img_editor_tools: "Обрізання, Масштаб", img_converter_title: "Конвертер зображень", img_converter_convert_btn: "Конвертувати",
            aud_gen_title: "Аудіо Генерація (Sine/Square)", aud_gen_play_btn: "Play Tone", vid_player_title: "Відеоплеєр",
            gol_title: "Гра Життя Конвея", gol_start_btn: "Старт", gol_reset_btn: "Скидання", gol_random_btn: "Рандом",
            tetris_title: "Тетріс", pong_title: "Понг", '2048_title': "Блоковий пазл (2048)", sand_sim_title: "Пісочниця частинок", perc_title: "Простий Перцептрон", perc_note: "Навчання логіці AND/OR", perc_train_btn: "Навчити",
            os_mockup_title: "Перевірка Анімацій OS", os_mockup_note: "Натисніть на іконку, щоб відкрити програму. Потягніть вікно вниз, щоб закрити його жестом.",
            browser_title: "Браузер-Заглушка + Симуляція Завантажень", browser_welcome_title: "Ласкаво просимо до МультиБраузера!", browser_note: "Це заглушка. Ви можете симулювати завантаження файлів.", browser_simulate_btn: "Симулювати Завантаження Файлу", browser_downloads_title: "Завантаження:",
            window_system_title: "Казуальна Віконна Система", window_system_open_btn: "Відкрити нове вікно",
            lab_title: "Генератор Лабіринтів", pal_title: "Генератор Палітр Кольорів", pal_generate_btn: "Генерувати", frac_title: "Генератор Фракталів", frac_mandelbrot: "Мандельброт",
            arch_title: "Архіватор LZW/DEFLATE", arch_input_placeholder: "Введіть текст для стиснення", arch_compress_btn: "Стиснути →", text_anal_title: "Аналізатор Тексту", text_anal_input_placeholder: "Введіть текст для аналізу", text_anal_analyze_btn: "Аналізувати", text_anal_output_label: "Частотність слів: ...", pat_gen_title: "Генератор Патернів",
            conv_title: "Конвертер °C в °F", conv_celsius_label: "Цельсій (°C):", conv_output_label: "Результат у Фаренгейтах",
            counter_title: "Лічильник Слів і Символів", counter_placeholder: "Введіть текст тут...", counter_chars: "Символів:", counter_words: "Слів:",
            ttt_mode_pvp: "Гравець vs Гравець", ttt_mode_pva: "Гравець vs AI", ttt_mode_ava: "AI vs AI", ttt_diff_hard: "Неможлива", ttt_diff_medium: "Середня", ttt_diff_easy: "Легка", ttt_current_turn: "Поточний хід:",
            snake_difficulty_label: "Складність AI (0-100):", snake_food_label: "Скін їжі:", snake_seed_label: "Сід:", snake_start_btn: "Старт AI", snake_score_label: "Рахунок:", snake_deaths_label: "Смертей:", snake_ai_level_label: "Рівень AI:",
            bytebeat_style_label: "Стиль візуалізації:", bytebeat_style_bars: "Стовпці (Bars)", bytebeat_style_wave: "Хвиля (Waveform)", bytebeat_style_dots: "Крапки (Dots)", bytebeat_style_mirror: "Дзеркальні Стовпці", bytebeat_generator_title: "Генератор Bytebeat", bytebeat_formula_label: "Формула Bytebeat", bytebeat_generate_btn: "Згенерувати Код", bytebeat_remix_btn: "Ремікс Коду", bytebeat_sample_rate_label: "Чіткість (Hz):", bytebeat_rate_high: "44100 Hz (Висока)", bytebeat_rate_low: "8000 Hz (Низька / Ефект Сміття)", bytebeat_play_btn: "Грати Bytebeat", bytebeat_audio_file_title: "Візуалізатор Аудіо Файлу", bytebeat_audio_file_label: "Оберіть MP3/WAV файл:", bytebeat_audio_play_btn: "Грати та Візуалізувати", bytebeat_visualizer_note: "Візуалізатор:",
            alert_pw_empty: "Оберіть хоча б один тип символів!", alert_timer_done: "Час вийшов!", alert_audio_decode_error: "Помилка декодування аудіофайлу.", alert_audio_file_select: "Будь ласка, оберіть аудіофайл.", alert_game_over: "Гра закінчена! Рахунок: {score}. Смертей: {deaths}. Рівень AI: {level}.",
        },
        lt: {
            title: "Daugiafunkcis įrankis | Versija 0.8 Alpha", header_title: "Daugiafunkcis įrankis | 0.8 Alpha 🚀",
            cpu_label: "CPU:", ram_label: "RAM:", toggle_theme_btn: "💡 Pakeisti temą",
            
            nav_password_gen: "Slaptažodžių generatorius", nav_qr_generator: "QR/Brūkšninis kodas", nav_uuid_gen: "UUID/Slapyvardžiai", nav_random_gen: "Reikšmių generatorius", nav_labyrinth: "Labirintų generatorius", nav_color_palette: "Palečių generatorius", nav_fractal_gen: "Fraktalų generatorius", nav_pattern_gen: "Šablonų generatorius",
            nav_mini_ide: "Mini-IDE", nav_json_formatter: "JSON Formatas", nav_regexp_tester: "RegExp Testeris", nav_base64_converter: "Base64", nav_code_encrypt: "Šifratorius", nav_hasher: "Maišos funkcija", nav_archiver: "Archyvatorius", nav_text_analyzer: "Teksto analizatorius",
            nav_image_editor: "Paveikslėlių redaktorius", nav_image_converter: "Paveikslėlių konverteris", nav_audio_generator: "Garso generavimas", nav_video_player: "Vaizdo grotuvas", nav_bytebeat: "Bytebeat/Vizualiz.",
            nav_game_of_life: "Gyvenimo žaidimas", nav_tetris: "Tetris", nav_pong: "Pong", nav_2048: "2048", nav_sand_sim: "Dalelių smėlio dėžė", nav_perceptron: "Perceptrionas", nav_tictactoe: "Kryžiukai/Nuliukai", nav_snake: "Gyvatė (AI)",
            nav_browser: "Naršyklė", nav_os_mockup: "OS Animacijos", nav_notepad: "Mini-Užrašinė", nav_timer: "Laikmatis/Chronometras", nav_converter: "Konverteris C/F", nav_currency_converter: "Valiutų konverteris", nav_counter: "Žodžių skaitiklis", nav_calculator: "Skaičiuoklė", nav_window_system: "Langų Sistema",
            
            pwg_title: "Slaptažodžių generatorius", pwg_length_label: "Ilgis:", pwg_upper: "Didžiosios (A-Z)", pwg_lower: "Mažosios (a-z)", pwg_numbers: "Skaičiai (0-9)", pwg_symbols: "Simboliai (!@#$%^)", pwg_generate_btn: "Generuoti", pwg_output_label: "Slaptažodis:",
            qr_title: "QR/Brūkšninio kodo generatorius", qr_input_placeholder: "Įveskite tekstą ar URL",
            notepad_title: "Mini-Užrašinė", notepad_placeholder: "Jūsų užrašai išsaugomi lokaliai...",
            timer_title: "Laikmatis / Chronometras", timer_start_btn: "Pradėti", timer_stop_btn: "Stabdyti", timer_reset_btn: "Iš naujo", timer_set_label: "Nustatyti laikmatį (sekundės):",
            cur_title: "Valiutų konverteris", cur_note: "Neprisijungus: USD/EUR/RUB (fiksuoti kursai).", cur_output_label: "Rezultatas:",
            uuid_title: "UUID/Slapyvardžių generatorius", uuid_nickname_btn: "Slapyvardis",
            reg_title: "RegExp Testeris", reg_pattern_label: "Šablonas (/.../):", reg_text_label: "Bandomasis tekstas:", reg_run_btn: "Patikrinti", reg_no_match: "Atitikmenų nerasta.", reg_match_count: "Rasta {count} atitikmenų", reg_error: "Šablono klaida", reg_index_label: "Indeksas",
            ide_title: "Mini-IDE (HTML/CSS/JS)", ide_run_btn: "Atnaujinti peržiūrą", ide_preview_title: "Peržiūra:",
            json_title: "JSON Formatas/Validatorius", json_input_label: "JSON įvestis:", json_format_btn: "Formatuoti/Patvirtinti", json_output_label: "Išvestis (Formatted):", json_valid: "Galiojantis JSON. Suformatuota.", json_error: "JSON klaida",
            base64_title: "Base64 Koduoti/Dekoduoti", base64_input_label: "Įvestis (Tekstas/Base64):", base64_encode_btn: "Koduoti →", base64_decode_btn: "← Dekoduoti", base64_output_label: "Išvestis:", base64_error: "Kodavimo/dekodavimo klaida.", base64_error_format: "Netinkamas Base64 formatas.",
            cipher_title: "Šifratorius/Dekoderis", cipher_key_placeholder: "Raktas/Poslinkis", cipher_encrypt_btn: "Šifruoti",
            hash_title: "Maišos funkcija", hash_placeholder: "Įveskite tekstą", hash_output_label: "Maišos kodas:",
            rand_title: "Atsitiktinių reikšmių generatorius", rand_number_btn: "Skaičius", rand_color_btn: "Spalva",
            img_editor_title: "Paveikslėlių redaktorius", img_editor_tools: "Apkarpymas, Mastelis", img_converter_title: "Paveikslėlių konverteris", img_converter_convert_btn: "Konvertuoti",
            aud_gen_title: "Garso generavimas (Sinusinė/Kvadratinė)", aud_gen_play_btn: "Groti toną", vid_player_title: "Vaizdo grotuvas",
            gol_title: "Gyvenimo žaidimas", gol_start_btn: "Pradėti", gol_reset_btn: "Iš naujo", gol_random_btn: "Atsitiktinis",
            tetris_title: "Tetris", pong_title: "Pong", '2048_title': "Blokų dėlionė (2048)", sand_sim_title: "Dalelių smėlio dėžė", perc_title: "Paprastas Perceptrionas", perc_note: "Mokymasis AND/OR logikos", perc_train_btn: "Mokyti",
            os_mockup_title: "Dinaminis Animacijos Testavimas (OS Mockup)", os_mockup_note: "Spustelėkite piktogramą, kad atidarytumėte programą. Nuvilkite langą žemyn, kad jį uždarytumėte.",
            browser_title: "Naršyklės maketas + Atsisiuntimo simuliacija", browser_welcome_title: "Sveiki atvykę į MultiNaršyklę!", browser_note: "Tai yra maketas. Galite imituoti failų atsisiuntimą.", browser_simulate_btn: "Imituoti failo atsisiuntimą", browser_downloads_title: "Atsisiuntimai:",
            window_system_title: "Atsitiktinė Langų Sistema", window_system_open_btn: "Atidaryti naują langą",
            lab_title: "Labirintų generatorius", pal_title: "Spalvų paletės generatorius", pal_generate_btn: "Generuoti", frac_title: "Fraktalų generatorius", frac_mandelbrot: "Mandelbrot",
            arch_title: "LZW/DEFLATE Archyvatorius", arch_input_placeholder: "Įveskite tekstą suspaudimui", arch_compress_btn: "Suspausti →", text_anal_title: "Teksto analizatorius", text_anal_input_placeholder: "Įveskite tekstą analizei", text_anal_analyze_btn: "Analizuoti", text_anal_output_label: "Žodžių dažnumas: ...", pat_gen_title: "Šablonų generatorius",
            conv_title: "Konverteris °C į °F", conv_celsius_label: "Celsijaus (°C):", conv_output_label: "Rezultatas Farenheitu",
            counter_title: "Žodžių ir Simbolių skaitiklis", counter_placeholder: "Įveskite tekstą čia...", counter_chars: "Simbolių:", counter_words: "Žodžių:",
            ttt_mode_pvp: "Žaidėjas prieš Žaidėją", ttt_mode_pva: "Žaidėjas prieš AI", ttt_mode_ava: "AI prieš AI", ttt_diff_hard: "Neįmanoma", ttt_diff_medium: "Vidutinė", ttt_diff_easy: "Lengva", ttt_current_turn: "Dabartinis ėjimas:",
            snake_difficulty_label: "AI Sunkumas (0-100):", snake_food_label: "Maisto oda:", snake_seed_label: "Sėkla:", snake_start_btn: "Paleisti AI", snake_score_label: "Taškai:", snake_deaths_label: "Mirtys:", snake_ai_level_label: "AI Lygis:",
            bytebeat_style_label: "Vizualizacijos stilius:", bytebeat_style_bars: "Stulpeliai (Bars)", bytebeat_style_wave: "Bangos forma (Waveform)", bytebeat_style_dots: "Taškai (Dots)", bytebeat_style_mirror: "Veidrodiniai stulpeliai", bytebeat_generator_title: "Bytebeat Generatorius", bytebeat_formula_label: "Bytebeat Formulė", bytebeat_generate_btn: "Generuoti kodą", bytebeat_remix_btn: "Remiksuoti kodą", bytebeat_sample_rate_label: "Aiškumas (Hz):", bytebeat_rate_high: "44100 Hz (Aukštas)", bytebeat_rate_low: "8000 Hz (Žemas / Šiukšlių Efektas)", bytebeat_play_btn: "Groti Bytebeat", bytebeat_audio_file_title: "Garso failo vizualizatorius", bytebeat_audio_file_label: "Pasirinkite MP3/WAV failą:", bytebeat_audio_play_btn: "Groti ir vizualizuoti", bytebeat_visualizer_note: "Vizualizatorius:",
            alert_pw_empty: "Pasirinkite bent vieną simbolių tipą!", alert_timer_done: "Laikas baigėsi!", alert_audio_decode_error: "Klaida dekoduojant garso failą.", alert_audio_file_select: "Pasirinkite garso failą.", alert_game_over: "Žaidimas baigtas! Taškai: {score}. Mirtys: {deaths}. AI Lygis: {level}.",
        }
    };

    // --- UI ЭЛЕМЕНТЫ ---
    const navButtons = document.querySelectorAll('.nav-button');
    const toolSections = document.querySelectorAll('.tool-section');
    const toggleThemeButton = document.getElementById('toggle-theme');
    const languageSwitcher = document.getElementById('language-switcher');
    
    // --- STATUS PANEL ELEMENTS ---
    const cpuLoadOutput = document.getElementById('cpu-load');
    const ramUsedOutput = document.getElementById('ram-used');

    // --- NEW MODULE ELEMENTS ---
    const passwordOutput = document.getElementById('password-output');
    const generatePasswordButton = document.getElementById('generate-password');
    const regexpPatternInput = document.getElementById('regexp-pattern');
    const regexpTextInput = document.getElementById('regexp-text');
    const regexpResultsDiv = document.getElementById('regexp-results');
    const runRegExpButton = document.getElementById('run-regexp');
    const jsonInput = document.getElementById('json-input');
    const jsonOutput = document.getElementById('json-output');
    const jsonStatus = document.getElementById('json-status');
    const formatJsonButton = document.getElementById('format-json');
    const base64Input = document.getElementById('base64-input');
    const base64Output = document.getElementById('base64-output');
    const encodeBase64Button = document.getElementById('encode-base64');
    const decodeBase64Button = document.getElementById('decode-base64');
    const ideEditor = document.getElementById('ide-editor');
    const idePreview = document.getElementById('ide-preview');
    const ideLangButtons = document.querySelectorAll('#mini-ide .ide-controls button');
    let currentIdeLang = 'html';
    
    // --- TIMER ELEMENTS ---
    const timerDisplay = document.getElementById('timer-display');
    const timerStartButton = document.getElementById('timer-start');
    const timerStopButton = document.getElementById('timer-stop');
    const timerResetButton = document.getElementById('timer-reset');
    const timerSetInput = document.getElementById('timer-set');
    let timerInterval = null;
    let timerStartTime = 0;
    let timerRunning = false;
    let timerTotalTime = 0;
    
    // --- GAME OF LIFE ELEMENTS ---
    const golCanvas = document.getElementById('gol-canvas');
    const golCtx = golCanvas ? golCanvas.getContext('2d') : null;
    let golSize = 30;
    let golGrid = [];
    
    // --- BROWSER ELEMENTS ---
    const simulateDownloadBtn = document.getElementById('simulate-download-btn');
    const showDownloadsBtn = document.getElementById('show-downloads');
    const webView = document.getElementById('web-view');
    const downloadsView = document.getElementById('downloads-view');
    const downloadsList = document.getElementById('downloads-list');

    // --- GENERAL ---
    const snakeCanvas = document.getElementById('snake-canvas');
    const snakeCtx = snakeCanvas ? snakeCanvas.getContext('2d') : null;
    const TILE_SIZE = 15;
    const SPECIAL_BYTEBEAT_CODE = '(t*((t&4096?t%65536<59392?7:t&7:16)^(1&t>>14))>>(3&-t>>(t&2048?2:10))) & 255';
    let currentSnakeGame = initSnakeGame(12345, 40, 0);


    // ===================================
    // === 0. СИСТЕМА, ТЕМИЗАЦИЯ И I18N ===
    // ===================================

    // Логика I18N
    const setLanguage = (lang) => {
        const dictionary = i18n[lang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dictionary[key]) {
                el.textContent = dictionary[key];
            }
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dictionary[key]) {
                el.placeholder = dictionary[key];
            }
        });
        
        // Отдельно для select (TTT)
        const tttOptions = {
            pvp: dictionary.ttt_mode_pvp, pva: dictionary.ttt_mode_pva, ava: dictionary.ttt_mode_ava,
            80: dictionary.ttt_diff_medium, 20: dictionary.ttt_diff_easy, 100: dictionary.ttt_diff_hard
        };
        document.querySelectorAll('#tictactoe-mode option, #ttt-difficulty-preset option').forEach(opt => {
            const value = opt.value;
            if (tttOptions[value]) {
                opt.textContent = tttOptions[value];
            }
        });
        
        // Отдельно для select (Bytebeat rates)
        document.querySelector('#sample-rate-select option[value="44100"]').textContent = dictionary.bytebeat_rate_high;
        document.querySelector('#sample-rate-select option[value="8000"]').textContent = dictionary.bytebeat_rate_low;

        localStorage.setItem('multitool_lang', lang);
    };

    languageSwitcher.addEventListener('change', (e) => setLanguage(e.target.value));

    // Симуляция CPU/RAM
    const updateStatusPanel = () => {
        const cpu = Math.floor(Math.random() * 50 + 20);
        const ram = Math.floor(Math.random() * 500 + 300);
        cpuLoadOutput.textContent = `${cpu}%`;
        ramUsedOutput.textContent = `${ram} MB`;
    };
    setInterval(updateStatusPanel, 2000);
    updateStatusPanel();

    // Темизация
    toggleThemeButton.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('multitool_theme', newTheme);
        // Перерисовка canvas для соответствия теме
        if (golCanvas) initGameOfLife();
        if (snakeCanvas) drawSnake(snakeCtx, currentSnakeGame);
    });
    
    // Загрузка сохраненной темы/языка при старте
    const savedLang = localStorage.getItem('multitool_lang') || 'ru';
    languageSwitcher.value = savedLang;
    setLanguage(savedLang);
    document.body.setAttribute('data-theme', localStorage.getItem('multitool_theme') || 'dark');


    // ===================================
    // === 1. ОБЩАЯ НАВИГАЦИЯ ===
    // ===================================
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const toolName = button.getAttribute('data-tool');

            if (currentSnakeGame.running) { clearInterval(currentSnakeGame.intervalId); currentSnakeGame.running = false; document.getElementById('snake-start').textContent = i18n[languageSwitcher.value].snake_start_btn; }
            if (audioState.audioCtx) { stopAudio(); }
            if (toolName !== 'timer' && timerRunning) { stopTimer(); }

            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            toolSections.forEach(section => {
                section.id === toolName ? section.classList.remove('hidden') : section.classList.add('hidden');
            });
            
            // Инициализация новых/сложных модулей
            if (toolName === 'tictactoe') { initTicTacToe(); }
            if (toolName === 'bytebeat') { initVisualizer(); drawVisualizer(); }
            if (toolName === 'game-of-life') { initGameOfLife(); }
            if (toolName === 'notepad') { loadNotepad(); }

        });
    });

    // ===================================
    // === 2. ГЕНЕРАТОР ПАРОЛЕЙ (НОВЫЙ) ===
    // ===================================
    const characters = {
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lower: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789', symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-'
    };

    generatePasswordButton.addEventListener('click', () => {
        const length = parseInt(document.getElementById('password-length').value);
        let validChars = '';
        if (document.getElementById('pass-upper').checked) validChars += characters.upper;
        if (document.getElementById('pass-lower').checked) validChars += characters.lower;
        if (document.getElementById('pass-numbers').checked) validChars += characters.numbers;
        if (document.getElementById('pass-symbols').checked) validChars += characters.symbols;

        let password = '';
        if (validChars.length === 0) {
            passwordOutput.value = i18n[languageSwitcher.value].alert_pw_empty;
            return;
        }

        for (let i = 0; i < length; i++) {
            password += validChars.charAt(Math.floor(Math.random() * validChars.length));
        }
        passwordOutput.value = password;
    });

    // ===================================
    // === 3. РЕГУЛЯРНЫЕ ВЫРАЖЕНИЯ (НОВЫЙ) ===
    // ===================================

    runRegExpButton.addEventListener('click', () => {
        const patternStr = regexpPatternInput.value;
        const text = regexpTextInput.value;
        let output = '';
        const lang = languageSwitcher.value;

        try {
            const matchStart = patternStr.indexOf('/');
            const matchEnd = patternStr.lastIndexOf('/');
            
            if (matchStart !== 0 || matchEnd <= matchStart) {
                throw new Error("Неверный формат паттерна. Используйте /паттерн/флаги.");
            }

            const pattern = patternStr.substring(matchStart + 1, matchEnd);
            const flags = patternStr.substring(matchEnd + 1);
            
            const regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'); // Добавляем 'g' для matchAll
            const matches = [...text.matchAll(regex)];

            if (matches.length === 0) {
                output = `<p class="note" style="color: #e74c3c;">${i18n[lang].reg_no_match}</p>`;
            } else {
                output = `<p class="note" style="color: #2ecc71;">${i18n[lang].reg_match_count.replace('{count}', matches.length)}:</p><ul>`;
                matches.forEach(m => {
                    output += `<li>"${m[0]}" (${i18n[lang].reg_index_label}: ${m.index})</li>`;
                });
                output += '</ul>';
            }
        } catch (e) {
            output = `<p class="note" style="color: #e74c3c;">${i18n[lang].reg_error}: ${e.message}</p>`;
        }

        regexpResultsDiv.innerHTML = output;
    });


    // ===================================
    // === 4. JSON FORMATTER (НОВЫЙ) ===
    // ===================================

    formatJsonButton.addEventListener('click', () => {
        const lang = languageSwitcher.value;
        try {
            const parsed = JSON.parse(jsonInput.value);
            const formatted = JSON.stringify(parsed, null, 2);
            jsonOutput.value = formatted;
            jsonStatus.innerHTML = `<span style="color: #2ecc71;">✅ ${i18n[lang].json_valid}</span>`;
        } catch (e) {
            jsonOutput.value = '';
            jsonStatus.innerHTML = `<span style="color: #e74c3c;">❌ ${i18n[lang].json_error}: ${e.message}</span>`;
        }
    });

    // ===================================
    // === 5. BASE64 CONVERTER (НОВЫЙ) ===
    // ===================================
    
    encodeBase64Button.addEventListener('click', () => {
        try {
            const encoded = btoa(base64Input.value);
            base64Output.value = encoded;
        } catch (e) {
            base64Output.value = i18n[languageSwitcher.value].base64_error;
        }
    });

    decodeBase64Button.addEventListener('click', () => {
        try {
            const decoded = atob(base64Input.value);
            base64Output.value = decoded;
        } catch (e) {
            base64Output.value = i18n[languageSwitcher.value].base64_error_format;
        }
    });


    // ===================================
    // === 6. МИНИ-IDE (каркас) ===
    // ===================================
    
    const ideCode = { html: '\n<h1>Hello IDE</h1>', css: '/* Your CSS here */\nh1 { color: red; }', js: '// Your JS here\nconsole.log("Run");' };

    const updateIdePreview = () => {
        const html = ideCode.html;
        const css = `<style>${ideCode.css}</style>`;
        const js = `<script>${ideCode.js}<\/script>`;
        const content = `<!DOCTYPE html><html><head>${css}</head><body>${html}${js}</body></html>`;
        idePreview.srcdoc = content;
    };

    ideLangButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            ideLangButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            ideCode[currentIdeLang] = ideEditor.value;
            currentIdeLang = btn.getAttribute('data-lang');
            ideEditor.value = ideCode[currentIdeLang];
        });
    });

    document.getElementById('run-ide').addEventListener('click', () => {
        ideCode[currentIdeLang] = ideEditor.value;
        updateIdePreview();
    });
    
    // Инициализация
    if (ideEditor) {
        ideEditor.value = ideCode.html;
        updateIdePreview();
    }


    // ===================================
    // === 7. ТАЙМЕР / СЕКУНДОМЕР (НОВЫЙ) ===
    // ===================================

    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        
        const pad = (num) => num.toString().padStart(2, '0');
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };

    const updateTimer = () => {
        const elapsed = (Date.now() - timerStartTime) / 1000;
        
        if (timerTotalTime === 0) { // Режим секундомера
            timerDisplay.textContent = formatTime(elapsed);
        } 
        else { // Режим таймера
            const remaining = timerTotalTime - elapsed;
            if (remaining <= 0) {
                timerDisplay.textContent = '00:00:00';
                stopTimer();
                alert(i18n[languageSwitcher.value].alert_timer_done);
                return;
            }
            timerDisplay.textContent = formatTime(remaining);
        }
    };

    const startTimer = () => {
        if (timerRunning) return;
        
        timerTotalTime = parseInt(timerSetInput.value) || 0;
        
        let [h, m, s] = timerDisplay.textContent.split(':').map(Number);
        
        if (timerTotalTime > 0) {
             const timeSpent = timerTotalTime - (h * 3600 + m * 60 + s);
             timerStartTime = Date.now() - (timeSpent * 1000);
        } else {
             const timeElapsed = h * 3600 + m * 60 + s;
             timerStartTime = Date.now() - (timeElapsed * 1000);
        }
        
        timerRunning = true;
        timerInterval = setInterval(updateTimer, 1000);
        timerStartButton.textContent = i18n[languageSwitcher.value].timer_stop_btn; // Временно меняем текст на стоп, так как он заменяется на "Старт" в stopTimer
    };

    const stopTimer = () => {
        if (!timerRunning) return;
        clearInterval(timerInterval);
        timerRunning = false;
        timerStartButton.textContent = i18n[languageSwitcher.value].timer_start_btn;
    };

    const resetTimer = () => {
        stopTimer();
        timerTotalTime = parseInt(timerSetInput.value) || 0;
        timerDisplay.textContent = formatTime(timerTotalTime || 0);
        timerStartButton.textContent = i18n[languageSwitcher.value].timer_start_btn;
    };
    
    if (timerStartButton) {
        timerStartButton.addEventListener('click', startTimer);
        timerStopButton.addEventListener('click', stopTimer);
        timerResetButton.addEventListener('click', resetTimer);
        timerSetInput.addEventListener('change', resetTimer);
        resetTimer();
    }


    // ===================================
    // === 8. ЖИЗНЬ КОНВЕЯ (каркас) ===
    // ===================================
    
    const initGameOfLife = () => {
        if (!golCanvas) return;
        golGrid = Array.from({ length: golSize }, () => Array(golSize).fill(0));
        
        const themeColor = document.body.getAttribute('data-theme') === 'dark' ? '#405467' : '#f0f0f0';
        golCtx.fillStyle = themeColor;
        golCtx.fillRect(0, 0, 300, 300);
        // ... (рисование сетки) ...
    };

    document.getElementById('gol-start')?.addEventListener('click', () => { /* Logic */ });
    document.getElementById('gol-reset')?.addEventListener('click', initGameOfLife);
    document.getElementById('gol-random')?.addEventListener('click', () => { /* Logic */ });
    if (golCanvas) initGameOfLife();

    // ===================================
    // === 9. Мини-Блокнот (локальное сохранение) ===
    // ===================================
    const notepadArea = document.getElementById('notepad-area');
    
    const loadNotepad = () => {
        if (notepadArea) {
            notepadArea.value = localStorage.getItem('multitool_notes') || '';
        }
    };
    
    if (notepadArea) {
        notepadArea.addEventListener('input', () => {
            localStorage.setItem('multitool_notes', notepadArea.value);
        });
    }

    // ===================================
    // === 10. Bytebeat/Audio Logic (для полноты) ===
    // ===================================
    
    const visualizerCanvas = document.getElementById('bytebeat-visualizer');
    const visualizerCtx = visualizerCanvas ? visualizerCanvas.getContext('2d') : null;
    const sampleRateSelect = document.getElementById('sample-rate-select');
    const bytebeatInput = document.getElementById('bytebeat-code');
    const visualizerStyleSelect = document.getElementById('visualizer-style');

    const initVisualizer = () => {
        if (!visualizerCanvas || audioState.analyser) return;

        const sr = parseInt(sampleRateSelect.value) || 44100;
        if (!audioState.audioCtx) {
            audioState.audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: sr });
        }
        
        audioState.analyser = audioState.audioCtx.createAnalyser();
        audioState.analyser.fftSize = 256;
        audioState.bufferLength = audioState.analyser.frequencyBinCount;
        audioState.dataArray = new Uint8Array(audioState.bufferLength);
    };

    const drawVisualizer = () => {
        if (!visualizerCanvas || !visualizerCtx) return;
        
        audioState.visualizerRunning = true;
        audioState.animationFrameId = requestAnimationFrame(drawVisualizer);
        
        const ctx = visualizerCtx;
        const WIDTH = visualizerCanvas.width;
        const HEIGHT = visualizerCanvas.height;
        const style = visualizerStyleSelect.value;
        const dataArray = audioState.dataArray;
        const bufferLength = audioState.bufferLength;
        const currentCode = bytebeatInput.value.trim();
        
        // --- CUSTOM VISUALIZATION CHECK ---
        if (currentCode === SPECIAL_BYTEBEAT_CODE) {
            // (Custom visualization logic)
            return;
        }
        
        // Получение данных
        if (audioState.running && audioState.analyser) {
            audioState.analyser.getByteFrequencyData(dataArray);
        } else if (dataArray) {
             for (let i = 0; i < dataArray.length; i++) { dataArray[i] = Math.max(0, dataArray[i] - 5); }
        }

        ctx.fillStyle = document.body.getAttribute('data-theme') === 'dark' ? '#2c3e50' : '#405467';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        
        // (Visualization drawing logic based on style)
    };

    const startBytebeat = () => {
        // (Bytebeat start logic)
    };
    
    // Привязки Bytebeat (если элементы существуют)
    if (document.getElementById('bytebeat-play')) {
        document.getElementById('bytebeat-play').addEventListener('click', startBytebeat);
        document.getElementById('bytebeat-stop').addEventListener('click', stopAudio);
        document.getElementById('bytebeat-generate').addEventListener('click', () => { bytebeatInput.value = generateBytebeat(); });
        document.getElementById('bytebeat-remix').addEventListener('click', () => { bytebeatInput.value = generateBytebeat(bytebeatInput.value); });
        
        if (visualizerCanvas) drawVisualizer();
    }
    
    // ===================================
    // === 11. Snake Logic (для полноты) ===
    // ===================================
    
    const drawSnake = (ctx, gameState) => {
        // (Drawing logic)
    };
    
    const updateGame = () => {
        // (Game update logic)
    };

    const startGame = () => {
        // (Game start logic)
    };

    if (document.getElementById('snake-start')) {
        document.getElementById('snake-start').addEventListener('click', startGame);
        // (Other snake event listeners)
    }
    if (snakeCanvas) drawSnake(snakeCtx, currentSnakeGame);

    // ===================================
    // === 12. OS Mockup Animations (для полноты) ===
    // ===================================

    const appWindowContainer = document.getElementById('app-window-container');
    const appIcons = document.querySelectorAll('.app-icon');
    let activeApp = null;
    let isDragging = false;
    let startDragY = 0;
    
    const createMockupApp = (appId) => {
        const window = document.createElement('div');
        window.classList.add('app-window');
        window.id = `window-${appId}`;
        const header = document.createElement('div');
        header.classList.add('app-window-header');
        header.textContent = `App ${appId}`;
        window.appendChild(header);
        return window;
    };

    const openApp = (icon) => {
        if (activeApp) return;

        const appId = icon.getAttribute('data-app');
        const newApp = createMockupApp(appId);
        appWindowContainer.appendChild(newApp);
        activeApp = newApp;
        
        // Animation logic here (same as previous version)
        const iconRect = icon.getBoundingClientRect();
        const containerRect = appWindowContainer.getBoundingClientRect();
        const scaleX = iconRect.width / containerRect.width;
        const scaleY = iconRect.height / containerRect.height;
        const translateX = icon.offsetLeft;
        const translateY = icon.offsetTop;
        activeApp.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
        activeApp.style.opacity = '0';
        activeApp.classList.add('opening');

        requestAnimationFrame(() => {
            activeApp.style.transition = 'transform 0.3s cubic-bezier(.4,0,.2,1), opacity 0.3s ease-out';
            activeApp.style.transform = `translate(0px, 0px) scale(1)`;
            activeApp.style.opacity = '1';
        });
        setTimeout(() => { activeApp.classList.remove('opening'); activeApp.style.transition = ''; }, 300);
    };

    const closeApp = () => {
        if (!activeApp) return;

        const icon = document.querySelector(`.app-icon[data-app="${activeApp.id.replace('window-', '')}"]`);
        const translateX = icon.offsetLeft;
        const translateY = icon.offsetTop;
        const scaleX = icon.clientWidth / activeApp.clientWidth;
        const scaleY = icon.clientHeight / activeApp.clientHeight;

        activeApp.classList.add('closing');
        activeApp.style.transition = 'transform 0.3s cubic-bezier(0,0,0,1), opacity 0.3s ease-in';
        activeApp.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
        activeApp.style.opacity = '0';

        setTimeout(() => { activeApp.remove(); activeApp = null; }, 300);
    };

    const startDrag = (e) => {
        if (!activeApp) return;
        const target = e.target;
        if (target.classList.contains('app-window-header') || target.classList.contains('gesture-bar')) {
            isDragging = true;
            startDragY = e.clientY || e.touches[0].clientY;
            activeApp.style.transition = 'none';
        }
    };
    
    const drag = (e) => {
        if (!isDragging || !activeApp) return;
        e.preventDefault(); 
        const currentY = e.clientY || e.touches[0].clientY;
        const deltaY = currentY - startDragY;
        if (deltaY > 0) {
            activeApp.style.transform = `translateY(${deltaY}px)`;
            activeApp.style.opacity = 1 - (deltaY / 400);
        }
    };
    
    const endDrag = (e) => {
        if (!isDragging || !activeApp) return;
        isDragging = false;
        
        const currentY = e.clientY || e.changedTouches[0].clientY;
        const deltaY = currentY - startDragY;

        if (deltaY > 100) { 
            closeApp();
        } else {
            activeApp.style.transition = 'transform 0.2s cubic-bezier(0, 0, 0, 1), opacity 0.2s ease-out';
            activeApp.style.transform = 'translateY(0px)';
            activeApp.style.opacity = '1';
        }
    };

    if (appWindowContainer) {
        appIcons.forEach(icon => icon.addEventListener('click', () => openApp(icon)));
        appWindowContainer.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        appWindowContainer.addEventListener('touchstart', startDrag, { passive: false });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', endDrag);
    }
});
