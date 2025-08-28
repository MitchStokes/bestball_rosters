import type { DraftablePlayer, DraftablesData } from '../types';

export class DraftablesService {
  private static instance: DraftablesService;
  private cache: DraftablePlayer[] | null = null;
  private playerIdToPositionMap: Map<number, string> | null = null;

  private constructor() {}

  static getInstance(): DraftablesService {
    if (!DraftablesService.instance) {
      DraftablesService.instance = new DraftablesService();
    }
    return DraftablesService.instance;
  }

  async loadDraftables(): Promise<DraftablePlayer[]> {
    if (this.cache) {
      return this.cache;
    }

    try {
      const response = await fetch('/draftables.json');
      if (!response.ok) {
        throw new Error(`Failed to load draftables data: ${response.statusText}`);
      }
      
      const data: DraftablesData = await response.json();
      this.cache = data.draftables;
      this.buildPositionMap();
      return this.cache;
    } catch (error) {
      console.error('Error loading draftables data:', error);
      throw new Error('Failed to load draftables data');
    }
  }

  private buildPositionMap(): void {
    if (!this.cache) return;
    
    this.playerIdToPositionMap = new Map();
    this.cache.forEach(player => {
      this.playerIdToPositionMap!.set(player.playerId, player.position);
    });
  }

  getActualPosition(playerId: number): string | null {
    if (!this.playerIdToPositionMap) return null;
    return this.playerIdToPositionMap.get(playerId) || null;
  }

  getDraftablePlayer(playerId: number): DraftablePlayer | null {
    if (!this.cache) return null;
    return this.cache.find(player => player.playerId === playerId) || null;
  }

  getPlayerTeam(playerId: number): string | null {
    const player = this.getDraftablePlayer(playerId);
    return player ? player.teamAbbreviation : null;
  }

  getPlayerByeWeek(playerId: number): string | null {
    const player = this.getDraftablePlayer(playerId);
    if (!player || !player.playerAttributes) return null;
    
    const byeWeekAttr = player.playerAttributes.find(attr => attr.name === 'ByeWeek');
    return byeWeekAttr ? byeWeekAttr.value : null;
  }

  getPlayersByActualPosition(position: string): DraftablePlayer[] {
    if (!this.cache) return [];
    return this.cache.filter(player => player.position === position);
  }

  getAllActualPositions(): string[] {
    if (!this.cache) return [];
    
    const positions = new Set<string>();
    this.cache.forEach(player => positions.add(player.position));
    return Array.from(positions).sort();
  }

  clearCache(): void {
    this.cache = null;
    this.playerIdToPositionMap = null;
  }
}