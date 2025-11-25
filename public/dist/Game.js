import { Deck } from "./Deck.js";
export class Game {
    #deck;
    #players;
    #dealer;
    #currentTurn;
    #gameInProgress;
    constructor() {
        this.#deck = new Deck();
        this.#players = [];
        this.#dealer = { id: "Dealer", cards: [], score: 0, isDealer: true, balance: 0 };
        this.#currentTurn = 0;
        this.#gameInProgress = false;
    }
    get playerList() {
        return this.#players;
    }
    get dealerInfo() {
        return this.#dealer;
    }
    get isGameInProgress() {
        return this.#gameInProgress;
    }
    get currentPlayer() {
        return this.#players[this.#currentTurn] || null;
    }
    get currentTurnIndex() {
        return this.#currentTurn;
    }
    /**
     * Inicia una nueva partida.
     * Acepta IDs de jugadores y opcionalmente saldos iniciales para cada uno.
     *
     * Parámetros:
     * - playerIds: array de IDs/nombres de jugadores
     * - initialBalances: objeto opcional que mapea ID → saldo inicial
     *   Si no se proporciona, todos los jugadores comienzan con 1000 (START_BALANCE)
     *
     * Ejemplo de uso:
     *   game.newGame(["Alice", "Bob"], { "Alice": 500, "Bob": 750 })
     * Esto causa que Alice tenga 500 y Bob 750 al inicio.
     */
    newGame(playerIds = ["Jugador 1", "Jugador 2"], initialBalances = {}) {
        this.#deck = new Deck();
        this.#deck.shuffle();
        const START_BALANCE = 1000;
        // Inicializamos jugadores con saldo
        // Si se proporciona un balance inicial para este jugador, lo usa;
        // si no, usa START_BALANCE como fallback
        this.#players = playerIds.map(id => ({
            id,
            cards: [],
            score: 0,
            balance: initialBalances[id] ?? START_BALANCE
        }));
        // El dealer tiene un bankroll mayor (ejemplo)
        this.#dealer = {
            id: "Dealer",
            cards: [],
            score: 0,
            isDealer: true,
            balance: START_BALANCE * 10
        };
        for (const player of this.#players) {
            const card1 = this.#deck.drawCard();
            card1.toggleFace();
            player.cards.push(card1);
            const card2 = this.#deck.drawCard();
            card2.toggleFace();
            player.cards.push(card2);
        }
        const dealerCard1 = this.#deck.drawCard();
        dealerCard1.toggleFace();
        this.#dealer.cards.push(dealerCard1);
        const dealerCard2 = this.#deck.drawCard();
        this.#dealer.cards.push(dealerCard2);
        this.updateScores();
        this.#currentTurn = 0;
        this.#gameInProgress = true;
        const blackjack = this.#players.some(p => p.score === 21) || this.#dealer.score === 21;
        if (blackjack) {
            this.endGame();
        }
    }
    hit() {
        if (!this.#gameInProgress)
            return;
        const currentPlayer = this.#players[this.#currentTurn];
        if (!currentPlayer)
            return;
        const card = this.#deck.drawCard();
        if (!card) {
            this.endGame();
            return;
        }
        card.toggleFace();
        currentPlayer.cards.push(card);
        this.updateScores();
        if (currentPlayer.score > 21) {
            this.#nextTurn();
        }
    }
    stand() {
        if (!this.#gameInProgress)
            return;
        this.#nextTurn();
    }
    #nextTurn() {
        this.#currentTurn++;
        if (this.#currentTurn >= this.#players.length) {
            this.dealerTurn();
        }
    }
    dealerTurn() {
        this.#dealer.cards.forEach(card => {
            if (!card.isFaceUp)
                card.toggleFace();
        });
        this.updateScores();
        while (this.#dealer.score < 17) {
            const card = this.#deck.drawCard();
            if (!card)
                break;
            card.toggleFace();
            this.#dealer.cards.push(card);
            this.updateScores();
        }
        this.endGame();
    }
    calculateScore(cards) {
        let score = 0;
        let aceCount = 0;
        for (const card of cards) {
            if (card.isFaceUp) {
                const value = card.getValue();
                if (value === 11)
                    aceCount++;
                score += value;
            }
        }
        while (score > 21 && aceCount > 0) {
            score -= 10;
            aceCount--;
        }
        return score;
    }
    updateScores() {
        for (const player of this.#players) {
            player.score = this.calculateScore(player.cards);
        }
        this.#dealer.score = this.calculateScore(this.#dealer.cards);
    }
    endGame() {
        this.#gameInProgress = false;
        // Aseguramos que las puntuaciones estén actualizadas y resolvemos las apuestas
        this.updateScores();
        this.resolveBets();
    }
    /**
     * Place a bet for a player. Returns true if the bet was accepted.
     */
    placeBet(playerId, amount) {
        const player = this.#players.find(p => p.id === playerId);
        if (!player)
            return false;
        if (amount <= 0)
            return false;
        if (player.balance < amount)
            return false; // fondos insuficientes
        // transferimos la apuesta desde el jugador al dealer (escrow)
        player.balance -= amount;
        player.currentBet = (player.currentBet ?? 0) + amount;
        this.#dealer.balance += amount;
        return true;
    }
    /**
     * Limpia las apuestas almacenadas en los jugadores (prepara siguiente ronda)
     */
    clearBets() {
        for (const p of this.#players) {
            p.currentBet = undefined;
        }
    }
    /**
     * Resuelve las apuestas según los resultados actuales de la mano.
     * Reglas implementadas:
     * - player pierde: dealer se queda con la apuesta (ya la tiene)
     * - push: dealer devuelve 1x la apuesta
     * - player gana normal: dealer paga 1:1 ( jugador recibe 2x apuesta )
     * - blackjack (player 21 con 2 cartas y dealer no): paga 3:2 (2.5x total devuelto)
     */
    resolveBets() {
        if (this.#gameInProgress)
            return;
        const results = this.getWinners();
        if (!results)
            return;
        for (const r of results) {
            const player = this.#players.find(p => p.id === r.id);
            if (!player)
                continue;
            const bet = player.currentBet ?? 0;
            const playerBlackjack = player.score === 21 && player.cards.length === 2;
            const dealerBlackjack = this.#dealer.score === 21 && this.#dealer.cards.length === 2;
            if (bet <= 0) {
                player.currentBet = undefined;
                continue;
            }
            if (r.result === "player") {
                if (playerBlackjack && !dealerBlackjack) {
                    const payout = 2.5 * bet; // devuelve apuesta + 1.5x ganancia
                    this.#dealer.balance -= payout;
                    player.balance += payout;
                }
                else {
                    const payout = 2.0 * bet; // devuelve apuesta + 1x ganancia
                    this.#dealer.balance -= payout;
                    player.balance += payout;
                }
            }
            else if (r.result === "push") {
                const payout = 1.0 * bet; // devolver la apuesta
                this.#dealer.balance -= payout;
                player.balance += payout;
            }
            else if (r.result === "dealer") {
                // El dealer ya tomó la apuesta cuando se hizo, no hacer nada adicional
            }
            // limpiar apuesta del jugador
            player.currentBet = undefined;
        }
    }
    getWinners() {
        if (this.#gameInProgress)
            return null;
        const dealerScore = this.#dealer.score;
        const results = [];
        for (const p of this.#players) {
            const playerScore = p.score;
            const playerBlackjack = playerScore === 21 && p.cards.length === 2;
            const dealerBlackjack = dealerScore === 21 && this.#dealer.cards.length === 2;
            if (playerScore > 21) {
                results.push({ id: p.id, result: "dealer" });
                continue;
            }
            if (dealerScore > 21) {
                results.push({ id: p.id, result: "player" });
                continue;
            }
            if (playerBlackjack && !dealerBlackjack) {
                results.push({ id: p.id, result: "player" });
                continue;
            }
            if (dealerBlackjack && !playerBlackjack) {
                results.push({ id: p.id, result: "dealer" });
                continue;
            }
            if (playerScore === dealerScore) {
                results.push({ id: p.id, result: "push" });
                continue;
            }
            if (playerScore > dealerScore) {
                results.push({ id: p.id, result: "player" });
            }
            else {
                results.push({ id: p.id, result: "dealer" });
            }
        }
        return results;
    }
}
//# sourceMappingURL=Game.js.map