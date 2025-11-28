import { Game } from './Game.js';
import { Board } from './Board.js';
import { PlayerStatsManager } from './PlayerStats.js';

document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  const board = new Board();

  const statsManager = new PlayerStatsManager();

  const initialPlayerNames = ["Jugador 1", "Jugador 2"];
  for (const name of initialPlayerNames) {
    statsManager.resetPlayer(name, 1000); 
  }

  let preGameBalances: Record<string, number> = {};

  const newGameButton = document.getElementById('new-game-button')!;
  const clearBetsButton = document.getElementById('clear-bets-button')!;

  board.setActionHandlers(
    (index) => {
      if (index === game.currentTurnIndex) {
        const player = game.playerList[index];
        
        if (!game.hasActiveBet(player.id)) {
          board.showMessage(`⛔ ${player.id}: Debes apostar mínimo $10 antes de jugar.`);
          return;
        }
        
        game.hit();
        updateUI();
      }
    },
    (index) => {
      if (index === game.currentTurnIndex) {
        const player = game.playerList[index];
        
        if (!game.hasActiveBet(player.id)) {
          board.showMessage(`⛔ ${player.id}: Debes apostar mínimo $10 antes de jugar.`);
          return;
        }
        
        game.stand();
        updateUI();
      }
    }
  );

  board.setBetHandler((index, amount) => {
    const player = game.playerList[index];
    if (!player) return;
    
    if (!game.canPlayerBet(player.id)) {
      board.showMessage(`⛔ ${player.id} está en QUIEBRA. Sin dinero para apostar. Reinicia las estadísticas para continuar.`);
      return;
    }
    
    if (amount < 10) {
      board.showMessage(`⚠️ Apuesta mínima es $10. Intenta de nuevo.`);
      return;
    }
    
    const ok = game.placeBet(player.id, amount);
    if (!ok) {
      board.showMessage(`⚠️ ${player.id} no tiene fondos suficientes. Tienes $${game.getPlayerBalance(player.id)}.`);
    } else {
      board.showMessage(`✓ ${player.id} apostó $${amount}. ¡Puedes empezar a jugar!`);
    }
    updateUI();
  });

  function updateUI(): void {
    board.renderHands(game.playerList, game.dealerInfo, game.currentTurnIndex);

    if (!game.isGameInProgress) {
      const results = game.getWinners();
      if (results) {
        board.showResults(results);
        saveGameResults(results);
        
        checkForBankruptPlayers(results);
      }
    } else {
      const current = game.currentPlayer;
      board.showMessage(`Turno de: ${current?.id}`);
    }
  }

  function checkForBankruptPlayers(results: Array<{ id: string; result: 'player' | 'dealer' | 'push' }>): void {
    for (const r of results) {
      const player = game.playerList.find(p => p.id === r.id);
      if (!player) continue;

      if (player.balance <= 0) {
        console.warn(`⛔ ${player.id} está en QUIEBRA con balance: ${player.balance}`);
        board.showMessage(
          `⛔ ${player.id} está en QUIEBRA (Balance: $${player.balance}). ` +
          `Presiona "Mostrar Estadísticas" y luego reinicia para continuar jugando.`
        );
      }
    }
  }

  function saveGameResults(results: Array<{ id: string; result: 'player' | 'dealer' | 'push' }>): void {
    console.log("Guardando resultados de partida...");
    for (const result of results) {
      const player = game.playerList.find(p => p.id === result.id);
      if (!player) continue;

      const wonHand = result.result === 'player';

      const currentBalance = player.balance;
      
      const preGameBalance = preGameBalances[player.id] ?? 1000;

      const change = currentBalance - preGameBalance;

      statsManager.updatePlayerAfterRound(player.id, change, wonHand);

      console.log(`${player.id}: Balance pre-partida=${preGameBalance}, Balance actual=${currentBalance}, Cambio=${change}, Ganó=${wonHand}`);
    }

    console.log("Estadísticas actualizadas:");
    for (const p of game.playerList) {
      const stats = statsManager.getStats(p.id);
      if (stats) {
        console.log(`${p.id}: Balance=${stats.balance}, Wins=${stats.wins}, Losses=${stats.losses}, Ganancia/Pérdida=${stats.profitLoss}`);
      }
    }
  }

  newGameButton.addEventListener('click', () => {
    const playerNames = ["Jugador 1", "Jugador 2"];
    const balancesMap: Record<string, number> = {};

    for (const name of playerNames) {
      const playerData = statsManager.getOrCreatePlayer(name);
      balancesMap[name] = playerData.balance;
    }

    console.log("Balances cargados del localStorage:", balancesMap);

    game.newGame(playerNames, balancesMap);
    board.clearBoard();

    preGameBalances = {};
    for (const p of game.playerList) {
      preGameBalances[p.id] = p.balance;
      console.log(`Balance pre-partida guardado para ${p.id}: $${p.balance}`);
    }

    game.clearBets();
    console.log("Balances iniciales de esta partida:");
    for (const p of game.playerList) console.log(p.id, p.balance);
    console.log("Dealer", game.dealerInfo.balance);

    updateUI();
  });

  clearBetsButton.addEventListener('click', () => {
    game.clearBets();
    board.showMessage('Apuestas limpiadas. Puedes reapostar.');
    updateUI();
  });

  const statsButton = document.getElementById('stats-button')!;
  const statsArea = document.getElementById('stats-area')!;
  const statsContent = document.getElementById('stats-content')!;
  const closeStatsButton = document.getElementById('close-stats-button')!;

  statsButton.addEventListener('click', () => {
    statsContent.innerHTML = '';

    const playerNames = ["Jugador 1", "Jugador 2"];

    for (const name of playerNames) {
      const stats = statsManager.getStats(name);
      if (!stats) continue;

      const statDiv = document.createElement('div');
      statDiv.classList.add('player-stats');
      statDiv.style.marginBottom = '20px';
      statDiv.style.padding = '10px';
      statDiv.style.border = '1px solid #ccc';
      statDiv.style.borderRadius = '5px';

      const profitLossColor = stats.profitLoss >= 0 ? '#28a745' : '#dc3545';

      statDiv.innerHTML = `
        <h3>${name}</h3>
        <p><strong>Balance actual:</strong> $${stats.balance}</p>
        <p><strong>Ganancia/Pérdida:</strong> <span style="color: ${profitLossColor};"><strong>$${stats.profitLoss}</strong></span></p>
        <p><strong>Manos ganadas:</strong> ${stats.wins}</p>
        <p><strong>Manos perdidas:</strong> ${stats.losses}</p>
        <p><strong>Total de rondas:</strong> ${stats.rounds}</p>
        <p><strong>Porcentaje de victorias:</strong> ${stats.winRate}%</p>
      `;

      statsContent.appendChild(statDiv);
    }

    statsArea.style.display = 'block';
  });

  closeStatsButton.addEventListener('click', () => {
    statsArea.style.display = 'none';
  });

  const resetStatsButton = document.getElementById('reset-stats-button')!;

  resetStatsButton.addEventListener('click', () => {
    const confirmed = confirm(
      '⚠️ ¿Estás seguro de que quieres REINICIAR todas las estadísticas?\n\n' +
      'Esto hará que todos los jugadores vuelvan a tener $1000 y se borrarán todos los datos acumulados.\n\n' +
      'Esta acción NO se puede deshacer.'
    );

    if (!confirmed) {
      board.showMessage('Reinicio cancelado.');
      return;
    }

    const playerNames = ["Jugador 1", "Jugador 2"];
    for (const name of playerNames) {
      statsManager.resetPlayer(name, 1000);
      console.log(`✓ ${name} ha sido reiniciado a $1000`);
    }

    for (const name of playerNames) {
      const stats = statsManager.getOrCreatePlayer(name);
      const player = game.playerList.find(p => p.id === name);
      if (player) {
        player.balance = stats.balance;
        preGameBalances[player.id] = stats.balance;
      }
    }

    board.showMessage('✓ Estadísticas reiniciadas. Presiona "Nuevo Juego" para comenzar.');

    statsArea.style.display = 'none';

    updateUI();

    console.log('Estadísticas reiniciadas para todos los jugadores');
  });
});
