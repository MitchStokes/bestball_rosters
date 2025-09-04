import type { Roster } from '../types';
import { BEST_BALL_CONTEST_DRAFT_GROUP_ID } from '../constants';

export class RosterService {
  private static instance: RosterService;
  private cache: Roster[] | null = null;

  private constructor() {}

  static getInstance(): RosterService {
    if (!RosterService.instance) {
      RosterService.instance = new RosterService();
    }
    return RosterService.instance;
  }

  async loadRosters(): Promise<Roster[]> {
    if (this.cache) {
      return this.cache;
    }

    try {
      const response = await fetch('/rosters.json');
      if (!response.ok) {
        throw new Error(`Failed to load rosters: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.cache = data.filter((roster: Roster) => 
        roster.ContestDraftGroupId === BEST_BALL_CONTEST_DRAFT_GROUP_ID
      );
      return this.cache;
    } catch (error) {
      console.error('Error loading rosters:', error);
      throw new Error('Failed to load roster data');
    }
  }

  clearCache(): void {
    this.cache = null;
  }

  getRosterById(lineupId: number): Roster | undefined {
    return this.cache?.find(roster => roster.LineupId === lineupId);
  }

  getRostersByPlayer(playerName: string): Roster[] {
    if (!this.cache) return [];
    
    const normalizedName = playerName.toLowerCase();
    return this.cache.filter(roster => 
      roster.Players.some(player => 
        `${player.fn} ${player.ln}`.toLowerCase().includes(normalizedName)
      )
    );
  }

  getRostersByTeam(teamAbbr: string): Roster[] {
    if (!this.cache) return [];
    
    return this.cache.filter(roster => 
      roster.Players.some(player => 
        player.atabbr === teamAbbr || player.htabbr === teamAbbr
      )
    );
  }

  getAllTeams(): string[] {
    if (!this.cache) return [];
    
    const teams = new Set<string>();
    this.cache.forEach(roster => {
      roster.Players.forEach(player => {
        teams.add(player.atabbr);
        teams.add(player.htabbr);
      });
    });
    
    return Array.from(teams).sort();
  }

  getAllPlayers(): Array<{ name: string; position: string; team: string }> {
    if (!this.cache) return [];
    
    const playersMap = new Map<number, { name: string; position: string; team: string }>();
    
    this.cache.forEach(roster => {
      roster.Players.forEach(player => {
        if (!playersMap.has(player.pid)) {
          playersMap.set(player.pid, {
            name: `${player.fn} ${player.ln}`,
            position: player.pn,
            team: player.atabbr
          });
        }
      });
    });
    
    return Array.from(playersMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }
}