let sequence = [];
let playerSequence = [];
let score = 0;
let highScore = localStorage.getItem('geniusHighScore') || 0;
let isPlayerTurn = false;

const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const messageArea = document.getElementById('message-area');
const btnStart = document.getElementById('btn-start');
const colorButtons = document.querySelectorAll('.color-btn');
const geniusBoard = document.querySelector('.genius-board');

highScoreDisplay.innerText = highScore;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const frequencies = [329.63, 261.63, 220.00, 164.81]; 
function playSound(colorIndex) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequencies[colorIndex];
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
    oscillator.stop(audioCtx.currentTime + 0.5);
}

btnStart.addEventListener('click', startGame);

function startGame() {
    sequence = [];
    playerSequence = [];
    score = 0;
    updateScore();
    btnStart.style.display = 'none'; 
    messageArea.innerText = 'Observe a sequência...';
    messageArea.classList.remove('game-over-text');
    
    nextRound();
}

function nextRound() {
    playerSequence = [];
    isPlayerTurn = false;
    geniusBoard.classList.add('unclickable'); 
    
    const randomColor = Math.floor(Math.random() * 4);
    sequence.push(randomColor);
    
    updateScore();
    playSequence();
}


function playSequence() {
    let delay = 0;
    
    sequence.forEach((colorIndex, index) => {
        setTimeout(() => {
            lightUpButton(colorIndex);
        }, delay);
        
        delay += 800; 
    });
    
   
    setTimeout(() => {
        messageArea.innerText = 'Sua vez!';
        isPlayerTurn = true;
        geniusBoard.classList.remove('unclickable');
    }, delay - 300);
}

function lightUpButton(colorIndex) {
    const btn = document.querySelector(`.color-btn[data-color="${colorIndex}"]`);
    btn.classList.add('active');
    playSound(colorIndex);
    
    setTimeout(() => {
        btn.classList.remove('active');
    }, 400); 
}

colorButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        if (!isPlayerTurn) return;
        
        const colorIndex = parseInt(e.target.getAttribute('data-color'));
        lightUpButton(colorIndex);
        playerSequence.push(colorIndex);
        
        checkPlayerMove(playerSequence.length - 1);
    });
});

function checkPlayerMove(currentMoveIndex) {
    if (playerSequence[currentMoveIndex] !== sequence[currentMoveIndex]) {
        gameOver();
        return;
    }
    
    if (playerSequence.length === sequence.length) {
        isPlayerTurn = false;
        geniusBoard.classList.add('unclickable');
        messageArea.innerText = 'Muito bem! Próxima rodada...';
        
        setTimeout(() => {
            nextRound();
        }, 1000);
    }
}

function gameOver() {
    messageArea.innerText = 'Você errou! Fim de jogo.';
    messageArea.classList.add('game-over-text');
    geniusBoard.classList.add('unclickable');
    
   
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('geniusHighScore', highScore);
        highScoreDisplay.innerText = highScore;
        messageArea.innerText = 'Novo Recorde! Fim de jogo.';
    }

    document.body.style.backgroundColor = '#c0392b';
    setTimeout(() => document.body.style.backgroundColor = '#1e272e', 300);
    
    
    btnStart.innerText = 'REINICIAR';
    btnStart.style.display = 'block';
}

function updateScore() {
    score = sequence.length > 0 ? sequence.length : 0;
    scoreDisplay.innerText = score;
}