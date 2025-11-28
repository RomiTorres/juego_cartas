import { Card } from "./Card.js";
type PlayerView = {
  id: string;
  cards: Card[];
  score: number;
  balance?: number;
  currentBet?: number;
};

export class Board {
  #dealerCards: HTMLElement;
  #playerCards: HTMLElement;
  #message: HTMLElement;
  #dealerBalanceEl: HTMLElement | null;

  #onHit: ((index: number) => void) | null;
  #onStand: ((index: number) => void) | null;
  #onBet: ((index: number, amount: number) => void) | null;

  constructor() {
    this.#dealerCards = document.getElementById('dealer-cards')!;
    this.#playerCards = document.getElementById('player-cards')!;
    this.#message = document.getElementById('game-message')!;
    this.#dealerBalanceEl = document.getElementById('dealer-balance');

    this.#onHit = null;
    this.#onStand = null;
  }

  clearBoard(): void {
    this.#dealerCards.innerHTML = '';
    this.#playerCards.innerHTML = '';
    this.#message.textContent = '';
  }

  renderHands(players: PlayerView[], dealer: PlayerView, currentTurnIndex: number): void {
    this.#dealerCards.innerHTML = '';
    if (this.#dealerBalanceEl && typeof dealer.balance === 'number') {
      this.#dealerBalanceEl.textContent = String(dealer.balance);
    }
    const dealerScoreEl = document.getElementById('dealer-score');
    if (dealerScoreEl) {
      dealerScoreEl.textContent = String(dealer.score);
    }
    dealer.cards.forEach(card => {
      const img = document.createElement('img');
      img.src = card.getImagePath();
      img.alt = `${card.rank}${card.suit}`;
      img.classList.add('card');
      this.#dealerCards.appendChild(img);
    });

    this.#playerCards.innerHTML = '';
    players.forEach((player, index) => {
      const container = document.createElement('div');
      container.classList.add('player-hand');
      container.id = `player-${index}`;

      const header = document.createElement('div');
      header.classList.add('player-header');

      const title = document.createElement('h3');
      title.textContent = `${player.id}`;
      header.appendChild(title);

      const balanceEl = document.createElement('span');
      balanceEl.classList.add('player-balance');
      balanceEl.textContent = `Saldo: ${player.balance ?? 0}`;
      header.appendChild(balanceEl);

      const scoreEl = document.createElement('span');
      scoreEl.classList.add('player-score');
      scoreEl.textContent = `Puntos: ${player.score}`;
      header.appendChild(scoreEl);

      container.appendChild(header);

      const cardsRow = document.createElement('div');
      cardsRow.classList.add('cards-row');
      player.cards.forEach(card => {
        const img = document.createElement('img');
        img.src = card.getImagePath();
        img.alt = `${card.rank}${card.suit}`;
        img.classList.add('card');
        cardsRow.appendChild(img);
      });
      container.appendChild(cardsRow);

      const actions = document.createElement('div');
      actions.classList.add('player-actions');

      const hitBtn = document.createElement('button');
      hitBtn.textContent = 'Pedir carta';
      hitBtn.id = `hit-${index}`;
      hitBtn.addEventListener('click', () => {
        if (this.#onHit) this.#onHit(index);
      });

      const standBtn = document.createElement('button');
      standBtn.textContent = 'Plantarse';
      standBtn.id = `stand-${index}`;
      standBtn.addEventListener('click', () => {
        if (this.#onStand) this.#onStand(index);
      });

      const isActive = index === currentTurnIndex;
      const hasActiveBet = (player.currentBet ?? 0) > 0;
      
      hitBtn.disabled = !isActive || !hasActiveBet;
      standBtn.disabled = !isActive || !hasActiveBet;
      
      if (!hasActiveBet) {
        hitBtn.title = '⚠️ Debes apostar mínimo $10 antes de jugar';
        standBtn.title = '⚠️ Debes apostar mínimo $10 antes de jugar';
      }

      actions.appendChild(hitBtn);
      actions.appendChild(standBtn);
      container.appendChild(actions);

      const betControls = document.createElement('div');
      betControls.classList.add('bet-controls');

      const currentBetEl = document.createElement('span');
      currentBetEl.classList.add('current-bet');
      if (player.currentBet && player.currentBet > 0) {
        currentBetEl.textContent = `Apuesta: ${player.currentBet}`;
      } else {
        currentBetEl.textContent = `Apuesta: -`;
      }
      betControls.appendChild(currentBetEl);

      const betInput = document.createElement('input');
      betInput.type = 'number';
      betInput.min = '10';         
      betInput.value = '10';       
      betInput.id = `bet-input-${index}`;
      betInput.classList.add('bet-input');
      betInput.placeholder = 'Mín $10'; 

      const betBtn = document.createElement('button');
      betBtn.textContent = 'Apostar';
      betBtn.id = `bet-btn-${index}`;
      
      const processBet = () => {
        const val = Number((document.getElementById(`bet-input-${index}`) as HTMLInputElement).value);
        if (this.#onBet) this.#onBet(index, val);
      };
      
      betBtn.addEventListener('click', processBet);
      
      betInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          processBet();
        }
      });

      if (player.currentBet && player.currentBet > 0) {
        betInput.disabled = true;
        betBtn.disabled = true;
      }

      betControls.appendChild(betInput);
      betControls.appendChild(betBtn);
      container.appendChild(betControls);

      if (isActive) {
        container.classList.add('active-player');
      } else {
        container.classList.remove('active-player');
      }

      this.#playerCards.appendChild(container);
    });
  }

  showMessage(message: string): void {
    this.#message.textContent = message;
  }

  showResults(results: Array<{ id: string; result: "player" | "dealer" | "push" }>): void {
    const lines = results.map(r => {
      if (r.result === "player") return `✓ ${r.id} gana`;
      if (r.result === "dealer") return `✗ ${r.id} pierde`;
      return `= ${r.id} empata`;
    });

    const playerWins = results.filter(r => r.result === "player").length;
    const playerLosses = results.filter(r => r.result === "dealer").length;

    let dealerStatus = '';
    if (playerLosses > 0) {
      dealerStatus = ' | 🎰 Crupier: ¡GANA!';
    } else if (playerWins > 0 && playerLosses === 0) {
      dealerStatus = ' | 🎰 Crupier: Pierde';
    }

    this.showMessage(lines.join(' | ') + dealerStatus);
  }

  setActionHandlers(onHit: (index: number) => void, onStand: (index: number) => void): void {
    this.#onHit = onHit;
    this.#onStand = onStand;
  }

  setBetHandler(onBet: (index: number, amount: number) => void): void {
    this.#onBet = onBet;
  }
}
