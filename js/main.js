'use strict'

var gLevel = {
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
secsPassed : 0,
lives: 3, // Track player's lives
gameOver: false, // Flag to check if game is over

}

var gFirstClick = true
var gMineIndexes = []

// Timer:
var gInterval
var gStartTime



function onInitGame() {
  if (gGame.isOn) return  // Don't start if game is already on

  gBoard = buildBoard()
  gMineIndexes = getRandomIndexes(gLevel.mines, gLevel.size * gLevel.size)
  placeMines()
  setMinesNegsCount()

  resetTimer() 
  renderBoard()  
  gGame.isOn = true 
}


// Create the board with empty cells
function buildBoard() {
  const size = gLevel.size
  const board = []

  for (let i = 0; i < size * size; i++) {
    board.push({
      isCovered: true,  // All cells are initially covered
      isMine: false,    // Default to not a mine
      minesAroundCount: 0, // Default to 0 mines around
      isMarked: false,   // Not marked initially
    })
  }

  return board
}

// Function to render the board
function renderBoard() {
  const board = document.querySelector('.board')
  board.innerHTML = '' // Clear any existing board

  const table = document.createElement('table')
  table.classList.add('game-table')

  // Loop through rows and columns to create the grid
  for (let row = 0; row < gLevel.size; row++) {
    const tr = document.createElement('tr')
    
    for (let col = 0; col < gLevel.size; col++) {
      const elCell = document.createElement('td') // Create the cell (elCell)
      elCell.classList.add('grid-item') // Add the CSS class for styling
      const index = row * gLevel.size + col // Calculate the correct index

      elCell.setAttribute('data-index', index) // Set the index attribute

      // Add event listener for left-click (click) to reveal the cell
      elCell.addEventListener('click', () => onCellClicked(index, elCell))

      // Add event listener for right-click (contextmenu) to mark the cell
      elCell.addEventListener('contextmenu', (event) => {
        event.preventDefault() 
        onCellMarked(elCell, index) 
      })

      // Append the cell to the row
      tr.appendChild(elCell)
    }

    // Append the row to the table
    table.appendChild(tr)
  }

  // Append the table to the board
  board.appendChild(table)
}


// Place mines randomly on the board
function placeMines() {
  gMineIndexes.forEach(index => {
    gBoard[index].isMine = true
  })
}


// Set the number of mines surrounding each cell
function setMinesNegsCount() {
  const size = gLevel.size

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const index = row * size + col
      const cell = gBoard[index]
      let mineCount = 0

      // Loop through the 8 neighboring cells
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          // Skip the current cell
          if (i === 0 && j === 0) continue

          const neighborRow = row + i
          const neighborCol = col + j

          // Ensure the neighbor is within bounds
          if (neighborRow >= 0 && neighborRow < size && neighborCol >= 0 && neighborCol < size) {
            const neighborIndex = neighborRow * size + neighborCol
            const neighborCell = gBoard[neighborIndex]

            // If the neighbor is a mine, increment the count
            if (neighborCell.isMine) {
              mineCount++
            }
          }
        }
      }

      // Set the `minesAroundCount` for the current cell
      cell.minesAroundCount = mineCount
    }
  }
}


function onCellClicked(index, elCell) {
  if (gGame.gameOver) return  // Don't process clicks if the game is over

  const clickedCell = gBoard[index]

  // Handle the first click
  if (gFirstClick) {
    gFirstClick = false
    gMineIndexes = getRandomIndexes(gLevel.mines, gLevel.size * gLevel.size)
    gBoard = buildBoard()
    placeMines() //Place the Mines after the first click
    setMinesNegsCount()

    startTimer()  // Start the timer when the first cell is clicked
    updateSmileyFace('normal') // Make sure smiley is normal on first click
  }

  // If it's a mine, display the bomb, reduce lives and check if game over
  if (clickedCell.isMine) {
    elCell.textContent = '💣'
    gGame.lives--
    updateLivesDisplay()
    updateSmileyFace('scared') // Update the smiley face to sad when a mine is clicked

    if (gGame.lives === 0) {
      gameOver(false)  // Game over: Player lost
    }
  } else {
    // Safe cell
    const mineCount = clickedCell.minesAroundCount
    if (mineCount > 0) {
      elCell.textContent = mineCount
      setNumberColor(elCell, mineCount)
    } else {
      expandUncover(gBoard, elCell, Math.floor(index / gLevel.size), index % gLevel.size)
    }

    // Update smiley to normal after clicking a regular cell (not a mine)
    updateSmileyFace('normal')
  }

  clickedCell.isCovered = false  // Mark this cell as uncovered

  // After uncovering a safe cell, check for the win condition
  checkWinCondition()
}


// Handle right-click (mark/unmark a cell)
function onCellMarked(elCell, index) {
  const clickedCell = gBoard[index]
  
  // Toggle the marked state
  if (!clickedCell.isCovered) return // Can't mark uncovered cells
  
  // Toggle the `isMarked` state
  clickedCell.isMarked = !clickedCell.isMarked
  
  // Update the cell's visual state based on marking
  if (clickedCell.isMarked) {
    elCell.textContent = '🚩'  // Show a flag emoji
  } else {
    elCell.textContent = ''  // Remove the flag
  }
  
  console.log(`Cell at index ${index} marked: ${clickedCell.isMarked}`)
}


function restartGame() {
  gGame.gameOver = false
  gGame.lives = 3  // Reset lives
  gGame.secsPassed = 0  // Reset timer

  // Reset game variables
  gBoard = buildBoard()
  gMineIndexes = getRandomIndexes(gLevel.mines, gLevel.size * gLevel.size)
  gFirstClick = true // Reset firstClick to true so the timer starts on the first click

  renderBoard() 
  resetTimer()  
  updateLivesDisplay()  
  updateSmileyFace('normal')  


  // Remove any existing game over message
  const gameOverMessage = document.querySelector('.game-over-message')
  if (gameOverMessage) {
    gameOverMessage.remove()
  }
}


// Uncover all the cells when the game is over
function uncoverAllCells() {
  const cells = document.querySelectorAll('.grid-item')
  
  cells.forEach((cell, index) => {
    const clickedCell = gBoard[index]

    // If the cell is covered, uncover it
    if (clickedCell.isCovered) {
      clickedCell.isCovered = false

      if (clickedCell.isMine) {
        cell.textContent = '💣'  
      } else {
        const mineCount = clickedCell.minesAroundCount
        if (mineCount > 0) {
          cell.textContent = mineCount  
          setNumberColor(cell, mineCount)  
        }
      }
      cell.classList.add('uncovered') 
    } 
  })
}

// Disable all cell clicks (to prevent interaction after game over)
function disableCellClicks() {
  const cells = document.querySelectorAll('.grid-item')
  cells.forEach(cell => {
    cell.removeEventListener('click', onCellClicked)
    cell.removeEventListener('contextmenu', (event) => event.preventDefault())
  })
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
  // Reset the game state
  gGame.lives = 3
  gGame.gameOver = false
  gGame.secsPassed = 0
  updateLivesDisplay() 

  // Reset the board and mines
  gBoard = buildBoard()
  gMineIndexes = getRandomIndexes(gLevel.mines, gLevel.size * gLevel.size)
  gFirstClick = true  // Reset firstClick to true so the timer starts on the first click

  renderBoard() 
  resetTimer() 
  updateLivesDisplay()  

  // Remove any existing game over message
  const gameOverMessage = document.querySelector('.game-over-message')
  if (gameOverMessage) {
    gameOverMessage.remove()
  }
}








