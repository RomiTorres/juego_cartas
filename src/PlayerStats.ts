export interface PlayerData {
  id: string;          
  balance: number;      
  totalWins: number;    
  totalLosses: number;  
  totalRounds: number;  
  initialBalance: number; 
}

export class PlayerStatsManager {
  private storageKey = "blackjack_players"; 

  getAllPlayers(): PlayerData[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      return [];
    }
    try {
      return JSON.parse(stored) as PlayerData[];
    } catch (e) {
      console.error("Error al parsear datos de jugadores:", e);
      return [];
    }
  }

  getPlayer(playerId: string): PlayerData | null {
    const players = this.getAllPlayers();
    return players.find(p => p.id === playerId) || null;
  }

  getOrCreatePlayer(playerId: string, initialBalance: number = 1000): PlayerData {
    const existing = this.getPlayer(playerId);
    if (existing) {
      return existing;
    }

    const newPlayer: PlayerData = {
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

  savePlayer(playerData: PlayerData): void {
    const players = this.getAllPlayers();
    const index = players.findIndex(p => p.id === playerData.id);

    if (index !== -1) {
      players[index] = playerData;
    } else {
      players.push(playerData);
    }

    localStorage.setItem(this.storageKey, JSON.stringify(players));
  }

  updatePlayerAfterRound(
    playerId: string,
    amountChange: number,
    wonHand: boolean
  ): void {
    const player = this.getPlayer(playerId);
    if (!player) return;

    player.balance += amountChange;

    player.totalRounds++;
    if (wonHand) {
      player.totalWins++;
    } else {
      player.totalLosses++;
    }

    this.savePlayer(player);
  }

  getNetProfitLoss(playerId: string): number {
    const player = this.getPlayer(playerId);
    if (!player) return 0;
    return player.balance - player.initialBalance;
  }

  resetPlayer(playerId: string, newInitialBalance: number = 1000): void {
    const player = this.getOrCreatePlayer(playerId, newInitialBalance);
    player.balance = newInitialBalance;
    player.totalWins = 0;
    player.totalLosses = 0;
    player.totalRounds = 0;
    player.initialBalance = newInitialBalance;
    this.savePlayer(player);
  }

  clearAllPlayers(): void {
    localStorage.removeItem(this.storageKey);
  }

  getStats(playerId: string): {
    balance: number;
    wins: number;
    losses: number;
    rounds: number;
    profitLoss: number;
    winRate: number;
  } | null {
    const player = this.getPlayer(playerId);
    if (!player) return null;

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
