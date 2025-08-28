import type { Player, PlayerWithADP, RosterWithStats, Roster } from '../types';
import { ADPService } from './ADPService';
import { DraftablesService } from './DraftablesService';

export class PlayerMatchingService {
  private static instance: PlayerMatchingService;
  private adpService: ADPService;
  private draftablesService: DraftablesService;

  private constructor() {
    this.adpService = ADPService.getInstance();
    this.draftablesService = DraftablesService.getInstance();
  }

  static getInstance(): PlayerMatchingService {
    if (!PlayerMatchingService.instance) {
      PlayerMatchingService.instance = new PlayerMatchingService();
    }
    return PlayerMatchingService.instance;
  }

  async enrichPlayersWithADP(players: Player[]): Promise<PlayerWithADP[]> {
    // Ensure both ADP and draftables data are loaded
    await Promise.all([
      this.adpService.loadADP(),
      this.draftablesService.loadDraftables()
    ]);

    return players.map(player => {
      const adpEntry = this.adpService.getADPByPlayerName(player.fn, player.ln);
      const draftablePlayer = this.draftablesService.getDraftablePlayer(player.pid);
      const actualPosition = this.draftablesService.getActualPosition(player.pid);
      const actualTeam = this.draftablesService.getPlayerTeam(player.pid);
      const byeWeek = this.draftablesService.getPlayerByeWeek(player.pid);
      
      return {
        ...player,
        adp: adpEntry?.ADP,
        adpRank: adpEntry ? Math.round(adpEntry.ADP) : undefined,
        actualPosition: actualPosition || player.pn,
        actualTeam: actualTeam || player.atabbr,
        byeWeek: byeWeek,
        // Override the image URL with the one from draftables if available
        i: draftablePlayer?.playerImage50 || player.i
      };
    });
  }

  async enrichRosterWithStats(roster: Roster): Promise<RosterWithStats> {
    const enrichedPlayers = await this.enrichPlayersWithADP(roster.Players);
    
    // Group players by actual position and draft slot position
    const playersByPosition: Record<string, PlayerWithADP[]> = {};
    const playersByActualPosition: Record<string, PlayerWithADP[]> = {};
    
    enrichedPlayers.forEach(player => {
      // Group by draft slot position (for roster display)
      const slotPosition = player.pn;
      if (!playersByPosition[slotPosition]) {
        playersByPosition[slotPosition] = [];
      }
      playersByPosition[slotPosition].push(player);
      
      // Group by actual position (for analysis)
      const actualPos = player.actualPosition || player.pn;
      if (!playersByActualPosition[actualPos]) {
        playersByActualPosition[actualPos] = [];
      }
      playersByActualPosition[actualPos].push(player);
    });

    // Calculate ADP stats
    const playersWithADP = enrichedPlayers.filter(p => p.adp !== undefined);
    const totalADP = playersWithADP.reduce((sum, player) => sum + (player.adp || 0), 0);
    const averageADP = playersWithADP.length > 0 ? totalADP / playersWithADP.length : 0;

    return {
      ...roster,
      Players: enrichedPlayers,
      totalADP,
      averageADP,
      playersByPosition, // Draft slot positions (QB, RB, WR, TE, FLEX, BN)
      playersByActualPosition // Actual positions (QB, RB, WR, TE, K, DST)
    };
  }

  async enrichRostersWithStats(rosters: Roster[]): Promise<RosterWithStats[]> {
    // Ensure both ADP and draftables data are loaded once
    await Promise.all([
      this.adpService.loadADP(),
      this.draftablesService.loadDraftables()
    ]);
    
    return Promise.all(
      rosters.map(roster => this.enrichRosterWithStats(roster))
    );
  }

  findPlayerStacks(players: PlayerWithADP[], minStackSize: number = 2): Array<{ team: string; players: PlayerWithADP[] }> {
    // Group players by team
    const playersByTeam: Record<string, PlayerWithADP[]> = {};
    
    players.forEach(player => {
      // Use the team the player is currently on (atabbr)
      const team = player.atabbr;
      if (!playersByTeam[team]) {
        playersByTeam[team] = [];
      }
      playersByTeam[team].push(player);
    });

    // Find stacks that meet minimum size requirement
    const stacks: Array<{ team: string; players: PlayerWithADP[] }> = [];
    
    Object.entries(playersByTeam).forEach(([team, teamPlayers]) => {
      if (teamPlayers.length >= minStackSize) {
        stacks.push({ team, players: teamPlayers });
      }
    });

    return stacks.sort((a, b) => b.players.length - a.players.length);
  }

  calculatePlayerValue(player: PlayerWithADP): number {
    // Lower ADP = higher value (better pick)
    // Return inverse of ADP for value calculation
    if (!player.adp) return 0;
    return 300 - player.adp; // Assuming max ADP around 300
  }

  findValuePicks(players: PlayerWithADP[], threshold: number = 100): PlayerWithADP[] {
    return players
      .filter(player => player.adp && player.adp > threshold)
      .sort((a, b) => (b.adp || 0) - (a.adp || 0));
  }

  getMostCommonStacks(rosters: RosterWithStats[], minStackSize: number = 2): Array<{ team: string; players: string[]; frequency: number; percentage: number }> {
    const stackCounts = new Map<string, { players: Set<string>; frequency: number }>();
    
    rosters.forEach(roster => {
      const stacks = this.findPlayerStacks(roster.Players, minStackSize);
      stacks.forEach(stack => {
        const stackKey = `${stack.team}-${stack.players.map(p => `${p.fn} ${p.ln}`).sort().join('|')}`;
        const playerNames = stack.players.map(p => `${p.fn} ${p.ln}`);
        
        if (!stackCounts.has(stackKey)) {
          stackCounts.set(stackKey, { players: new Set(playerNames), frequency: 0 });
        }
        stackCounts.get(stackKey)!.frequency++;
      });
    });

    const totalRosters = rosters.length;
    return Array.from(stackCounts.entries())
      .map(([key, data]) => {
        const [team] = key.split('-');
        return {
          team,
          players: Array.from(data.players),
          frequency: data.frequency,
          percentage: (data.frequency / totalRosters) * 100
        };
      })
      .sort((a, b) => b.frequency - a.frequency);
  }
}