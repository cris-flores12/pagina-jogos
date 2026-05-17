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
                <thead><tr><th>Pos</th><th>Nome</th><th>Modo</th><th>Tentativas</th></tr></thead>
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

class AdivinhacaoGame {
    constructor() {
        this.secretNumber = null; this.attempts = 0; this.gameMode = 'solo';
        this.initDOM(); this.bindEvents(); this.updateRecordDisplay();
    }
    initDOM() {
        this.dom = {
            btnSolo: document.getElementById('btn-solo'), btnMulti: document.getElementById('btn-multi'),
            diffSection: document.getElementById('diff-section'), setupMulti: document.getElementById('setup-multiplayer'),
            rangeLabel: document.getElementById('range-label'), guessInput: document.getElementById('guess-input'),
            guessBtn: document.getElementById('guess-btn'), secretInput: document.getElementById('secret-input'),
            lockSecretBtn: document.getElementById('lock-secret-btn'), feedback: document.getElementById('feedback'),
            attemptCount: document.getElementById('attempt-count'), resetBtn: document.getElementById('reset-btn'),
            playerName: document.getElementById('player-name'), rankingContainer: document.getElementById('record-solo-container'),
            difficulty: document.getElementById('difficulty')
        };
    }
    bindEvents() {
        this.dom.btnSolo.addEventListener('click', () => this.switchMode('solo'));
        this.dom.btnMulti.addEventListener('click', () => this.switchMode('multi'));
        this.dom.resetBtn.addEventListener('click', () => this.initMatch());
        this.dom.lockSecretBtn.addEventListener('click', () => this.setMultiplayerSecret());
        this.dom.guessBtn.addEventListener('click', () => this.processGuess());
    }
    switchMode(mode) {
        this.gameMode = mode;
        this.dom.btnSolo.classList.toggle('active', mode === 'solo');
        this.dom.btnMulti.classList.toggle('active', mode === 'multi');
        this.dom.diffSection.classList.toggle('hidden', mode === 'multi');
        this.dom.setupMulti.classList.toggle('hidden', mode === 'solo');
        this.resetState();
    }
    resetState() {
        this.secretNumber = null; this.attempts = 0; this.dom.attemptCount.innerText = this.attempts;
        this.dom.guessInput.disabled = true; this.dom.guessBtn.disabled = true;
        this.dom.guessInput.value = ""; this.dom.secretInput.value = "";
        this.dom.feedback.innerText = "Aguardando início...";
    }
    initMatch() {
        this.resetState();
        if (this.gameMode === 'solo') {
            const maxRange = parseInt(this.dom.difficulty.value);
            this.secretNumber = Math.floor(Math.random() * maxRange) + 1;
            this.dom.rangeLabel.innerText = `Adivinhe entre 1 e ${maxRange}`;
            this.dom.guessInput.disabled = false; this.dom.guessBtn.disabled = false;
            this.dom.feedback.innerText = "Valendo!";
        }
    }
    setMultiplayerSecret() {
        const val = parseInt(this.dom.secretInput.value); if (isNaN(val) || val < 1) return;
        this.secretNumber = val; this.dom.rangeLabel.innerText = "J2 tenta adivinhar.";
        this.dom.guessInput.disabled = false; this.dom.guessBtn.disabled = false;
        this.dom.feedback.innerText = "Valendo!";
    }
    processGuess() {
        const guess = parseInt(this.dom.guessInput.value); if (isNaN(guess)) return;
        this.attempts++; this.dom.attemptCount.innerText = this.attempts;

        if (guess === this.secretNumber) {
            this.dom.feedback.innerText = `🏆 Acertou em ${this.attempts} jogadas!`;
            this.dom.guessInput.disabled = true; this.dom.guessBtn.disabled = true;
            
            const name = this.dom.playerName.value.trim() || 'Anônimo';
            const currentLabel = this.gameMode === 'solo' ? 'Solo' : 'Multiplayer';
            StorageManager.saveToRanking('adivinhacao_records', { name: name, mode: currentLabel, score: this.attempts }, true);
            this.updateRecordDisplay();
        } else {
            this.dom.feedback.innerText = guess < this.secretNumber ? "📈 MAIOR!" : "📉 MENOR!";
        }
        this.dom.guessInput.value = "";
    }
    updateRecordDisplay() { StorageManager.renderRankingTable('adivinhacao_records', 'record-solo-container'); }
}
document.addEventListener('DOMContentLoaded', () => new AdivinhacaoGame());