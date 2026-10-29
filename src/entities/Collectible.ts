import * as THREE from 'three';
import { Box3D } from '../utils/math';

export class CollectibleEntity {
  public mesh: THREE.Group;
  public value: 1 | 5 = 1;
  public active: boolean = false;
  public lane: number = 0;
  public x: number = 0;
  public y: number = 1.0;
  public z: number = 0;
  private coinMesh: THREE.Mesh;
  private animOffset: number = 0;

  private static voteTexture: THREE.Texture | null = null;

  constructor() {
    this.mesh = new THREE.Group();
    this.mesh.visible = false;

    // Load coin texture from uploaded asset if available, else procedural canvas
    if (!CollectibleEntity.voteTexture && typeof window !== 'undefined') {
      const loader = new THREE.TextureLoader();
      CollectibleEntity.voteTexture = loader.load(
        '/images_vote_coin.jpeg',
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
        },
        undefined,
        () => {
          loader.load(
            '/assets/aistudio/images__3__b4222acb.jpeg',
            (tex) => {
              tex.colorSpace = THREE.SRGBColorSpace;
            },
            undefined,
            () => {
              CollectibleEntity.voteTexture = CollectibleEntity.generateProceduralCoinTexture();
            }
          );
        }
      );
    }

    // Cylinder coin token
    const coinGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 20);
    const coinMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      metalness: 0.85,
      roughness: 0.25,
      map: CollectibleEntity.voteTexture,
    });

    this.coinMesh = new THREE.Mesh(coinGeo, coinMat);
    this.coinMesh.rotation.x = Math.PI / 2;
    this.mesh.add(this.coinMesh);

    // Subtle glow halo ring
    const haloGeo = new THREE.TorusGeometry(0.44, 0.03, 8, 16);
    const haloMat = new THREE.MeshBasicMaterial({ color: '#facc15', transparent: true, opacity: 0.6 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    this.mesh.add(halo);
  }

  public init(value: 1 | 5, lane: number, z: number, x: number): void {
    this.value = value;
    this.lane = lane;
    this.x = x;
    this.z = z;
    this.y = 1.0;
    this.active = true;
    this.animOffset = Math.random() * Math.PI * 2;

    const mat = this.coinMesh.material as THREE.MeshStandardMaterial;
    if (this.value === 5) {
      // Golden Vote (5x)
      mat.color.set('#facc15');
      mat.metalness = 0.95;
      mat.roughness = 0.15;
      this.mesh.scale.set(1.25, 1.25, 1.25);
    } else {
      // Standard Vote (1x)
      mat.color.set('#ffffff');
      mat.metalness = 0.8;
      mat.roughness = 0.3;
      this.mesh.scale.set(1.0, 1.0, 1.0);
    }

    this.mesh.position.set(this.x, this.y, this.z);
    this.mesh.visible = true;
  }

  public update(dt: number, scrollDistance: number): void {
    if (!this.active) return;

    this.z -= scrollDistance;
    this.animOffset += dt * 4;

    // Spin animation and gentle floating hover bob
    this.coinMesh.rotation.y = this.animOffset;
    this.y = 1.0 + Math.sin(this.animOffset * 1.5) * 0.12;

    this.mesh.position.set(this.x, this.y, this.z);

    if (this.z < -6) {
      this.deactivate();
    }
  }

  public getBoundingBox(): Box3D {
    const size = this.value === 5 ? 0.6 : 0.48;
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

  private static generateProceduralCoinTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Coin face background
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(128, 128, 120, 0, Math.PI * 2);
    ctx.fill();

    // Outer rim
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 12;
    ctx.stroke();

    // VOTE text embossing
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 58px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VOTE', 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
}
