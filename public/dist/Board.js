export class Board {
    dealerCards;
    playerCards;
    dealerScore;
    playerScore;
    message;
    constructor() {
        this.dealerCards = document.getElementById('dealer-cards');
        this.playerCards = document.getElementById('player-cards');
        this.dealerScore = document.getElementById('dealer-score');
        this.playerScore = document.getElementById('player-score');
        this.message = document.getElementById('game-message');
    }
    clearBoard() {
        this.dealerCards.innerHTML = '';
        this.playerCards.innerHTML = '';
        this.message.textContent = '';
        this.dealerScore.textContent = '0';
        this.playerScore.textContent = '0';
    }
    renderCard(card, isPlayer) {
        const cardImg = document.createElement('img');
        cardImg.src = card.getImagePath();
        cardImg.alt = card.rank + card.suit;
        cardImg.classList.add('card');
        if (isPlayer) {
            this.playerCards.appendChild(cardImg);
        }
        else {
            this.dealerCards.appendChild(cardImg);
        }
    }
    renderHands(playerCards, dealerCards) {
        this.playerCards.innerHTML = '';
        this.dealerCards.innerHTML = '';
        playerCards.forEach(card => this.renderCard(card, true));
        dealerCards.forEach(card => this.renderCard(card, false));
    }
    updateScores(playerScore, dealerScore) {
        this.playerScore.textContent = playerScore.toString();
        this.dealerScore.textContent = dealerScore.toString();
    }
    showMessage(message) {
        this.message.textContent = message;
    }
}
//# sourceMappingURL=Board.js.map