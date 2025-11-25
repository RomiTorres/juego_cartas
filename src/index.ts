import { Game } from './Game.js';
import { Board } from './Board.js';
import { PlayerStatsManager } from './PlayerStats.js';

document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  const board = new Board();

  // Instancia del gestor de estadísticas persistentes
  // Esto nos permite guardar/cargar balances entre partidas usando localStorage
  const statsManager = new PlayerStatsManager();

  const newGameButton = document.getElementById('new-game-button')!;
  const clearBetsButton = document.getElementById('clear-bets-button')!;

  board.setActionHandlers(
    (index) => {
      if (index === game.currentTurnIndex) {
        game.hit();
        updateUI();
      }
    },
    (index) => {
      if (index === game.currentTurnIndex) {
        game.stand();
        updateUI();
      }
    }
  );

  // Handler para apuestas desde la UI
  board.setBetHandler((index, amount) => {
    const player = game.playerList[index];
    if (!player) return;
    const ok = game.placeBet(player.id, amount);
    if (!ok) {
      board.showMessage(`Fondos insuficientes para ${player.id} o apuesta inválida.`);
    } else {
      board.showMessage(`${player.id} apostó ${amount}`);
    }
    updateUI();
  });

  /**
   * Función auxiliar para actualizar la UI después de cambios en el juego.
   * Se llama tras cada acción (hit, stand, apuesta, etc.)
   */
  function updateUI(): void {
    board.renderHands(game.playerList, game.dealerInfo, game.currentTurnIndex);

    if (!game.isGameInProgress) {
      const results = game.getWinners();
      if (results) {
        board.showResults(results);
        // Una vez que la partida termina, guardamos los balances en localStorage
        saveGameResults(results);
      }
    } else {
      const current = game.currentPlayer;
      board.showMessage(`Turno de: ${current?.id}`);
    }
  }

  /**
   * Guarda los resultados de la partida en localStorage.
   * 
   * Paso a paso:
   * 1. Para cada jugador en la partida:
   *    a. Calcula cuánto ganó/perdió comparando su balance final con su apuesta inicial
   *    b. Determina si ganó o perdió esa mano
   *    c. Llama a statsManager.updatePlayerAfterRound() para actualizar sus estadísticas
   * 2. Muestra en consola los balances finales y cambios
   * 
   * Esto permite que los balances se acumulen entre partidas.
   */
  function saveGameResults(results: Array<{ id: string; result: 'player' | 'dealer' | 'push' }>): void {
    console.log("Guardando resultados de partida...");
    for (const result of results) {
      const player = game.playerList.find(p => p.id === result.id);
      if (!player) continue;

      // Determinar si el jugador ganó esta mano
      const wonHand = result.result === 'player';

      // Calcular cuánto cambió su saldo en esta mano
      // (su balance actual menos su balance inicial al comenzar la partida)
      // Nota: esto es simplificado; idealmente deberíamos guardar el balance
      // pre-partida para un cálculo más preciso.
      const playerInGame = game.playerList.find(p => p.id === result.id);
      const currentBalance = playerInGame?.balance ?? 0;

      // Obtener el balance previo del jugador desde localStorage
      const previousPlayer = statsManager.getPlayer(player.id);
      const previousBalance = previousPlayer?.balance ?? 1000;

      // Calcular el cambio (puede ser positivo o negativo)
      const change = currentBalance - previousBalance;

      // Actualizar estadísticas en localStorage
      statsManager.updatePlayerAfterRound(player.id, change, wonHand);

      console.log(`${player.id}: Balance anterior=${previousBalance}, Nuevo balance=${currentBalance}, Cambio=${change}, Ganó=${wonHand}`);
    }

    // Mostrar estadísticas finales
    console.log("Estadísticas actualizadas:");
    for (const p of game.playerList) {
      const stats = statsManager.getStats(p.id);
      if (stats) {
        console.log(`${p.id}: Balance=${stats.balance}, Wins=${stats.wins}, Losses=${stats.losses}, Ganancia/Pérdida=${stats.profitLoss}`);
      }
    }
  }

  /**
   * Evento: Pulsar "Nuevo Juego"
   * 
   * Paso a paso:
   * 1. Obtén los balances persistentes de cada jugador del localStorage
   * 2. Inicia una nueva partida con esos balances
   * 3. Limpia apuestas previas
   * 4. Renderiza la UI con los datos actualizados
   */
  newGameButton.addEventListener('click', () => {
    // Carga balances previos del localStorage
    // Si un jugador no tiene balance guardado, getOrCreatePlayer lo crea con 1000
    const playerNames = ["Jugador 1", "Jugador 2"];
    const balancesMap: Record<string, number> = {};

    for (const name of playerNames) {
      const playerData = statsManager.getOrCreatePlayer(name);
      balancesMap[name] = playerData.balance;
    }

    console.log("Balances cargados del localStorage:", balancesMap);

    // Inicia nueva partida pasando los balances persistentes
    game.newGame(playerNames, balancesMap);
    board.clearBoard();

    // Se limpia cualquier apuesta previa. Luego el usuario puede apostar desde la UI
    game.clearBets();
    // Mostrar balances iniciales en consola
    console.log("Balances iniciales de esta partida:");
    for (const p of game.playerList) console.log(p.id, p.balance);
    console.log("Dealer", game.dealerInfo.balance);

    updateUI();
  });

  // Permite limpiar apuestas para habilitar re-apuestas manualmente
  clearBetsButton.addEventListener('click', () => {
    game.clearBets();
    board.showMessage('Apuestas limpiadas. Puedes reapostar.');
    updateUI();
  });

  /**
   * Evento: Pulsar "Mostrar Estadísticas"
   * 
   * Abre un panel que muestra las estadísticas acumuladas de cada jugador:
   * - Balance actual
   * - Ganancias/Pérdidas desde el inicio
   * - Número de manos ganadas y perdidas
   * - Porcentaje de victorias
   */
  const statsButton = document.getElementById('stats-button')!;
  const statsArea = document.getElementById('stats-area')!;
  const statsContent = document.getElementById('stats-content')!;
  const closeStatsButton = document.getElementById('close-stats-button')!;

  statsButton.addEventListener('click', () => {
    // Limpiar contenido previo
    statsContent.innerHTML = '';

    // Obtener nombres de jugadores
    const playerNames = ["Jugador 1", "Jugador 2"];

    // Para cada jugador, obtener sus estadísticas y mostrarlas
    for (const name of playerNames) {
      const stats = statsManager.getStats(name);
      if (!stats) continue;

      // Crear un elemento para mostrar estadísticas del jugador
      const statDiv = document.createElement('div');
      statDiv.classList.add('player-stats');
      statDiv.style.marginBottom = '20px';
      statDiv.style.padding = '10px';
      statDiv.style.border = '1px solid #ccc';
      statDiv.style.borderRadius = '5px';

      // Determinar si ganó o perdió dinero neto
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

    // Mostrar el panel de estadísticas
    statsArea.style.display = 'block';
  });

  closeStatsButton.addEventListener('click', () => {
    statsArea.style.display = 'none';
  });
});
