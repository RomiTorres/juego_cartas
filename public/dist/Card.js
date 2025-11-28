export class Card {
    #rank;
    #suit;
    #isFaceUp;
    constructor(rank, suit) {
        this.#rank = rank;
        this.#suit = suit;
        this.#isFaceUp = false;
    }
    get rank() {
        return this.#rank;
    }
    get suit() {
        return this.#suit;
    }
    get isFaceUp() {
        return this.#isFaceUp;
    }
    toggleFace() {
        this.#isFaceUp = !this.#isFaceUp;
    }
    setCardImage(id) {
        const card = document.getElementById(id);
        if (card) {
            card.setAttribute("src", this.getImagePath());
        }
    }
    getImagePath() {
        if (!this.#isFaceUp) {
            return `img/cartas_poker/back.png`;
        }
        const suitChar = this.#suit.charAt(0).toUpperCase();
        const rankChar = this.#rank === '10' ? '0' : this.#rank;
        return `img/cartas_poker/${rankChar}${suitChar}.png`;
    }
    getValue() {
        if (this.#rank === 'A') {
            return 11;
        }
        if (['K', 'Q', 'J'].includes(this.#rank)) {
            return 10;
        }
        return parseInt(this.#rank);
    }
}
//# sourceMappingURL=Card.js.map