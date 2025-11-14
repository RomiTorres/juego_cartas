import { Board } from "./Board.js";
import { Card } from "./Card.js";

// const cardInstance = new Card();

// cardInstance.spinCard();


const card1 = new Card("A", "spades"); // spades, hearts, diamonds, clubs
const card2 = new Card("K", "hearts")
const card3 = new Card("3", "clubs");
const card4 = new Card("9", "diamonds");

const deck = [card1, card2, card3, card4];
const board = new Board(deck, 4);
board.renderBoard();
const selectedCard: HTMLElement = document.getElementById('selected-card')

const visibleCards: HTMLCollection =  document.getElementsByClassName("deck-card");
let key: number;
for(let i = 0; i < visibleCards.length; i++) {
  visibleCards[i].addEventListener("click", (e) => {
    if(e.target instanceof HTMLElement) {
      key = parseInt(e.target.id.substring(e.target.id.indexOf("-")+ 1));
      if( board.visibleCards.get(key) instanceof Card) {
          board.visibleCards.get(key).toggleFace();
          board.visibleCards.get(key).setCardImage(e.target.id);
      }
    }
    
  })
  visibleCards[i].addEventListener('dragstart', (e: DragEvent) => {
    if(e.target instanceof HTMLElement) {
      e.dataTransfer.setData('text/plain',e.target.id);
      e.dataTransfer.effectAllowed = 'move';
      e.target.classList.add('dragging');
      e.target.setAttribute('aria-grabbed', 'true') ;
    }
  });

  visibleCards[i].addEventListener('dragend', (e:DragEvent) => {
     if(e.target instanceof HTMLElement) {
    e.target.classList.remove('dragging');
    e.target.setAttribute('aria-grabbed', 'false');
     }
  })

}

selectedCard.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  selectedCard.classList.replace('selected-cards', 'over');
})

selectedCard.addEventListener('dragleave', () => {
  selectedCard.classList.replace('over', 'selected-cards');
})


selectedCard.addEventListener('drop', (e) => {
  e.preventDefault();
  selectedCard.classList.remove('over');

  const id = e.dataTransfer.getData('text/plain');
  const dragged = document.getElementById(id);

  if(!dragged) return ;

  selectedCard.innerHTML = '';
  selectedCard.appendChild(dragged);

  

})








// document.getElementById("card-1").addEventListener("click", (e) => {
//   if( board.visibleCards.get(1) instanceof Card) {
//   board.visibleCards.get(1).toggleFace();
//   if(e.target instanceof HTMLElement)  board.visibleCards.get(1).setCardImage(e.target.getAttribute("id"));
//   }
// });

// document.getElementById("card-2").addEventListener("click", (e) => {
//    if( board.visibleCards.get(2) instanceof Card) {
//   board.visibleCards.get(2).toggleFace();
//   if(e.target instanceof HTMLElement)  board.visibleCards.get(2).setCardImage(e.target.getAttribute("id"));
//    }
// });

// document.getElementById("card-3").addEventListener("click", (e) => {
//    if( board.visibleCards.get(3) instanceof Card) {
//   board.visibleCards.get(3).toggleFace();
//   if(e.target instanceof HTMLElement)  board.visibleCards.get(3).setCardImage(e.target.getAttribute("id"));
//    }
// });