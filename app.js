const diceContainer = document.querySelector('.dice-container');
const rollButton = document.querySelector('.roll');
const diceCountSelect = document.getElementById('diceCount');

//   //////////////////////////////////////

rollButton.addEventListener('click', rollDice);
/* theme */
// Добавляем в начало файла
const themeToggle = document.getElementById('themeToggle');

// Функция переключения темы
function toggleTheme() {
	document.body.classList.toggle('light-theme');
	const isLight = document.body.classList.contains('light-theme');
	themeToggle.textContent = isLight ? '☀️' : '🌙';
	localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// Инициализация темы при загрузке
function initTheme() {
	const savedTheme = localStorage.getItem('theme') || 'dark';
	if (savedTheme === 'light') {
		document.body.classList.add('light-theme');
		themeToggle.textContent = '☀️';
	} else {
		themeToggle.textContent = '🌙';
	}
}

// Добавляем обработчик клика на кнопку темы
themeToggle.addEventListener('click', toggleTheme);

// //////////////////////////////////
// SVG шаблон для кубика
const diceSVG = (dots) => `
            <svg viewBox="0 0 100 100">
                ${dots
									.map((pos) => `<circle class="dot" cx="${pos[0]}" cy="${pos[1]}" r="8"/>`)
									.join('')}
            </svg>
        `;

// Конфигурация точек для каждой грани
const diceFaces = {
	1: [[50, 50]],
	2: [
		[30, 30],
		[70, 70],
	],
	3: [
		[30, 30],
		[50, 50],
		[70, 70],
	],
	4: [
		[30, 30],
		[70, 30],
		[30, 70],
		[70, 70],
	],
	5: [
		[30, 30],
		[70, 30],
		[30, 70],
		[70, 70],
		[50, 50],
	],
	6: [
		[30, 30],
		[70, 30],
		[30, 50],
		[70, 50],
		[30, 70],
		[70, 70],
	],
};

function createDiceElement() {
	const div = document.createElement('div');
	div.className = 'dice';
	return div;
}

function updateDice(diceElement, number) {
	diceElement.classList.add('rolling');
	setTimeout(() => {
		diceElement.innerHTML = diceSVG(diceFaces[number]);
		diceElement.classList.remove('rolling');
	}, 800);
}

function rollDice() {
	const count = parseInt(diceCountSelect.value);
	const diceElements = Array.from({ length: count }, createDiceElement);

	diceContainer.innerHTML = '';
	diceElements.forEach((dice) => diceContainer.appendChild(dice));

	diceElements.forEach((dice) => {
		const randomNumber = 1 + Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] % 6);
		updateDice(dice, randomNumber);
	});
}

// Инициализация начальных кубиков
initTheme();
rollDice();
