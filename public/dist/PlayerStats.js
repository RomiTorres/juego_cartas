export class PlayerStatsManager {
    storageKey = "blackjack_players";
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
    getPlayer(playerId) {
        const players = this.getAllPlayers();
        return players.find(p => p.id === playerId) || null;
    }
    getOrCreatePlayer(playerId, initialBalance = 1000) {
        const existing = this.getPlayer(playerId);
        if (existing) {
            return existing;
        }
        const newPlayer = {
            id: playerId,
            balance: initialBalance,
            totalWins: 0,
            totalLosses: 0,
            totalRounds: 0,
            initialBalance: initialBalance
        };
        this.savePlayer(newPlayer);
        return newPlayer;
    }
    savePlayer(playerData) {
        const players = this.getAllPlayers();
        const index = players.findIndex(p => p.id === playerData.id);
        if (index !== -1) {
            players[index] = playerData;
        }
        else {
            players.push(playerData);
        }
        localStorage.setItem(this.storageKey, JSON.stringify(players));
    }
    updatePlayerAfterRound(playerId, amountChange, wonHand) {
        const player = this.getPlayer(playerId);
        if (!player)
            return;
        player.balance += amountChange;
        player.totalRounds++;
        if (wonHand) {
            player.totalWins++;
        }
        else {
            player.totalLosses++;
        }
        this.savePlayer(player);
    }
    getNetProfitLoss(playerId) {
        const player = this.getPlayer(playerId);
        if (!player)
            return 0;
        return player.balance - player.initialBalance;
    }
    resetPlayer(playerId, newInitialBalance = 1000) {
        const player = this.getOrCreatePlayer(playerId, newInitialBalance);
        player.balance = newInitialBalance;
        player.totalWins = 0;
        player.totalLosses = 0;
        player.totalRounds = 0;
        player.initialBalance = newInitialBalance;
        this.savePlayer(player);
    }
    clearAllPlayers() {
        localStorage.removeItem(this.storageKey);
    }
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