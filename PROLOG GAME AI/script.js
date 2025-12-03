const boardElement = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const mode2PlayerBtn = document.getElementById('mode-2player');
const modeRobotBtn = document.getElementById('mode-robot');
const winningLine = document.getElementById('winning-line');
const modal = document.getElementById('winner-modal');
const winnerTitle = document.getElementById('winner-title');
const winnerMessage = document.getElementById('winner-message');
const newGameBtn = document.getElementById('new-game-btn');

let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = true;
let mode = '2player'; // '2player' or 'robot'

// Winning combinations
const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.getAttribute('data-index'));

    if (board[index] !== null || !gameActive) {
        return;
    }

    // Human move
    makeMove(index, currentPlayer);

    if (checkWin() || checkDraw()) {
        return;
    }

    // Switch turn
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();

    // Robot move if applicable
    if (mode === 'robot' && currentPlayer === 'O' && gameActive) {
        makeRobotMove();
    }
}

function makeMove(index, player) {
    board[index] = player;
    const cell = cells[index];
    cell.textContent = player;
    cell.classList.add(player.toLowerCase());
}

function updateStatus() {
    statusElement.textContent = `Player ${currentPlayer}'s Turn`;
}

function checkWin() {
    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            gameActive = false;
            showWin(board[a], i);
            return true;
        }
    }
    return false;
}

function checkDraw() {
    if (!board.includes(null)) {
        statusElement.textContent = "It's a Draw!";
        gameActive = false;
        showModal("It's a Draw!", "No one wins this round.");
        return true;
    }
    return false;
}

function showWin(winner, conditionIndex) {
    statusElement.textContent = `Player ${winner} Wins!`;
    drawWinningLine(conditionIndex);

    // Confetti
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
    });

    setTimeout(() => {
        showModal(`${winner} Wins!`, `Player ${winner} takes the victory!`);
    }, 1000);
}

function drawWinningLine(conditionIndex) {
    const [a, b, c] = winConditions[conditionIndex];
    const cellA = cells[a];
    const cellC = cells[c];

    // Calculate positions relative to the board
    const boardRect = boardElement.getBoundingClientRect();
    const rectA = cellA.getBoundingClientRect();
    const rectC = cellC.getBoundingClientRect();

    const x1 = rectA.left - boardRect.left + rectA.width / 2;
    const y1 = rectA.top - boardRect.top + rectA.height / 2;
    const x2 = rectC.left - boardRect.left + rectC.width / 2;
    const y2 = rectC.top - boardRect.top + rectC.height / 2;

    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    winningLine.style.width = `${length}px`;
    winningLine.style.transform = `rotate(${angle}deg)`;
    winningLine.style.top = `${y1}px`;
    winningLine.style.left = `${x1}px`;
    winningLine.style.display = 'block';

    // Animate line
    winningLine.animate([
        { width: '0px' },
        { width: `${length}px` }
    ], {
        duration: 300,
        easing: 'ease-out',
        fill: 'forwards'
    });
}

function showModal(title, message) {
    winnerTitle.textContent = title;
    winnerMessage.textContent = message;
    modal.classList.add('show');
}

function hideModal() {
    modal.classList.remove('show');
}

async function makeRobotMove() {
    statusElement.textContent = "Robot is thinking...";
    const thinkingOverlay = document.getElementById('thinking-overlay');
    if (thinkingOverlay) thinkingOverlay.classList.add('active');

    try {
        const response = await fetch('/move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ board: board })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const newBoard = data.board;

        // Find the move made by the robot
        let moveIndex = -1;
        for (let i = 0; i < 9; i++) {
            if (board[i] !== newBoard[i]) {
                moveIndex = i;
                break;
            }
        }

        if (moveIndex !== -1) {
            // Artificial delay for realism
            setTimeout(() => {
                if (thinkingOverlay) thinkingOverlay.classList.remove('active');
                makeMove(moveIndex, 'O');
                if (checkWin() || checkDraw()) {
                    return;
                }
                currentPlayer = 'X';
                updateStatus();
            }, 800);
        } else {
            if (thinkingOverlay) thinkingOverlay.classList.remove('active');
        }

    } catch (error) {
        console.error('Error:', error);
        statusElement.textContent = "Error connecting to robot server.";
        if (thinkingOverlay) thinkingOverlay.classList.remove('active');
    }
}

function resetGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    gameActive = true;
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });
    winningLine.style.display = 'none';
    hideModal();
    updateStatus();
}

function setMode(newMode) {
    mode = newMode;
    if (mode === '2player') {
        mode2PlayerBtn.classList.add('active');
        modeRobotBtn.classList.remove('active');
    } else {
        mode2PlayerBtn.classList.remove('active');
        modeRobotBtn.classList.add('active');
    }
    resetGame();
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', resetGame);
newGameBtn.addEventListener('click', resetGame);
mode2PlayerBtn.addEventListener('click', () => setMode('2player'));
modeRobotBtn.addEventListener('click', () => setMode('robot'));

updateStatus();
