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

// Отображение данных
function updateUI() {
  if (!userData) return;
  
  document.getElementById('faction').textContent = userData.faction;
  document.getElementById('mana').textContent = userData.mana;
  document.getElementById('crystals').textContent = userData.crystals;
  
  // Создание сетки
  const grid = document.getElementById('city-grid');
  grid.innerHTML = '';
  for (let i = 0; i < 49; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.addEventListener('click', () => onCellClick(cell));
    grid.appendChild(cell);
  }
}

// Постройка здания
async function onCellClick(cell) {
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
    
    try {
      // Сохраняем данные в Firebase
      await database.ref(`users/${userId}`).update({
        crystals: userData.crystals,
        mana: userData.mana
      });
      
      console.log('✅ Данные пользователя обновлены в Firebase');
      
      // Обновляем интерфейс
      updateUI();
      alert('✅ Здание построено!');
    } catch (error) {
      console.error('❌ Ошибка сохранения данных:', error);
      alert('❌ Ошибка сохранения данных');
      // Откатываем изменения в интерфейсе
      cell.classList.remove('built', 'mana-collector');
      cell.textContent = '';
      userData.crystals += 50;
      userData.mana -= 10;
    }
  }
}

// Загрузка и отображение данных при запуске
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 DOM загружен, начинаем инициализацию...');
  loadUserData();
});
