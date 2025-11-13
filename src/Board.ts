
import { Card } from "./Card.js";

export class Board {
  #numberOfVisbleCards: number;
  #visibleCards: Map<number, Card> 

  constructor(deck:Array<Card>, numberOfVisbleCards: number ) {
    this.#numberOfVisbleCards = numberOfVisbleCards;
    this.#visibleCards = new Map<number, Card> 
    const deckCopy: Array<Card> = deck.map((card) => {return new Card(card.rank, card.suit)});
    for(let i = 1; i <= numberOfVisbleCards; i++) {
      const randomNumberCard = Math.floor(Math.random() * deckCopy.length);
      this.#visibleCards.set(i, deckCopy[randomNumberCard]);
      deckCopy.splice(randomNumberCard, 1);
    }
  }

  get visibleCards():Map<number, Card> {
    return this.#visibleCards;
  }

  generateVisibleCardsHTML() {
    const visibleCards = document.getElementById("visible-cards");
    for(let i = 1; i <= this.#numberOfVisbleCards; i++) {
      const paragraph = document.createElement("p");
      const img = document.createElement("img");
      img.setAttribute("src", "../public/img/cartas_poker/back.png");
      img.setAttribute("alt", "reverso de carta de poker");
      img.classList.add("deck-card");
      img.setAttribute("draggable", "true");
      img.setAttribute("aria-grabbed", "false");
      img.id = `card-${i}`;
      paragraph.appendChild(img);
      visibleCards.insertAdjacentElement("beforeend", paragraph);
    }
  }

    renderBoard() {
    this.generateVisibleCardsHTML();
    const boardCards = document.getElementsByClassName("deck-card");
    for(let i = 1; i <= boardCards.length; i++) {
      if( this.#visibleCards.get(i) instanceof Card){
          this.#visibleCards.get(i).setCardImage(`card-${i}`);
      } 
    }
  }
}