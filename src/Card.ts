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

  set isFaceUp(newState: boolean) {
    this.#isFaceUp = newState;
  }

  //Alternar carta
  toggleFace(): void {
   this.#isFaceUp = !this.#isFaceUp;
  }

  // Establecer imagen de tarjeta
  setCardImage(id:string) {
    const card = document.getElementById(id);
    let imagePath = "../public/img/cartas_poker/back.png";
    if(this.#isFaceUp) imagePath = "../public/img/cartas_poker/AS.png"
    // ESTO VA MAS ADELANTE
    // if(this.#isFaceUp) imagePath = `../public/img/cartas_poker/${this.#rank}${this.#suit[0].toUpperCase()}.png`;
    card.setAttribute("src", imagePath);
  }

  //  spinCard():void {
    
  //   const currentLetter = document.getElementById("reverse-letter");
  //   currentLetter.addEventListener("click", () => {
  //     currentLetter.remove();
  //     console.log(currentLetter, 'soy current')
  //   const newCard = document.createElement("img");
  //   newCard.src = './img/cartas_poker/AS.png';
  //   const container = document.querySelector("p");
  //   container.appendChild(newCard);
  
  // })}
}