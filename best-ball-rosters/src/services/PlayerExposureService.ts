import type { RosterWithStats, PlayerWithADP, PlayerExposure, PlayerExposureAnalysis } from '../types';

export class PlayerExposureService {
  private static instance: PlayerExposureService;

  private constructor() {}

  static getInstance(): PlayerExposureService {
    if (!PlayerExposureService.instance) {
      PlayerExposureService.instance = new PlayerExposureService();
    }
    return PlayerExposureService.instance;
  }

  /**
   * Analyze player exposure across all rosters
   */
  analyzePlayerExposure(rosters: RosterWithStats[]): PlayerExposureAnalysis {
    const playerCounts = new Map<string, {
      player: PlayerWithADP;
      count: number;
    }>();

    // Count occurrences of each player across all rosters
    rosters.forEach(roster => {
      roster.Players.forEach(player => {
        const playerKey = `${player.fn} ${player.ln}`.toLowerCase();
        
        if (playerCounts.has(playerKey)) {
          playerCounts.get(playerKey)!.count++;
        } else {
          playerCounts.set(playerKey, {
            player,
            count: 1
          });
        }
      });
    });

    // Convert to PlayerExposure objects
    const exposures: PlayerExposure[] = Array.from(playerCounts.values()).map(data => {
      const exposurePercentage = (data.count / rosters.length) * 100;
      const averageADP = data.player.adp && data.player.adp > 0 ? data.player.adp : 999;
      
      return {
        player: data.player,
        rosterCount: data.count,
        exposurePercentage,
        averageADP
      };
    });

    return {
      exposures,
      totalRosters: rosters.length
    };
  }

  /**
   * Filter and sort player exposures
   */
  filterAndSortExposures(
    analysis: PlayerExposureAnalysis,
    selectedTeams: string[] = [],
    playerNameQuery: string = '',
    sortBy: 'frequency' | 'averageADP' = 'frequency',
    sortDirection: 'asc' | 'desc' = 'desc'
  ): PlayerExposure[] {
    let filteredExposures = analysis.exposures;

    // Apply team filter
    if (selectedTeams.length > 0) {
      filteredExposures = filteredExposures.filter(exposure => {
        const team = exposure.player.actualTeam || exposure.player.atabbr;
        return selectedTeams.includes(team);
      });
    }

    // Apply player name filter
    if (playerNameQuery.trim().length > 0) {
      const normalizedQuery = this.normalizePlayerName(playerNameQuery);
      filteredExposures = filteredExposures.filter(exposure => {
        const playerName = `${exposure.player.fn} ${exposure.player.ln}`;
        const normalizedPlayerName = this.normalizePlayerName(playerName);
        
        return playerName.toLowerCase().includes(playerNameQuery.toLowerCase()) ||
               normalizedPlayerName.includes(normalizedQuery);
      });
    }

    // Sort exposures
    return filteredExposures.sort((a, b) => {
      let comparison: number;

      switch (sortBy) {
        case 'frequency':
          comparison = a.rosterCount - b.rosterCount;
          break;
        case 'averageADP':
          comparison = a.averageADP - b.averageADP;
          break;
        default:
          return 0;
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Get available teams from exposures
   */
  getAvailableTeams(analysis: PlayerExposureAnalysis): string[] {
    const teams = new Set<string>();
    analysis.exposures.forEach(exposure => {
      const team = exposure.player.actualTeam || exposure.player.atabbr;
      teams.add(team);
    });
    return Array.from(teams).sort();
  }

  /**
   * Search players for autocomplete
   */
  searchPlayers(analysis: PlayerExposureAnalysis, query: string): Array<{ name: string; position: string; team: string; count: number }> {
    if (query.trim().length < 2) return [];
    
    const normalizedQuery = this.normalizePlayerName(query);
    
    return analysis.exposures
      .filter(exposure => {
        const playerName = `${exposure.player.fn} ${exposure.player.ln}`;
        const normalizedPlayerName = this.normalizePlayerName(playerName);
        
        return playerName.toLowerCase().includes(query.toLowerCase()) ||
               normalizedPlayerName.includes(normalizedQuery);
      })
      .map(exposure => ({
        name: `${exposure.player.fn} ${exposure.player.ln}`,
        position: exposure.player.actualPosition || exposure.player.pn,
        team: exposure.player.actualTeam || exposure.player.atabbr,
        count: exposure.rosterCount
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  /**
   * Normalize player name for fuzzy matching
   */
  private normalizePlayerName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}