var TILE_WIDTH = 100;
var TILE_HEIGHT = 83;
var TILE_OFFSET_Y =9;
var ACTIONS = {
		37: 'left',
		38: 'top',
		39: 'right',
		40: 'down'
}

var stage = new createjs.Stage('game-stage');
var queue = new createjs.LoadQueue();


queue.installPlugin(createjs.Sound)
queue.addEventListener('complete', init);
queue.loadManifest([
	{id: 'bug', src: 'img/bug.png'},
	{id: 'hero', src: 'img/char-horn-girl.png'},
	{id: 'grass', src: 'img/tile-grass.png'},
	{id: 'stone', src: 'img/tile-stone.png'},
	{id: 'water', src: 'img/tile-water.png'},
	{id: 'background', src: 'audio/background.mp3'},
	{id: 'scream', src: 'audio/woman-scream.mp3'},
	{id: 'splash', src: 'audio/water-splash.mp3'},
]);

var hero;
var bugs = [];

var level = 1;
var hudLevel;

function init() {
	createLevel();
	createHud();
	createHero();
	createBugs();
	
	setLevel(1);
	setTicker();
	bindEvents();


	createjs.Sound.play('background', { loop: -1 })
}



function createHud() {
	hudLevel = new createjs.Text('', 'bold 25px Arial', '#fff' );
	hudLevel.x = hudLevel.y = 15;
	stage.addChild(hudLevel);
}

function setLevel(lvl) {
	level = lvl;
	hudLevel.text = 'lvl: ' + level;
}

function setTicker () {
	createjs.Ticker.timingMode = createjs.Ticker.RAF;
	createjs.Ticker.addEventListener('tick', tick);
}

function tick(e) {
	if(e.delta > 300) {
		return;
	}

	bugs.forEach(function(bug) {
		moveBug(bug, e.delta);
	});

	if (bugs.some(checkCollision)) {
		looseGame();
	}

	stage.update(e);
}

function checkCollision(el) {
	return hero.y === el.y &&
				 hero.x < el.x + TILE_WIDTH * 0.75 &&
				 el.x < hero.x + TILE_WIDTH * 0.70;
}

function moveBug(bug, delta) {
	bug.x += bug.speed * delta;
	if (bug.x > TILE_WIDTH * 7) {
		resetBug(bug);
	}
}

function createBugs() {
	for (var i = 0; i < 5; i++) {
		createBug();
	}
}

function createBug() {
	var bug = new createjs.Bitmap(queue.getResult('bug'));
	resetBug(bug);

	bugs.push(bug);
	stage.addChild(bug);
}

function resetBug(bug) {
	bug.x = -TILE_WIDTH;
	bug.y = (Math.floor(Math.random() * 4) + 1) * TILE_HEIGHT;
	bug.speed = (Math.random() + Math.random() + 1) * (level * 0.1 + 1) * 0.25;
}

function createLevel() {
	for (var i = 0; i < 6; i++) {
		createRow(getImg(i), i)
	}
}

function getImg(i) {
	var type = 'stone';
	if (i===0) {
		type = 'water';
	} else if (i===5) {
		type = 'grass';
	}
	return queue.getResult(type);
}

function createRow(img, i) {
	for (var j = 0; j < 7; j++) {
		createTile(img, i, j);
	}
}

function createTile(img, i, j) {
	var tile = new createjs.Bitmap(img);
	tile.y = TILE_HEIGHT * i - TILE_OFFSET_Y;
	tile.x = TILE_WIDTH * j;
	stage.addChild(tile);
}

function createHero() {
	hero = new createjs.Bitmap(queue.getResult('hero'));
	stage.addChild(hero);
	resetHero();
}

function resetHero() {
	hero.y = TILE_HEIGHT * 5;
	hero.x = TILE_WIDTH * 3;
}

function bindEvents() {
	window.addEventListener('keyup', moveHero);
}

function moveHero(e) {
	//console.log(e.keyCode)
	var newX = hero.x;
	var newY = hero.y;

	switch(ACTIONS[e.keyCode]) {
		case 'left':
			newX -= TILE_WIDTH;
			break;
		case 'right':
			newX += TILE_WIDTH;
			break;
		case 'top':
			newY -= TILE_HEIGHT;
			break;
		case 'down':
			newY += TILE_HEIGHT;
			break;
	}
	if (newY < 0 ||
		 	newY > TILE_HEIGHT * 5 ||
		 	newX < 0 || 
		 	newX > TILE_WIDTH * 6) {
		return;
	} 
		hero.x = newX;
		hero.y = newY;

	if (newY === 0) {
		winLevel();
	}
}

function winLevel() {
	resetHero();
	setLevel(++level);
	//createjs.Sound.play('splash')
}

function looseGame() {
	resetHero();
	setLevel(1);
	createjs.Sound.play('scream');
}
