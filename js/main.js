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
secsPassed : 0,
lives: 3, // Track player's lives
gameOver: false, // Flag to check if game is over

}

// Timer:
var gInterval
var gStartTime


function onInitGame() {
 
  if (gGame.isOn) {
    return  // Don't start the timer if the game is already in progress
  }

  gBoard = createBoard()  // Create the board at the start
  mineIndexes = getRandomIndexes(gLevel.mines, gLevel.size * gLevel.size)
  placeMines() // Place the mines
  setMinesNegsCount() // Set the mine counts for all cells

  startTimer() // Start the timer
  renderBoard() // Render the board after everything is set


}

var firstClick = true
var mineIndexes = []

// Create the board with empty cells
function createBoard() {
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

// Place mines randomly on the board
function placeMines() {
  mineIndexes.forEach(index => {
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


function handleClick(index, elCell) {
  if (gGame.gameOver) return // Don't process clicks if the game is over

  const clickedCell = gBoard[index] // Get the clicked cell object

  // If this is the first click, initialize the game
  if (firstClick) {
    firstClick = false
    mineIndexes = getRandomIndexes(gLevel.mines, gLevel.size * gLevel.size)
    gBoard = createBoard()
    placeMines()// Place mines on the board
    setMinesNegsCount() // Set the mine counts for all cells
  }

  // If it's a mine, display the bomb and decrease lives
  if (clickedCell.isMine) {
    console.log('Mine hit!')
    elCell.textContent = '💣'  // Display a bomb if it's a mine

    gGame.lives -= 1 // Decrease the player's lives
    updateLivesDisplay() // Update the lives display on the page

    if (gGame.lives === 0) {
      gameOver(); // Trigger game over if no lives left
    }
  } else {
    console.log('Safe click')
    const mineCount = clickedCell.minesAroundCount

    if (mineCount > 0) {
      elCell.textContent = mineCount;  // Show the number of surrounding mines
      setNumberColor(elCell, mineCount)  // Set the color of the number
    } else {
      // If no mines are around, uncover the cell and expand uncovering to neighbors
      expandUncover(gBoard, elCell, Math.floor(index / gLevel.size), index % gLevel.size)
    }
  }

  // Mark the cell as revealed
  clickedCell.isCovered = false
}

// Function to set the color of the number based on the surrounding mines count
function setNumberColor(elCell, number) {
  switch (number) {
    case 1:
      elCell.style.color = 'blue'
      break
    case 2:
      elCell.style.color = 'green'
      break
    case 3:
      elCell.style.color = 'red'
      break
    case 4:
      elCell.style.color = 'darkblue'
      break
    case 5:
      elCell.style.color = 'darkred'
    default:
      elCell.style.color = 'black' // For 0 or any other case
      break
  }
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

// Helper function to uncover a cell and its neighbors recursively
function expandUncover(board, elCell, i, j) {
  const clickedCell = board[i * gLevel.size + j] // Get the cell based on its index
  if (clickedCell.isCovered && !clickedCell.isMine) {
    elCell.textContent = clickedCell.minesAroundCount > 0 ? clickedCell.minesAroundCount : ''
    clickedCell.isCovered = false // Mark this cell as uncovered

    // If the cell has no mines around, uncover its neighbors
    if (clickedCell.minesAroundCount === 0) {
      elCell.style.backgroundColor = 'rgb(207, 205, 205)'
      uncoverNeighbors(board, i, j)
    }else {
      // Set the number color for non-empty cells
      setNumberColor(elCell, clickedCell.minesAroundCount);
    }
  }
}

// Function to uncover all neighbors of a given cell
function uncoverNeighbors(board, i, j) {
  for (let row = i - 1; row <= i + 1; row++) {
    for (let col = j - 1; col <= j + 1; col++) {
      if (row >= 0 && row < gLevel.size && col >= 0 && col < gLevel.size) {
        const index = row * gLevel.size + col
        const neighborCell = board[index]
        const neighborCellEl = document.querySelector(`.grid-item[data-index="${index}"]`)
        
        // Avoid processing out-of-bounds or already uncovered cells
        if (neighborCell && neighborCell.isCovered && !neighborCell.isMine) {
          expandUncover(board, neighborCellEl, row, col) // Recursively uncover neighbors
        }
      }
    }
  }
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
      elCell.addEventListener('click', () => handleClick(index, elCell))

      // Add event listener for right-click (contextmenu) to mark the cell
      elCell.addEventListener('contextmenu', (event) => {
        event.preventDefault() // Prevent the default right-click menu
        onCellMarked(elCell, index) // Mark or unmark the cell
      });

      // Append the cell to the row
      tr.appendChild(elCell)
    }

    // Append the row to the table
    table.appendChild(tr)
  }

  // Append the table to the board
  board.appendChild(table)
}

// Get random unique indexes for mines
function getRandomIndexes(count, max) {
  const indexes = new Set()
  
  while (indexes.size < count) {
    indexes.add(Math.floor(Math.random() * max))
  }
  
  return [...indexes]
}

// Update the display for the player's remaining lives
function updateLivesDisplay() {
  const livesDisplay = document.querySelector('.lives')
  if (livesDisplay) {
    livesDisplay.textContent = `Lives: ${gGame.lives}`
  }
}

// Game Over function
function gameOver() {

      gGame.gameOver = true
      
      // Log to check if the interval is cleared
      console.log("Stopping the timer...")
      if (gInterval) {
        clearInterval(gInterval)
        gInterval = null  // Reset the interval
        console.log("Timer stopped!")
      }

       // Stop the timer and update the display

      uncoverAllCells() // Uncover all cells
      showGameOverMessage()  // Show game over message
      disableCellClicks() // Disable further clicks
      stopTimer() 
    
    
}

function showGameOverMessage() {
  console.log("Displaying Game Over Message")  // Debugging line

  const gameOverMessage = document.createElement('div')
  gameOverMessage.classList.add('game-over-message')
  gameOverMessage.innerHTML = `
    <h2>Game Over!</h2>
    <p>You have lost all your lives.</p>
    <p><strong>Time: ${Math.floor((Date.now() - gStartTime) / 1000)}s</strong></p>
    <button onclick="restartGame()">Restart</button>
  `

  document.body.appendChild(gameOverMessage)  // Append the message
}


function restartGame() {
  // Reset game state and board for a new game
  gGame = {
    isOn: false,
    coveredCount: 0,
    markedCount: 0,
    secsPassed: 0,
  };
  
  firstClick = true
  mineIndexes = []
  gBoard = createBoard()
  
  renderBoard()  // Re-render the board
  startTimer()  // Restart the timer
  
  // Remove the game over message from the screen
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
        cell.textContent = '💣'  // Show a bomb if it's a mine
      } else {
        const mineCount = clickedCell.minesAroundCount
        if (mineCount > 0) {
          cell.textContent = mineCount  // Show the number of surrounding mines
          setNumberColor(cell, mineCount)  // Set the number's color
        }
      }
      cell.classList.add('uncovered')  // Optional: Add a class for styling
    }
  })
}

// Disable all cell clicks (to prevent interaction after game over)
function disableCellClicks() {
  const cells = document.querySelectorAll('.grid-item')
  cells.forEach(cell => {
    cell.removeEventListener('click', handleClick)
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

// Function to start a new game
function startNewGame() {
  // Reset the game state
  gGame.lives = 3
  gGame.gameOver = false
  gGame.secsPassed = 0
  updateLivesDisplay() // Update the lives display
  
  // Reset the board and mines
  renderBoard()
  startTimer()
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
    if(gLevel.size === '12') gLevel.mines = 32
    console.log(gLevel.size)
    console.log(gLevel.mines)

    onInitGame()
}



function updateTime() {
  const currentTime = Date.now()
  const elapsedTime = currentTime - gStartTime

  const seconds = Math.floor(elapsedTime / 1000)  // Convert to seconds

  const elTimer = document.querySelector('.timer')
  if (elTimer) {
    elTimer.textContent = `Time: ${seconds}s`  // Update timer display
  }
}

function startTimer() {
  console.log("Starting timer...")

  if (gInterval) {
    console.log("Timer is already running, skipping start.")
    return  // Skip starting the timer if it’s already running
  }

  gStartTime = Date.now()
  gInterval = setInterval(updateTime, 1000) // Start the timer
  console.log("Timer started")
}

function stopTimer() {
  console.log("Stopping timer...")
  
  if (gInterval) {
    clearInterval(gInterval)  // Stop the timer
    gInterval = null  // Set gInterval to null to ensure it doesn’t restart
    console.log("Timer stopped successfully.")
  } else {
    console.log("No timer is running.")
  }
}
