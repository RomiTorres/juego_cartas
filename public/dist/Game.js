import { Deck } from "./Deck.js";
export class Game {
    // Campos privados nativos
    #deck;
    #player;
    #dealer;
    #gameInProgress;
    constructor() {
        this.#deck = new Deck();
        this.#player = { cards: [], score: 0 };
        this.#dealer = { cards: [], score: 0 };
        this.#gameInProgress = false;
    }
    // --- Getters y Setters ---
    get player() {
        return this.#player;
    }
    get dealer() {
        return this.#dealer;
    }
    get isGameInProgress() {
        return this.#gameInProgress;
    }
    // --- Métodos públicos ---
    newGame() {
        this.#deck = new Deck();
        this.#deck.shuffle();
        this.#player = { cards: [], score: 0 };
        this.#dealer = { cards: [], score: 0 };
        // Reparto inicial jugador
        const playerCard1 = this.#deck.drawCard();
        playerCard1.toggleFace();
        this.#player.cards.push(playerCard1);
        const playerCard2 = this.#deck.drawCard();
        playerCard2.toggleFace();
        this.#player.cards.push(playerCard2);
        // Reparto crupier
        const dealerFirstCard = this.#deck.drawCard();
        dealerFirstCard.toggleFace();
        this.#dealer.cards.push(dealerFirstCard);
        const dealerSecondCard = this.#deck.drawCard();
        this.#dealer.cards.push(dealerSecondCard);
        this.updateScores();
        this.#gameInProgress = true;
        if (this.#player.score === 21 || this.#dealer.score === 21) {
            this.endGame();
        }
    }
    hit() {
        if (!this.#gameInProgress)
            return;
        const card = this.#deck.drawCard();
        card.toggleFace();
        this.#player.cards.push(card);
        this.updateScores();
        if (this.#player.score > 21) {
            this.endGame();
        }
    }
    stand() {
        if (!this.#gameInProgress)
            return;
        this.dealerTurn();
    }
    dealerTurn() {
        this.#dealer.cards.forEach(card => {
            if (!card.isFaceUp)
                card.toggleFace();
        });
        this.updateScores();
        while (this.#dealer.score < 17) {
            const card = this.#deck.drawCard();
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
        this.#player.score = this.calculateScore(this.#player.cards);
        this.#dealer.score = this.calculateScore(this.#dealer.cards);
    }
    endGame() {
        this.#gameInProgress = false;
    }
    getWinner() {
        if (this.#gameInProgress)
            return null;
        const playerScore = this.#player.score;
        const dealerScore = this.calculateScore(this.#dealer.cards);
        if (playerScore > 21)
            return 'dealer';
        if (dealerScore > 21)
            return 'player';
        if (playerScore === 21 && this.#player.cards.length === 2 && dealerScore !== 21)
            return 'player';
        if (dealerScore === 21 && this.#dealer.cards.length === 2 && playerScore !== 21)
            return 'dealer';
        if (playerScore === dealerScore)
            return 'push';
        if (playerScore > dealerScore)
            return 'player';
        return 'dealer';
    }
}
//# sourceMappingURL=Game.js.map