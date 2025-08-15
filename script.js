// script.js
console.log('✅ script.js загружен');

// Импортируем Firebase SDK (используем compat версии для простоты)
// Эти скрипты должны быть подключены в index.html:
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAHl5EUnVHlIJLqsi_wfT14PkE-NClMtMU",
  authDomain: "academy-of-elements.firebaseapp.com",
  databaseURL: "https://academy-of-elements-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "academy-of-elements",
  storageBucket: "academy-of-elements.firebasestorage.app",
  messagingSenderId: "182622266003",
  appId: "1:182622266003:web:4e9836cffe58eb472c6366",
  measurementId: "G-5V7LG83DS3"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Получение user_id из URL параметров
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user_id');

if (!userId) {
  alert('❌ Ошибка: Не удалось получить ID пользователя. Пожалуйста, откройте приложение через Telegram бота.');
  console.error('User ID not found in URL parameters');
  throw new Error('User ID not found in URL parameters');
}

console.log('👤 User ID:', userId);

// Глобальные переменные
let userData = null;
let buildingsConfig = {}; // Будет заполнен данными о зданиях

const BUILDING_EMOJIS = {
  "library": "images/library.png",
  "wizard_tower": "images/wizard_tower.png",
  "blessing_tower": "images/blessing_tower.png",
  "aom_generator": "images/aom_generator.png",
  "pvp_arena": "images/pvp_arena.png",
  "defense_tower": "images/defense_tower.png",
  "arcane_lab": "images/arcane_lab.png",
  "mana_collector": "images/mana_collector.png" // Коллектор маны (если будет)
};

// Функция для получения конфигурации зданий с сервера
// Пока используем локальную копию, в будущем можно сделать API endpoint
function getBuildingsConfig() {
  // Это упрощенная локальная копия BUILDINGS_DATA из buildings_config.py
  // В реальной реализации лучше получать это с сервера
  return {
    "library": {
      "name": "Библиотека",
      "emoji": "📚",
      "description": "Центр исследований заклинаний."
    },
    "wizard_tower": {
      "name": "Башня магов",
      "emoji": "🧙‍♂️",
      "description": "Усиливает магов и позволяет нанимать новых."
    },
    "blessing_tower": {
      "name": "Башня благословений",
      "emoji": "🛐",
      "description": "Открывает мощные временные благословения для магов."
    },
    "aom_generator": {
      "name": "Генератор АОМ",
      "emoji": "💎",
      "description": "Производит кристаллы AOM - основную валюту."
    },
    "pvp_arena": {
      "name": "PvP Арена",
      "emoji": "⚔️",
      "description": "Проведение боев 1 на 1 по принципу autochess с рейтингом."
    },
    "defense_tower": {
      "name": "Башня защиты",
      "emoji": "🛡️",
      "description": "Защищает город, используя изученные заклинания."
    },
    "arcane_lab": {
      "name": "Арканская лаборатория",
      "emoji": "⚗️",
      "description": "Ускоряет процесс исследования заклинаний."
    }
  };
}

// Функция для загрузки данных пользователя из Firebase
async function loadUserData() {
  try {
    console.log('📥 Загрузка данных пользователя из Firebase...');
    const snapshot = await database.ref(`users/${userId}`).once('value');
    const data = snapshot.val();
    
    if (data) {
      userData = data;
      buildingsConfig = getBuildingsConfig(); // Получаем конфигурацию зданий
      console.log('✅ Данные пользователя загружены:', userData);
      updateUI();
    } else {
      console.error('❌ Пользователь не найден в базе данных');
      alert('❌ Пользователь не найден. Пожалуйста, зарегистрируйтесь в боте сначала.');
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки данных:', error);
    alert('❌ Ошибка загрузки данных пользователя. Проверьте соединение.');
  }
}

// Функция для сохранения данных пользователя в Firebase
async function saveUserData() {
  try {
    // Сохраняем только необходимые поля
    const dataToSave = {
      mana: userData.mana,
      crystals: userData.crystals,
      // В реальной реализации нужно сохранять только измененные данные
    };
    await database.ref(`users/${userId}`).update(dataToSave);
    console.log('✅ Данные пользователя обновлены в Firebase');
  } catch (error) {
    console.error('❌ Ошибка сохранения данных:', error);
    alert('❌ Ошибка сохранения данных');
    throw error;
  }
}

// Отображение данных
function updateUI() {
  if (!userData) return;

  document.getElementById('faction').textContent = userData.faction || 'Неизвестно';
  document.getElementById('mana').textContent = userData.mana || 0;
  document.getElementById('crystals').textContent = userData.crystals || 0;

  // Создание сетки зданий
  updateBuildingsGrid();
}

// Обновление сетки зданий

function updateBuildingsGrid() {
  const grid = document.getElementById('city-grid');
  if (!grid) {
    console.error('❌ Элемент city-grid не найден в DOM');
    return;
  }
  
  grid.innerHTML = '';
  const buildingsGrid = userData.buildings_grid || Array(9).fill(null); // 3x3 сетка
  
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    
    const buildingId = buildingsGrid[i];
    const construction = userData.construction || {};
    
    // Проверяем, строится ли что-то в этой ячейке
    const isUnderConstruction = construction.active && 
                               construction.cell_index === i && 
                               construction.type === 'build';

    if (buildingId) {
      // В ячейке есть здание
      cell.classList.add('built');
      
      // Получаем информацию о здании из конфигурации
      const buildingConfig = buildingsConfig[buildingId];
      const buildingInfo = userData.buildings[buildingId];
      
      if (buildingConfig) {
        const img = document.createElement('img');
        img.src = buildingConfig.emoji; // Теперь это URL изображения
        img.alt = buildingConfig.name;
        cell.appendChild(img);
        cell.title = `${buildingConfig.name} (уровень ${buildingInfo?.level || 1})`;
        
        // Добавляем класс по ID здания для стилизации
        cell.classList.add(`building-${buildingId}`);
      } else {
        cell.textContent = '🏛️';
        cell.title = `Здание (${buildingId})`;
      }
      
      // Добавляем обработчик клика для здания
      cell.addEventListener('click', () => onBuildingClick(cell, buildingId, i));
    } else if (isUnderConstruction) {
      // В ячейке идет постройка
      cell.classList.add('under-construction');
      cell.textContent = '🔨'; // Значок молотка
      cell.title = 'Идет постройка...';
      
      // Можно добавить анимацию пульсации
      cell.classList.add('pulse');
    } else {
      // Пустая ячейка
      cell.classList.add('empty');
      cell.textContent = '+';
      cell.title = 'Пустая ячейка. Кликните, чтобы построить.';
      
      // Добавляем обработчик клика для пустой ячейки
      cell.addEventListener('click', () => onEmptyCellClick(cell, i));
    }

    grid.appendChild(cell);
  }
}


// Обработчик клика по зданию
function onBuildingClick(cell, buildingId, cellIndex) {
  console.log(`🏢 Клик по зданию: ${buildingId} в ячейке ${cellIndex}`);
  
  // Получаем информацию о здании
  const buildingConfig = buildingsConfig[buildingId];
  const buildingInfo = userData.buildings[buildingId];
  
  if (!buildingConfig) {
    alert(`Неизвестное здание: ${buildingId}`);
    return;
  }
  
  // Формируем информацию для отображения
  let infoText = `🏛️ **${buildingConfig.name}**\n`;
  infoText += `📝 ${buildingConfig.description}\n`;
  infoText += `📊 Уровень: ${buildingInfo?.level || 1}\n\n`;
  
  // Проверяем, можно ли улучшить здание
  const maxLevel = getBuildingMaxLevel(buildingId);
  const currentLevel = buildingInfo?.level || 1;
  
  if (currentLevel < maxLevel) {
    infoText += `⬆️ Можно улучшить до уровня ${currentLevel + 1}\n`;
    infoText += `Команда в боте: \`/upgrade ${buildingId} ${currentLevel + 1}\``;
  } else {
    infoText += `✅ Здание на максимальном уровне (${maxLevel})`;
  }
  
  // Показываем информацию во всплывающем окне или модальном окне
  alert(infoText.replace(/\`/g, '')); // Убираем markdown для alert
}

// Обработчик клика по пустой ячейке
function onEmptyCellClick(cell, cellIndex) {
  console.log(`➕ Клик по пустой ячейке: ${cellIndex}`);
  
  // Формируем список доступных для постройки зданий
  // Пока покажем простое сообщение
  let buildText = `🏗️ **Постройка здания**\n`;
  buildText += `Выберите здание для постройки в ячейке ${cellIndex}:\n\n`;
  
  // Добавляем несколько примеров зданий
  buildText += `💎 \`/build aom_generator\` - Генератор АОМ\n`;
  buildText += `⚔️ \`/build pvp_arena\` - PvP Арена\n`;
  buildText += `🛡️ \`/build defense_tower\` - Башня защиты\n`;
  buildText += `...\n\n`;
  buildText += `Введите команду в Telegram боте для начала постройки.`;
  
  // Показываем информацию
  alert(buildText.replace(/\`/g, '')); // Убираем markdown для alert
}

// Вспомогательные функции
function getBuildingMaxLevel(buildingId) {
  // Это упрощенная реализация
  // В реальной системе нужно получать это из buildings_config
  const maxLevels = {
    "library": 1,
    "wizard_tower": 10,
    "blessing_tower": 5,
    "aom_generator": 20,
    "pvp_arena": 1,
    "defense_tower": 5,
    "arcane_lab": 15
  };
  return maxLevels[buildingId] || 1;
}

// Загрузка и отображение данных при запуске
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 DOM загружен, начинаем инициализацию...');
  loadUserData();
});
