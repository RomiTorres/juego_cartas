import { Deck } from "./Deck.js";
import { Card } from "./Card.js";

export type Player = {
  id: string;
  cards: Card[];
  score: number;
  isDealer?: boolean;
};

type Result = "player" | "dealer" | "push";

export class Game {
  #deck: Deck;
  #players: Player[];
  #dealer: Player;
  #currentTurn: number;
  #gameInProgress: boolean;

  constructor() {
    this.#deck = new Deck();
    this.#players = [];
    this.#dealer = { id: "Dealer", cards: [], score: 0, isDealer: true };
    this.#currentTurn = 0;
    this.#gameInProgress = false;
  }

  get playerList(): Player[] {
    return this.#players;
  }

  get dealerInfo(): Player {
    return this.#dealer;
  }

  get isGameInProgress(): boolean {
    return this.#gameInProgress;
  }

  get currentPlayer(): Player | null {
    return this.#players[this.#currentTurn] || null;
  }

    get currentTurnIndex(): number {
      return this.#currentTurn;
    }
  newGame(playerIds: string[] = ["Jugador 1", "Jugador 2"]): void {
    this.#deck = new Deck();
    this.#deck.shuffle();

    this.#players = playerIds.map(id => ({
      id,
      cards: [],
      score: 0
    }));

    this.#dealer = {
      id: "Dealer",
      cards: [],
      score: 0,
      isDealer: true
    };

    for (const player of this.#players) {
      const card1 = this.#deck.drawCard()!;
      card1.toggleFace();
      player.cards.push(card1);

      const card2 = this.#deck.drawCard()!;
      card2.toggleFace();
      player.cards.push(card2);
    }

    const dealerCard1 = this.#deck.drawCard()!;
    dealerCard1.toggleFace();
    this.#dealer.cards.push(dealerCard1);

    const dealerCard2 = this.#deck.drawCard()!;
    this.#dealer.cards.push(dealerCard2);

    this.updateScores();
    this.#currentTurn = 0;
    this.#gameInProgress = true;

    const blackjack = this.#players.some(p => p.score === 21) || this.#dealer.score === 21;
    if (blackjack) {
      this.endGame();
    }
  }

  hit(): void {
    if (!this.#gameInProgress) return;

    const currentPlayer = this.#players[this.#currentTurn];
    if (!currentPlayer) return;

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

  stand(): void {
    if (!this.#gameInProgress) return;
    this.#nextTurn();
  }

  #nextTurn(): void {
    this.#currentTurn++;
    if (this.#currentTurn >= this.#players.length) {
      this.dealerTurn();
    }
  }

  dealerTurn(): void {
    this.#dealer.cards.forEach(card => {
      if (!card.isFaceUp) card.toggleFace();
    });
    this.updateScores();

    while (this.#dealer.score < 17) {
      const card = this.#deck.drawCard();
      if (!card) break;
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
    for (const player of this.#players) {
      player.score = this.calculateScore(player.cards);
    }
    this.#dealer.score = this.calculateScore(this.#dealer.cards);
  }

  endGame(): void {
    this.#gameInProgress = false;
  }

  getWinners(): Array<{ id: string; result: Result }> | null {
    if (this.#gameInProgress) return null;

    const dealerScore = this.#dealer.score;
    const results: Array<{ id: string; result: Result }> = [];

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
      } else {
        results.push({ id: p.id, result: "dealer" });
      }
    }

    return results;
  }
}
