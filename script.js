// script.js
console.log('✅ script.js загружен');

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

// Глобальная переменная для данных пользователя
let userData = null;
// Индекс библиотеки в сетке (должен совпадать с тем, что в database.py)
const LIBRARY_INDEX = 24;

// Функция для загрузки данных пользователя из Firebase
async function loadUserData() {
  try {
    console.log('📥 Загрузка данных пользователя из Firebase...');
    const snapshot = await database.ref(`users/${userId}`).once('value');
    const data = snapshot.val();

    if (data) {
      userData = data;
      // Инициализируем массив buildings, если его нет
      if (!userData.buildings || !Array.isArray(userData.buildings)) {
        console.log('🔧 Инициализация массива buildings');
        userData.buildings = Array(49).fill(false);
      } else if (userData.buildings.length < 49) {
        console.log('🔧 Корректировка длины массива buildings');
        while (userData.buildings.length < 49) {
          userData.buildings.push(false);
        }
      }
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
      buildings: userData.buildings,
      // Также сохраняем spells, research, wizards, available_spells если они изменились
      // Для простоты сохраним их все
      spells: userData.spells,
      research: userData.research,
      wizards: userData.wizards,
      available_spells: userData.available_spells
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

  // Создание сетки
  const grid = document.getElementById('city-grid');
  grid.innerHTML = '';
  for (let i = 0; i < 49; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    
    // Проверяем, построено ли здание
    if (userData.buildings && userData.buildings[i]) {
      cell.classList.add('built');
      // Проверяем, является ли это библиотекой
      if (i === LIBRARY_INDEX) {
        cell.classList.add('library');
        cell.textContent = '📚'; // Эмодзи библиотеки
        // Добавляем обработчик клика для библиотеки
        cell.addEventListener('click', () => openLibrary());
      } else {
        // Для других построенных зданий можно добавить другой обработчик или текст
        cell.textContent = '🏠'; // Общий эмодзи для зданий
        cell.addEventListener('click', () => alert(`Здание в ячейке ${i}`)); // Заглушка
      }
    } else {
      // Непостроенная ячейка
      cell.addEventListener('click', () => onCellClick(cell));
    }

    grid.appendChild(cell);
  }
}

// Постройка здания (для новых ячеек)
async function onCellClick(cell) {
  const index = parseInt(cell.dataset.index);

  // Временно отключим возможность строить новые здания через этот интерфейс
  // Пока реализуем только взаимодействие с существующими
  alert('Постройка новых зданий будет доступна позже!');
  return;

  // Оригинальная логика постройки коллектора маны (закомментирована)
  /*
  if (cell.classList.contains('built')) {
    alert('Здесь уже построено!');
    return;
  }

  if (userData.crystals < 50) {
    alert('Недостаточно кристаллов!');
    return;
  }

  if (confirm('Построить Коллектор маны за 50 кристаллов?')) {
    cell.classList.add('built', 'mana-collector');
    cell.textContent = 'М';
    
    // Обновляем данные пользователя
    userData.crystals -= 50;
    userData.mana += 10;
    // Обновляем состояние сетки
    if (!userData.buildings) {
      userData.buildings = Array(49).fill(false);
    }
    userData.buildings[index] = true;

    try {
      // Сохраняем данные в Firebase
      await saveUserData();

      // Обновляем интерфейс (только счетчики)
      document.getElementById('mana').textContent = userData.mana;
      document.getElementById('crystals').textContent = userData.crystals;

      alert('✅ Здание построено!');
    } catch (error) {
      console.error('❌ Ошибка сохранения данных:', error);
      // Откатываем изменения в интерфейсе
      cell.classList.remove('built', 'mana-collector');
      cell.textContent = '';
      userData.buildings[index] = false;
      userData.crystals += 50;
      userData.mana -= 10;
      // Обновляем интерфейс после отката
      document.getElementById('mana').textContent = userData.mana;
      document.getElementById('crystals').textContent = userData.crystals;
    }
  }
  */
}

// Функция для открытия окна библиотеки
function openLibrary() {
  // Создаем или показываем модальное окно библиотеки
  const modal = document.getElementById('library-modal');
  if (modal) {
    modal.style.display = 'block';
    updateLibraryContent();
  } else {
    createLibraryModal();
    updateLibraryContent();
  }
}

// Функция для создания модального окна библиотеки
function createLibraryModal() {
  const modalHTML = `
    <div id="library-modal" class="modal">
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>📚 Библиотека Заклинаний</h2>
        <div id="library-content">
          <!-- Содержимое библиотеки будет здесь -->
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Добавляем обработчики событий
  const modal = document.getElementById('library-modal');
  const span = modal.querySelector('.close');
  
  span.onclick = function() {
    modal.style.display = 'none';
  }
  
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
}

// Функция для обновления содержимого библиотеки
function updateLibraryContent() {
  const contentDiv = document.getElementById('library-content');
  if (!contentDiv) return;
  
  if (!userData || !userData.spells) {
    contentDiv.innerHTML = '<p>Нет данных о заклинаниях.</p>';
    return;
  }
  
  let html = '<h3>Доступные заклинания:</h3>';
  
  // Проходим по всем фракциям и их заклинаниям
  for (const [faction, spells] of Object.entries(userData.spells)) {
    if (Object.keys(spells).length > 0) {
      html += `<h4>${faction.toUpperCase()}:</h4>`;
      html += '<ul>';
      for (const [spellId, spellInfo] of Object.entries(spells)) {
        const isAvailable = userData.available_spells && userData.available_spells.includes(spellId);
        const status = isAvailable ? '✅' : '🔒';
        html += `<li>
          ${status} <strong>${spellInfo.name}</strong> 
          (Ступень ${spellInfo.tier}, Уровень ${spellInfo.level})
          <br>
          <button onclick="startResearch('${spellId}', ${spellInfo.level + 1}, '${faction}')"
                  ${!isAvailable ? 'disabled' : ''}>
            Улучшить до уровня ${spellInfo.level + 1}
          </button>
          <!-- Кнопка изучения других фракций может быть здесь -->
        </li>`;
      }
      html += '</ul>';
    }
  }
  
  // Кнопка для изучения новых заклинаний (заглушка)
  html += `
    <h3>Изучить новые заклинания:</h3>
    <p><em>Функция изучения заклинаний других фракций будет доступна позже.</em></p>
    <!-- Здесь можно добавить список доступных для изучения заклинаний -->
  `;
  
  contentDiv.innerHTML = html;
}

// Функция для начала исследования
async function startResearch(spellId, targetLevel, faction) {
  // Проверяем, нет ли уже активного исследования
  if (userData.research && userData.research.active) {
    alert('У вас уже есть активное исследование!');
    return;
  }
  
  // Находим информацию о заклинании
  let spellInfo = null;
  if (userData.spells[faction] && userData.spells[faction][spellId]) {
    spellInfo = userData.spells[faction][spellId];
  }
  
  if (!spellInfo) {
    alert('Заклинание не найдено!');
    return;
  }
  
  // Проверяем, можно ли улучшить до targetLevel
  if (targetLevel > 5) {
    alert('Максимальный уровень заклинания - 5!');
    return;
  }
  
  // Рассчитываем время исследования
  // Базовое время = 2^(уровень_цели - 2) дней
  let baseTime = targetLevel === 2 ? 1 : Math.pow(2, targetLevel - 2);
  
  // Множитель за фракцию (пока считаем, что все заклинания в списке - своей фракции)
  const factionBonus = faction === userData.faction;
  const timeMultiplier = factionBonus ? 1 : 2;
  
  const totalTime = baseTime * timeMultiplier;
  
  // Подтверждение
  const factionText = factionBonus ? 'своей фракции' : 'чужой фракции';
  if (confirm(`Начать исследование "${spellInfo.name}" до уровня ${targetLevel} (${factionText})?\nВремя: ${totalTime} дней`)) {
    // Обновляем данные исследования
    userData.research = {
      active: true,
      spell: spellId,
      target_level: targetLevel,
      time_left: totalTime,
      faction_bonus: factionBonus
    };
    
    try {
      await saveUserData();
      alert(`✅ Исследование "${spellInfo.name}" до уровня ${targetLevel} начато!\nОсталось: ${totalTime} дней.`);
      
      // Закрываем модальное окно
      const modal = document.getElementById('library-modal');
      if (modal) {
        modal.style.display = 'none';
      }
      
    } catch (error) {
      console.error('❌ Ошибка начала исследования:', error);
      alert('❌ Ошибка начала исследования.');
      // Откатываем изменения
      userData.research = { active: false, spell: null, target_level: null, time_left: 0, faction_bonus: false };
    }
  }
}

// Загрузка и отображение данных при запуске
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 DOM загружен, начинаем инициализацию...');
  loadUserData();
});
