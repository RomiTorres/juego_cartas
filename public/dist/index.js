import { Board } from "./Board.js";
import { Card } from "./Card.js";
import { Deck } from "./Deck.js";
const suit = ["spades", "hearts", "diamonds", "clubs"];
const rank = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const deckInstance = new Deck(suit, rank);
const deck = deckInstance.generateDeck(suit, rank);
const board = new Board(deck, 4);
board.renderBoard();
const selectedCard = document.getElementById('selected-card');
const visibleCards = document.getElementsByClassName("deck-card");
let key;
for (let i = 0; i < visibleCards.length; i++) {
    visibleCards[i].addEventListener("click", (e) => {
        if (e.target instanceof HTMLElement) {
            key = parseInt(e.target.id.substring(e.target.id.indexOf("-") + 1));
            if (board.visibleCards.get(key) instanceof Card) {
                board.visibleCards.get(key).toggleFace();
                board.visibleCards.get(key).setCardImage(e.target.id);
            }
        }
    });
    visibleCards[i].addEventListener('dragstart', (e) => {
        if (e.target instanceof HTMLElement) {
            e.dataTransfer.setData('text/plain', e.target.id);
            e.dataTransfer.effectAllowed = 'move';
            e.target.classList.add('dragging');
            e.target.setAttribute('aria-grabbed', 'true');
        }
    });
    visibleCards[i].addEventListener('dragend', (e) => {
        if (e.target instanceof HTMLElement) {
            e.target.classList.remove('dragging');
            e.target.setAttribute('aria-grabbed', 'false');
        }
    });
}
if (selectedCard) {
    selectedCard.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        selectedCard.classList.replace('selected-cards', 'over');
    });
    selectedCard.addEventListener('dragleave', () => {
        selectedCard.classList.replace('over', 'selected-cards');
    });
    selectedCard.addEventListener('drop', (e) => {
        e.preventDefault();
        selectedCard.classList.remove('over');
        const id = e.dataTransfer.getData('text/plain');
        const dragged = document.getElementById(id);
        if (!dragged)
            return;
        selectedCard.innerHTML = '';
        selectedCard.appendChild(dragged);
    });
}
else {
    console.warn('Elemento #selected-card no encontrado en el DOM. Event listeners no asignados.');
}
//# sourceMappingURL=index.js.map