import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { FIXED_STEP, GAP_MAX, PlayerState, REVIVE_COST } from '../config/constants';
import { calculateDifficulty, calculateSpeed } from '../config/difficulty';
import { EventBus } from './EventBus';
import { StateMachine } from './StateMachine';
import { Time } from './Time';
import { SaveManager } from '../storage/SaveManager';
import { AudioManager } from '../audio/AudioManager';
import { PlayerEntity } from '../entities/Player';
import { ChaserEntity } from '../entities/Chaser';
import { CameraRig } from '../world/CameraRig';
import { WorldManager } from '../world/WorldManager';
import { InputSystem } from '../systems/InputSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { ChaseSystem } from '../systems/ChaseSystem';
import { PowerUpSystem } from '../systems/PowerUpSystem';
import { ScoreSystem } from '../systems/ScoreSystem';
import { MissionSystem } from '../systems/MissionSystem';
import { formatGameOverTicker } from '../config/lines';

export class Game {
  public eventBus: EventBus;
  public stateMachine: StateMachine;
  public saveManager: SaveManager;
  public audioManager: AudioManager;
  public missionSystem: MissionSystem;

  private container: HTMLElement;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private cameraRig: CameraRig;
  private worldManager: WorldManager;

  private playerEntity: PlayerEntity;
  private chaserEntity: ChaserEntity;
  private playerState: PlayerState;

  private inputSystem: InputSystem;
  private movementSystem: MovementSystem;
  private collisionSystem: CollisionSystem;
  private chaseSystem: ChaseSystem;
  private powerUpSystem: PowerUpSystem;
  private scoreSystem: ScoreSystem;
  private time: Time;

  private isRunning: boolean = false;
  private isSoftwareGl: boolean = false;
  private frameId: number = 0;
  private hasRevivedThisRun: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.eventBus = new EventBus();
    this.stateMachine = new StateMachine(this.eventBus);
    this.saveManager = SaveManager.getInstance();
    this.audioManager = AudioManager.getInstance();
    this.missionSystem = new MissionSystem(this.saveManager, this.eventBus);

    // Initial audio settings
    const saved = this.saveManager.getData();
    this.audioManager.init(saved.settings.sfx, saved.settings.music);

    // Initial player state
    this.playerState = {
      lane: 0,
      x: 0,
      y: 0,
      vy: 0,
      action: 'running',
      invulnerableFor: 0,
      shieldCharges: 0,
      activePowerUps: {},
    };

    // Detect software WebGL per Three.js skill guidelines
    this.isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : (gl as any).RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // Initialize Three.js Scene & Renderer
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#38bdf8');

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // Environment Lighting Reflections via RoomEnvironment
    try {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch (e) {
      console.warn('RoomEnvironment fallback:', e);
    }

    // Initialize CameraRig
    this.cameraRig = new CameraRig(60, width / height);
    this.cameraRig.setReducedMotion(saved.settings.reducedMotion);

    // Initialize World Manager
    this.worldManager = new WorldManager(this.scene);

    // Initialize Entities
    this.playerEntity = new PlayerEntity(saved.selectedSkin);
    this.scene.add(this.playerEntity.mesh);

    this.chaserEntity = new ChaserEntity();
    this.scene.add(this.chaserEntity.mesh);

    // Initialize Systems
    this.inputSystem = new InputSystem();
    this.inputSystem.init(() => this.togglePause());

    this.movementSystem = new MovementSystem();
    this.collisionSystem = new CollisionSystem();
    this.chaseSystem = new ChaseSystem(this.eventBus);
    this.powerUpSystem = new PowerUpSystem(this.eventBus);
    this.scoreSystem = new ScoreSystem(this.eventBus);
    this.time = new Time();

    // Check daily missions
    this.missionSystem.checkDailyReset();

    // Setup window resize and visibility listeners
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // Expose for testing/debugging
    (window as any).__VOTE_RUNNER_GAME__ = this;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.time.reset();
    this.animate();
  }

  public destroy(): void {
    this.isRunning = false;
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.inputSystem.destroy();
    this.audioManager.stopMusic();

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }

  public startNewRun(): void {
    this.hasRevivedThisRun = false;
    this.time.reset();
    this.movementSystem.reset(this.playerState);
    this.powerUpSystem.reset();
    this.chaseSystem.reset(GAP_MAX);
    this.scoreSystem.reset();
    this.worldManager.reset();

    const skin = this.saveManager.getData().selectedSkin;
    this.playerEntity.setSkin(skin);

    this.stateMachine.transitionTo('Playing');
    this.audioManager.startMusic();
  }

  public togglePause(): void {
    if (this.stateMachine.state === 'Playing') {
      this.stateMachine.transitionTo('Paused');
      this.audioManager.stopMusic();
    } else if (this.stateMachine.state === 'Paused') {
      this.stateMachine.transitionTo('Playing');
      this.time.reset();
      this.audioManager.startMusic();
    }
  }

  public resume(): void {
    if (this.stateMachine.state === 'Paused') {
      this.stateMachine.transitionTo('Playing');
      this.time.reset();
      this.audioManager.startMusic();
    }
  }

  public canRevive(): boolean {
    return !this.hasRevivedThisRun && this.saveManager.getData().totalVotes >= REVIVE_COST;
  }

  public revive(): boolean {
    if (!this.canRevive()) return false;

    this.saveManager.spendBankedVotes(REVIVE_COST);
    this.hasRevivedThisRun = true;

    // Spec: gap set to 6, 2 s invulnerable
    this.chaseSystem.setGap(6);
    this.playerState.action = 'running';
    this.playerState.invulnerableFor = 2.0;

    this.stateMachine.transitionTo('Playing');
    this.audioManager.playPowerUpStart();
    this.audioManager.startMusic();
    this.eventBus.emit('shout', { text: 'Back in the Race!', subtext: 'Revived with SPG Cordon' });
    return true;
  }

  public sendInput(cmd: 'left' | 'right' | 'jump' | 'slide'): void {
    this.inputSystem.enqueue(cmd);
  }

  public setSkin(skinId: string): void {
    this.saveManager.save({ selectedSkin: skinId });
    this.playerEntity.setSkin(skinId);
  }

  private handleResize = (): void => {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
    this.cameraRig.camera.aspect = width / height;
    this.cameraRig.camera.updateProjectionMatrix();
  };

  private handleVisibilityChange = (): void => {
    if (document.hidden && this.stateMachine.state === 'Playing') {
      this.stateMachine.transitionTo('Paused');
      this.audioManager.stopMusic();
    }
  };

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (!gl || typeof gl.fenceSync !== 'function') {
      this.frameId = window.setTimeout(cb, 60);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 60);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private animate = (): void => {
    if (!this.isRunning) return;

    const now = performance.now();

    // Fixed timestep update
    this.time.advance(now, (dt) => {
      if (this.stateMachine.state === 'Playing') {
        this.fixedUpdate(dt);
      }
    });

    // Render pass
    this.render();

    // Loop pacing
    if (this.isSoftwareGl) {
      this.afterDraw(this.animate);
    } else {
      this.frameId = requestAnimationFrame(this.animate);
    }
  };

  private fixedUpdate(dt: number): void {
    const distance = this.scoreSystem.getDistance();
    const difficulty = calculateDifficulty(distance);
    const slowmo = this.powerUpSystem.isActive('slowmo');
    const speed = calculateSpeed(this.time.elapsed, slowmo);
    const scrollDistance = speed * dt;

    // 1. Consume buffered inputs
    const cmd = this.inputSystem.consume();
    if (cmd) {
      switch (cmd) {
        case 'left':
          this.movementSystem.changeLane(this.playerState, -1);
          this.audioManager.playSlide();
          break;
        case 'right':
          this.movementSystem.changeLane(this.playerState, 1);
          this.audioManager.playSlide();
          break;
        case 'jump':
          if (this.movementSystem.jump(this.playerState)) {
            this.audioManager.playJump();
            this.missionSystem.trackProgress('jumps', 1);
          }
          break;
        case 'slide':
          if (this.movementSystem.slide(this.playerState)) {
            this.audioManager.playSlide();
          }
          break;
      }
    }

    // 2. Update player movement
    this.playerState.activePowerUps = this.powerUpSystem.getActiveMap();
    this.movementSystem.update(this.playerState, dt);

    // 3. Update world scrolling & spawns
    this.worldManager.update(scrollDistance, distance, difficulty, speed);

    // 4. Update powerup timers
    this.powerUpSystem.update(dt);

    // 5. Check Collisions
    const isMagnet = this.powerUpSystem.isActive('magnet');
    const collisions = this.collisionSystem.checkCollisions(
      this.playerState,
      this.worldManager.obstaclePool.getActive(),
      this.worldManager.collectiblePool.getActive(),
      this.worldManager.powerUpPool.getActive(),
      isMagnet
    );

    // Handle vote pickups
    for (const vote of collisions.collectedVotes) {
      this.scoreSystem.addVote(vote.value);
      this.missionSystem.trackProgress('votes', vote.value);
      if (vote.value === 5) {
        this.audioManager.playGoldenVote();
      } else {
        this.audioManager.playVote();
      }
      this.eventBus.emit('vote:collected', {
        value: vote.value,
        total: this.scoreSystem.getVotes(),
        isGolden: vote.value === 5,
      });
      vote.deactivate();
    }

    // Handle powerup pickups
    for (const pUp of collisions.collectedPowerUps) {
      this.powerUpSystem.activate(pUp.id);
      this.audioManager.playPowerUpStart();
      this.missionSystem.trackProgress('powerups', 1);
      pUp.deactivate();
    }

    // Handle obstacle stumbles
    for (const obs of collisions.stumbles) {
      if (this.playerState.invulnerableFor <= 0) {
        const hasShield = this.powerUpSystem.hasShield();
        if (hasShield) {
          this.powerUpSystem.consumeShield();
          this.audioManager.playStumble();
          this.cameraRig.triggerShake(0.18, 0.2);
          this.eventBus.emit('stumble', { gap: this.chaseSystem.getGap(), hasShield: true });
        } else {
          this.movementSystem.triggerStumble(this.playerState);
          this.audioManager.playStumble();
          this.cameraRig.triggerShake(0.35, 0.35);

          // Haptics if enabled in settings
          if (this.saveManager.getData().settings.haptics && typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(200);
          }

          const stumbleResult = this.chaseSystem.onStumble(false, false);
          this.eventBus.emit('stumble', { gap: this.chaseSystem.getGap(), hasShield: false });

          if (stumbleResult.caught) {
            this.handleCaught();
            return;
          }
        }
      }
    }

    // 6. Chase system recovery & caught check
    const isInvuln = this.playerState.invulnerableFor > 0;
    const chaseResult = this.chaseSystem.update(dt, isInvuln);
    if (chaseResult.caught) {
      this.handleCaught();
      return;
    }

    // 7. Update Score & Distance
    const isMultiplier = this.powerUpSystem.isActive('multiplier');
    this.scoreSystem.update(dt, speed, isMultiplier);
    this.missionSystem.trackProgress('distance', scrollDistance);

    // Audio cue for chaser proximity
    this.audioManager.playRivalFootsteps(this.chaseSystem.getGap() / GAP_MAX);
  }

  private handleCaught(): void {
    this.playerState.action = 'dead';
    this.audioManager.stopMusic();
    this.audioManager.playCaught();

    const distance = this.scoreSystem.getDistance();
    const votes = this.scoreSystem.getVotes();
    const score = this.scoreSystem.getScore();

    // Bank votes earned
    this.saveManager.addBankedVotes(votes);
    const { isNewHigh } = this.saveManager.updateRecords(score, distance, votes);

    const headline = formatGameOverTicker(distance, votes);

    this.stateMachine.transitionTo('GameOver');
    this.eventBus.emit('caught', { distance, votes, score });
    this.eventBus.emit('shout', {
      text: 'CAUGHT BY VIPAKSH BHAI!',
      subtext: isNewHigh ? '★ NEW ALL-TIME HIGH SCORE! ★' : headline,
    });
  }

  private render(): void {
    const speed = calculateSpeed(this.time.elapsed, this.powerUpSystem.isActive('slowmo'));

    // Update Player 3D mesh
    this.playerEntity.update(this.playerState, 1 / 60, speed);

    // Update Chaser 3D mesh
    this.chaserEntity.update(this.playerState.x, this.chaseSystem.getGap(), 1 / 60, speed);

    // Update Camera
    this.cameraRig.update(this.playerState.x, this.playerState.y, speed, 1 / 60);

    // Render WebGL
    this.renderer.render(this.scene, this.cameraRig.camera);
  }
}
