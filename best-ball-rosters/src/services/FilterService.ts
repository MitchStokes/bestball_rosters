import type { RosterWithStats, FilterOptions, SortOptions, PlayerWithADP } from '../types';

export class FilterService {
  private static instance: FilterService;

  private constructor() {}

  private normalizePlayerName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove all non-alphanumeric characters except spaces
      .replace(/\s+/g, ' ') // Collapse multiple spaces into single spaces
      .trim();
  }

  static getInstance(): FilterService {
    if (!FilterService.instance) {
      FilterService.instance = new FilterService();
    }
    return FilterService.instance;
  }

  applyFilters(rosters: RosterWithStats[], filters: FilterOptions): RosterWithStats[] {
    return rosters.filter(roster => {
      // Team filter - roster must have at least one player from each selected team
      if (filters.teams.length > 0) {
        const rosterTeams = new Set<string>();
        roster.Players.forEach(player => {
          // Use actualTeam from draftables data, fallback to original team data
          const actualTeam = (player as PlayerWithADP).actualTeam || player.atabbr;
          rosterTeams.add(actualTeam);
        });
        
        // Check if roster has players from ALL selected teams (AND logic)
        const hasAllTeams = filters.teams.every(team => rosterTeams.has(team));
        if (!hasAllTeams) return false;
      }

      // Player filter - roster must have ALL selected players (AND logic)
      if (filters.players.length > 0) {
        const rosterPlayerNames = roster.Players.map(p => {
          const fullName = `${p.fn} ${p.ln}`;
          return {
            original: fullName.toLowerCase(),
            normalized: this.normalizePlayerName(fullName)
          };
        });
        
        const hasAllPlayers = filters.players.every(playerName => {
          const normalizedQuery = this.normalizePlayerName(playerName);
          return rosterPlayerNames.some(names => 
            names.original.includes(playerName.toLowerCase()) || 
            names.normalized.includes(normalizedQuery)
          );
        });
        if (!hasAllPlayers) return false;
      }

      // Position filter - roster must have players in ALL selected positions
      if (filters.positions.length > 0) {
        const rosterPositions = new Set(roster.Players.map(p => p.pn));
        const hasAllPositions = filters.positions.every(pos => rosterPositions.has(pos));
        if (!hasAllPositions) return false;
      }

      // Stack size filter
      if (filters.minStackSize !== undefined || filters.maxStackSize !== undefined) {
        const stacks = this.findRosterStacks(roster.Players);
        const maxStackSize = Math.max(...stacks.map(s => s.players.length), 0);
        
        if (filters.minStackSize !== undefined && maxStackSize < filters.minStackSize) {
          return false;
        }
        
        if (filters.maxStackSize !== undefined && maxStackSize > filters.maxStackSize) {
          return false;
        }
      }

      // Position count filters
      if (filters.positionCounts) {
        const positionCounts = this.getPositionCounts(roster.Players);
        
        for (const [position, constraints] of Object.entries(filters.positionCounts)) {
          const count = positionCounts[position] || 0;
          
          if (constraints.min !== undefined && count < constraints.min) {
            return false;
          }
          
          if (constraints.max !== undefined && count > constraints.max) {
            return false;
          }
        }
      }

      return true;
    });
  }

  sortRosters(rosters: RosterWithStats[], sortOptions: SortOptions): RosterWithStats[] {
    const { field, direction } = sortOptions;
    
    return [...rosters].sort((a, b) => {
      let valueA: number;
      let valueB: number;

      switch (field) {
        case 'averageADP':
          valueA = a.averageADP;
          valueB = b.averageADP;
          break;
        case 'lineupId':
          valueA = a.LineupId;
          valueB = b.LineupId;
          break;
        default:
          return 0;
      }

      const comparison = valueA - valueB;
      return direction === 'asc' ? comparison : -comparison;
    });
  }

  private getPositionCounts(players: PlayerWithADP[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    players.forEach(player => {
      const position = player.actualPosition || player.pn;
      counts[position] = (counts[position] || 0) + 1;
    });
    
    return counts;
  }

  private findRosterStacks(players: PlayerWithADP[]): Array<{ team: string; players: PlayerWithADP[] }> {
    const playersByTeam: Record<string, PlayerWithADP[]> = {};
    
    players.forEach(player => {
      const team = player.actualTeam || player.atabbr;
      if (!playersByTeam[team]) {
        playersByTeam[team] = [];
      }
      playersByTeam[team].push(player);
    });

    return Object.entries(playersByTeam)
      .filter(([, teamPlayers]) => teamPlayers.length >= 2)
      .map(([team, teamPlayers]) => ({ team, players: teamPlayers }));
  }

  getAvailableFilterValues(rosters: RosterWithStats[]): {
    teams: string[];
    players: Array<{ name: string; position: string; team: string }>;
    positions: string[];
    stackSizes: number[];
  } {
    const teamsSet = new Set<string>();
    const playersMap = new Map<string, { name: string; position: string; team: string }>();
    const positionsSet = new Set<string>();
    const stackSizesSet = new Set<number>();

    rosters.forEach(roster => {
      roster.Players.forEach(player => {
        const actualTeam = (player as PlayerWithADP).actualTeam || player.atabbr;
        const actualPosition = (player as PlayerWithADP).actualPosition || player.pn;
        
        teamsSet.add(actualTeam);
        positionsSet.add(actualPosition);
        
        const playerName = `${player.fn} ${player.ln}`;
        if (!playersMap.has(playerName)) {
          playersMap.set(playerName, {
            name: playerName,
            position: actualPosition,
            team: actualTeam
          });
        }
      });

      // Calculate stack sizes for this roster
      const stacks = this.findRosterStacks(roster.Players);
      stacks.forEach(stack => stackSizesSet.add(stack.players.length));
    });

    return {
      teams: Array.from(teamsSet).sort(),
      players: Array.from(playersMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
      positions: Array.from(positionsSet).sort(),
      stackSizes: Array.from(stackSizesSet).sort((a, b) => a - b)
    };
  }

  searchPlayers(rosters: RosterWithStats[], query: string): Array<{ name: string; position: string; team: string; count: number }> {
    const playersMap = new Map<string, { name: string; position: string; team: string; count: number }>();
    const normalizedQuery = this.normalizePlayerName(query);

    rosters.forEach(roster => {
      roster.Players.forEach(player => {
        const playerName = `${player.fn} ${player.ln}`;
        const normalizedPlayerName = this.normalizePlayerName(playerName);
        
        // Match on both original and normalized names
        if (playerName.toLowerCase().includes(query.toLowerCase()) || 
            normalizedPlayerName.includes(normalizedQuery)) {
          const key = playerName;
          if (!playersMap.has(key)) {
            playersMap.set(key, {
              name: playerName,
              position: (player as PlayerWithADP).actualPosition || player.pn,
              team: (player as PlayerWithADP).actualTeam || player.atabbr,
              count: 0
            });
          }
          playersMap.get(key)!.count++;
        }
      });
    });

    return Array.from(playersMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Limit to top 20 results
  }
}