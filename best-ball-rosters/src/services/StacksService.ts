import type { RosterWithStats, PlayerWithADP, Stack, StackAnalysis } from '../types';

export class StacksService {
  private static instance: StacksService;

  private constructor() {}

  static getInstance(): StacksService {
    if (!StacksService.instance) {
      StacksService.instance = new StacksService();
    }
    return StacksService.instance;
  }

  /**
   * Generate all possible combinations of a given size from an array
   */
  private generateCombinations<T>(arr: T[], size: number): T[][] {
    if (size === 1) return arr.map(item => [item]);
    if (size > arr.length) return [];
    
    const result: T[][] = [];
    
    for (let i = 0; i <= arr.length - size; i++) {
      const head = arr[i];
      const tailCombinations = this.generateCombinations(arr.slice(i + 1), size - 1);
      for (const tail of tailCombinations) {
        result.push([head, ...tail]);
      }
    }
    
    return result;
  }

  /**
   * Get all players from the same team in a roster
   */
  private getTeamPlayersFromRoster(roster: RosterWithStats): Record<string, PlayerWithADP[]> {
    const playersByTeam: Record<string, PlayerWithADP[]> = {};
    
    roster.Players.forEach(player => {
      const team = (player as PlayerWithADP).actualTeam || player.atabbr;
      if (!playersByTeam[team]) {
        playersByTeam[team] = [];
      }
      playersByTeam[team].push(player);
    });

    return playersByTeam;
  }

  /**
   * Generate all possible stack combinations for a roster
   */
  private generateRosterStacks(roster: RosterWithStats, minSize: number = 2, maxSize: number = 20): Array<{
    team: string;
    players: PlayerWithADP[];
    size: number;
    key: string;
  }> {
    const teamPlayers = this.getTeamPlayersFromRoster(roster);
    const allStacks: Array<{
      team: string;
      players: PlayerWithADP[];
      size: number;
      key: string;
    }> = [];

    // For each team with multiple players
    Object.entries(teamPlayers).forEach(([team, players]) => {
      if (players.length < minSize) return;

      const maxSizeForTeam = Math.min(maxSize, players.length);
      
      // Generate all combinations from minSize to maxSize
      for (let size = minSize; size <= maxSizeForTeam; size++) {
        const combinations = this.generateCombinations(players, size);
        
        combinations.forEach(combination => {
          // Create a unique key based on sorted player names
          const playerNames = combination
            .map(p => `${p.fn} ${p.ln}`)
            .sort();
          const key = `${team}:${playerNames.join(',')}`;
          
          allStacks.push({
            team,
            players: combination,
            size,
            key
          });
        });
      }
    });

    return allStacks;
  }

  /**
   * Analyze all stacks across all rosters
   */
  analyzeStacks(rosters: RosterWithStats[], minStackSize: number = 2, maxStackSize: number = 20): StackAnalysis {
    const stackCounts = new Map<string, {
      team: string;
      players: PlayerWithADP[];
      size: number;
      frequency: number;
      playerNames: string[];
    }>();

    // Generate all stacks for each roster
    rosters.forEach(roster => {
      const rosterStacks = this.generateRosterStacks(roster, minStackSize, maxStackSize);
      
      rosterStacks.forEach(stack => {
        if (stackCounts.has(stack.key)) {
          stackCounts.get(stack.key)!.frequency++;
        } else {
          const playerNames = stack.players.map(p => `${p.fn} ${p.ln}`).sort();
          stackCounts.set(stack.key, {
            team: stack.team,
            players: stack.players,
            size: stack.size,
            frequency: 1,
            playerNames
          });
        }
      });
    });

    // Convert to Stack objects with percentages and average ADP
    const stacks: Stack[] = Array.from(stackCounts.values()).map(stackData => {
      // Calculate average ADP for players with ADP data
      const playersWithADP = stackData.players.filter(p => p.adp && p.adp > 0);
      const averageADP = playersWithADP.length > 0 
        ? playersWithADP.reduce((sum, p) => sum + p.adp!, 0) / playersWithADP.length
        : 999; // High value for players without ADP data
      
      return {
        team: stackData.team,
        players: stackData.players,
        frequency: stackData.frequency,
        percentage: (stackData.frequency / rosters.length) * 100,
        size: stackData.size,
        playerNames: stackData.playerNames,
        averageADP
      };
    });

    return {
      stacks,
      totalRosters: rosters.length
    };
  }

  /**
   * Filter stacks by size, teams, and sort by frequency or average ADP
   */
  filterAndSortStacks(
    stackAnalysis: StackAnalysis, 
    minSize?: number, 
    maxSize?: number,
    selectedTeams: string[] = [],
    sortBy: 'frequency' | 'averageADP' = 'frequency',
    sortDirection: 'asc' | 'desc' = 'desc'
  ): Stack[] {
    let filteredStacks = stackAnalysis.stacks;

    // Apply size filters
    if (minSize !== undefined) {
      filteredStacks = filteredStacks.filter(stack => stack.size >= minSize);
    }
    if (maxSize !== undefined) {
      filteredStacks = filteredStacks.filter(stack => stack.size <= maxSize);
    }

    // Apply team filter
    if (selectedTeams.length > 0) {
      filteredStacks = filteredStacks.filter(stack => selectedTeams.includes(stack.team));
    }

    // Sort by selected field
    return filteredStacks.sort((a, b) => {
      let comparison: number;
      
      if (sortBy === 'frequency') {
        comparison = a.frequency - b.frequency;
      } else {
        // For ADP, lower is better (more valuable)
        comparison = a.averageADP - b.averageADP;
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Get available stack sizes from the analysis
   */
  getAvailableStackSizes(stackAnalysis: StackAnalysis): number[] {
    const sizes = new Set<number>();
    stackAnalysis.stacks.forEach(stack => sizes.add(stack.size));
    return Array.from(sizes).sort((a, b) => a - b);
  }

  /**
   * Get available teams from the analysis
   */
  getAvailableTeams(stackAnalysis: StackAnalysis): string[] {
    const teams = new Set<string>();
    stackAnalysis.stacks.forEach(stack => teams.add(stack.team));
    return Array.from(teams).sort();
  }
}