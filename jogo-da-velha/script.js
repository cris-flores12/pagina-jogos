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
            element.innerHTML = `<p class="no-data">Nenhum registro ainda.</p>`;
            return;
        }

        element.innerHTML = `
            <table class="ranking-table">
                <thead><tr><th>Nº</th><th>Nome</th><th>Modo</th><th>Resultado</th></tr></thead>
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

const JogoDaVelha = {
    state: { board: Array(9).fill(""), currentPlayer: "X", isActive: true, mode: "solo" },
    winPatterns: [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]],
    init() { this.cacheDOM(); this.bindEvents(); this.updateScoreboard(); },
    cacheDOM() {
        this.dom = {
            cells: document.querySelectorAll('.cell'), status: document.getElementById('status-text'),
            btnSolo: document.getElementById('btn-solo'), btnMulti: document.getElementById('btn-multi'),
            btnReset: document.getElementById('reset-btn'), playerName: document.getElementById('player-name'),
            rankingContainer: document.getElementById('velha-ranking-container')
        };
    },
    bindEvents() {
        this.dom.cells.forEach(cell => cell.addEventListener('click', () => this.handleCellClick(cell)));
        this.dom.btnSolo.addEventListener('click', () => this.switchMode('solo'));
        this.dom.btnMulti.addEventListener('click', () => this.switchMode('multi'));
        this.dom.btnReset.addEventListener('click', () => this.resetGame());
    },
    switchMode(mode) {
        this.state.mode = mode;
        this.dom.btnSolo.classList.toggle('active', mode === 'solo');
        this.dom.btnMulti.classList.toggle('active', mode === 'multi');
        this.resetGame();
    },
    handleCellClick(cell) {
        const index = cell.dataset.index;
        if (this.state.board[index] !== "" || !this.state.isActive) return;
        this.executeMove(index, this.state.currentPlayer);
        if (this.checkEndConditions()) return;
        if (this.state.mode === 'solo') {
            this.state.isActive = false; this.dom.status.innerText = "CPU pensando...";
            setTimeout(() => this.executeCPUMove(), 400);
        } else {
            this.state.currentPlayer = this.state.currentPlayer === "X" ? "O" : "X";
            this.dom.status.innerText = `Turno de: ${this.state.currentPlayer}`;
        }
    },
    executeMove(index, player) {
        this.state.board[index] = player;
        this.dom.cells[index].innerText = player;
        this.dom.cells[index].style.color = player === "X" ? "#3b82f6" : "#ef4444";
    },
    executeCPUMove() {
        const available = this.state.board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
        if (available.length > 0 && !this.state.isActive) {
            this.state.isActive = true;
            this.executeMove(available[Math.floor(Math.random() * available.length)], "O");
            if (!this.checkEndConditions()) {
                this.state.currentPlayer = "X"; this.dom.status.innerText = `Turno de: X`;
            }
        }
    },
    checkEndConditions() {
        const name = this.dom.playerName.value.trim() || 'Anônimo';
        const currentLabel = this.state.mode === 'solo' ? 'vs CPU' : 'Multiplayer';

        for (let pattern of this.winPatterns) {
            const [a, b, c] = pattern;
            if (this.state.board[a] && this.state.board[a] === this.state.board[b] && this.state.board[a] === this.state.board[c]) {
                const winner = this.state.board[a];
                this.dom.status.innerText = `🏆 Vitória do "${winner}"!`;
                pattern.forEach(idx => this.dom.cells[idx].classList.add('winning'));
                StorageManager.saveToRanking('velha_records', { name: name, mode: currentLabel, score: `Vitória (${winner})` });
                this.state.isActive = false; this.updateScoreboard(); return true;
            }
        }
        if (!this.state.board.includes("")) {
            this.dom.status.innerText = "🤝 Empate!";
            StorageManager.saveToRanking('velha_records', { name: name, mode: currentLabel, score: 'Empate' });
            this.state.isActive = false; this.updateScoreboard(); return true;
        }
        return false;
    },
    updateScoreboard() { StorageManager.renderRankingTable('velha_records', 'velha-ranking-container'); },
    resetGame() {
        this.state.board.fill(""); this.state.currentPlayer = "X"; this.state.isActive = true;
        this.dom.status.innerText = "Turno de: X";
        this.dom.cells.forEach(cell => { cell.innerText = ""; cell.classList.remove('winning'); });
        this.updateScoreboard();
    }
};
document.addEventListener('DOMContentLoaded', () => JogoDaVelha.init());