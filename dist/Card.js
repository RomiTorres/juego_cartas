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
    set isFaceUp(newState) {
        this.#isFaceUp = newState;
    }
    //Alternar carta
    toggleFace() {
        this.#isFaceUp = !this.#isFaceUp;
    }
    // Establecer imagen de tarjeta
    setCardImage(id) {
        const card = document.getElementById(id);
        let imagePath = "../public/img/cartas_poker/back.png";
        if (this.#isFaceUp)
            imagePath = "../public/img/cartas_poker/AS.png";
        // ESTO VA MAS ADELANTE
        // if(this.#isFaceUp) imagePath = `../public/img/cartas_poker/${this.#rank}${this.#suit[0].toUpperCase()}.png`;
        card.setAttribute("src", imagePath);
    }
}
//# sourceMappingURL=Card.js.map