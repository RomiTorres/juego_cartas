import { Game } from './Game.js';
import { Board } from './Board.js';
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    const board = new Board();
    const newGameButton = document.getElementById('new-game-button');
    const hitButton = document.getElementById('hit-button');
    const standButton = document.getElementById('stand-button');
    function updateUI() {
        board.renderHands(game.player.cards, game.dealer.cards);
        board.updateScores(game.player.score, game.dealer.score);
        if (!game.isGameInProgress()) {
            const winner = game.getWinner();
            let message = '';
            if (winner === 'player') {
                message = '¡El jugador gana!';
            }
            else if (winner === 'dealer') {
                message = '¡El crupier gana!';
            }
            else {
                message = '¡Empate!';
            }
            board.showMessage(message);
            hitButton.disabled = true;
            standButton.disabled = true;
        }
    }
    newGameButton.addEventListener('click', () => {
        game.newGame();
        board.clearBoard();
        updateUI();
        hitButton.disabled = false;
        standButton.disabled = false;
        board.showMessage('');
    });
    hitButton.addEventListener('click', () => {
        game.hit();
        updateUI();
    });
    standButton.addEventListener('click', () => {
        game.stand();
        updateUI();
    });
    // Iniciar deshabilitado hasta que se presione "Nuevo Juego"
    hitButton.disabled = true;
    standButton.disabled = true;
});
//# sourceMappingURL=index.js.map