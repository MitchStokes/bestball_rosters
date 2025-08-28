export interface Player {
  pid: number;
  pdkid: number;
  pcode: number;
  tid: number;
  tsid: number;
  fn: string; // first name
  ln: string; // last name
  fnu: string; // first name uppercase
  lnu: string; // last name uppercase
  pn: string; // position
  rosposid: number;
  htid: number; // home team id
  atid: number; // away team id
  htabbr: string; // home team abbreviation
  atabbr: string; // away team abbreviation
  s: number;
  pd: number;
  pu: null;
  tr: number;
  ppg: string; // points per game
  r: number;
  pts: number;
  ipc: boolean;
  ytp: boolean;
  swp: boolean;
  stats: Record<string, any>;
  fullStats: any;
  nsstats: any;
  pp: number;
  i: string; // profile image URL
  cuts: number;
  evts: number;
  savg: number;
  tten: number;
  fin: number;
  avgf: number;
  dgst: number;
}

export interface Roster {
  LineupId: number;
  SportId: number;
  ContestDraftGroupId: number;
  LastModified: string;
  Name: string;
  DisplayName: string;
  VisibleWhenUnlinked: boolean;
  IsOrphaned: boolean;
  EntryCount: number;
  Players: Player[];
}

export interface ADPEntry {
  ID: string;
  Name: string;
  Position: string;
  ADP: number;
  Team: string;
}

export interface PlayerWithADP extends Player {
  adp?: number;
  adpRank?: number;
}

export interface RosterWithStats extends Roster {
  totalADP: number;
  averageADP: number;
  playersByPosition: Record<string, PlayerWithADP[]>; // Draft slot positions (QB, RB, WR, TE, FLEX, BN)
  playersByActualPosition?: Record<string, PlayerWithADP[]>; // Actual positions (QB, RB, WR, TE, K, DST)
}

export interface PositionCounts {
  QB?: { min?: number; max?: number };
  RB?: { min?: number; max?: number };
  WR?: { min?: number; max?: number };
  TE?: { min?: number; max?: number };
}

export interface FilterOptions {
  teams: string[];
  players: string[];
  positions: string[];
  minStackSize?: number;
  maxStackSize?: number;
  positionCounts?: PositionCounts;
}

export interface Stack {
  team: string;
  players: PlayerWithADP[];
  frequency: number;
  percentage: number;
  size: number;
  playerNames: string[];
  averageADP: number;
}

export interface StackAnalysis {
  stacks: Stack[];
  totalRosters: number;
}

export interface PlayerAssociation {
  player: PlayerWithADP;
  sharedRosters: number;
  sharedPercentage: number; // Percentage of searched player's rosters that also contain this player
  averageADP: number;
}

export interface PlayerAssociationsAnalysis {
  searchedPlayer: PlayerWithADP;
  searchedPlayerRosters: number;
  associations: PlayerAssociation[];
}

export interface PlayerExposure {
  player: PlayerWithADP;
  rosterCount: number;
  exposurePercentage: number;
  averageADP: number;
}

export interface PlayerExposureAnalysis {
  exposures: PlayerExposure[];
  totalRosters: number;
}

export interface TeamColors {
  primary: string;
  secondary: string;
  accent?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: 'averageADP' | 'lineupId';
  direction: SortDirection;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface DraftablePlayer {
  draftableId: number;
  firstName: string;
  lastName: string;
  displayName: string;
  shortName: string;
  playerId: number;
  playerDkId: number;
  position: string;
  rosterSlotId: number;
  status: string;
  isSwappable: boolean;
  isDisabled: boolean;
  newsStatus: string;
  playerImage50: string;
  playerImage160: string;
  altPlayerImage50: string;
  altPlayerImage160: string;
  teamId: number;
  teamAbbreviation: string;
  playerAttributes: Array<{
    name: string;
    value: string;
  }>;
  competition: {
    competitionId: number;
    name: string;
    nameDisplay: Array<{
      value: string;
      isEmphasized?: boolean;
    }>;
  };
}

export interface DraftablesData {
  draftables: DraftablePlayer[];
}

export interface PlayerWithCorrectPosition extends Player {
  actualPosition?: string;
  draftSlotPosition: string;
}

export interface PlayerWithADP extends Player {
  adp?: number;
  adpRank?: number;
  actualPosition?: string;
  actualTeam?: string;
  byeWeek?: string;
}

export interface AppState {
  rosters: RosterWithStats[];
  filteredRosters: RosterWithStats[];
  adpData: ADPEntry[];
  draftablesData: DraftablePlayer[];
  filters: FilterOptions;
  sort: SortOptions;
  loading: LoadingState;
}