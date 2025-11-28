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
    newGame(playerIds = ["Jugador 1", "Jugador 2"], initialBalances = {}) {
        this.#deck = new Deck();
        this.#deck.shuffle();
        const START_BALANCE = 1000;
        this.#players = playerIds.map(id => ({
            id,
            cards: [],
            score: 0,
            balance: initialBalances[id] ?? START_BALANCE
        }));
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
        this.updateScores();
        this.resolveBets();
    }
    placeBet(playerId, amount) {
        const MIN_BET = 10;
        const player = this.#players.find(p => p.id === playerId);
        if (!player)
            return false;
        if (amount <= 0)
            return false;
        if (amount < MIN_BET)
            return false;
        if (player.balance < amount)
            return false;
        player.balance -= amount;
        player.currentBet = (player.currentBet ?? 0) + amount;
        this.#dealer.balance += amount;
        return true;
    }
    hasActiveBet(playerId) {
        const player = this.#players.find(p => p.id === playerId);
        if (!player)
            return false;
        return (player.currentBet ?? 0) > 0; // tiene apuesta activa
    }
    canPlayerBet(playerId) {
        const player = this.#players.find(p => p.id === playerId);
        if (!player)
            return false;
        return player.balance > 0;
    }
    getPlayerBalance(playerId) {
        const player = this.#players.find(p => p.id === playerId);
        return player?.balance ?? 0;
    }
    clearBets() {
        for (const p of this.#players) {
            p.currentBet = undefined;
        }
    }
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
                    const payout = 2.5 * bet;
                    this.#dealer.balance -= payout;
                    player.balance += payout;
                }
                else {
                    const payout = 2.0 * bet;
                    this.#dealer.balance -= payout;
                    player.balance += payout;
                }
            }
            else if (r.result === "push") {
                const payout = 1.0 * bet;
                this.#dealer.balance -= payout;
                player.balance += payout;
            }
            else if (r.result === "dealer") {
            }
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