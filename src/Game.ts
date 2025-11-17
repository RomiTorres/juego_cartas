import { Deck } from "./Deck.js";
import { Card } from "./Card.js";

// Alias de tipo para jugador
type Player = {
  cards: Card[];
  score: number;
};

export class Game {
  // Campos privados nativos
  #deck: Deck;
  #player: Player;
  #dealer: Player;
  #gameInProgress: boolean;

  constructor() {
    this.#deck = new Deck();
    this.#player = { cards: [], score: 0 };
    this.#dealer = { cards: [], score: 0 };
    this.#gameInProgress = false;
  }

  // --- Getters y Setters ---
  get player(): Player {
    return this.#player;
  }

  get dealer(): Player {
    return this.#dealer;
  }

  get isGameInProgress(): boolean {
    return this.#gameInProgress;
  }

  // --- Métodos públicos ---
  newGame(): void {
    this.#deck = new Deck();
    this.#deck.shuffle();

    this.#player = { cards: [], score: 0 };
    this.#dealer = { cards: [], score: 0 };

    // Reparto inicial jugador
    const playerCard1 = this.#deck.drawCard()!;
    playerCard1.toggleFace();
    this.#player.cards.push(playerCard1);

    const playerCard2 = this.#deck.drawCard()!;
    playerCard2.toggleFace();
    this.#player.cards.push(playerCard2);

    // Reparto crupier
    const dealerFirstCard = this.#deck.drawCard()!;
    dealerFirstCard.toggleFace();
    this.#dealer.cards.push(dealerFirstCard);

    const dealerSecondCard = this.#deck.drawCard()!;
    this.#dealer.cards.push(dealerSecondCard);

    this.updateScores();
    this.#gameInProgress = true;

    if (this.#player.score === 21 || this.#dealer.score === 21) {
      this.endGame();
    }
  }

  hit(): void {
    if (!this.#gameInProgress) return;

    const card = this.#deck.drawCard()!;
    card.toggleFace();
    this.#player.cards.push(card);
    this.updateScores();

    if (this.#player.score > 21) {
      this.endGame();
    }
  }

  stand(): void {
    if (!this.#gameInProgress) return;
    this.dealerTurn();
  }

  dealerTurn(): void {
    this.#dealer.cards.forEach(card => {
      if (!card.isFaceUp) card.toggleFace();
    });
    this.updateScores();

    while (this.#dealer.score < 17) {
      const card = this.#deck.drawCard()!;
      card.toggleFace();
      this.#dealer.cards.push(card);
      this.updateScores();
    }

    this.endGame();
  }

  calculateScore(cards: Card[]): number {
    let score = 0;
    let aceCount = 0;

    for (const card of cards) {
      if (card.isFaceUp) {
        const value = card.getValue();
        if (value === 11) aceCount++;
        score += value;
      }
    }

    while (score > 21 && aceCount > 0) {
      score -= 10;
      aceCount--;
    }

    return score;
  }

  updateScores(): void {
    this.#player.score = this.calculateScore(this.#player.cards);
    this.#dealer.score = this.calculateScore(this.#dealer.cards);
  }

  endGame(): void {
    this.#gameInProgress = false;
  }

  getWinner(): 'player' | 'dealer' | 'push' | null {
    if (this.#gameInProgress) return null;

    const playerScore = this.#player.score;
    const dealerScore = this.calculateScore(this.#dealer.cards);

    if (playerScore > 21) return 'dealer';
    if (dealerScore > 21) return 'player';
    if (playerScore === 21 && this.#player.cards.length === 2 && dealerScore !== 21) return 'player';
    if (dealerScore === 21 && this.#dealer.cards.length === 2 && playerScore !== 21) return 'dealer';
    if (playerScore === dealerScore) return 'push';
    if (playerScore > dealerScore) return 'player';

    return 'dealer';
  }
}
