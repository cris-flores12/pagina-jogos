const colors = ["green","red","yellow","blue"];

let sequence = [];
let playerSequence = [];
let player = 1;
let canClick = false;

let score = {1:0, 2:0};

const status = document.getElementById("status");
const scoreBox = document.getElementById("score");
const bestBox = document.getElementById("best");

// 🔊 Sons (um para cada cor)
const sounds = {
  green: new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg"),
  red: new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"),
  yellow: new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"),
  blue: new Audio("https://actions.google.com/sounds/v1/cartoon/boing.ogg")
};

document.getElementById("start").onclick = startGame;

document.querySelectorAll(".color").forEach(c=>{
  c.onclick = () => {
    if(!canClick) return;

    const color = c.dataset.color;
    playerSequence.push(color);

    playSound(color);
    flash(c);

    checkMove();
  };
});

function startGame(){
  sequence = [];
  playerSequence = [];
  player = 1;
  score = {1:0,2:0};

  updateScore();
  nextRound();
}

function nextRound(){
  playerSequence = [];
  status.innerText = `Jogador ${player} jogando`;

  const next = colors[Math.floor(Math.random()*colors.length)];
  sequence.push(next);

  showSequence();
}

function showSequence(){
  canClick = false;
  let i = 0;

  const interval = setInterval(()=>{
    const color = sequence[i];
    const pad = document.querySelector(`[data-color="${color}"]`);

    flash(pad);
    playSound(color);

    i++;

    if(i >= sequence.length){
      clearInterval(interval);
      canClick = true;
    }
  },700);
}

function flash(pad){
  pad.classList.add("active");
  setTimeout(()=>pad.classList.remove("active"),300);
}

function playSound(color){
  sounds[color].currentTime = 0;
  sounds[color].play();
}

function checkMove(){
  let i = playerSequence.length - 1;

  if(playerSequence[i] !== sequence[i]){
    status.innerText = `❌ Jogador ${player} perdeu!`;

    saveBest();
    canClick = false;
    return;
  }

  if(playerSequence.length === sequence.length){
    score[player]++;
    updateScore();

    player = player === 1 ? 2 : 1;
    setTimeout(nextRound,1000);
  }
}

function updateScore(){
  scoreBox.innerText = `Jogador 1: ${score[1]} | Jogador 2: ${score[2]}`;
}

function saveBest(){
  let best = localStorage.getItem("genius_best") || 0;
  let max = Math.max(score[1], score[2]);

  if(max > best){
    localStorage.setItem("genius_best", max);
    best = max;
  }

  bestBox.innerText = `🏆 Melhor pontuação: ${best}`;
}