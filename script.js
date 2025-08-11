// script.js

console.log('✅ script.js загружен');
console.log('supabase:', supabase); // Проверяем, что Supabase доступен

// Получаем user_id из URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user_id');

console.log('🔍 user_id из URL:', userId);

if (!userId) {
  document.body.innerHTML = '<h2>❌ Ошибка: не указан user_id</h2>';
  throw new Error('user_id not provided');
}

// Загружаем данные
async function loadUserData() {
  try {
    console.log('🔄 Запрашиваем данные из Supabase...');

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', parseInt(userId))
      .single();

    if (error) {
      console.error('❌ Ошибка Supabase:', error);
      document.body.innerHTML = `<h2>❌ Ошибка: ${error.message}</h2>`;
      return;
    }

    if (!data) {
      console.warn('⚠️ Игрок не найден в базе');
      document.body.innerHTML = '<h2>⚠️ Игрок не найден. Зарегистрируйся в боте.</h2>';
      return;
    }

    console.log('✅ Данные получены:', data);

    // Обновляем страницу
    document.getElementById('faction').textContent = data.faction;
    document.getElementById('mana').textContent = data.mana;
    document.getElementById('crystals').textContent = data.crystals;

    // Создаём сетку
    const grid = document.getElementById('city-grid');
    grid.innerHTML = '';
    for (let i = 0; i < 49; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = i;
      cell.addEventListener('click', () => onCellClick(cell, data));
      grid.appendChild(cell);
    }

  } catch (e) {
    console.error('❌ Ошибка в loadUserData:', e);
    document.body.innerHTML = `<h2>❌ Ошибка: ${e.message}</h2>`;
  }
}

// Запускаем
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

  const { error } = await supabase
    .from('users')
    .update({ crystals: newCrystals, mana: newMana })
    .eq('id', userData.id);

  if (error) {
    alert('❌ Ошибка сохранения!');
    console.error(error);
    cell.classList.remove('built', 'mana-collector');
    cell.textContent = '';
  } else {
    document.getElementById('crystals').textContent = newCrystals;
    document.getElementById('mana').textContent = newMana;
    alert('✅ Здание построено!');
  }
}