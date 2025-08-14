// script.js
console.log('✅ script.js загружен');

// Импортируем Firebase SDK (используем compat версии для простоты)
// Эти скрипты должны быть подключены в index.html:
//  
//  

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

// Эмодзи для зданий (можно расширить)
const BUILDING_EMOJIS = {
  "library": "📚",
  "wizard_tower": "🧙‍♂️",
  "blessing_tower": "🛐",
  "aom_generator": "💎",
  "pvp_arena": "⚔️",
  "defense_tower": "🛡️",
  "arcane_lab": "⚗️",
  "mana_collector": "🔮" // Коллектор маны (если будет)
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
      "description": "Центр исследований заклинаний.",
      "can_build": false // Нельзя строить
    },
    "wizard_tower": {
      "name": "Башня магов",
      "emoji": "🧙‍♂️",
      "description": "Усиливает магов и позволяет нанимать новых.",
      "can_build": false // Нельзя строить
    }, 
    "blessing_tower": {
      "name": "Башня благословений",
      "emoji": "🛐",
      "description": "Открывает мощные временные благословения для магов.",
      "can_build": true
    },
    "aom_generator": {
      "name": "Генератор АОМ",
      "emoji": "💎",
      "description": "Производит кристаллы AOM - основную валюту.",
      "can_build": true
    },
    "pvp_arena": {
      "name": "PvP Арена",
      "emoji": "⚔️",
      "description": "Проведение боев 1 на 1 по принципу autochess с рейтингом.",
      "can_build": true
    },
    "defense_tower": {
      "name": "Башня защиты",
      "emoji": "🛡️",
      "description": "Защищает город, используя изученные заклинания.",
      "can_build": true
    },
    "arcane_lab": {
      "name": "Арканская лаборатория",
      "emoji": "⚗️",
      "description": "Ускоряет процесс исследования заклинаний.",
      "can_build": true
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
  const buildingsGrid = userData.buildings_grid || Array(49).fill(null);
  
  for (let i = 0; i < 49; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    
    const buildingId = buildingsGrid[i];
    
    if (buildingId) {
      // В ячейке есть здание
      cell.classList.add('built');
      
      // Получаем информацию о здании из конфигурации
      const buildingConfig = buildingsConfig[buildingId];
      const buildingInfo = userData.buildings[buildingId];
      
      if (buildingConfig) {
        cell.textContent = buildingConfig.emoji || '🏛️';
        cell.title = `${buildingConfig.name} (уровень ${buildingInfo?.level || 1})`;
        
        // Добавляем класс по ID здания для стилизации
        cell.classList.add(`building-${buildingId}`);
      } else {
        cell.textContent = '🏛️';
        cell.title = `Здание (${buildingId})`;
      }
      
      // Добавляем обработчик клика для здания
      cell.addEventListener('click', () => onBuildingClick(cell, buildingId, i));
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
  const buildableBuildings = Object.entries(buildingsConfig).filter(
    ([id, data]) => data.can_build !== false
  );

  if (buildableBuildings.length === 0) {
    alert("Нет доступных зданий для постройки.");
    return;
  }

  let menuText = `🏗️ Построить в ячейке ${cellIndex}:\n`;
  buildableBuildings.forEach(([id, data], index) => {
    menuText += `${index + 1}. ${data.emoji} ${data.name}\n`;
  });
  menuText += `\nВведите номер здания (1-${buildableBuildings.length}):`;

  const choice = prompt(menuText);

  if (choice === null) return; // Отмена

  const selectedIndex = parseInt(choice, 10) - 1;
  if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= buildableBuildings.length) {
    alert("Неверный выбор.");
    return;
  }

  const [selectedBuildingId, selectedBuildingData] = buildableBuildings[selectedIndex];
  console.log(`Пользователь выбрал постройку ${selectedBuildingId} в ячейке ${cellIndex}`);

  // Отправка запроса на бэкенд
  initiateBuild(selectedBuildingId, cellIndex);
}

// Функция для отправки запроса на постройку
async function initiateBuild(buildingId, cellIndex) {
  try {
    // URL вашего API endpoint для постройки
    const apiUrl = 'http://127.0.0.1:8000/api/build'; // Убедитесь, что это правильный URL
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        building_id: buildingId,
        cell_index: cellIndex,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert(`✅ ${data.message}`); // Или обновить UI
      // Перезагрузить данные пользователя, чтобы отразить изменения
      await loadUserData();
    } else {
      alert(`❌ Ошибка: ${data.detail || 'Неизвестная ошибка'}`);
    }
  } catch (error) {
    console.error('Ошибка при отправке запроса на постройку:', error);
    alert('❌ Ошибка соединения. Попробуйте позже.');
  }
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
