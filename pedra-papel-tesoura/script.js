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
                <thead><tr><th>Nº</th><th>Nome</th><th>Modo</th><th>Placar</th></tr></thead>
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

const Jokenpo = {
    state: { mode: 'solo', p1Choice: null, p2Choice: null, scoreP1: 0, scoreP2: 0 },
    rules: { pedra: 'tesoura', tesoura: 'papel', papel: 'pedra' },
    icons: { pedra: '✊', papel: '✋', tesoura: '✌️' },

    init() { this.cacheDOM(); this.bindEvents(); this.renderRanking(); },
    cacheDOM() {
        this.dom = {
            btnSolo: document.getElementById('btn-solo'), btnMulti: document.getElementById('btn-multi'),
            score1: document.getElementById('score-p1'), score2: document.getElementById('score-p2'),
            resultMsg: document.getElementById('result-msg'), vBox1: document.getElementById('visual-p1'),
            vBox2: document.getElementById('visual-p2'), choiceBtns: document.querySelectorAll('.choice-btn'),
            playerName: document.getElementById('player-name'), rankingContainer: document.getElementById('jokenpo-ranking-container')
        };
    },
    bindEvents() {
        this.dom.btnSolo.addEventListener('click', () => this.switchMode('solo'));
        this.dom.btnMulti.addEventListener('click', () => this.switchMode('multi'));
        this.dom.choiceBtns.forEach(btn => btn.addEventListener('click', () => this.playRound(btn.dataset.choice)));
    },
    switchMode(mode) {
        this.state.mode = mode;
        this.dom.btnSolo.classList.toggle('active', mode === 'solo');
        this.dom.btnMulti.classList.toggle('active', mode === 'multi');
        this.resetMatch();
    },
    playRound(choice) {
        if (this.state.mode === 'solo') {
            this.state.p1Choice = choice;
            const opt = ['pedra', 'papel', 'tesoura'];
            this.state.p2Choice = opt[Math.floor(Math.random() * 3)];
            this.animateArena();
        } else {
            if (!this.state.p1Choice) {
                this.state.p1Choice = choice; this.dom.resultMsg.innerText = "J1 escolheu!";
            } else {
                this.state.p2Choice = choice; this.animateArena();
            }
        }
    },
    animateArena() {
        this.dom.vBox1.classList.add('animate'); this.dom.vBox2.classList.add('animate');
        this.dom.resultMsg.innerText = "Jokenpô...";
        setTimeout(() => {
            this.dom.vBox1.classList.remove('animate'); this.dom.vBox2.classList.remove('animate');
            this.evaluateWinner();
        }, 500);
    },
    evaluateWinner() {
        this.dom.vBox1.innerText = this.icons[this.state.p1Choice];
        this.dom.vBox2.innerText = this.icons[this.state.p2Choice];

        let msg = "";
        if (this.state.p1Choice === this.state.p2Choice) {
            msg = "Empate!";
        } else if (this.rules[this.state.p1Choice] === this.state.p2Choice) {
            msg = "J1 pontuou!"; this.state.scoreP1++;
        } else {
            msg = "J2/CPU pontuou!"; this.state.scoreP2++;
        }

        this.dom.score1.innerText = this.state.scoreP1;
        this.dom.score2.innerText = this.state.scoreP2;
        this.dom.resultMsg.innerText = msg;
        this.checkMatchEnd();
        this.state.p1Choice = null; this.state.p2Choice = null;
    },
    checkMatchEnd() {
        if (this.state.scoreP1 === 3 || this.state.scoreP2 === 3) {
            const winnerName = this.state.scoreP1 > this.state.scoreP2 ? "J1" : (this.state.mode === 'solo' ? "CPU" : "J2");
            const scoreLabel = `${this.state.scoreP1}x${this.state.scoreP2}`;
            const name = this.dom.playerName.value.trim() || winnerName;
            
            setTimeout(() => {
                alert(`🏁 Campeão: ${winnerName}`);
                StorageManager.saveToRanking('jokenpo_records', { name: name, mode: this.state.mode, score: scoreLabel });
                this.resetMatch();
            }, 50);
        }
    },
    renderRanking() { StorageManager.renderRankingTable('jokenpo_records', 'jokenpo-ranking-container'); },
    resetMatch() {
        this.state.scoreP1 = 0; this.state.scoreP2 = 0; this.state.p1Choice = null; this.state.p2Choice = null;
        this.dom.score1.innerText = 0; this.dom.score2.innerText = 0;
        this.dom.vBox1.innerText = "?"; this.dom.vBox2.innerText = "?";
        this.dom.resultMsg.innerText = "Faça sua escolha"; this.renderRanking();
    }
};
document.addEventListener('DOMContentLoaded', () => Jokenpo.init());