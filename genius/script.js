// Variáveis de estado do jogo
let sequence = [];
let playerSequence = [];
let score = 0;
let highScore = localStorage.getItem('geniusHighScore') || 0;
let isPlayerTurn = false;

// Elementos do DOM
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const messageArea = document.getElementById('message-area');
const btnStart = document.getElementById('btn-start');
const colorButtons = document.querySelectorAll('.color-btn');
const geniusBoard = document.querySelector('.genius-board');

// Exibe o recorde inicial salvo no localStorage
highScoreDisplay.innerText = highScore;

// Mapeamento de sons (Frequências em Hz para Web Audio API)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const frequencies = [329.63, 261.63, 220.00, 164.81]; // Verde, Vermelho, Amarelo, Azul

// Função para tocar som (Desafio)
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

// Inicia o Jogo
btnStart.addEventListener('click', startGame);

function startGame() {
    sequence = [];
    playerSequence = [];
    score = 0;
    updateScore();
    btnStart.style.display = 'none'; // Esconde o botão durante o jogo
    messageArea.innerText = 'Observe a sequência...';
    messageArea.classList.remove('game-over-text');
    
    nextRound();
}

// Lógica de avanço de rodada
function nextRound() {
    playerSequence = [];
    isPlayerTurn = false;
    geniusBoard.classList.add('unclickable'); // Bloqueia cliques do jogador
    
    // Sorteia nova cor (0 a 3) e adiciona à sequência
    const randomColor = Math.floor(Math.random() * 4);
    sequence.push(randomColor);
    
    updateScore();
    playSequence();
}

// Reproduz a sequência gerada pelo computador
function playSequence() {
    let delay = 0;
    
    sequence.forEach((colorIndex, index) => {
        setTimeout(() => {
            lightUpButton(colorIndex);
        }, delay);
        
        delay += 800; // Tempo entre as luzes (800ms)
    });
    
    // Libera para o jogador clicar após a sequência terminar
    setTimeout(() => {
        messageArea.innerText = 'Sua vez!';
        isPlayerTurn = true;
        geniusBoard.classList.remove('unclickable');
    }, delay - 300);
}

// Acende o botão e toca som
function lightUpButton(colorIndex) {
    const btn = document.querySelector(`.color-btn[data-color="${colorIndex}"]`);
    btn.classList.add('active');
    playSound(colorIndex);
    
    setTimeout(() => {
        btn.classList.remove('active');
    }, 400); // Tempo que a luz fica acesa
}

// Clique do jogador
colorButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        if (!isPlayerTurn) return;
        
        const colorIndex = parseInt(e.target.getAttribute('data-color'));
        lightUpButton(colorIndex);
        playerSequence.push(colorIndex);
        
        checkPlayerMove(playerSequence.length - 1);
    });
});

// Verifica se o jogador acertou a sequência até o momento
function checkPlayerMove(currentMoveIndex) {
    if (playerSequence[currentMoveIndex] !== sequence[currentMoveIndex]) {
        gameOver();
        return;
    }
    
    // Se o jogador terminou a sequência da rodada corretamente
    if (playerSequence.length === sequence.length) {
        isPlayerTurn = false;
        geniusBoard.classList.add('unclickable');
        messageArea.innerText = 'Muito bem! Próxima rodada...';
        
        setTimeout(() => {
            nextRound();
        }, 1000);
    }
}

// Fim de jogo e salvamento do recorde
function gameOver() {
    messageArea.innerText = 'Você errou! Fim de jogo.';
    messageArea.classList.add('game-over-text');
    geniusBoard.classList.add('unclickable');
    
    // Verifica e salva o High Score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('geniusHighScore', highScore);
        highScoreDisplay.innerText = highScore;
        messageArea.innerText = 'Novo Recorde! Fim de jogo.';
    }
    
    // Efeito de erro visual (piscar a tela)
    document.body.style.backgroundColor = '#c0392b';
    setTimeout(() => document.body.style.backgroundColor = '#1e272e', 300);
    
    // Mostra o botão Iniciar/Reiniciar
    btnStart.innerText = 'REINICIAR';
    btnStart.style.display = 'block';
}

function updateScore() {
    // A pontuação é igual ao número da rodada (tamanho da sequência)
    score = sequence.length > 0 ? sequence.length : 0;
    scoreDisplay.innerText = score;
}