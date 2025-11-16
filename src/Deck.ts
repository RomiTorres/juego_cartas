import { Card } from "./Card.js";

export class Deck {
  #cards: Card[] = [];
  #suits: Array<string> = ["spades", "hearts", "diamonds", "clubs"];
  #ranks: Array<string> = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  constructor() {
    this.#cards = this.#generateDeck();
  }

  #generateDeck(): Array<Card> {
    let deck: Array<Card> = [];
    for (const suit of this.#suits) {
      for (const rank of this.#ranks) {
        deck.push(new Card(rank, suit));
      }
    }
    return deck;
  }

  shuffle(): void {
    for (let i = this.#cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.#cards[i], this.#cards[j]] = [this.#cards[j], this.#cards[i]];
    }
  }

  drawCard(): Card | undefined {
    return this.#cards.pop();
  }
}