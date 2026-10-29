import * as THREE from 'three';
import { PlayerAction, PlayerState } from '../config/constants';
import { CHARACTERS, CharacterSkin } from '../config/characters';

export class PlayerEntity {
  public mesh: THREE.Group;
  private torso: THREE.Mesh;
  private vest: THREE.Mesh;
  private scarf: THREE.Mesh;
  private head: THREE.Mesh;
  private cap: THREE.Mesh;
  private legL: THREE.Mesh;
  private legR: THREE.Mesh;
  private armL: THREE.Mesh;
  private armR: THREE.Mesh;
  private shadow: THREE.Mesh;
  private trailParticles: THREE.Points;
  private trailPositions: Float32Array;
  private trailAlphas: Float32Array;
  private trailIndex: number = 0;

  private runCycle: number = 0;
  private currentSkin: CharacterSkin;

  constructor(skinId: string = 'khadi_white') {
    this.mesh = new THREE.Group();
    const skin = CHARACTERS.player.skins.find((s) => s.id === skinId) || CHARACTERS.player.skins[0];
    this.currentSkin = skin;

    // --- 1. Torso: Crisp Kurta ---
    const torsoGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.9, 12);
    const kurtaMat = new THREE.MeshStandardMaterial({
      color: skin.kurtaColor,
      roughness: 0.65,
      metalness: 0.05,
    });
    this.torso = new THREE.Mesh(torsoGeo, kurtaMat);
    this.torso.position.y = 0.95;
    this.mesh.add(this.torso);

    // --- 2. Vest: Nehru Jacket ---
    const vestGeo = new THREE.CylinderGeometry(0.36, 0.41, 0.6, 12);
    const vestMat = new THREE.MeshStandardMaterial({
      color: skin.vestColor,
      roughness: 0.5,
      metalness: 0.1,
    });
    this.vest = new THREE.Mesh(vestGeo, vestMat);
    this.vest.position.set(0, 0.05, 0.02);
    this.torso.add(this.vest);

    // --- 3. Angavastram / Stole Scarf ---
    const scarfGeo = new THREE.BoxGeometry(0.12, 0.7, 0.08);
    const scarfMat = new THREE.MeshStandardMaterial({
      color: skin.trailColor,
      roughness: 0.7,
    });
    this.scarf = new THREE.Mesh(scarfGeo, scarfMat);
    this.scarf.position.set(0.24, 0.0, 0.22);
    this.torso.add(this.scarf);

    // --- 4. Head: Caricature Cartoon Face ---
    const headGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({
      color: '#ffedd5', // warm skin tone
      roughness: 0.4,
    });
    this.head = new THREE.Mesh(headGeo, headMat);
    this.head.position.set(0, 1.55, 0);
    this.mesh.add(this.head);

    // Caricature spectacles / sunglasses
    const glassesGeo = new THREE.TorusGeometry(0.08, 0.02, 8, 12);
    const glassesMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.2 });
    const gL = new THREE.Mesh(glassesGeo, glassesMat);
    gL.position.set(-0.09, 0.02, 0.22);
    const gR = new THREE.Mesh(glassesGeo, glassesMat);
    gR.position.set(0.09, 0.02, 0.22);
    this.head.add(gL, gR);

    // --- 5. Cap: Classic Topi ---
    const capGeo = new THREE.ConeGeometry(0.28, 0.22, 12);
    const capMat = new THREE.MeshStandardMaterial({
      color: skin.capColor,
      roughness: 0.55,
    });
    this.cap = new THREE.Mesh(capGeo, capMat);
    this.cap.position.set(0, 0.22, 0);
    this.cap.rotation.x = -0.15;
    this.head.add(this.cap);

    // --- 6. Arms ---
    const armGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.65, 8);
    this.armL = new THREE.Mesh(armGeo, kurtaMat);
    this.armL.position.set(-0.45, 0.95, 0);
    this.armR = new THREE.Mesh(armGeo, kurtaMat);
    this.armR.position.set(0.45, 0.95, 0);
    this.mesh.add(this.armL, this.armR);

    // --- 7. Legs ---
    const legGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.75, 8);
    const pyjamaMat = new THREE.MeshStandardMaterial({ color: skin.kurtaColor, roughness: 0.7 });
    this.legL = new THREE.Mesh(legGeo, pyjamaMat);
    this.legL.position.set(-0.2, 0.38, 0);
    this.legR = new THREE.Mesh(legGeo, pyjamaMat);
    this.legR.position.set(0.2, 0.38, 0);
    this.mesh.add(this.legL, this.legR);

    // --- 8. Contact Ground Shadow ---
    const shadowGeo = new THREE.CircleGeometry(0.6, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: '#020617',
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    this.shadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.02;
    this.mesh.add(this.shadow);

    // --- 9. Vote Trail Particle Emitter ---
    const particleCount = 40;
    const trailGeo = new THREE.BufferGeometry();
    this.trailPositions = new Float32Array(particleCount * 3);
    this.trailAlphas = new Float32Array(particleCount);
    for (let i = 0; i < particleCount * 3; i++) this.trailPositions[i] = 0;

    trailGeo.setAttribute('position', new THREE.BufferAttribute(this.trailPositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: skin.trailColor,
      size: 0.18,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    this.trailParticles = new THREE.Points(trailGeo, particleMat);
    this.mesh.add(this.trailParticles);
  }

  public setSkin(skinId: string): void {
    const skin = CHARACTERS.player.skins.find((s) => s.id === skinId);
    if (!skin) return;
    this.currentSkin = skin;

    (this.torso.material as THREE.MeshStandardMaterial).color.set(skin.kurtaColor);
    (this.vest.material as THREE.MeshStandardMaterial).color.set(skin.vestColor);
    (this.cap.material as THREE.MeshStandardMaterial).color.set(skin.capColor);
    (this.scarf.material as THREE.MeshStandardMaterial).color.set(skin.trailColor);
    (this.legL.material as THREE.MeshStandardMaterial).color.set(skin.kurtaColor);
    (this.legR.material as THREE.MeshStandardMaterial).color.set(skin.kurtaColor);
    (this.trailParticles.material as THREE.PointsMaterial).color.set(skin.trailColor);
  }

  public update(state: PlayerState, dt: number, speed: number): void {
    // Sync position
    this.mesh.position.set(state.x, state.y, 0);

    // Shadow stays on ground and shrinks with jump height
    this.shadow.position.y = -state.y + 0.02;
    const shadowScale = Math.max(0.3, 1 - state.y * 0.2);
    this.shadow.scale.set(shadowScale, shadowScale, shadowScale);

    // Invulnerability flashing (e.g. after stumble)
    if (state.invulnerableFor > 0) {
      const flash = Math.sin(state.invulnerableFor * 30) > 0;
      this.mesh.visible = flash;
    } else {
      this.mesh.visible = true;
    }

    // Shield bubble visibility (if active)
    // Dynamic pose animations based on action
    switch (state.action) {
      case 'running':
        this.animateRunning(dt, speed);
        break;
      case 'jumping':
        this.animateJumping();
        break;
      case 'sliding':
        this.animateSliding();
        break;
      case 'stumbling':
        this.animateStumbling(dt);
        break;
      case 'dead':
        this.animateDead();
        break;
    }

    this.updateTrail(dt);
  }

  private animateRunning(dt: number, speed: number): void {
    this.runCycle += dt * (speed * 1.1);

    // Arm swings
    this.armL.rotation.x = Math.sin(this.runCycle) * 0.7;
    this.armR.rotation.x = -Math.sin(this.runCycle) * 0.7;

    // Leg strides
    this.legL.rotation.x = -Math.sin(this.runCycle) * 0.8;
    this.legR.rotation.x = Math.sin(this.runCycle) * 0.8;

    // Torso gentle bob and lean
    this.torso.rotation.z = Math.sin(this.runCycle * 0.5) * 0.05;
    this.torso.rotation.x = 0.12; // Forward sprint lean
    this.head.rotation.x = -0.06;
    this.mesh.scale.set(1.0, 1.0, 1.0);
  }

  private animateJumping(): void {
    // Tuck legs and raise arms for jump
    this.legL.rotation.x = 0.4;
    this.legR.rotation.x = -0.3;
    this.armL.rotation.x = -1.2;
    this.armR.rotation.x = -1.2;
    this.torso.rotation.x = -0.1;
    this.mesh.scale.set(1.0, 1.0, 1.0);
  }

  private animateSliding(): void {
    // Crouch low
    this.legL.rotation.x = 1.3;
    this.legR.rotation.x = 1.3;
    this.armL.rotation.x = -0.8;
    this.armR.rotation.x = -0.8;
    this.torso.rotation.x = 0.9;
    this.mesh.scale.set(1.0, 0.55, 1.2);
  }

  private animateStumbling(dt: number): void {
    this.runCycle += dt * 25;
    this.torso.rotation.z = Math.sin(this.runCycle) * 0.3;
    this.torso.rotation.x = -0.25;
    this.armL.rotation.z = 0.8;
    this.armR.rotation.z = -0.8;
    this.mesh.scale.set(1.0, 1.0, 1.0);
  }

  private animateDead(): void {
    this.torso.rotation.x = Math.PI / 2;
    this.mesh.scale.set(1.0, 0.4, 1.0);
  }

  private updateTrail(dt: number): void {
    const pos = this.trailParticles.geometry.attributes.position as THREE.BufferAttribute;
    const array = pos.array as Float32Array;

    // Emit particle behind player
    const idx = (this.trailIndex % 40) * 3;
    array[idx] = (Math.random() - 0.5) * 0.4;
    array[idx + 1] = 0.3 + (Math.random() - 0.5) * 0.3;
    array[idx + 2] = -0.4 - Math.random() * 0.8;

    this.trailIndex++;
    pos.needsUpdate = true;
  }
}
