// script.js — теперь получает данные через /api/user
console.log('✅ script.js загружен');

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user_id');

if (!userId) {
  document.body.innerHTML = '<h2>❌ Ошибка: не указан user_id</h2>';
  throw new Error('user_id not provided');
}

async function loadUserData() {
  try {
    console.log('🔄 Запрашиваем данные через прокси...');

    // Запрос через наш API (на Vercel)
    const response = await fetch(`/api/user?user_id=${userId}`);
    const userData = await response.json();

    if (response.status === 400) {
      document.body.innerHTML = '<h2>❌ Ошибка: user_id не передан</h2>';
      return;
    }

    if (response.status === 500) {
      document.body.innerHTML = `<h2>❌ Ошибка сервера: ${userData.error}</h2>`;
      return;
    }

    console.log('✅ Данные получены:', userData);

    document.getElementById('faction').textContent = userData.faction;
    document.getElementById('mana').textContent = userData.mana;
    document.getElementById('crystals').textContent = userData.crystals;

    const grid = document.getElementById('city-grid');
    grid.innerHTML = '';
    for (let i = 0; i < 49; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = i;
      cell.addEventListener('click', () => onCellClick(cell, userData));
      grid.appendChild(cell);
    }
  } catch (e) {
    console.error('❌ Ошибка:', e);
    document.body.innerHTML = `<h2>❌ Ошибка загрузки: ${e.message}</h2>`;
  }
}

loadUserData();

function onCellClick(cell, userData) {
  if (cell.classList.contains('built')) {
    alert('Здесь уже построено!');
    return;
  }

  if (userData.crystals < 50) {
    alert('Недостаточно кристаллов!');
    return;
  }

  if (confirm('Построить Коллектор маны за 50 кристаллов?')) {
    buildStructure(cell, userData);
  }
}

async function buildStructure(cell, userData) {
  cell.classList.add('built', 'mana-collector');
  cell.textContent = 'М';

  const newCrystals = userData.crystals - 50;
  const newMana = userData.mana + 10;

  // Обновляем данные через API
  const response = await fetch(`/api/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userData.id,
      crystals: newCrystals,
      mana: newMana
    })
  });

  const result = await response.json();

  if (response.ok) {
    document.getElementById('crystals').textContent = newCrystals;
    document.getElementById('mana').textContent = newMana;
    alert('✅ Здание построено!');
  } else {
    alert('❌ Ошибка сохранения!');
    cell.classList.remove('built', 'mana-collector');
    cell.textContent = '';
    console.error(result.error);
  }
}
