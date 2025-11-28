export class Card {
  #rank: string;
  #suit: string;
  #isFaceUp: boolean;

  constructor(rank:string, suit: string) {
    this.#rank = rank;
    this.#suit = suit;
    this.#isFaceUp = false;
  }

  get rank(): string {
    return this.#rank;
  }

  get suit(): string {
    return this.#suit;
  }

  get isFaceUp(): boolean {
    return this.#isFaceUp;
  }


  toggleFace(): void {
   this.#isFaceUp = !this.#isFaceUp;
  }

  setCardImage(id:string) {
    const card = document.getElementById(id);
    if (card) {
      card.setAttribute("src", this.getImagePath());
    }
  }

  getImagePath(): string {
    if (!this.#isFaceUp) {
      return `img/cartas_poker/back.png`;
    }
    const suitChar = this.#suit.charAt(0).toUpperCase();
    const rankChar = this.#rank === '10' ? '0' : this.#rank;
    return `img/cartas_poker/${rankChar}${suitChar}.png`;
  }

  getValue(): number {
    if (this.#rank === 'A') {
      return 11;
    }
    if (['K', 'Q', 'J'].includes(this.#rank)) {
      return 10;
    }
    return parseInt(this.#rank);
  }
}