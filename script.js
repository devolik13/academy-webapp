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
        userData.buildings = Array(49).fill(false); // 7x7 сетка = 49 ячеек
      } else if (userData.buildings.length < 49) {
        // Если массив есть, но короче, чем нужно, дополняем его
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
      buildings: userData.buildings
    };
    await database.ref(`users/${userId}`).update(dataToSave);
    console.log('✅ Данные пользователя обновлены в Firebase');
  } catch (error) {
    console.error('❌ Ошибка сохранения данных:', error);
    alert('❌ Ошибка сохранения данных');
    throw error; // Пробрасываем ошибку для обработки в вызывающем коде
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
    cell.addEventListener('click', () => onCellClick(cell));

    // Проверяем, было ли здание построено
    if (userData.buildings && userData.buildings[i]) {
      cell.classList.add('built', 'mana-collector');
      cell.textContent = 'М';
    }

    grid.appendChild(cell);
  }
}

// Постройка здания
async function onCellClick(cell) {
  const index = parseInt(cell.dataset.index);

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
}

// Загрузка и отображение данных при запуске
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 DOM загружен, начинаем инициализацию...');
  loadUserData();
});
