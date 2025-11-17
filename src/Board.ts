import { Card } from "./Card.js";

export class Board {
  // Campos privados nativos
  #dealerCards: HTMLElement;
  #playerCards: HTMLElement;
  #dealerScore: HTMLElement;
  #playerScore: HTMLElement;
  #message: HTMLElement;

  constructor() {
    this.#dealerCards = document.getElementById('dealer-cards')!;
    this.#playerCards = document.getElementById('player-cards')!;
    this.#dealerScore = document.getElementById('dealer-score')!;
    this.#playerScore = document.getElementById('player-score')!;
    this.#message = document.getElementById('game-message')!;
  }

  // --- Getters y Setters controlados ---
  get dealerCards(): HTMLElement {
    return this.#dealerCards;
  }

  get playerCards(): HTMLElement {
    return this.#playerCards;
  }

  get dealerScore(): string {
    return this.#dealerScore.textContent || "0";
  }
  set dealerScore(value: string) {
    this.#dealerScore.textContent = value;
  }

  get playerScore(): string {
    return this.#playerScore.textContent || "0";
  }
  set playerScore(value: string) {
    this.#playerScore.textContent = value;
  }

  get message(): string {
    return this.#message.textContent || "";
  }
  set message(value: string) {
    this.#message.textContent = value;
  }

  // --- Métodos públicos ---
  clearBoard(): void {
    this.#dealerCards.innerHTML = '';
    this.#playerCards.innerHTML = '';
    this.#message.textContent = '';
    this.#dealerScore.textContent = '0';
    this.#playerScore.textContent = '0';
  }

  renderCard(card: Card, isPlayer: boolean): void {
    const cardImg = document.createElement('img');
    cardImg.src = card.getImagePath();
    cardImg.alt = card.rank + card.suit;
    cardImg.classList.add('card');

    if (isPlayer) {
      this.#playerCards.appendChild(cardImg);
    } else {
      this.#dealerCards.appendChild(cardImg);
    }
  }

  renderHands(playerCards: Card[], dealerCards: Card[]): void {
    this.#playerCards.innerHTML = '';
    this.#dealerCards.innerHTML = '';
    playerCards.forEach(card => this.renderCard(card, true));
    dealerCards.forEach(card => this.renderCard(card, false));
  }

  updateScores(playerScore: number, dealerScore: number): void {
    this.#playerScore.textContent = playerScore.toString();
    this.#dealerScore.textContent = dealerScore.toString();
  }

  showMessage(message: string): void {
    this.#message.textContent = message;
  }
}
