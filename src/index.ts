import { Board } from "./Board.js";
import { Card } from "./Card.js";

const card1 = new Card("3", "spades");
const card2 = new Card("J", "heart");
const card3 = new Card("K", "diamond");
const card4 = new Card("10", "clubs");

const deck = [card1, card2, card3, card4];
const board = new Board(deck, 2);
console.log(board)
board.renderBoard();

document.getElementById("reverse-letter").addEventListener("click", (e) => {
  if (board.visibleCards.get(1) instanceof Card) {
    board.visibleCards.get(1).toggleFace();
    if(e.target instanceof HTMLElement) board.visibleCards.get(1).setCardImage(e.target.getAttribute("id"));
  }
})