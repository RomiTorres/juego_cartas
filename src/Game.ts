import { Deck } from "./Deck.js";
import { Card } from "./Card.js";

export type Player = {
  id: string;
  cards: Card[];
  score: number;
  isDealer?: boolean;
  balance: number;       // saldo disponible del jugador o crupier
  currentBet?: number;   // apuesta actual para la ronda
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
    this.#dealer = { id: "Dealer", cards: [], score: 0, isDealer: true, balance: 0 };
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
  /**
   * Inicia una nueva partida.
   * Acepta IDs de jugadores y opcionalmente saldos iniciales para cada uno.
   * 
   * Parámetros:
   * - playerIds: array de IDs/nombres de jugadores
   * - initialBalances: objeto opcional que mapea ID → saldo inicial
   *   Si no se proporciona, todos los jugadores comienzan con 1000 (START_BALANCE)
   * 
   * Ejemplo de uso:
   *   game.newGame(["Alice", "Bob"], { "Alice": 500, "Bob": 750 })
   * Esto causa que Alice tenga 500 y Bob 750 al inicio.
   */
  newGame(
    playerIds: string[] = ["Jugador 1", "Jugador 2"],
    initialBalances: Record<string, number> = {}
  ): void {
    this.#deck = new Deck();
    this.#deck.shuffle();

    const START_BALANCE = 1000;

    // Inicializamos jugadores con saldo
    // Si se proporciona un balance inicial para este jugador, lo usa;
    // si no, usa START_BALANCE como fallback
    this.#players = playerIds.map(id => ({
      id,
      cards: [],
      score: 0,
      balance: initialBalances[id] ?? START_BALANCE
    }));

    // El dealer tiene un bankroll mayor (ejemplo)
    this.#dealer = {
      id: "Dealer",
      cards: [],
      score: 0,
      isDealer: true,
      balance: START_BALANCE * 10
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
    // Aseguramos que las puntuaciones estén actualizadas y resolvemos las apuestas
    this.updateScores();
    this.resolveBets();
  }

  /**
   * Realiza una apuesta para un jugador específico.
   * 
   * Paso a paso:
   * 1. Valida que el jugador exista
   * 2. Valida que la cantidad sea positiva
   * 3. Valida que el jugador tenga suficientes fondos
   * 4. Si todo es válido:
   *    a. Resta la apuesta del balance del jugador
   *    b. Suma la apuesta al balance del crupier (escrow)
   *    c. Registra la apuesta actual del jugador
   * 5. Devuelve true si tuvo éxito, false si falló (y el balance no cambia)
   * 
   * NOTA IMPORTANTE: Los balances pueden crecer más allá de 1000 si el jugador gana.
   * No hay límite superior de ganancia.
   */
  placeBet(playerId: string, amount: number): boolean {
    const player = this.#players.find(p => p.id === playerId);
    if (!player) return false;
    
    // Validar cantidad positiva
    if (amount <= 0) return false;
    
    // Validar fondos suficientes
    // Si no tiene dinero, la apuesta se rechaza y devuelve false
    if (player.balance < amount) return false;

    // TRANSFERENCIA DE FONDOS (modelo "escrow"):
    // El dinero se mueve del jugador al crupier/banco hasta que se resuelva la mano
    player.balance -= amount;           // jugador pierde el dinero temporalmente
    player.currentBet = (player.currentBet ?? 0) + amount; // registrar apuesta
    this.#dealer.balance += amount;     // el crupier lo tiene en custodia
    
    return true; // apuesta aceptada
  }

  /**
   * Verifica si un jugador puede seguir jugando (tiene dinero).
   * 
   * Paso a paso:
   * 1. Encuentra el jugador por ID
   * 2. Devuelve true si tiene balance > 0 (puede apostar)
   * 3. Devuelve false si tiene balance <= 0 (QUIEBRA - debe dejar de jugar)
   * 
   * Esto se usa antes de permitir nuevas apuestas o iniciar una nueva mano.
   */
  canPlayerBet(playerId: string): boolean {
    const player = this.#players.find(p => p.id === playerId);
    if (!player) return false;
    return player.balance > 0; // solo puede apostar si tiene dinero disponible
  }

  /**
   * Obtiene el balance actual de un jugador.
   * Útil para verificaciones de solvencia en la UI.
   */
  getPlayerBalance(playerId: string): number {
    const player = this.#players.find(p => p.id === playerId);
    return player?.balance ?? 0;
  }

  /**
   * Limpia las apuestas almacenadas en los jugadores (prepara siguiente ronda)
   */
  clearBets(): void {
    for (const p of this.#players) {
      p.currentBet = undefined;
    }
  }

  /**
   * Resuelve todas las apuestas de los jugadores al final de la mano.
   * 
   * REGLAS DE PAGO:
   * ===============
   * Cuando un jugador apuesta, el dinero va al crupier (escrow).
   * Al terminar, el crupier devuelve/paga según el resultado:
   * 
   * 1. JUGADOR PIERDE (playerScore > 21 o dealer ganó):
   *    - El crupier se queda con la apuesta
   *    - Payout = 0 (el jugador ya perdió el dinero)
   *    - Balance: disminuye en la cantidad apostada
   * 
   * 2. EMPATE/PUSH (playerScore == dealerScore):
   *    - El crupier devuelve la apuesta sin cambios
   *    - Payout = 1 × apuesta
   *    - Balance: vuelve al mismo
   * 
   * 3. JUGADOR GANA (sin blackjack):
   *    - El crupier paga 1:1 (devuelve apuesta + ganancias)
   *    - Payout = 2 × apuesta
   *    - Balance: aumenta en la cantidad apostada (ganancia = apuesta)
   * 
   * 4. BLACKJACK (21 con 2 cartas, sin que dealer tenga blackjack):
   *    - El crupier paga 3:2 (mejor pago por suerte)
   *    - Payout = 2.5 × apuesta
   *    - Balance: aumenta 1.5× la apuesta (mayor ganancia)
   * 
   * NOTA: Los saldos pueden crecer indefinidamente si ganan muchas manos.
   * Si un jugador pierde todo (balance = 0), no podrá apostar de nuevo
   * hasta que reciba más dinero o reinicie sus estadísticas.
   */
  resolveBets(): void {
    if (this.#gameInProgress) return;
    const results = this.getWinners();
    if (!results) return;

    for (const r of results) {
      const player = this.#players.find(p => p.id === r.id);
      if (!player) continue;
      const bet = player.currentBet ?? 0;

      const playerBlackjack = player.score === 21 && player.cards.length === 2;
      const dealerBlackjack = this.#dealer.score === 21 && this.#dealer.cards.length === 2;

      if (bet <= 0) {
        player.currentBet = undefined;
        continue;
      }

      if (r.result === "player") {
        if (playerBlackjack && !dealerBlackjack) {
          const payout = 2.5 * bet; // devuelve apuesta + 1.5x ganancia
          this.#dealer.balance -= payout;
          player.balance += payout;
        } else {
          const payout = 2.0 * bet; // devuelve apuesta + 1x ganancia
          this.#dealer.balance -= payout;
          player.balance += payout;
        }
      } else if (r.result === "push") {
        const payout = 1.0 * bet; // devolver la apuesta
        this.#dealer.balance -= payout;
        player.balance += payout;
      } else if (r.result === "dealer") {
        // El dealer ya tomó la apuesta cuando se hizo, no hacer nada adicional
      }

      // limpiar apuesta del jugador
      player.currentBet = undefined;
    }
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
