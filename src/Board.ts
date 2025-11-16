import { Card } from "./Card.js";

export class Board {
  private dealerCards: HTMLElement;
  private playerCards: HTMLElement;
  private dealerScore: HTMLElement;
  private playerScore: HTMLElement;
  private message: HTMLElement;

  constructor() {
    this.dealerCards = document.getElementById('dealer-cards')!;
    this.playerCards = document.getElementById('player-cards')!;
    this.dealerScore = document.getElementById('dealer-score')!;
    this.playerScore = document.getElementById('player-score')!;
    this.message = document.getElementById('game-message')!;
  }

  clearBoard(): void {
    this.dealerCards.innerHTML = '';
    this.playerCards.innerHTML = '';
    this.message.textContent = '';
    this.dealerScore.textContent = '0';
    this.playerScore.textContent = '0';
  }

  renderCard(card: Card, isPlayer: boolean): void {
    const cardImg = document.createElement('img');
    cardImg.src = card.getImagePath();
    cardImg.alt = card.rank + card.suit;
    cardImg.classList.add('card');

    if (isPlayer) {
      this.playerCards.appendChild(cardImg);
    } else {
      this.dealerCards.appendChild(cardImg);
    }
  }

  renderHands(playerCards: Card[], dealerCards: Card[]): void {
    this.playerCards.innerHTML = '';
    this.dealerCards.innerHTML = '';
    playerCards.forEach(card => this.renderCard(card, true));
    dealerCards.forEach(card => this.renderCard(card, false));
  }

  updateScores(playerScore: number, dealerScore: number): void {
    this.playerScore.textContent = playerScore.toString();
    this.dealerScore.textContent = dealerScore.toString();
  }

  showMessage(message: string): void {
    this.message.textContent = message;
  }
}