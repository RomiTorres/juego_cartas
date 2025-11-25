/**
 * PlayerStats.ts
 *
 * Este módulo gestiona la persistencia y estadísticas de jugadores.
 * Usa localStorage del navegador para guardar balances entre partidas.
 *
 * Conceptos clave:
 * - localStorage: almacenamiento en el navegador que persiste entre sesiones
 * - JSON.stringify/parse: convertir datos a/desde texto para guardar
 * - Interfaz PlayerData: estructura de datos para un jugador persistente
 */
/**
 * Clase que gestiona estadísticas y persistencia de jugadores.
 *
 * Responsabilidades:
 * 1. Guardar/cargar balances desde localStorage
 * 2. Crear nuevos jugadores si no existen
 * 3. Actualizar estadísticas tras cada partida
 * 4. Limpiar datos si es necesario
 */
export class PlayerStatsManager {
    storageKey = "blackjack_players"; // clave para localStorage
    /**
     * Obtiene los datos de todos los jugadores del localStorage.
     * Si no hay datos guardados, devuelve un array vacío.
     *
     * Paso a paso:
     * 1. Obtén del localStorage usando la clave
     * 2. Si no existe (null/undefined), devuelve array vacío
     * 3. Si existe, lo parses desde JSON a objetos TypeScript
     */
    getAllPlayers() {
        const stored = localStorage.getItem(this.storageKey);
        if (!stored) {
            return [];
        }
        try {
            return JSON.parse(stored);
        }
        catch (e) {
            console.error("Error al parsear datos de jugadores:", e);
            return [];
        }
    }
    /**
     * Obtiene un jugador específico por su ID.
     * Si no existe, devuelve null.
     *
     * Paso a paso:
     * 1. Obtén todos los jugadores
     * 2. Busca el que coincida con el ID
     * 3. Devuelve el jugador o null si no existe
     */
    getPlayer(playerId) {
        const players = this.getAllPlayers();
        return players.find(p => p.id === playerId) || null;
    }
    /**
     * Obtiene o crea un jugador. Si existe, lo devuelve;
     * si no, lo crea con valores iniciales.
     *
     * Paso a paso:
     * 1. Busca el jugador existente
     * 2. Si existe, devuélvelo
     * 3. Si no existe, crea uno nuevo con saldo inicial 1000
     * 4. Guarda el nuevo jugador
     * 5. Devuelve el jugador creado
     */
    getOrCreatePlayer(playerId, initialBalance = 1000) {
        const existing = this.getPlayer(playerId);
        if (existing) {
            return existing;
        }
        // Crear nuevo jugador
        const newPlayer = {
            id: playerId,
            balance: initialBalance,
            totalWins: 0,
            totalLosses: 0,
            totalRounds: 0,
            initialBalance: initialBalance
        };
        // Guardar el nuevo jugador
        this.savePlayer(newPlayer);
        return newPlayer;
    }
    /**
     * Guarda o actualiza un jugador en localStorage.
     *
     * Paso a paso:
     * 1. Obtén todos los jugadores actuales
     * 2. Busca si el jugador ya existe
     * 3. Si existe, reemplaza sus datos
     * 4. Si no existe, añádelo al array
     * 5. Guarda el array actualizado en localStorage como JSON
     */
    savePlayer(playerData) {
        const players = this.getAllPlayers();
        const index = players.findIndex(p => p.id === playerData.id);
        if (index !== -1) {
            // El jugador ya existe, actualizar
            players[index] = playerData;
        }
        else {
            // Nuevo jugador, añadir
            players.push(playerData);
        }
        // Guardar en localStorage
        localStorage.setItem(this.storageKey, JSON.stringify(players));
    }
    /**
     * Actualiza el balance de un jugador después de una mano.
     * También actualiza sus estadísticas.
     *
     * Parámetros:
     * - playerId: identificador del jugador
     * - amountChange: cantidad a sumar (positiva si ganó, negativa si perdió)
     * - wonHand: true si ganó la mano, false si perdió
     *
     * Paso a paso:
     * 1. Obtén el jugador actual
     * 2. Si no existe, no hagas nada
     * 3. Suma el cambio de saldo
     * 4. Incrementa totalRounds
     * 5. Actualiza totalWins o totalLosses según el resultado
     * 6. Guarda los cambios
     */
    updatePlayerAfterRound(playerId, amountChange, wonHand) {
        const player = this.getPlayer(playerId);
        if (!player)
            return;
        // Actualizar balance
        player.balance += amountChange;
        // Actualizar estadísticas
        player.totalRounds++;
        if (wonHand) {
            player.totalWins++;
        }
        else {
            player.totalLosses++;
        }
        // Guardar cambios
        this.savePlayer(player);
    }
    /**
     * Calcula la ganancia/pérdida neta de un jugador desde el inicio de la sesión.
     * (balance actual - saldo inicial de la sesión)
     */
    getNetProfitLoss(playerId) {
        const player = this.getPlayer(playerId);
        if (!player)
            return 0;
        return player.balance - player.initialBalance;
    }
    /**
     * Reinicia todos los datos de un jugador (para comenzar una nueva sesión).
     * Preserva el ID pero resetea balance y estadísticas.
     */
    resetPlayer(playerId, newInitialBalance = 1000) {
        const player = this.getOrCreatePlayer(playerId, newInitialBalance);
        player.balance = newInitialBalance;
        player.totalWins = 0;
        player.totalLosses = 0;
        player.totalRounds = 0;
        player.initialBalance = newInitialBalance;
        this.savePlayer(player);
    }
    /**
     * Limpia todos los datos de jugadores (útil para debugging o reiniciar todo).
     */
    clearAllPlayers() {
        localStorage.removeItem(this.storageKey);
    }
    /**
     * Obtiene un resumen de estadísticas para un jugador.
     * Útil para mostrar en la UI.
     */
    getStats(playerId) {
        const player = this.getPlayer(playerId);
        if (!player)
            return null;
        const winRate = player.totalRounds > 0
            ? Math.round((player.totalWins / player.totalRounds) * 100)
            : 0;
        return {
            balance: player.balance,
            wins: player.totalWins,
            losses: player.totalLosses,
            rounds: player.totalRounds,
            profitLoss: this.getNetProfitLoss(playerId),
            winRate: winRate
        };
    }
}
//# sourceMappingURL=PlayerStats.js.map