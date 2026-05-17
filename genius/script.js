const AudioManager = {
    ctx: null,
    init() {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },
    playTone(frequency, type = 'sine', duration = 0.4) {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.frequency.value = frequency; osc.type = type;
        osc.start();
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.stop(this.ctx.currentTime + duration);
    }
};

const StorageManager = {
    get(key, defaultValue = null) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    saveToRanking(gameKey, entry, reverseOrder = false) {
        const ranking = this.get(gameKey, []);
        ranking.push({ ...entry });
        if (reverseOrder) ranking.sort((a, b) => a.score - b.score);
        else ranking.sort((a, b) => b.score - a.score);
        this.set(gameKey, ranking.slice(0, 5));
    },
    renderRankingTable(gameKey, elementId) {
        const ranking = this.get(gameKey, []);
        const element = document.getElementById(elementId);
        if (!element) return;

        if (ranking.length === 0) {
            element.innerHTML = `<p class="no-data">Nenhum recorde registrado ainda.</p>`;
            return;
        }

        element.innerHTML = `
            <table class="ranking-table">
                <thead><tr><th>Pos</th><th>Nome</th><th>Modo</th><th>Placar</th></tr></thead>
                <tbody>
                    ${ranking.map((item, index) => `
                        <tr>
                            <td><strong>${index + 1}º</strong></td>
                            <td>${item.name || 'Anônimo'}</td>
                            <td>${item.mode}</td>
                            <td>${item.score}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;
    }
};

class GeniusGame {
    constructor() {
        this.gameSequence = []; this.playerSequence = [];
        this.round = 0; this.isPlayerTurn = false;
        this.gameMode = 'solo'; this.currentPlayer = 1;
        this.multiScores = { p1: 0, p2: 0 };
        this.frequencies = { green: 261.63, red: 329.63, yellow: 392.00, blue: 523.25 };
        this.initDOM(); this.bindEvents(); this.updateUI();
    }
    initDOM() {
        this.dom = {
            btnSolo: document.getElementById('btn-solo'), btnMulti: document.getElementById('btn-multi'),
            startBtn: document.getElementById('start-btn'), roundDisplay: document.getElementById('current-round'),
            highScoreDisplay: document.getElementById('high-score'), msgDisplay: document.getElementById('msg-display'),
            rankingContainer: document.getElementById('genius-ranking-container'),
            playerName: document.getElementById('player-name'), colorBtns: document.querySelectorAll('.genius-btn')
        };
    }
    bindEvents() {
        this.dom.btnSolo.addEventListener('click', () => this.setMode('solo'));
        this.dom.btnMulti.addEventListener('click', () => this.setMode('multi'));
        this.dom.startBtn.addEventListener('click', () => this.startGame());
        this.dom.colorBtns.forEach(btn => btn.addEventListener('click', (e) => this.handlePlayerClick(e.target.dataset.color)));
    }
    setMode(mode) {
        this.gameMode = mode;
        this.dom.btnSolo.classList.toggle('active', mode === 'solo');
        this.dom.btnMulti.classList.toggle('active', mode === 'multi');
        this.resetGame();
    }
    startGame() { this.resetGame(); this.dom.startBtn.disabled = true; this.nextRound(); }
    resetGame() {
        this.gameSequence = []; this.playerSequence = []; this.round = 0;
        this.isPlayerTurn = false; this.currentPlayer = 1; this.multiScores = { p1: 0, p2: 0 };
        this.dom.startBtn.disabled = false; this.updateUI();
    }
    nextRound() {
        this.playerSequence = []; this.round++; this.isPlayerTurn = false; this.updateUI();
        this.dom.msgDisplay.innerText = "Preste atenção...";
        const colors = ['green', 'red', 'yellow', 'blue'];
        this.gameSequence.push(colors[Math.floor(Math.random() * 4)]);
        this.playSequence();
    }
    playSequence() {
        let i = 0;
        const interval = setInterval(() => {
            this.flashColor(this.gameSequence[i]); i++;
            if (i >= this.gameSequence.length) {
                clearInterval(interval);
                setTimeout(() => { this.isPlayerTurn = true; this.dom.msgDisplay.innerText = "Sua vez!"; }, 400);
            }
        }, 600);
    }
    flashColor(color) {
        const btn = document.querySelector(`.${color}`); if (!btn) return;
        btn.classList.add('lit'); AudioManager.playTone(this.frequencies[color], 'sine', 0.3);
        setTimeout(() => btn.classList.remove('lit'), 350);
    }
    handlePlayerClick(color) {
        if (!this.isPlayerTurn) return;
        this.flashColor(color); this.playerSequence.push(color);
        this.checkInput(this.playerSequence.length - 1);
    }
    checkInput(index) {
        if (this.playerSequence[index] !== this.gameSequence[index]) { this.gameOver(); return; }
        if (this.playerSequence.length === this.gameSequence.length) {
            if (this.gameMode === 'multi') {
                if (this.currentPlayer === 1) this.multiScores.p1 = this.round;
                else this.multiScores.p2 = this.round;
            }
            setTimeout(() => this.nextRound(), 1000);
        }
    }
    gameOver() {
        AudioManager.playTone(130.00, 'sawtooth', 0.5);
        const name = this.dom.playerName.value.trim() || 'Anônimo';
        
        if (this.gameMode === 'solo') {
            this.dom.msgDisplay.innerText = `💥 Fim! Pontos: ${this.round - 1}`;
            StorageManager.saveToRanking('genius_records', { name: name, mode: 'Solo', score: this.round - 1 });
            this.dom.startBtn.disabled = false;
        } else {
            if (this.currentPlayer === 1) {
                this.dom.msgDisplay.innerText = "J1 errou! Vez do J2.";
                this.currentPlayer = 2; this.gameSequence = [];
                setTimeout(() => this.nextRound(), 1500);
            } else {
                const maxScore = Math.max(this.multiScores.p1, this.multiScores.p2) - 1;
                let msg = `J1: ${this.multiScores.p1 - 1} | J2: ${this.multiScores.p2 - 1}. `;
                this.dom.msgDisplay.innerText = msg;
                StorageManager.saveToRanking('genius_records', { name: name, mode: 'Multiplayer', score: maxScore });
                this.dom.startBtn.disabled = false;
            }
        }
        this.updateUI();
    }
    updateUI() {
        this.dom.roundDisplay.innerText = this.round;
        StorageManager.renderRankingTable('genius_records', 'genius-ranking-container');
        const records = StorageManager.get('genius_records', []);
        this.dom.highScoreDisplay.innerText = records[0] ? records[0].score : 0;
    }
}
document.addEventListener('DOMContentLoaded', () => new GeniusGame());