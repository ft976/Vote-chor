# Vote Runner — 3D Endless Campaign Meme Game

Vote Runner is a mobile-first, 3D endless-runner web game inspired by Subway Surfers and Temple Run. The player controls a fictional campaign leader, **Neta Ji**, dashing down bustling streets and highways collecting votes while outrunning rival inquisitor, **Vipaksh Bhai**.

---

## ⚠️ Hard Rule: Fictional Satire Only
- All characters are fictional cartoon caricatures.
- No real politician's name, face, voice, or quote is used.
- No real party name, symbol, logo, branding colors, or slogan is used.
- Humor comes entirely from situational everyday tropes (traffic jams, road potholes, press boom mics, stray cows, cutting chai breaks).

---

## Tech Stack
- **Framework**: Next.js 15+ App Router with React 19 & TypeScript (strict mode)
- **3D Engine**: Three.js (r160+) with `RoomEnvironment` PBR studio lighting, dynamic camera rig with lane-switch damping, speed-based FOV expansion, and screen shake
- **Audio Engine**: Web Audio API with 100% procedural sound synthesis (vote dings, golden chimes, swoosh jumps, friction slides, stumble thuds, and dynamic dholak rhythm beats)
- **Physics & Gameplay**: Fixed-timestep accumulator loop at 60 Hz with frame interpolation, AABB collision detection in 3D lane space, object pooling, and seeded RNG
- **Persistence**: Safe `localStorage` wrapper with migration, auto-recovery, and daily mission cycles
- **Styling**: Tailwind CSS with bilingual typography support (English & Hindi)
- **PWA**: Web App Manifest and Service Worker for installable and offline gameplay

---

## Getting Started

### 1. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Run Pure Logic Unit Tests
```bash
npx --yes tsx --test tests/*.test.ts
```
Covers:
- `SpawnValidator` (fairness, reachability, lane switch interval)
- `ScoreSystem` (scoring formula & multiplier)
- `ChaseSystem` (stumble gap loss, recovery, shield absorption, caught triggers)
- `SaveManager` (resilient deserialization, migration, progress clamping)

### 3. Production Build
```bash
npm run build
npm run start
```

---

## How to Customize Characters and Art

All character identifiers, display names, speech lines, and skin palettes are strictly centralized in:
`src/config/characters.ts`

### Changing Character Names & Speech Lines
Open `src/config/characters.ts`:
```typescript
export const CHARACTERS = {
  player: {
    id: 'neta_ji',
    displayName: 'Neta Ji', // Edit display name here
    speechLines: [
      'Janata mere saath hai!',
      'Vikas ki speed dekho!',
      // Add custom fictional voice lines here
    ],
    // ...
  },
  chaser: {
    id: 'vipaksh_bhai',
    displayName: 'Vipaksh Bhai', // Edit rival display name here
    speechLines: [
      'Ruko bhai, ruko!',
      'Ek minute baat suno!',
      // Add custom rival chase lines here
    ],
    // ...
  }
};
```

### Adding or Modifying Skins & Outfits
In `src/config/characters.ts`, each skin defines colors for the kurta, Nehru vest, topi cap, and trail particles:
```typescript
{
  id: 'custom_skin',
  name: 'Festival Silk',
  kurtaColor: '#fef08a',
  vestColor: '#ca8a04',
  capColor: '#eab308',
  trailColor: '#facc15',
  cost: 250,
  description: 'Festive silk kurta with shimmering golden dust trail.'
}
```

---

## Controls
- **Change Lanes**: `A` / `D` or `Left Arrow` / `Right Arrow` (or swipe Left / Right on touchscreen)
- **Jump**: `W` / `Up Arrow` / `Space` (or swipe Up)
- **Slide / Fast-Fall**: `S` / `Down Arrow` (or swipe Down)
- **Pause Game**: `Esc` or `P` key (or tap Pause button in HUD)
- **Instant Test Run**: Load with `?autostart=1` query parameter
