let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameMode = "";
let gameActive = true;

const boardElement = document.getElementById("board");
const statusText = document.getElementById("status");

const winConditions = [
  [0,1,2],
  [3,4,5],
  [6,7,8],
  [0,3,6],
  [1,4,7],
  [2,5,8],
  [0,4,8],
  [2,4,6]
];

function startGame(mode){
  gameMode = mode;
  document.getElementById("menu").style.display = "none";
  document.getElementById("game").style.display = "block";
  createBoard();
  updateStatus();
}

function createBoard(){
  boardElement.innerHTML = "";

  board.forEach((cell, index) => {
    const div = document.createElement("div");
    div.classList.add("cell");
    div.dataset.index = index;
    div.addEventListener("click", handleClick);
    div.innerText = cell;
    boardElement.appendChild(div);
  });
}

function handleClick(e){
  const index = e.target.dataset.index;

  if(board[index] !== "" || !gameActive) return;

  board[index] = currentPlayer;
  updateBoard();

  if(checkWin()){
    statusText.innerText = `Jogador ${currentPlayer} venceu!`;
    gameActive = false;
    return;
  }

  if(board.every(cell => cell !== "")){
    statusText.innerText = "Empate!";
    gameActive = false;
    return;
  }

  changePlayer();

  if(gameMode === "solo" && currentPlayer === "O"){
    setTimeout(cpuMove, 500);
  }
}

function cpuMove(){
  let empty = board
    .map((v,i) => v === "" ? i : null)
    .filter(v => v !== null);

  let random = empty[Math.floor(Math.random() * empty.length)];

  board[random] = "O";
  updateBoard();

  if(checkWin()){
    statusText.innerText = "CPU venceu!";
    gameActive = false;
    return;
  }

  if(board.every(cell => cell !== "")){
    statusText.innerText = "Empate!";
    gameActive = false;
    return;
  }

  changePlayer();
}

function changePlayer(){
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatus();
}

function updateStatus(){
  statusText.innerText = `Vez do jogador ${currentPlayer}`;
}

function updateBoard(){
  createBoard();
}

function checkWin(){
  return winConditions.some(condition => {
    return condition.every(i => board[i] === currentPlayer);
  });
}

function resetGame(){
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  createBoard();
  updateStatus();
}