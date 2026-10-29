import * as THREE from 'three';
import { PowerUpId } from '../config/constants';
import { POWERUPS } from '../config/powerups';
import { Box3D } from '../utils/math';

export class PowerUpEntity {
  public mesh: THREE.Group;
  public id: PowerUpId = 'magnet';
  public lane: number = 0;
  public x: number = 0;
  public y: number = 1.1;
  public z: number = 0;
  public active: boolean = false;
  private animTimer: number = 0;
  private iconMesh: THREE.Mesh;
  private beaconRing: THREE.Mesh;

  constructor() {
    this.mesh = new THREE.Group();
    this.mesh.visible = false;

    // Outer crystal beacon cube/octahedron
    const crystalGeo = new THREE.OctahedronGeometry(0.42, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: '#3b82f6',
      metalness: 0.6,
      roughness: 0.2,
      emissive: '#1e3a8a',
      emissiveIntensity: 0.4,
    });
    this.iconMesh = new THREE.Mesh(crystalGeo, crystalMat);
    this.mesh.add(this.iconMesh);

    // Glowing orbiting energy ring
    const ringGeo = new THREE.TorusGeometry(0.55, 0.04, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: '#60a5fa', transparent: true, opacity: 0.75 });
    this.beaconRing = new THREE.Mesh(ringGeo, ringMat);
    this.mesh.add(this.beaconRing);
  }

  public init(id: PowerUpId, lane: number, z: number, x: number): void {
    this.id = id;
    this.lane = lane;
    this.x = x;
    this.z = z;
    this.y = 1.1;
    this.active = true;
    this.animTimer = Math.random() * 5;

    const def = POWERUPS[id];
    const color = def ? def.color : '#3b82f6';

    const mat = this.iconMesh.material as THREE.MeshStandardMaterial;
    mat.color.set(color);
    mat.emissive.set(color);

    const ringMat = this.beaconRing.material as THREE.MeshBasicMaterial;
    ringMat.color.set(color);

    this.mesh.position.set(this.x, this.y, this.z);
    this.mesh.visible = true;
  }

  public update(dt: number, scrollDistance: number): void {
    if (!this.active) return;

    this.z -= scrollDistance;
    this.animTimer += dt * 3.5;

    // Bob and spin
    this.y = 1.1 + Math.sin(this.animTimer) * 0.15;
    this.iconMesh.rotation.y = this.animTimer * 1.5;
    this.iconMesh.rotation.x = Math.sin(this.animTimer * 0.8) * 0.3;

    this.beaconRing.rotation.x = Math.PI / 4 + Math.cos(this.animTimer) * 0.2;
    this.beaconRing.rotation.y = -this.animTimer * 1.8;

    this.mesh.position.set(this.x, this.y, this.z);

    if (this.z < -6) {
      this.deactivate();
    }
  }

  public getBoundingBox(): Box3D {
    const size = 0.6;
    return {
      minX: this.x - size,
      maxX: this.x + size,
      minY: this.y - size,
      maxY: this.y + size,
      minZ: this.z - size,
      maxZ: this.z + size,
    };
  }

  public deactivate(): void {
    this.active = false;
    this.mesh.visible = false;
  }
}
