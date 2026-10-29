import { PowerUpDef, PowerUpId } from './constants';

export const POWERUPS: Record<PowerUpId, PowerUpDef> = {
  magnet: {
    id: 'magnet',
    name: 'Campaign Jeep',
    duration: 8,
    art: 'magnet',
    description: 'Pulls ballot votes effortlessly from all three lanes into your tally.',
    color: '#3b82f6', // blue
  },
  multiplier: {
    id: 'multiplier',
    name: 'Viral Reel',
    duration: 8,
    art: 'multiplier',
    description: 'Social media frenzy! Doubles (2x) all score gained during the run.',
    color: '#ec4899', // pink
  },
  shield: {
    id: 'shield',
    name: 'Security Cover',
    duration: 10,
    art: 'shield',
    description: 'SPG bodyguard cordon: absorbs 1 obstacle stumble without losing distance.',
    color: '#10b981', // emerald green
  },
  helicopter: {
    id: 'helicopter',
    name: 'VIP Helicopter',
    duration: 6,
    art: 'helicopter',
    description: 'Fly high above all road obstacles and scoop aerial golden votes for 6 seconds!',
    color: '#f59e0b', // amber
  },
  slowmo: {
    id: 'slowmo',
    name: 'Chai Break',
    duration: 8,
    art: 'slowmo',
    description: 'Sip a hot cutting chai: slows game speed down to 0.7x for precision dodges.',
    color: '#8b5cf6', // purple
  },
};
