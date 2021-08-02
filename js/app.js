var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var GLUE = 'GLUE';

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';
var GLUE_IMG = '<img src="img/glue.png" />';

var gBoard;
var gGamerPos;

var gBallsCounter = 0;
var gBallsRemaining = 2;
var gInsertBallsInterval;
var gInsertGlueInterval;

var gIsGlued = false;


function initGame() {
	var elPlayAgainButton = document.querySelector('.play-again');
	elPlayAgainButton.style.display = 'none';

	var elBallsCollector = document.querySelector('h2');
	elBallsCollector.innerHTML = 'Balls collected: <span></span>';
	elBallsCollector.style.color = 'white';

	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	renderBoard(gBoard);

	
	// Set a random ball on the board every 1.5 sec
	gInsertBallsInterval = setInterval(function(){
		var glueX = getRandomInteger(1,9);
		var glueY = getRandomInteger(1,11);

		while((glueX === gGamerPos.i && glueY === gGamerPos.j) || (gBoard[glueX][glueY].gameElement === BALL) || (gBoard[glueX][glueY].gameElement === GLUE)){
			glueX = getRandomInteger(1,9);
			glueY = getRandomInteger(1,11);
		}
		if(gBallsRemaining < 77 ){
			gBoard[glueX][glueY].gameElement = BALL;
			gBallsRemaining++;
		}
		renderCell({i:glueX,j:glueY},BALL_IMG);
	},2000);

	// Make glue appear every 5 seconds
	gInsertGlueInterval = setInterval(function(){
		var glueX = getRandomInteger(1,9);
		var glueY = getRandomInteger(1,11);

		while((glueX === gGamerPos.i && glueY === gGamerPos.j) || (gBoard[glueX][glueY].gameElement === BALL) || (gBoard[glueX][glueY].gameElement === GLUE)){
			glueX = getRandomInteger(1,9);
			glueY = getRandomInteger(1,11);
		}

		gBoard[glueX][glueY].gameElement = GLUE;
		renderCell({i:glueX,j:glueY},GLUE_IMG);

		
		// Make the glue gone after 3 seconds
		setTimeout(function(){
			if(!gIsGlued){
				gBoard[glueX][glueY].gameElement = null;
				renderCell({i: glueX, j: glueY},'');
			}
		},3000);

	},5000);
}


function buildBoard() {
	// Create the Matrix
	var board = createMat(10, 12)


	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };

			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
			}

			// Add created cell to The game board
			board[i][j] = cell;
		}
	}

	// Create passages
	board[0][5] = { type: FLOOR, gameElement: null };
	board[9][5] = { type: FLOOR, gameElement: null };

	board[5][0] = { type: FLOOR, gameElement: null };
	board[5][11] = { type: FLOOR, gameElement: null };


	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;

	return board;
}

// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			cellClass += (currCell.type === FLOOR)? ' floor':' wall';

			strHTML += `\t<td class="cell ${cellClass}" onclick="moveTo(${i},${j})">\n`;

			switch(currCell.gameElement){
				case GAMER:
					strHTML += GAMER_IMG;
					break;
				case BALL:
					strHTML += BALL_IMG;
					break;
			}


			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}

	// console.log('strHTML is:');
	// console.log(strHTML);
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {

	if(gIsGlued) return;

	// If player is in a passage, change the next position i or j accordingly
	var isPassageNow = false;

	if(i === gBoard.length){
		i = 0;	
		isPassageNow = true;
	} 
	if(i === -1){
		i = i = gBoard.length - 1;
		isPassageNow = true;
	}
	if(j === -1){
		j = j = gBoard[0].length - 1;
		isPassageNow = true;
	}
	if(j === gBoard[0].length){
		j = 0;
		isPassageNow = true;
	}

	// If reached wall
	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;


	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if (((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) || isPassageNow) {

		// Stepped on glue
		if(targetCell.gameElement === GLUE){
			new Audio('Sticky.mp3').play();
			gIsGlued = true;
			setTimeout(function(){
				gIsGlued = false;
			},3000);
		}

		


		if (targetCell.gameElement === BALL) {
			gBallsCounter++;
			gBallsRemaining--;
			 new Audio('Bite.mp3').play();
			var elBallsCollector = document.querySelector('h2 span');
			elBallsCollector.innerText = gBallsCounter;
			if(gBallsRemaining === 0){
				clearInterval(gInsertBallsInterval);
				victoryY();
			}
		}

				// MOVING from current position
				// Model:
				gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
				// Dom:
				renderCell(gGamerPos, '');

				
				// MOVING to selected position
				// Model:
				gGamerPos.i = i;
				gGamerPos.j = j;
				gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
				// DOM:
				renderCell(gGamerPos, GAMER_IMG);

				
				
	}

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;


	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;
	}

}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

function victoryY(){
	var elPlayAgainButton = document.querySelector('.play-again');
	elPlayAgainButton.style.display = 'inline-block';

	var elBallsCollector = document.querySelector('h2');
	elBallsCollector.style.color = 'green';
	elBallsCollector.innerHTML = 'You Won!';

	gBallsCounter = 0;
	gBallsRemaining = 2;

}