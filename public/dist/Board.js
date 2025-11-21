export class Board {
    // Elementos del DOM
    #dealerCards;
    #playerCards;
    #message;
    // Handlers de acción (privados y opcionales)
    #onHit;
    #onStand;
    constructor() {
        this.#dealerCards = document.getElementById('dealer-cards');
        this.#playerCards = document.getElementById('player-cards');
        this.#message = document.getElementById('game-message');
        this.#onHit = null;
        this.#onStand = null;
    }
    // Limpieza de la mesa
    clearBoard() {
        this.#dealerCards.innerHTML = '';
        this.#playerCards.innerHTML = '';
        this.#message.textContent = '';
    }
    // Render principal: dealer y jugadores, con turno activo
    renderHands(players, dealer, currentTurnIndex) {
        // Dealer
        this.#dealerCards.innerHTML = '';
        dealer.cards.forEach(card => {
            const img = document.createElement('img');
            img.src = card.getImagePath();
            img.alt = `${card.rank}${card.suit}`;
            img.classList.add('card');
            this.#dealerCards.appendChild(img);
        });
        // Jugadores
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
            const scoreEl = document.createElement('span');
            scoreEl.classList.add('player-score');
            scoreEl.textContent = `Puntos: ${player.score}`;
            header.appendChild(scoreEl);
            container.appendChild(header);
            // Cartas del jugador
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
            // Botones de acción por jugador
            const actions = document.createElement('div');
            actions.classList.add('player-actions');
            const hitBtn = document.createElement('button');
            hitBtn.textContent = 'Pedir carta';
            hitBtn.id = `hit-${index}`;
            hitBtn.addEventListener('click', () => {
                if (this.#onHit)
                    this.#onHit(index);
            });
            const standBtn = document.createElement('button');
            standBtn.textContent = 'Plantarse';
            standBtn.id = `stand-${index}`;
            standBtn.addEventListener('click', () => {
                if (this.#onStand)
                    this.#onStand(index);
            });
            // Deshabilitar si no es el turno de este jugador
            const isActive = index === currentTurnIndex;
            hitBtn.disabled = !isActive;
            standBtn.disabled = !isActive;
            actions.appendChild(hitBtn);
            actions.appendChild(standBtn);
            container.appendChild(actions);
            // Marcar visualmente al activo (opcional: depende de tu CSS)
            if (isActive) {
                container.classList.add('active-player');
            }
            else {
                container.classList.remove('active-player');
            }
            this.#playerCards.appendChild(container);
        });
    }
    // Mensajes generales
    showMessage(message) {
        this.#message.textContent = message;
    }
    // Mostrar resultados al final por jugador
    showResults(results) {
        const lines = results.map(r => {
            if (r.result === "player")
                return `${r.id} gana`;
            if (r.result === "dealer")
                return `${r.id} pierde`;
            return `${r.id} empata`;
        });
        this.showMessage(lines.join(' | '));
    }
    // Inyección de handlers desde index.ts
    setActionHandlers(onHit, onStand) {
        this.#onHit = onHit;
        this.#onStand = onStand;
    }
}
//# sourceMappingURL=Board.js.map