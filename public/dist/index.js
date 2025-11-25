import { Game } from './Game.js';
import { Board } from './Board.js';
import { PlayerStatsManager } from './PlayerStats.js';
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    const board = new Board();
    // Instancia del gestor de estadísticas persistentes
    // Esto nos permite guardar/cargar balances entre partidas usando localStorage
    const statsManager = new PlayerStatsManager();
    // Variable para guardar los balances ANTES de que comience la partida
    // Se usa para calcular correctamente el cambio de saldo en saveGameResults()
    let preGameBalances = {};
    const newGameButton = document.getElementById('new-game-button');
    const clearBetsButton = document.getElementById('clear-bets-button');
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
    // Handler para apuestas desde la UI
    board.setBetHandler((index, amount) => {
        const player = game.playerList[index];
        if (!player)
            return;
        // Verificar si el jugador tiene fondos antes de permitir apuesta
        if (!game.canPlayerBet(player.id)) {
            board.showMessage(`⛔ ${player.id} está en QUIEBRA. Sin dinero para apostar. Reinicia las estadísticas para continuar.`);
            return;
        }
        const ok = game.placeBet(player.id, amount);
        if (!ok) {
            board.showMessage(`⚠️ Fondos insuficientes para ${player.id}. Intenta con una apuesta menor.`);
        }
        else {
            board.showMessage(`✓ ${player.id} apostó $${amount}`);
        }
        updateUI();
    });
    /**
     * Función auxiliar para actualizar la UI después de cambios en el juego.
     * Se llama tras cada acción (hit, stand, apuesta, etc.)
     *
     * RESPONSABILIDADES:
     * 1. Renderizar las manos (cartas) de todos los jugadores
     * 2. Si la partida terminó:
     *    a. Mostrar resultados (quién ganó)
     *    b. Guardar resultados en localStorage (actualizar balances)
     * 3. Si aún hay partida:
     *    a. Mostrar a quién le toca jugar
     */
    function updateUI() {
        board.renderHands(game.playerList, game.dealerInfo, game.currentTurnIndex);
        if (!game.isGameInProgress) {
            const results = game.getWinners();
            if (results) {
                board.showResults(results);
                // Una vez que la partida termina, guardamos los balances en localStorage
                saveGameResults(results);
                // Verificar si algún jugador está en quiebra
                checkForBankruptPlayers(results);
            }
        }
        else {
            const current = game.currentPlayer;
            board.showMessage(`Turno de: ${current?.id}`);
        }
    }
    /**
     * Verifica si algún jugador se ha quedado sin dinero (QUIEBRA).
     *
     * Paso a paso:
     * 1. Para cada jugador que acaba de terminar una mano:
     *    a. Obtén su balance actual
     *    b. Si balance <= 0:
     *       - Mostrar mensaje de quiebra en la UI
     *       - El jugador NO podrá apostar en la siguiente partida
     *       - Sugerir reiniciar estadísticas o dar más dinero
     */
    function checkForBankruptPlayers(results) {
        for (const r of results) {
            const player = game.playerList.find(p => p.id === r.id);
            if (!player)
                continue;
            if (player.balance <= 0) {
                console.warn(`⛔ ${player.id} está en QUIEBRA con balance: ${player.balance}`);
                board.showMessage(`⛔ ${player.id} está en QUIEBRA (Balance: $${player.balance}). ` +
                    `Presiona "Mostrar Estadísticas" y luego reinicia para continuar jugando.`);
            }
        }
    }
    /**
     * Guarda los resultados de la partida en localStorage.
     *
     * Paso a paso:
     * 1. Para cada jugador en la partida:
     *    a. Obtén su balance ACTUAL (tras resolver apuestas)
     *    b. Obtén su balance PRE-PARTIDA (guardado cuando comenzó la mano)
     *    c. Calcula el cambio: currentBalance - preGameBalance
     *    d. Determina si ganó o perdió esa mano
     *    e. Llama a statsManager.updatePlayerAfterRound() para actualizar sus estadísticas
     * 2. Muestra en consola los balances y cambios para debugging
     *
     * NOTA IMPORTANTE: Usamos preGameBalances (guardado antes de apostar)
     * en lugar de previousBalance del localStorage, para evitar errores
     * de cálculo cuando el balance cambia durante la partida.
     */
    function saveGameResults(results) {
        console.log("Guardando resultados de partida...");
        for (const result of results) {
            const player = game.playerList.find(p => p.id === result.id);
            if (!player)
                continue;
            // Determinar si el jugador ganó esta mano
            const wonHand = result.result === 'player';
            // Balance ACTUAL tras resolver apuestas
            const currentBalance = player.balance;
            // Balance PRE-PARTIDA (guardado antes de comenzar)
            // Esto es crítico para calcular correctamente el cambio
            const preGameBalance = preGameBalances[player.id] ?? 1000;
            // Calcular el cambio: puede ser positivo (ganó dinero) o negativo (perdió dinero)
            const change = currentBalance - preGameBalance;
            // Actualizar estadísticas en localStorage
            // Este método suma el 'change' al balance guardado
            statsManager.updatePlayerAfterRound(player.id, change, wonHand);
            console.log(`${player.id}: Balance pre-partida=${preGameBalance}, Balance actual=${currentBalance}, Cambio=${change}, Ganó=${wonHand}`);
        }
        // Mostrar estadísticas finales para verificación
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
        const balancesMap = {};
        for (const name of playerNames) {
            const playerData = statsManager.getOrCreatePlayer(name);
            balancesMap[name] = playerData.balance;
        }
        console.log("Balances cargados del localStorage:", balancesMap);
        // Inicia nueva partida pasando los balances persistentes
        game.newGame(playerNames, balancesMap);
        board.clearBoard();
        // GUARDAR LOS BALANCES PRE-PARTIDA
        // Esto es CRÍTICO: guardamos los balances ANTES de que se hagan apuestas
        // para poder calcular correctamente el cambio al final de la partida
        preGameBalances = {};
        for (const p of game.playerList) {
            preGameBalances[p.id] = p.balance;
            console.log(`Balance pre-partida guardado para ${p.id}: $${p.balance}`);
        }
        // Se limpia cualquier apuesta previa. Luego el usuario puede apostar desde la UI
        game.clearBets();
        // Mostrar balances iniciales en consola
        console.log("Balances iniciales de esta partida:");
        for (const p of game.playerList)
            console.log(p.id, p.balance);
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
    const statsButton = document.getElementById('stats-button');
    const statsArea = document.getElementById('stats-area');
    const statsContent = document.getElementById('stats-content');
    const closeStatsButton = document.getElementById('close-stats-button');
    statsButton.addEventListener('click', () => {
        // Limpiar contenido previo
        statsContent.innerHTML = '';
        // Obtener nombres de jugadores
        const playerNames = ["Jugador 1", "Jugador 2"];
        // Para cada jugador, obtener sus estadísticas y mostrarlas
        for (const name of playerNames) {
            const stats = statsManager.getStats(name);
            if (!stats)
                continue;
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
    /**
     * Evento: Pulsar "Reiniciar Estadísticas"
     *
     * Permite a los jugadores empezar de cero:
     * 1. Limpia todos los datos del localStorage
     * 2. Resetea balance a 1000 para cada jugador
     * 3. Resetea contador de wins/losses/rounds
     * 4. Pide confirmación antes de ejecutar
     *
     * Útil cuando:
     * - Un jugador se queda en quiebra (balance <= 0)
     * - Alguien quiere empezar una nueva sesión desde cero
     */
    const resetStatsButton = document.getElementById('reset-stats-button');
    resetStatsButton.addEventListener('click', () => {
        // Pedir confirmación para evitar accidentes
        const confirmed = confirm('⚠️ ¿Estás seguro de que quieres REINICIAR todas las estadísticas?\n\n' +
            'Esto hará que todos los jugadores vuelvan a tener $1000 y se borrarán todos los datos acumulados.\n\n' +
            'Esta acción NO se puede deshacer.');
        if (!confirmed) {
            board.showMessage('Reinicio cancelado.');
            return;
        }
        // Reiniciar cada jugador
        const playerNames = ["Jugador 1", "Jugador 2"];
        for (const name of playerNames) {
            statsManager.resetPlayer(name, 1000);
            console.log(`✓ ${name} ha sido reiniciado a $1000`);
        }
        // Mostrar confirmación
        board.showMessage('✓ Estadísticas reiniciadas. Presiona "Nuevo Juego" para comenzar.');
        // Opcionalmente, ocultar el panel de estadísticas si estaba abierto
        statsArea.style.display = 'none';
        // Log en consola para verificación
        console.log('Estadísticas reiniciadas para todos los jugadores');
    });
});
//# sourceMappingURL=index.js.map