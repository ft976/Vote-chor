// Character configurations and skin definitions
// HARD RULE: Fictional cartoon caricatures only. No real politicians, parties, or symbols.

export interface CharacterSkin {
  id: string;
  name: string;
  kurtaColor: string; // hex color
  vestColor: string;
  capColor: string;
  trailColor: string;
  cost: number;
  unlockedByDefault?: boolean;
  description: string;
}

export interface CharacterConfig {
  id: string;
  displayName: string;
  tagline: string;
  spritePath: string;
  frameCount: {
    run: number;
    jump: number;
    slide: number;
    stumble: number;
    dead: number;
  };
  speechLines: string[];
  skins: CharacterSkin[];
}

export const CHARACTERS: {
  player: CharacterConfig;
  chaser: CharacterConfig;
} = {
  player: {
    id: 'neta_ji',
    displayName: 'Neta Ji',
    tagline: 'The Campaign Runner',
    spritePath: '/assets/sprites/neta_ji.png',
    frameCount: {
      run: 6,
      jump: 1,
      slide: 1,
      stumble: 1,
      dead: 1,
    },
    speechLines: [
      'Janata mere saath hai!',
      'Vikas ki speed dekho!',
      'Chai break baad mein hoga!',
      'Har gali mein campaign chalega!',
      'Mera manifesto sabse aage!',
    ],
    skins: [
      {
        id: 'khadi_white',
        name: 'Classic Khadi White',
        kurtaColor: '#f8fafc',
        vestColor: '#1e293b',
        capColor: '#f1f5f9',
        trailColor: '#38bdf8',
        cost: 0,
        unlockedByDefault: true,
        description: 'Fresh crisp white khadi kurta with midnight Nehru vest.',
      },
      {
        id: 'saffron_sunset',
        name: 'Sunset Orange',
        kurtaColor: '#ffedd5',
        vestColor: '#ea580c',
        capColor: '#f97316',
        trailColor: '#fb923c',
        cost: 100,
        description: 'Vibrant sunset shades for high-energy rallies.',
      },
      {
        id: 'emerald_green',
        name: 'Grassroots Green',
        kurtaColor: '#ecfdf5',
        vestColor: '#059669',
        capColor: '#10b981',
        trailColor: '#34d399',
        cost: 200,
        description: 'Fresh field vibes for door-to-door campaigning.',
      },
      {
        id: 'royal_indigo',
        name: 'Midnight Indigo',
        kurtaColor: '#e0e7ff',
        vestColor: '#3730a3',
        capColor: '#4f46e5',
        trailColor: '#818cf8',
        cost: 350,
        description: 'Distinguished velvet vest with midnight elegance.',
      },
      {
        id: 'golden_jubilee',
        name: 'Golden Victory',
        kurtaColor: '#fef08a',
        vestColor: '#ca8a04',
        capColor: '#eab308',
        trailColor: '#facc15',
        cost: 500,
        description: 'Shimmering celebratory silk kurta with golden dust trail.',
      },
    ],
  },
  chaser: {
    id: 'vipaksh_bhai',
    displayName: 'Vipaksh Bhai',
    tagline: 'The Relentless Inquirer',
    spritePath: '/assets/sprites/vipaksh_bhai.png',
    frameCount: {
      run: 6,
      jump: 1,
      slide: 1,
      stumble: 1,
      dead: 1,
    },
    speechLines: [
      'Ruko bhai, ruko!',
      'Ek minute baat suno!',
      'Itni jaldi kya hai?',
      'Bas thoda aur!',
      'Press conference kab doge?',
      'Hawa ka rukh badal raha hai!',
    ],
    skins: [
      {
        id: 'chaser_default',
        name: 'Maroon Megaphone',
        kurtaColor: '#fef2f2',
        vestColor: '#991b1b',
        capColor: '#dc2626',
        trailColor: '#ef4444',
        cost: 0,
        unlockedByDefault: true,
        description: 'Crimson vest equipped with loud megaphone.',
      },
    ],
  },
};
