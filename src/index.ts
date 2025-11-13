import { Card } from "./Card.js";

const card = new Card("A", "spades");
document.getElementById("reverse-letter").addEventListener("click", (e) => {
  card.toggleFace();
  if(e.target instanceof HTMLElement) card.setCardImage(e.target.getAttribute("id"));
})
