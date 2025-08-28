import type { RosterWithStats, PlayerWithADP, PlayerAssociation, PlayerAssociationsAnalysis } from '../types';

export class PlayerAssociationsService {
  private static instance: PlayerAssociationsService;

  private constructor() {}

  static getInstance(): PlayerAssociationsService {
    if (!PlayerAssociationsService.instance) {
      PlayerAssociationsService.instance = new PlayerAssociationsService();
    }
    return PlayerAssociationsService.instance;
  }

  /**
   * Find a player by name (fuzzy matching)
   */
  findPlayer(rosters: RosterWithStats[], playerName: string): PlayerWithADP | null {
    const normalizedSearchName = this.normalizePlayerName(playerName);
    
    for (const roster of rosters) {
      for (const player of roster.Players) {
        const fullName = `${player.fn} ${player.ln}`;
        const normalizedPlayerName = this.normalizePlayerName(fullName);
        
        if (normalizedPlayerName.includes(normalizedSearchName) || 
            fullName.toLowerCase().includes(playerName.toLowerCase())) {
          return player;
        }
      }
    }
    
    return null;
  }

  /**
   * Get all unique players from rosters
   */
  getAllPlayers(rosters: RosterWithStats[]): Array<{ name: string; player: PlayerWithADP; count: number }> {
    const playersMap = new Map<string, { player: PlayerWithADP; count: number }>();
    
    rosters.forEach(roster => {
      roster.Players.forEach(player => {
        const playerName = `${player.fn} ${player.ln}`;
        const key = playerName.toLowerCase();
        
        if (playersMap.has(key)) {
          playersMap.get(key)!.count++;
        } else {
          playersMap.set(key, { player, count: 1 });
        }
      });
    });
    
    return Array.from(playersMap.entries())
      .map(([name, data]) => ({ name: data.player.fn + ' ' + data.player.ln, ...data }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Analyze player associations for a given player
   */
  analyzePlayerAssociations(rosters: RosterWithStats[], searchedPlayer: PlayerWithADP): PlayerAssociationsAnalysis | null {
    // Find all rosters containing the searched player
    const rostersWithSearchedPlayer = rosters.filter(roster =>
      roster.Players.some(player => 
        player.pid === searchedPlayer.pid || 
        (`${player.fn} ${player.ln}` === `${searchedPlayer.fn} ${searchedPlayer.ln}`)
      )
    );

    if (rostersWithSearchedPlayer.length === 0) {
      return null;
    }

    // Count associations with other players
    const associationCounts = new Map<string, {
      player: PlayerWithADP;
      count: number;
    }>();

    rostersWithSearchedPlayer.forEach(roster => {
      roster.Players.forEach(player => {
        // Skip the searched player
        if (player.pid === searchedPlayer.pid || 
            (`${player.fn} ${player.ln}` === `${searchedPlayer.fn} ${searchedPlayer.ln}`)) {
          return;
        }

        const key = `${player.fn} ${player.ln}`.toLowerCase();
        
        if (associationCounts.has(key)) {
          associationCounts.get(key)!.count++;
        } else {
          associationCounts.set(key, { player, count: 1 });
        }
      });
    });

    // Convert to PlayerAssociation objects
    const associations: PlayerAssociation[] = Array.from(associationCounts.values()).map(data => {
      const sharedPercentage = (data.count / rostersWithSearchedPlayer.length) * 100;
      const averageADP = data.player.adp && data.player.adp > 0 ? data.player.adp : 999;
      
      return {
        player: data.player,
        sharedRosters: data.count,
        sharedPercentage,
        averageADP
      };
    });

    return {
      searchedPlayer,
      searchedPlayerRosters: rostersWithSearchedPlayer.length,
      associations
    };
  }

  /**
   * Filter and sort associations
   */
  filterAndSortAssociations(
    analysis: PlayerAssociationsAnalysis,
    selectedTeams: string[] = [],
    sortBy: 'frequency' | 'averageADP' = 'frequency',
    sortDirection: 'asc' | 'desc' = 'desc'
  ): PlayerAssociation[] {
    let filteredAssociations = analysis.associations;

    // Apply team filter
    if (selectedTeams.length > 0) {
      filteredAssociations = filteredAssociations.filter(association => {
        const team = association.player.actualTeam || association.player.atabbr;
        return selectedTeams.includes(team);
      });
    }

    // Sort associations
    return filteredAssociations.sort((a, b) => {
      let comparison: number;

      switch (sortBy) {
        case 'frequency':
          comparison = a.sharedRosters - b.sharedRosters;
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
   * Get available teams from associations
   */
  getAvailableTeams(analysis: PlayerAssociationsAnalysis): string[] {
    const teams = new Set<string>();
    analysis.associations.forEach(association => {
      const team = association.player.actualTeam || association.player.atabbr;
      teams.add(team);
    });
    return Array.from(teams).sort();
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

  /**
   * Search players for autocomplete
   */
  searchPlayers(rosters: RosterWithStats[], query: string): Array<{ name: string; position: string; team: string; count: number }> {
    const normalizedQuery = this.normalizePlayerName(query);
    const playersMap = new Map<string, { name: string; position: string; team: string; count: number }>();

    rosters.forEach(roster => {
      roster.Players.forEach(player => {
        const playerName = `${player.fn} ${player.ln}`;
        const normalizedPlayerName = this.normalizePlayerName(playerName);
        
        if (playerName.toLowerCase().includes(query.toLowerCase()) || 
            normalizedPlayerName.includes(normalizedQuery)) {
          const key = playerName;
          if (!playersMap.has(key)) {
            playersMap.set(key, {
              name: playerName,
              position: player.actualPosition || player.pn,
              team: player.actualTeam || player.atabbr,
              count: 0
            });
          }
          playersMap.get(key)!.count++;
        }
      });
    });

    return Array.from(playersMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }
}