import { Cell, Chunk, Row, ROW_SPACING } from './constants';

export interface RawChunkDef {
  id: string;
  difficulty: number;
  pattern: string[];
}

export function parseAsciiChunk(def: RawChunkDef): Chunk {
  const rows: Row[] = [];
  const lines = def.pattern.map((l) => l.trim()).filter((l) => l.length > 0);

  lines.forEach((line, rowIndex) => {
    const chars = line.split('');
    const cells: [Cell, Cell, Cell] = [
      parseChar(chars[0] || '.'),
      parseChar(chars[1] || '.'),
      parseChar(chars[2] || '.'),
    ];

    rows.push({
      z: rowIndex * ROW_SPACING,
      cells,
    });
  });

  return {
    id: def.id,
    difficulty: def.difficulty,
    length: Math.max(1, lines.length) * ROW_SPACING,
    rows,
  };
}

function parseChar(c: string): Cell {
  switch (c) {
    case 'v':
      return { t: 'vote', value: 1 };
    case 'V':
      return { t: 'vote', value: 5 };
    case 'B':
      return { t: 'obstacle', id: 'barricade' };
    case 'P':
      return { t: 'obstacle', id: 'pothole' };
    case 'M':
      return { t: 'obstacle', id: 'press_mic' };
    case 'R':
      return { t: 'obstacle', id: 'rally_banner' };
    case 'C':
      return { t: 'obstacle', id: 'traffic_car' };
    case '@':
      return { t: 'obstacle', id: 'stray_cow' };
    case 'm':
      return { t: 'powerup', id: 'magnet' };
    case 'x':
      return { t: 'powerup', id: 'multiplier' };
    case 's':
      return { t: 'powerup', id: 'shield' };
    case 'h':
      return { t: 'powerup', id: 'helicopter' };
    case 'z':
      return { t: 'powerup', id: 'slowmo' };
    default:
      return { t: 'empty' };
  }
}

// 28 chunks across 4 difficulty tiers:
// Tier 1: 0 - 0.25 (Beginner)
// Tier 2: 0.25 - 0.5 (Intermediate)
// Tier 3: 0.5 - 0.75 (Advanced)
// Tier 4: 0.75 - 1.0 (Expert / Rally Rush)
export const RAW_CHUNKS: RawChunkDef[] = [
  // --- TIER 1: 0 - 0.25 ---
  {
    id: 't1_straight_run',
    difficulty: 0.05,
    pattern: [
      '.v.',
      '.v.',
      '.v.',
      '.v.',
      '.V.',
    ],
  },
  {
    id: 't1_zigzag',
    difficulty: 0.1,
    pattern: [
      'v..',
      '.v.',
      '..v',
      '.v.',
      'v..',
    ],
  },
  {
    id: 't1_single_barricade',
    difficulty: 0.12,
    pattern: [
      '.v.',
      '.B.',
      '.v.',
      '.v.',
    ],
  },
  {
    id: 't1_magnet_run',
    difficulty: 0.15,
    pattern: [
      '.m.',
      'v.v',
      'vvv',
      'vvv',
      '.v.',
    ],
  },
  {
    id: 't1_pothole_lane',
    difficulty: 0.18,
    pattern: [
      'v..',
      'P..',
      'v..',
      '.v.',
    ],
  },
  {
    id: 't1_mic_overhead',
    difficulty: 0.2,
    pattern: [
      '.v.',
      '.M.',
      '.v.',
      '.V.',
    ],
  },
  {
    id: 't1_shield_pickup',
    difficulty: 0.22,
    pattern: [
      '..s',
      '.v.',
      'B..',
      '.v.',
    ],
  },

  // --- TIER 2: 0.25 - 0.5 ---
  {
    id: 't2_jump_and_shift',
    difficulty: 0.3,
    pattern: [
      '.v.',
      '.B.',
      '.v.',
      'C.v',
      'v..',
    ],
  },
  {
    id: 't2_slide_and_collect',
    difficulty: 0.32,
    pattern: [
      '..v',
      '..R',
      '..v',
      '.v.',
      'B..',
    ],
  },
  {
    id: 't2_multiplier_chase',
    difficulty: 0.35,
    pattern: [
      '.x.',
      'v.v',
      'v.v',
      'B.B',
      '.V.',
    ],
  },
  {
    id: 't2_car_dodge',
    difficulty: 0.38,
    pattern: [
      '.v.',
      'C..',
      '.v.',
      '..C',
      '.v.',
    ],
  },
  {
    id: 't2_slowmo_oasis',
    difficulty: 0.4,
    pattern: [
      '.z.',
      'B.B',
      '.v.',
      'P.P',
      '.V.',
    ],
  },
  {
    id: 't2_cow_wander_intro',
    difficulty: 0.42,
    pattern: [
      '.v.',
      '.@.',
      'v..',
      'v..',
      '.v.',
    ],
  },
  {
    id: 't2_double_hurdle',
    difficulty: 0.45,
    pattern: [
      'v..',
      'B..',
      '.v.',
      '.B.',
      '..v',
    ],
  },

  // --- TIER 3: 0.5 - 0.75 ---
  {
    id: 't3_helicopter_haven',
    difficulty: 0.52,
    pattern: [
      '.h.',
      'CCC',
      'VVV',
      'VVV',
      '.v.',
    ],
  },
  {
    id: 't3_press_scrum',
    difficulty: 0.55,
    pattern: [
      '.v.',
      'M.M',
      '.v.',
      '.M.',
      'v.v',
    ],
  },
  {
    id: 't3_cow_and_car',
    difficulty: 0.58,
    pattern: [
      'v..',
      'C..',
      '.v.',
      '.@.',
      '..v',
    ],
  },
  {
    id: 't3_pothole_switchback',
    difficulty: 0.62,
    pattern: [
      'v..',
      'P.P',
      '.v.',
      'B.B',
      '.V.',
    ],
  },
  {
    id: 't3_banner_trench_combo',
    difficulty: 0.65,
    pattern: [
      '..v',
      '..R',
      '.v.',
      '.P.',
      'v..',
      'B..',
    ],
  },
  {
    id: 't3_high_low_rhythm',
    difficulty: 0.68,
    pattern: [
      '.v.',
      '.B.',
      '.v.',
      '.M.',
      '.v.',
      '.B.',
    ],
  },
  {
    id: 't3_corridor_squeeze',
    difficulty: 0.72,
    pattern: [
      '.v.',
      'C.C',
      '.v.',
      'B.B',
      '.V.',
    ],
  },

  // --- TIER 4: 0.75 - 1.0 ---
  {
    id: 't4_rally_chaos',
    difficulty: 0.78,
    pattern: [
      'v..',
      'C.@',
      '..v',
      '..M',
      '.v.',
      '.B.',
    ],
  },
  {
    id: 't4_triple_lane_weaver',
    difficulty: 0.82,
    pattern: [
      'v..',
      '.C.',
      '..v',
      '..C',
      '.v.',
      'C..',
    ],
  },
  {
    id: 't4_golden_gauntlet',
    difficulty: 0.85,
    pattern: [
      '.V.',
      'B.B',
      '.V.',
      'M.M',
      '.V.',
      'P.P',
    ],
  },
  {
    id: 't4_fast_cow_stampede',
    difficulty: 0.88,
    pattern: [
      'v..',
      '.@.',
      '..v',
      'C..',
      '.v.',
    ],
  },
  {
    id: 't4_press_barricade_blitz',
    difficulty: 0.92,
    pattern: [
      '..v',
      '..B',
      '.v.',
      '.R.',
      'v..',
      'C..',
    ],
  },
  {
    id: 't4_ultimate_rally_run',
    difficulty: 0.96,
    pattern: [
      '.s.',
      'B.C',
      '..v',
      '.@.',
      'v..',
      '.M.',
      '.V.',
    ],
  },
  {
    id: 't4_master_corridor',
    difficulty: 1.0,
    pattern: [
      'v..',
      '.C.',
      '..v',
      'M.M',
      '.v.',
      'B.B',
      '.V.',
    ],
  },
];

export const PARSED_CHUNKS: Chunk[] = RAW_CHUNKS.map(parseAsciiChunk);
