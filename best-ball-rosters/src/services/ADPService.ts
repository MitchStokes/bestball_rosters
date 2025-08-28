import type { ADPEntry } from '../types';

export class ADPService {
  private static instance: ADPService;
  private cache: ADPEntry[] | null = null;
  private nameToADPMap: Map<string, ADPEntry> | null = null;

  private constructor() {}

  static getInstance(): ADPService {
    if (!ADPService.instance) {
      ADPService.instance = new ADPService();
    }
    return ADPService.instance;
  }

  async loadADP(): Promise<ADPEntry[]> {
    if (this.cache) {
      return this.cache;
    }

    try {
      const response = await fetch('/adp.csv');
      if (!response.ok) {
        throw new Error(`Failed to load ADP data: ${response.statusText}`);
      }
      
      const text = await response.text();
      const lines = text.split('\n');
      
      // Skip header row and empty lines
      const dataLines = lines.slice(1).filter(line => line.trim());
      
      const adpData: ADPEntry[] = dataLines.map(line => {
        const [ID, Name, Position, ADP, Team] = line.split(',');
        return {
          ID: ID?.trim() || '',
          Name: Name?.trim() || '',
          Position: Position?.trim() || '',
          ADP: parseFloat(ADP?.trim() || '999'),
          Team: Team?.trim() || ''
        };
      });

      this.cache = adpData;
      this.buildNameMap();
      return adpData;
    } catch (error) {
      console.error('Error loading ADP data:', error);
      throw new Error('Failed to load ADP data');
    }
  }

  private buildNameMap(): void {
    if (!this.cache) return;
    
    this.nameToADPMap = new Map();
    this.cache.forEach(entry => {
      // Store by full name
      this.nameToADPMap!.set(entry.Name.toLowerCase(), entry);
      
      // Also store by normalized variations
      const normalized = this.normalizePlayerName(entry.Name);
      this.nameToADPMap!.set(normalized, entry);
    });
  }

  private normalizePlayerName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\./g, '')
      .replace(/'/g, '')
      .replace(/jr\.?/i, '')
      .replace(/sr\.?/i, '')
      .replace(/iii?/i, '')
      .trim();
  }

  getADPByPlayerName(firstName: string, lastName: string): ADPEntry | null {
    if (!this.nameToADPMap) return null;
    
    const fullName = `${firstName} ${lastName}`;
    const variations = [
      fullName.toLowerCase(),
      this.normalizePlayerName(fullName),
      `${firstName.toLowerCase()} ${lastName.toLowerCase()}`,
      // Handle common name variations
      fullName.replace('Jr.', '').replace('Sr.', '').replace('III', '').trim().toLowerCase()
    ];
    
    for (const variation of variations) {
      const match = this.nameToADPMap.get(variation);
      if (match) return match;
    }
    
    return null;
  }

  getADPById(playerId: string): ADPEntry | null {
    if (!this.cache) return null;
    return this.cache.find(entry => entry.ID === playerId) || null;
  }

  getAllPositions(): string[] {
    if (!this.cache) return [];
    
    const positions = new Set<string>();
    this.cache.forEach(entry => positions.add(entry.Position));
    return Array.from(positions).sort();
  }

  getPlayersByPosition(position: string): ADPEntry[] {
    if (!this.cache) return [];
    return this.cache.filter(entry => entry.Position === position);
  }

  getTopPlayersByPosition(position: string, count: number = 10): ADPEntry[] {
    return this.getPlayersByPosition(position)
      .sort((a, b) => a.ADP - b.ADP)
      .slice(0, count);
  }

  clearCache(): void {
    this.cache = null;
    this.nameToADPMap = null;
  }
}