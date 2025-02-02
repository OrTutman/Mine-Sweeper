'use strict' 

function updateSmileyFace(state = 'normal') {
    const smileyBtn = document.querySelector('.smiley')
    
    if (state === 'scared') {
      smileyBtn.textContent = '🫣'// Scared face when the player click on mine
    } else if (state === 'happy') {
      smileyBtn.textContent = '😎'// Happy face when the player wins
    } else if (state === 'Dead') {
        smileyBtn.textContent = '🤯'// Dead face when the player LOSE   
    } else {
      smileyBtn.textContent = '🙂'// Normal face during the game
    }
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

  // Update the display for the player's remaining lives
  function updateLivesDisplay() {
    const livesDisplay = document.querySelector('.lives')
    if (livesDisplay) {
      livesDisplay.textContent = `Lives: ${gGame.lives}`
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
  
  
  function checkWinCondition() {
    let uncoveredCells = 0
    const totalCells = gLevel.size * gLevel.size
    const totalMines = gLevel.mines
  
    // Count uncovered safe cells (cells that are not mines)
    gBoard.forEach(cell => {
      if (!cell.isCovered && !cell.isMine) {
        uncoveredCells++
      }
    })
  
    // If the number of uncovered safe cells equals the total non-mine cells, player wins
    if (uncoveredCells === totalCells - totalMines) {
      gameOver(true)  // Player has won
    }
  }
  
  function gameOver(isWin) {
    if (gGame.gameOver) return // Prevent running gameOver more than once
  
    gGame.gameOver = true
  
    // Stop the timer
    if (gInterval) {
      clearInterval(gInterval)
      gInterval = null
    }
  
    // Uncover all cells
    uncoverAllCells()
  
    // Show win or lose message based on the game result
    if (isWin) {
      showWinMessage() 
      updateSmileyFace('happy')  
      playWinAudio()
    } else {
      showGameOverMessage() 
      updateSmileyFace('Dead') 
      playLoseAudio()
  
    // Disable further clicks to prevent any further interaction after game ends
    disableCellClicks()
  }
}
    // Function to uncover a cell and its neighbors recursively
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
        setNumberColor(elCell, clickedCell.minesAroundCount)
      }
    }
  }

  function showGameOverMessage() {
    const gameOverMessage = document.createElement('div')
    gameOverMessage.classList.add('game-over-message')
    gameOverMessage.innerHTML = `
      <h2>Game Over!</h2>
      <p>You have lost all your lives.</p>
      <p><strong>Time: ${Math.floor((Date.now() - gStartTime) / 1000)}s</strong></p>
      <button onclick="restartGame()">Restart</button>
    `
  
    document.body.appendChild(gameOverMessage)  // Display game over message
  }

  function showWinMessage() {
    const winMessage = document.createElement('div')
    winMessage.classList.add('game-over-message')
    winMessage.innerHTML = `
      <h2>You Win!</h2>
      <p>Congratulations! You found all the safe cells.</p>
      <p><strong>Time: ${Math.floor((Date.now() - gStartTime) / 1000)}s</strong></p>
      <button onclick="restartGame()">Restart</button>
    `
  
    document.body.appendChild(winMessage)  // Display win message
  }
  

  function onDifficultyClick(elBtn) {
    gLevel.size = parseInt(elBtn.dataset.size)
    if (gLevel.size === 4) gLevel.mines = 2
    if (gLevel.size === 8) gLevel.mines = 14
    if (gLevel.size === 12) gLevel.mines = 32
  
    console.log(gLevel.size)
    console.log(gLevel.mines)
  
    restartGame()  // Restart the game with the new difficulty
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
  
  function resetTimer() {
    clearInterval(gInterval)// Stop the current timer
    gStartTime = Date.now() // Reset the start time
    gInterval = null // Reset the interval
    document.querySelector('.timer').innerHTML = 'Time:0s' // Reset the display to 0
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

  function stopTimer() {
    clearInterval(gInterval) // Stop the timer
    gInterval = null
  }

  // Get random unique indexes for mines
  function getRandomIndexes(count, max) {
    const indexes = new Set()
    
    while (indexes.size < count) {
      indexes.add(Math.floor(Math.random() * max))
    }
    
    return [...indexes]
  }
  
  function playWinAudio() {
    const audioWin = new Audio(`audio/win.mp3`)
    audioWin.play()
}

function playLoseAudio() {
    const audioWin = new Audio(`audio/lose.mp3`)
    audioWin.play()
}