import type { TeamColors } from '../types';

export const teamColors: Record<string, TeamColors> = {
  ARI: { primary: '#97233F', secondary: '#000000', accent: '#FFB612' },
  ATL: { primary: '#A71930', secondary: '#000000', accent: '#A5ACAF' },
  BAL: { primary: '#241773', secondary: '#000000', accent: '#9E7C0C' },
  BUF: { primary: '#00338D', secondary: '#C60C30', accent: '#FFFFFF' },
  CAR: { primary: '#0085CA', secondary: '#101820', accent: '#BFC0BF' },
  CHI: { primary: '#0B162A', secondary: '#C83803', accent: '#FFFFFF' },
  CIN: { primary: '#FB4F14', secondary: '#000000', accent: '#FFFFFF' },
  CLE: { primary: '#311D00', secondary: '#FF3C00', accent: '#FFFFFF' },
  DAL: { primary: '#003594', secondary: '#041E42', accent: '#869397' },
  DEN: { primary: '#FB4F14', secondary: '#002244', accent: '#FFFFFF' },
  DET: { primary: '#0076B6', secondary: '#B0B7BC', accent: '#FFFFFF' },
  GB: { primary: '#203731', secondary: '#FFB612', accent: '#FFFFFF' },
  HOU: { primary: '#03202F', secondary: '#A71930', accent: '#FFFFFF' },
  IND: { primary: '#002C5F', secondary: '#A2AAAD', accent: '#FFFFFF' },
  JAX: { primary: '#101820', secondary: '#D7A22A', accent: '#9F792C' },
  KC: { primary: '#E31837', secondary: '#FFB81C', accent: '#FFFFFF' },
  LV: { primary: '#000000', secondary: '#A5ACAF', accent: '#FFFFFF' },
  LAC: { primary: '#0080C6', secondary: '#FFC20E', accent: '#FFFFFF' },
  LAR: { primary: '#003594', secondary: '#FFA300', accent: '#FFFFFF' },
  MIA: { primary: '#008E97', secondary: '#FC4C02', accent: '#005778' },
  MIN: { primary: '#4F2683', secondary: '#FFC62F', accent: '#FFFFFF' },
  NE: { primary: '#002244', secondary: '#C60C30', accent: '#B0B7BC' },
  NO: { primary: '#101820', secondary: '#D3BC8D', accent: '#FFFFFF' },
  NYG: { primary: '#0B2265', secondary: '#A71930', accent: '#A5ACAF' },
  NYJ: { primary: '#125740', secondary: '#000000', accent: '#FFFFFF' },
  PHI: { primary: '#004C54', secondary: '#A5ACAF', accent: '#ACC0C6' },
  PIT: { primary: '#FFB612', secondary: '#101820', accent: '#FFFFFF' },
  SF: { primary: '#AA0000', secondary: '#B3995D', accent: '#FFFFFF' },
  SEA: { primary: '#002244', secondary: '#69BE28', accent: '#A5ACAF' },
  TB: { primary: '#D50A0A', secondary: '#FF7900', accent: '#0A0A08' },
  TEN: { primary: '#0C2340', secondary: '#4B92DB', accent: '#C8102E' },
  WAS: { primary: '#5A1414', secondary: '#FFB612', accent: '#FFFFFF' }
};

export const getTeamColors = (teamAbbr: string): TeamColors => {
  return teamColors[teamAbbr] || { primary: '#6B7280', secondary: '#9CA3AF', accent: '#FFFFFF' };
};

export const getPositionColor = (position: string): string => {
  const positionColors: Record<string, string> = {
    QB: '#10B981', // green
    RB: '#3B82F6', // blue  
    WR: '#F59E0B', // amber
    TE: '#EF4444', // red
    K: '#8B5CF6',  // purple
    DST: '#6B7280' // gray
  };
  
  return positionColors[position] || '#6B7280';
};