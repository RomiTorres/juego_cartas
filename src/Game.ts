import { Deck } from "./Deck.js";
import { Card } from "./Card.js";

// Define la estructura para un jugador (jugador o crupier)
type Player = {
  cards: Card[];
  score: number;
};

export class Game {
  private deck: Deck;
  public player: Player;
  public dealer: Player;
  private gameInProgress: boolean;

  constructor() {
    this.deck = new Deck();
    this.player = { cards: [], score: 0 };
    this.dealer = { cards: [], score: 0 };
    this.gameInProgress = false;
  }

  // Inicia una nueva partida
  public newGame(): void {
    this.deck = new Deck();
    this.deck.shuffle();

    this.player = { cards: [], score: 0 };
    this.dealer = { cards: [], score: 0 };

    // Reparto inicial para el jugador (ambas boca arriba)
    const playerCard1 = this.deck.drawCard()!;
    playerCard1.toggleFace();
    this.player.cards.push(playerCard1);

    const playerCard2 = this.deck.drawCard()!;
    playerCard2.toggleFace();
    this.player.cards.push(playerCard2);
    
    // Reparto para el crupier (primera boca arriba, segunda boca abajo)
    const dealerFirstCard = this.deck.drawCard()!;
    dealerFirstCard.toggleFace();
    this.dealer.cards.push(dealerFirstCard);
    
    const dealerSecondCard = this.deck.drawCard()!;
    this.dealer.cards.push(dealerSecondCard);

    this.updateScores();
    this.gameInProgress = true;

    // Comprobar si hay Blackjacks iniciales
    if (this.player.score === 21 || this.dealer.score === 21) {
      this.endGame();
    }
  }

  // El jugador pide una carta
  public hit(): void {
    if (!this.gameInProgress) return;

    const card = this.deck.drawCard()!;
    card.toggleFace();
    this.player.cards.push(card);
    this.updateScores();

    if (this.player.score > 21) {
      this.endGame();
    }
  }

  // El jugador se planta, turno del crupier
  public stand(): void {
    if (!this.gameInProgress) return;
    this.dealerTurn();
  }

 
  private dealerTurn(): void {
  // Voltear la carta oculta del crupier
  this.dealer.cards.forEach(card => {
    if (!card.isFaceUp) card.toggleFace();
  });
  this.updateScores();

  // El crupier pide cartas hasta tener 17 o más
  while (this.dealer.score < 17) {
    const card = this.deck.drawCard()!;
    card.toggleFace(); // 👈 IMPORTANTE: mostrar la carta
    this.dealer.cards.push(card);
    this.updateScores();
  }

  this.endGame();
}


  // Calcula la puntuación de un jugador, manejando los Ases
  private calculateScore(cards: Card[]): number {
    let score = 0;
    let aceCount = 0;

    for (const card of cards) {
        if (card.isFaceUp) {
            const value = card.getValue();
            if (value === 11) {
                aceCount++;
            }
            score += value;
        }
    }

    // Ajustar el valor de los Ases si la puntuación supera 21
    while (score > 21 && aceCount > 0) {
      score -= 10;
      aceCount--;
    }

    return score;
  }

  // Actualiza las puntuaciones de ambos jugadores
  private updateScores(): void {
    this.player.score = this.calculateScore(this.player.cards);
    this.dealer.score = this.calculateScore(this.dealer.cards);
  }

  // Termina el juego y determina el ganador
  private endGame(): void {
    this.gameInProgress = false;
    // La lógica para determinar el ganador y mostrar el mensaje se manejará en index.ts
    // para separar la lógica del juego de la manipulación del DOM.
  }

  public getWinner(): 'player' | 'dealer' | 'push' | null {
    if (this.gameInProgress) return null;

    const playerScore = this.player.score;
    const dealerScore = this.calculateScore(this.dealer.cards); // Recalcula con todas las cartas visibles

    if (playerScore > 21) return 'dealer';
    if (dealerScore > 21) return 'player';
    if (playerScore === 21 && this.player.cards.length === 2 && dealerScore !== 21) return 'player'; // Blackjack del jugador
    if (dealerScore === 21 && this.dealer.cards.length === 2 && playerScore !== 21) return 'dealer'; // Blackjack del crupier
    if (playerScore === dealerScore) return 'push';
    if (playerScore > dealerScore) return 'player';
    
    return 'dealer';
  }

  public isGameInProgress(): boolean {
    return this.gameInProgress;
  }
}