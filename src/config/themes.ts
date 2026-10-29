export interface ThemeDef {
  id: string;
  name: string;
  minDistance: number;
  maxDistance: number;
  skyColor: string;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  roadColor: string;
  roadBorderColor: string;
  laneMarkingColor: string;
  buildingPalette: string[];
  bannerColors: string[];
  ambientIntensity: number;
  sunColor: string;
  sunIntensity: number;
}

export const THEMES: ThemeDef[] = [
  {
    id: 'main_street',
    name: 'Main Street & Bazaars',
    minDistance: 0,
    maxDistance: 500,
    skyColor: '#38bdf8', // crisp daylight blue
    fogColor: '#bae6fd',
    fogNear: 45,
    fogFar: 110,
    roadColor: '#334155', // asphalt slate
    roadBorderColor: '#cbd5e1',
    laneMarkingColor: '#facc15',
    buildingPalette: ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa'],
    bannerColors: ['#f97316', '#3b82f6', '#10b981'],
    ambientIntensity: 0.8,
    sunColor: '#fffbeb',
    sunIntensity: 1.5,
  },
  {
    id: 'busy_market',
    name: 'Busy Market Square',
    minDistance: 500,
    maxDistance: 1200,
    skyColor: '#fb923c', // warm afternoon glow
    fogColor: '#fed7aa',
    fogNear: 40,
    fogFar: 100,
    roadColor: '#475569',
    roadBorderColor: '#e2e8f0',
    laneMarkingColor: '#ffffff',
    buildingPalette: ['#f97316', '#eab308', '#ec4899', '#8b5cf6', '#06b6d4'],
    bannerColors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'],
    ambientIntensity: 0.85,
    sunColor: '#ffedd5',
    sunIntensity: 1.6,
  },
  {
    id: 'flyover_highway',
    name: 'Flyover & Grand Highway',
    minDistance: 1200,
    maxDistance: 2500,
    skyColor: '#0284c7', // twilight dusk
    fogColor: '#7dd3fc',
    fogNear: 50,
    fogFar: 120,
    roadColor: '#1e293b',
    roadBorderColor: '#64748b',
    laneMarkingColor: '#fde047',
    buildingPalette: ['#64748b', '#475569', '#334155', '#94a3b8'],
    bannerColors: ['#0284c7', '#059669', '#d97706'],
    ambientIntensity: 0.75,
    sunColor: '#fef08a',
    sunIntensity: 1.4,
  },
  {
    id: 'night_rally',
    name: 'Night Rally Ground',
    minDistance: 2500,
    maxDistance: 999999,
    skyColor: '#090d16', // midnight starry sky
    fogColor: '#0f172a',
    fogNear: 35,
    fogFar: 95,
    roadColor: '#0f172a',
    roadBorderColor: '#334155',
    laneMarkingColor: '#38bdf8',
    buildingPalette: ['#1e1b4b', '#312e81', '#1e293b', '#0f172a'],
    bannerColors: ['#f43f5e', '#a855f7', '#38bdf8', '#fbbf24'],
    ambientIntensity: 0.5,
    sunColor: '#fcd34d',
    sunIntensity: 1.1,
  },
];

export function getThemeForDistance(distance: number): ThemeDef {
  for (const theme of THEMES) {
    if (distance >= theme.minDistance && distance < theme.maxDistance) {
      return theme;
    }
  }
  return THEMES[THEMES.length - 1];
}
