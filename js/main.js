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
 
startTimer()
renderBoard()


}

var firstClick = true
var mineIndexes = []

// Create the board with empty cells
function createBoard() {
  const size = gLevel.size
  const board = []

  for (let i = 0; i < size * size; i++) {
    board.push({
      isMine: false,
      minesAroundCount: 0,
      isCovered: true,  // Initially covered
      isMarked: false,
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


// // Rendering the board
// function renderBoard() {
//   const board = document.querySelector('.board')
//   board.innerHTML = '' // Clear any existing board

//   const table = document.createElement('table')
//   table.classList.add('game-table')

//   // Loop through rows and columns to create the grid
//   for (let row = 0; row < gLevel.size; row++) {
//     const tr = document.createElement('tr')
    
//     for (let col = 0; col < gLevel.size; col++) {
//       const td = document.createElement('td')
//       td.classList.add('grid-item');
//       td.textContent = '' // Empty initially

//       const index = row * gLevel.size + col; // Calculate index based on row/column

//       // Add event listener for clicks
//       td.addEventListener('click', () => handleClick(index, td))
//       tr.appendChild(td)
//     }
//     table.appendChild(tr)
//   }
  
//   board.appendChild(table)
// }


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


// // Handle cell click
// function handleClick(index, cell) {
//   if (firstClick) {
//     firstClick = false
//     mineIndexes = getRandomIndexes(gLevel.mines, gLevel.size * gLevel.size)
//     gBoard = createBoard()
//     placeMines()// Place mines on the board
//     setMinesNegsCount() // Set the mine counts for all cells
//   }

//   const clickedCell = gBoard[index]

//   // If it's a mine, display the bomb
//   if (clickedCell.isMine) {
//     console.log('Mine hit!')
//     cell.textContent = '💣'  // Display a bomb if it's a mine
//   } else {
//     console.log('Safe click')
//     const mineCount = clickedCell.minesAroundCount

//     if (mineCount > 0) {
//       // Display the number of mines around the cell
//       cell.textContent = mineCount

//             // Apply different colors based on the mine count
//             if (mineCount === 1) {
//               cell.style.color = 'blue'  // Blue for 1
//             } else if (mineCount === 2) {
//               cell.style.color = 'green'  // Green for 2
//             } else if (mineCount === 3) {
//               cell.style.color = 'red'  // Red for 3
//             } else if (mineCount === 4) {
//               cell.style.color = 'darkblue'  // Dark blue for 4
//             } else {
//               cell.style.color = '' // Default color for other numbers (e.g., 5, 6, etc.)
//             }

//     } else {
//       // If no mines are around, leave the cell empty
//       cell.textContent = 0
//     }
//   }

//   // Mark the cell as revealed
//   clickedCell.isCovered = false
// }

// Handle cell click with class-based color
function handleClick(index, elCell) {
  
  if (firstClick) {
    firstClick = false
    mineIndexes = getRandomIndexes(gLevel.mines, gLevel.size * gLevel.size)
    gBoard = createBoard()
    placeMines() // Place mines on the board
    setMinesNegsCount() // Set the mine counts for all cells
  }

  const clickedCell = gBoard[index]

  // If it's a mine, display the bomb
  if (clickedCell.isMine) {
    console.log('Mine hit!')
    elCell.textContent = '💣'  // Display a bomb if it's a mine
  } else {
    console.log('Safe click')
    const mineCount = clickedCell.minesAroundCount

    if (mineCount > 0) {
      // Display the number of mines around the cell
      elCell.textContent = mineCount
      setNumberColor(elCell, mineCount)
      
      // Apply CSS classes based on the number
     // elCell.classList.remove('blue-number', 'green-number', 'red-number', 'darkblue-number') // Remove any previous color classes
      
      // if (mineCount === 1) {
      //   elCell.classList.add('blue-number')
      // } else if (mineCount === 2) {
      //   elCell.classList.add('green-number')
      // } else if (mineCount === 3) {
      //   elCell.classList.add('red-number')
      // } else if (mineCount === 4) {
      //   elCell.classList.add('darkblue-number')
      // } else if (mineCount === 5) {
      //   elCell.classList.add('darkred-number')
      // }
    } else {
      // If no mines are around, uncover the cell and expand uncovering to neighbors
      expandUncover(gBoard, elCell, Math.floor(index / gLevel.size), index % gLevel.size)  }
}

  // Mark the cell as revealed
  clickedCell.isCovered = false
}

// Function to set the color of the number based on the surrounding mines count
function setNumberColor(elCell, number) {
  switch (number) {
    case 1:
      elCell.style.color = 'blue'
      break;
    case 2:
      elCell.style.color = 'green'
      break;
    case 3:
      elCell.style.color = 'red'
      break;
    case 4:
      elCell.style.color = 'darkblue'
      break;
    case 5:
      elCell.style.color = 'darkred'
    default:
      elCell.style.color = 'black' // For 0 or any other case
      break;
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
  board.innerHTML = ''; // Clear any existing board

  const table = document.createElement('table')
  table.classList.add('game-table')

  // Loop through rows and columns to create the grid
  for (let row = 0; row < gLevel.size; row++) {
    const tr = document.createElement('tr')
    
    for (let col = 0; col < gLevel.size; col++) {
      const elCell = document.createElement('td') // Create the cell (elCell)
      elCell.classList.add('grid-item'); // Add the CSS class for styling
      elCell.setAttribute('data-index', row * gLevel.size + col) // Set the index attribute

      // Initially set the cell's background color to the covered state (if necessary)
      //elCell.style.backgroundColor = 'gray'; // All cells are initially covered

      // Add event listener for left-click (click) to reveal the cell
      elCell.addEventListener('click', () => handleClick(row * gLevel.size + col, elCell))

      // Add event listener for right-click (contextmenu) to mark the cell
      elCell.addEventListener('contextmenu', (event) => {
        event.preventDefault(); // Prevent the default right-click menu
        onCellMarked(elCell, row * gLevel.size + col) // Mark or unmark the cell
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

// // Rendering the board
// function renderBoard() {
//   const board = document.querySelector('.board')
//   board.innerHTML = '' // Clear any existing board

//   const table = document.createElement('table')
//   table.classList.add('game-table')

//   // Loop through rows and columns to create the grid
//   for (let row = 0; row < gLevel.size; row++) {
//     const tr = document.createElement('tr')
    
//     for (let col = 0; col < gLevel.size; col++) {
//       const td = document.createElement('td')
//       td.classList.add('grid-item')
//       td.textContent = '' // Empty initially

//       const index = row * gLevel.size + col // Calculate index based on row/column

//       // Left-click (standard click)
//       td.addEventListener('click', () => handleClick(index, td))

//       // Right-click (context menu - flag the cell)
//       td.addEventListener('contextmenu', (event) => {
//         event.preventDefault() // Prevent the default context menu from showing
//         onCellMarked(td, index) // Mark or unmark the cell
//       });

//       tr.appendChild(td)
//     }
//     table.appendChild(tr)
//   }
  
//   board.appendChild(table)
// }


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
  gGame.gameOver = true // Mark the game as over
  alert('Game Over! You lost all your lives.'); // Show a game over message
  
  // Optionally, disable further clicks on the board
  const cells = document.querySelectorAll('.grid-item')
  cells.forEach(cell => cell.removeEventListener('click', handleClick))
  cells.forEach(cell => cell.removeEventListener('contextmenu', (event) => event.preventDefault()))

  // Stop the timer if needed
  clearInterval(gInterval)
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
  gGame.lives = 3;
  gGame.gameOver = false;
  gGame.secsPassed = 0;
  updateLivesDisplay(); // Update the lives display
  
  // Reset the board and mines
  renderBoard();
  startTimer();
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

