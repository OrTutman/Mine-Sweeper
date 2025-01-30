'use strict'


const gLevel1 = {size: 4}//, mines: 2}
const gLevel2 = {size: 8}//, mines: 14}
const gLevel3 = {size: 12}//, mines: 32}


// Timer:
var gInterval
var gStartTime

function onInitGame() {
    resetTimer()
    
}


// creat board 
const board = document.getElementById('board')
const cells = []
for (let i = 0; i < 16; i++) {
  const cell = document.createElement('div')
  cell.classList.add('cell')
  cell.dataset.index = i
  cell.addEventListener('click', () => handleCellClick(i))
  board.appendChild(cell)
  cells.push(cell)
  startTimer()
}

let currentPlayer = '❤️'

// on click on cell
function handleCellClick(index) {
   
  if (!cells[index].textContent) {
    cells[index].textContent = currentPlayer
    currentPlayer = currentPlayer === '❤️' ? '😍' :'😍'
  }
}

const newGameButton = document.getElementById('newGameButton')

newGameButton.addEventListener('click', startNewGame)

function startNewGame() {
  // clear the board
  cells.forEach(cell => {
    cell.textContent = ''
  });

  }
  

function resetTimer() {
    clearInterval(gInterval)
    var elTimer = document.querySelector('.timer')
    elTimer.innerHTML = '000'
    gStartTime = 0
    gInterval = null
}



function onDifficultyClick(elBtn) {
    gSize = +elBtn.dataset.size
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

