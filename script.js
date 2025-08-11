// script.js
console.log('✅ script.js загружен');

// Генерируем временный ID для теста (в реальном приложении будет от Telegram)
const userId = localStorage.getItem('user_id') || Math.random().toString(36).substr(2, 9);
localStorage.setItem('user_id', userId);

// Инициализация данных
function initUserData() {
  const defaultData = {
    id: userId,
    username: 'Тестовый_Маг',
    faction: 'Орден Магов',
    mana: 0,
    crystals: 100,
    energy: 50,
    buildings: []
  };
  
  const saved = localStorage.getItem(`user_${userId}`);
  return saved ? JSON.parse(saved) : defaultData;
}

let userData = initUserData();

// Отображение данных
function updateUI() {
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
function onCellClick(cell) {
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
    
    userData.crystals -= 50;
    userData.mana += 10;
    
    // Сохраняем данные
    localStorage.setItem(`user_${userData.id}`, JSON.stringify(userData));
    
    // Обновляем интерфейс
    updateUI();
    alert('✅ Здание построено!');
  }
}

// Загрузка и отображение данных
updateUI();
