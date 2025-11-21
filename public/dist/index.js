import { Game } from './Game.js';
import { Board } from './Board.js';
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    const board = new Board();
    const newGameButton = document.getElementById('new-game-button');
    board.setActionHandlers((index) => {
        if (index === game.currentTurnIndex) {
            game.hit();
            updateUI();
        }
    }, (index) => {
        if (index === game.currentTurnIndex) {
            game.stand();
            updateUI();
        }
    });
    function updateUI() {
        board.renderHands(game.playerList, game.dealerInfo, game.currentTurnIndex);
        if (!game.isGameInProgress) {
            const results = game.getWinners();
            if (results)
                board.showResults(results);
        }
        else {
            const current = game.currentPlayer;
            board.showMessage(`Turno de: ${current?.id}`);
        }
    }
    newGameButton.addEventListener('click', () => {
        game.newGame(["Jugador 1", "Jugador 2"]);
        board.clearBoard();
        updateUI();
    });
});
//# sourceMappingURL=index.js.map