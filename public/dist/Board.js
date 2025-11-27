export class Board {
    // Elementos del DOM
    #dealerCards;
    #playerCards;
    #message;
    #dealerBalanceEl;
    // Handlers de acción (privados y opcionales)
    #onHit;
    #onStand;
    #onBet;
    constructor() {
        this.#dealerCards = document.getElementById('dealer-cards');
        this.#playerCards = document.getElementById('player-cards');
        this.#message = document.getElementById('game-message');
        this.#dealerBalanceEl = document.getElementById('dealer-balance');
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
        // mostrar balance del dealer si existe el elemento
        if (this.#dealerBalanceEl && typeof dealer.balance === 'number') {
            this.#dealerBalanceEl.textContent = String(dealer.balance);
        }
        // actualizar score del dealer
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
            // Balance del jugador
            const balanceEl = document.createElement('span');
            balanceEl.classList.add('player-balance');
            balanceEl.textContent = `Saldo: ${player.balance ?? 0}`;
            header.appendChild(balanceEl);
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
            // O si el jugador no tiene apuesta activa (apuesta es obligatoria)
            const isActive = index === currentTurnIndex;
            const hasActiveBet = (player.currentBet ?? 0) > 0;
            // Los botones se deshabilitan si:
            // 1. No es el turno del jugador, O
            // 2. El jugador no tiene apuesta (apuesta es obligatoria)
            hitBtn.disabled = !isActive || !hasActiveBet;
            standBtn.disabled = !isActive || !hasActiveBet;
            // Cambiar el título (title) del botón para mostrar por qué está deshabilitado
            if (!hasActiveBet) {
                hitBtn.title = '⚠️ Debes apostar mínimo $10 antes de jugar';
                standBtn.title = '⚠️ Debes apostar mínimo $10 antes de jugar';
            }
            actions.appendChild(hitBtn);
            actions.appendChild(standBtn);
            container.appendChild(actions);
            // Controles de apuesta
            const betControls = document.createElement('div');
            betControls.classList.add('bet-controls');
            // Mostrar apuesta actual si existe
            const currentBetEl = document.createElement('span');
            currentBetEl.classList.add('current-bet');
            if (player.currentBet && player.currentBet > 0) {
                currentBetEl.textContent = `Apuesta: ${player.currentBet}`;
            }
            else {
                currentBetEl.textContent = `Apuesta: -`;
            }
            betControls.appendChild(currentBetEl);
            const betInput = document.createElement('input');
            betInput.type = 'number';
            betInput.min = '10'; // Mínimo de apuesta: $10
            betInput.value = '10'; // Valor por defecto: $10
            betInput.id = `bet-input-${index}`;
            betInput.classList.add('bet-input');
            betInput.placeholder = 'Mín $10'; // Mostrar el mínimo como placeholder
            const betBtn = document.createElement('button');
            betBtn.textContent = 'Apostar';
            betBtn.id = `bet-btn-${index}`;
            // Función auxiliar para procesar la apuesta
            const processBet = () => {
                const val = Number(document.getElementById(`bet-input-${index}`).value);
                if (this.#onBet)
                    this.#onBet(index, val);
            };
            // Click en el botón
            betBtn.addEventListener('click', processBet);
            // Presionar Enter en el input de apuesta
            betInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    processBet();
                }
            });
            // Si ya hay apuesta, deshabilitar controles
            if (player.currentBet && player.currentBet > 0) {
                betInput.disabled = true;
                betBtn.disabled = true;
            }
            betControls.appendChild(betInput);
            betControls.appendChild(betBtn);
            container.appendChild(betControls);
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
    /**
     * Muestra los resultados finales de la mano para todos los jugadores.
     *
     * Paso a paso:
     * 1. Para cada jugador, determina su resultado (gana, pierde, empata)
     * 2. Cuenta cuántos jugadores ganaron contra el dealer
     * 3. Crea un mensaje mostrando:
     *    - Resultados individuales de cada jugador (gana/pierde/empata)
     *    - Estado del dealer (ganador/perdedor según los resultados)
     * 4. Muestra el mensaje en la UI
     *
     * El dealer se considera "ganador" si al menos uno de los jugadores perdió,
     * y "perdedor" si todos los jugadores ganaron o empataron.
     */
    showResults(results) {
        const lines = results.map(r => {
            if (r.result === "player")
                return `✓ ${r.id} gana`;
            if (r.result === "dealer")
                return `✗ ${r.id} pierde`;
            return `= ${r.id} empata`;
        });
        // Contar resultados para mostrar estado del dealer
        const playerWins = results.filter(r => r.result === "player").length;
        const playerLosses = results.filter(r => r.result === "dealer").length;
        // Mensaje del dealer: si hay pérdidas, el dealer ganó
        let dealerStatus = '';
        if (playerLosses > 0) {
            dealerStatus = ' | 🎰 Crupier: ¡GANA!';
        }
        else if (playerWins > 0 && playerLosses === 0) {
            // Todos ganaron o empataron
            dealerStatus = ' | 🎰 Crupier: Pierde';
        }
        this.showMessage(lines.join(' | ') + dealerStatus);
    }
    // Inyección de handlers desde index.ts
    setActionHandlers(onHit, onStand) {
        this.#onHit = onHit;
        this.#onStand = onStand;
    }
    // Registrar handler para apuestas
    setBetHandler(onBet) {
        this.#onBet = onBet;
    }
}
//# sourceMappingURL=Board.js.map