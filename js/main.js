'use strict'

// TODO: kmvdfvmkldfm

const gLevel = {
    size: 4, 
    mines: 2
} 

var gBoard = {
    minesAroundCount : 4 ,
    isCovered : true ,
    isMine : false,
    isMarked : false
}

var gGame = {
isOn : false ,
coveredCount : 0 ,
markedCount : 0,
secsPassed : 0

}

// Timer:
var gInterval
var gStartTime


function onInitGame() {
 
startTimer()
renderBoard()


}

var firstClick = true
var mineIndexes = []

function buildBoard(){
  
}
function renderBoard() {
  const board = document.querySelector('.board')
  board.innerHTML = '' // Clear any existing board

  const table = document.createElement('table')
  table.classList.add('game-table')

  // Loop through rows and columns to create the grid
  for (let row = 0; row < gLevel.size; row++) {
    const tr = document.createElement('tr')
    
    for (let col = 0; col < gLevel.size; col++) {
      const td = document.createElement('td')
      td.classList.add('grid-item');
      td.textContent = ''; // Empty initially
      const index = row * gLevel.size + col; // Calculate index based on row/column
      
      td.addEventListener('click', () => handleClick(index, td))
      tr.appendChild(td)
    }
    table.appendChild(tr)
  }
  
  board.appendChild(table)
}

function handleClick(index, cell) {
  if (firstClick) {
    firstClick = false;
    mineIndexes = getRandomIndexes(gLevel.mines, gLevel.size * gLevel.size);
  }
  
  if (mineIndexes.includes(index)) {
    console.log('Mine hit!');
    cell.textContent = '💣';  // Display a bomb if it's a mine
  } else {
    console.log('Safe click');
    cell.textContent = '🔢';  // Display a number or placeholder
  }
}

// Get random unique indexes for mines
function getRandomIndexes(count, max) {
  const indexes = new Set();
  
  while (indexes.size < count) {
    indexes.add(Math.floor(Math.random() * max));
  }
  
  return [...indexes];
}

  document.addEventListener('DOMContentLoaded', function() {
    const newGameButton = document.querySelector('.newGameButton')
  
    if (newGameButton) {
      newGameButton.addEventListener('click', startNewGame) // Listen for clicks on the new game button
    }
  
    // Initialize the board when the page loads
    renderBoard()
  }) 

 
function startNewGame() {
// clear the board
startTimer()

firstClick = true
mineIndexes = []
renderBoard() 
}


function resetTimer() {
    clearInterval(gInterval)
    var elTimer = document.querySelector('.timer')
    elTimer.innerHTML = '000'
    gStartTime = 0
    gInterval = null
}



function onDifficultyClick(elBtn) {
    gLevel.size = elBtn.dataset.size

  
    if(gLevel.size === '4') gLevel.mines = 2
    if(gLevel.size === '8') gLevel.mines = 14
    if(gLevel.size === '12')  gLevel.mines = 32
    console.log(gLevel.size)
    console.log(gLevel.mines)

    onInitGame()
}


function startTimer() {
    gStartTime = Date.now()
    gInterval = setInterval(updateTime, 1)
}


function updateTime() {
    var currTime = Date.now()
    var elapsedTime = currTime - gStartTime


    var sec = Math.floor(elapsedTime / 1000 % 60)

    var elTime = document.querySelector('.timer')
    elTime.innerHTML = `${sec}`
}

