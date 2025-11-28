import { Card } from "./Card";
export class Deck {
    #suits = ["spades", "hearts", "diamonds", "clubs"];
    #rank = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    constructor(suits, rank) {
        this.#suits = suits;
        this.#rank = rank;
    }
    get suits() {
        return this.#suits;
    }
    get rank() {
        return this.#rank;
    }
    generateDeck(suits, rank) {
        let deckRandom = [];
        for (let i = 0; i < suits.length; i++) {
            for (let j = 0; j < rank.length; j++) {
                const card = new Card(rank[j], suits[i]);
                deckRandom.push(card);
                console.log(card);
            }
        }
        console.log(deckRandom.length);
        return deckRandom;
    }
}
//# sourceMappingURL=Deck.js.map