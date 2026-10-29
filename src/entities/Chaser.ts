import * as THREE from 'three';
import { CHARACTERS } from '../config/characters';
import { damp } from '../utils/math';

export class ChaserEntity {
  public mesh: THREE.Group;
  private torso: THREE.Mesh;
  private vest: THREE.Mesh;
  private head: THREE.Mesh;
  private cap: THREE.Mesh;
  private megaphone: THREE.Group;
  private legL: THREE.Mesh;
  private legR: THREE.Mesh;
  private armL: THREE.Mesh;
  private armR: THREE.Mesh;
  private shadow: THREE.Mesh;

  private runCycle: number = 0;

  constructor() {
    this.mesh = new THREE.Group();
    const chaserConfig = CHARACTERS.chaser;
    const skin = chaserConfig.skins[0];

    // --- 1. Bulky Torso ---
    const torsoGeo = new THREE.CylinderGeometry(0.42, 0.46, 0.95, 12);
    const kurtaMat = new THREE.MeshStandardMaterial({
      color: skin.kurtaColor,
      roughness: 0.7,
    });
    this.torso = new THREE.Mesh(torsoGeo, kurtaMat);
    this.torso.position.y = 1.0;
    this.mesh.add(this.torso);

    // --- 2. Maroon Vest ---
    const vestGeo = new THREE.CylinderGeometry(0.44, 0.48, 0.65, 12);
    const vestMat = new THREE.MeshStandardMaterial({
      color: skin.vestColor,
      roughness: 0.5,
      metalness: 0.1,
    });
    this.vest = new THREE.Mesh(vestGeo, vestMat);
    this.vest.position.set(0, 0.05, 0.02);
    this.torso.add(this.vest);

    // --- 3. Head ---
    const headGeo = new THREE.SphereGeometry(0.26, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({
      color: '#fed7aa',
      roughness: 0.45,
    });
    this.head = new THREE.Mesh(headGeo, headMat);
    this.head.position.set(0, 1.62, 0);
    this.mesh.add(this.head);

    // Topi Cap
    const capGeo = new THREE.ConeGeometry(0.3, 0.22, 12);
    const capMat = new THREE.MeshStandardMaterial({
      color: skin.capColor,
      roughness: 0.6,
    });
    this.cap = new THREE.Mesh(capGeo, capMat);
    this.cap.position.set(0, 0.24, 0);
    this.head.add(this.cap);

    // --- 4. Megaphone in Hand ---
    this.megaphone = new THREE.Group();
    const coneGeo = new THREE.ConeGeometry(0.18, 0.4, 12);
    const coneMat = new THREE.MeshStandardMaterial({ color: '#facc15', roughness: 0.3 });
    const horn = new THREE.Mesh(coneGeo, coneMat);
    horn.rotation.x = Math.PI / 2;
    horn.position.z = 0.2;

    const handleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8);
    const handleMat = new THREE.MeshStandardMaterial({ color: '#1e293b' });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = -0.12;

    this.megaphone.add(horn, handle);
    this.megaphone.position.set(0.48, 1.1, 0.3);
    this.mesh.add(this.megaphone);

    // --- 5. Arms ---
    const armGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.65, 8);
    this.armL = new THREE.Mesh(armGeo, kurtaMat);
    this.armL.position.set(-0.52, 1.0, 0);
    this.armR = new THREE.Mesh(armGeo, kurtaMat);
    this.armR.position.set(0.52, 1.0, 0);
    this.mesh.add(this.armL, this.armR);

    // --- 6. Legs ---
    const legGeo = new THREE.CylinderGeometry(0.11, 0.1, 0.75, 8);
    this.legL = new THREE.Mesh(legGeo, kurtaMat);
    this.legL.position.set(-0.24, 0.38, 0);
    this.legR = new THREE.Mesh(legGeo, kurtaMat);
    this.legR.position.set(0.24, 0.38, 0);
    this.mesh.add(this.legL, this.legR);

    // --- 7. Contact Shadow ---
    const shadowGeo = new THREE.CircleGeometry(0.65, 16);
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
  }

  public update(playerX: number, gap: number, dt: number, speed: number): void {
    // Map gap (0..10) to distance behind player (Z: -1.8 to -14)
    // When gap < 5, chaser is close enough to be visible on screen!
    const targetZ = -Math.max(1.8, gap * 1.35 + 1.2);
    const currentZ = damp(this.mesh.position.z, targetZ, 8, dt);
    const currentX = damp(this.mesh.position.x, playerX, 6, dt);

    this.mesh.position.set(currentX, 0, currentZ);

    // Animate running sprint
    this.runCycle += dt * (speed * 1.15);
    this.legL.rotation.x = -Math.sin(this.runCycle) * 0.85;
    this.legR.rotation.x = Math.sin(this.runCycle) * 0.85;

    this.armL.rotation.x = Math.sin(this.runCycle) * 0.8;
    this.armR.rotation.x = -Math.sin(this.runCycle) * 0.8;

    // Megaphone waving action
    this.megaphone.rotation.x = Math.sin(this.runCycle * 1.5) * 0.3;
    this.megaphone.rotation.z = Math.cos(this.runCycle) * 0.2;

    this.torso.rotation.x = 0.18; // Urgent chasing lean
  }
}
