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
    let imagePath = "img/cartas_poker/back.png";
    if(this.#isFaceUp) imagePath = `img/cartas_poker/${this.#rank}${this.#suit[0].toUpperCase()}.png`;
    card.setAttribute("src", imagePath);
  }

  }