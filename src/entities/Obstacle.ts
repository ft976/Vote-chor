import * as THREE from 'three';
import { Box3D } from '../utils/math';
import { ObstacleDef } from '../config/constants';
import { OBSTACLES } from '../config/obstacles';

export class ObstacleEntity {
  public mesh: THREE.Group;
  public id: string = '';
  public def: ObstacleDef = OBSTACLES.barricade;
  public lane: number = 0;
  public x: number = 0;
  public z: number = 0;
  public active: boolean = false;
  private animTimer: number = 0;
  private cowDirection: number = 1;

  constructor() {
    this.mesh = new THREE.Group();
    this.mesh.visible = false;
  }

  public init(obstacleId: string, lane: number, z: number, x: number): void {
    this.id = obstacleId;
    this.def = OBSTACLES[obstacleId] || OBSTACLES.barricade;
    this.lane = lane;
    this.x = x;
    this.z = z;
    this.active = true;
    this.animTimer = Math.random() * 10;
    this.cowDirection = Math.random() > 0.5 ? 1 : -1;

    // Clear previous mesh children and build procedural composite model
    while (this.mesh.children.length > 0) {
      const child = this.mesh.children.pop()!;
      this.disposeObject(child);
    }

    this.buildModel();
    this.mesh.position.set(this.x, 0, this.z);
    this.mesh.visible = true;
  }

  public update(dt: number, scrollDistance: number): void {
    if (!this.active) return;

    this.z -= scrollDistance;
    this.animTimer += dt;

    // Special logic for moving obstacle: stray_cow
    if (this.id === 'stray_cow') {
      const wanderSpeed = 1.2;
      this.x += this.cowDirection * wanderSpeed * dt;
      // Reverse direction at lane edges [-2.4, 2.4]
      if (this.x > 2.4) {
        this.x = 2.4;
        this.cowDirection = -1;
      } else if (this.x < -2.4) {
        this.x = -2.4;
        this.cowDirection = 1;
      }

      // Gentle walking sway
      this.mesh.rotation.z = Math.sin(this.animTimer * 6) * 0.08;
      this.mesh.rotation.y = this.cowDirection > 0 ? Math.PI / 2 : -Math.PI / 2;
    }

    this.mesh.position.set(this.x, 0, this.z);

    // Deactivate when passed behind player
    if (this.z < -6) {
      this.deactivate();
    }
  }

  public getBoundingBox(): Box3D {
    const halfW = this.def.size.w / 2;
    const halfD = this.def.size.d / 2;

    if (this.def.kind === 'high') {
      // Overhead obstacle: player can slide under
      return {
        minX: this.x - halfW,
        maxX: this.x + halfW,
        minY: 0.9, // Overhead clearance starts at y = 0.9
        maxY: 0.9 + this.def.size.h,
        minZ: this.z - halfD,
        maxZ: this.z + halfD,
      };
    } else if (this.def.kind === 'low') {
      // Low obstacle: player can jump over
      return {
        minX: this.x - halfW,
        maxX: this.x + halfW,
        minY: 0,
        maxY: this.def.size.h,
        minZ: this.z - halfD,
        maxZ: this.z + halfD,
      };
    }

    // Full obstacle or moving
    return {
      minX: this.x - halfW,
      maxX: this.x + halfW,
      minY: 0,
      maxY: this.def.size.h,
      minZ: this.z - halfD,
      maxZ: this.z + halfD,
    };
  }

  public deactivate(): void {
    this.active = false;
    this.mesh.visible = false;
  }

  private buildModel(): void {
    switch (this.id) {
      case 'barricade':
        this.buildBarricade();
        break;
      case 'pothole':
        this.buildPothole();
        break;
      case 'press_mic':
        this.buildPressMic();
        break;
      case 'rally_banner':
        this.buildRallyBanner();
        break;
      case 'traffic_car':
        this.buildTrafficCar();
        break;
      case 'stray_cow':
        this.buildStrayCow();
        break;
      default:
        this.buildBarricade();
        break;
    }
  }

  // 1. Barricade: 6-part wooden/metal barrier with yellow/black hazard stripes
  private buildBarricade(): void {
    const legGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.1, 8);
    const woodMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.8 });
    const stripeMat = new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.5, metalness: 0.1 });
    const redMat = new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.3 });

    // Left A-frame legs
    const legL1 = new THREE.Mesh(legGeo, woodMat);
    legL1.position.set(-0.85, 0.55, -0.15);
    legL1.rotation.x = 0.2;
    const legL2 = new THREE.Mesh(legGeo, woodMat);
    legL2.position.set(-0.85, 0.55, 0.15);
    legL2.rotation.x = -0.2;

    // Right A-frame legs
    const legR1 = new THREE.Mesh(legGeo, woodMat);
    legR1.position.set(0.85, 0.55, -0.15);
    legR1.rotation.x = 0.2;
    const legR2 = new THREE.Mesh(legGeo, woodMat);
    legR2.position.set(0.85, 0.55, 0.15);
    legR2.rotation.x = -0.2;

    // Cross beam with hazard stripes
    const beamGeo = new THREE.BoxGeometry(1.9, 0.28, 0.08);
    const beam = new THREE.Mesh(beamGeo, stripeMat);
    beam.position.set(0, 0.8, 0);

    // Warning light beacon on top
    const beaconGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.16, 8);
    const beacon = new THREE.Mesh(beaconGeo, redMat);
    beacon.position.set(0, 1.02, 0);

    this.mesh.add(legL1, legL2, legR1, legR2, beam, beacon);
  }

  // 2. Pothole: 4-part road trench with caution cone
  private buildPothole(): void {
    // Road crater recess
    const craterGeo = new THREE.CylinderGeometry(0.75, 0.8, 0.06, 16);
    const craterMat = new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.95 });
    const crater = new THREE.Mesh(craterGeo, craterMat);
    crater.position.set(0, 0.03, 0);

    // Rim gravel ring
    const ringGeo = new THREE.TorusGeometry(0.8, 0.07, 8, 16);
    const ringMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.9 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.04, 0);

    // Caution traffic cone
    const coneGeo = new THREE.ConeGeometry(0.18, 0.55, 12);
    const coneMat = new THREE.MeshStandardMaterial({ color: '#f97316', roughness: 0.4 });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(0.45, 0.28, -0.3);

    // Cone base
    const coneBaseGeo = new THREE.BoxGeometry(0.32, 0.04, 0.32);
    const coneBase = new THREE.Mesh(coneBaseGeo, new THREE.MeshStandardMaterial({ color: '#1e293b' }));
    coneBase.position.set(0.45, 0.03, -0.3);

    this.mesh.add(crater, ring, cone, coneBase);
  }

  // 3. Press Mic: 5-part overhead boom microphone rig
  private buildPressMic(): void {
    const steelMat = new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.8, roughness: 0.3 });
    const micFoamMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.9 });
    const logoMat = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.4 });

    // Left boom stand
    const poleGeo = new THREE.CylinderGeometry(0.04, 0.05, 2.6, 8);
    const poleL = new THREE.Mesh(poleGeo, steelMat);
    poleL.position.set(-1.0, 1.3, 0);

    // Overhead boom arm
    const boomGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.2, 8);
    const boom = new THREE.Mesh(boomGeo, steelMat);
    boom.rotation.z = Math.PI / 2;
    boom.position.set(0, 2.4, 0);

    // Suspended central microphone
    const micGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.35, 12);
    const mic = new THREE.Mesh(micGeo, micFoamMat);
    mic.position.set(0, 1.9, 0);

    // News station cube logo flag
    const flagGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const flag = new THREE.Mesh(flagGeo, logoMat);
    flag.position.set(0, 2.15, 0);

    this.mesh.add(poleL, boom, mic, flag);
  }

  // 4. Rally Banner: 5-part high banner ribbon across lanes
  private buildRallyBanner(): void {
    const bambooMat = new THREE.MeshStandardMaterial({ color: '#ca8a04', roughness: 0.8 });
    const clothMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.6 });

    // Left pole
    const poleGeo = new THREE.CylinderGeometry(0.05, 0.06, 2.5, 8);
    const poleL = new THREE.Mesh(poleGeo, bambooMat);
    poleL.position.set(-1.05, 1.25, 0);

    // Right pole
    const poleR = new THREE.Mesh(poleGeo, bambooMat);
    poleR.position.set(1.05, 1.25, 0);

    // Overhead cloth banner
    const bannerGeo = new THREE.BoxGeometry(2.1, 0.55, 0.04);
    const banner = new THREE.Mesh(bannerGeo, clothMat);
    banner.position.set(0, 2.1, 0);

    // Top trim string
    const stringGeo = new THREE.CylinderGeometry(0.015, 0.015, 2.2, 6);
    const string = new THREE.Mesh(stringGeo, bambooMat);
    string.rotation.z = Math.PI / 2;
    string.position.set(0, 2.4, 0);

    this.mesh.add(poleL, poleR, banner, string);
  }

  // 5. Traffic Car: 8-part vintage sedan / ambassador car
  private buildTrafficCar(): void {
    const carPaintMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.2, metalness: 0.6 });
    const windowMat = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.1, metalness: 0.8 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.8 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.9, roughness: 0.1 });

    // Main lower body
    const bodyGeo = new THREE.BoxGeometry(1.65, 0.65, 2.4);
    const body = new THREE.Mesh(bodyGeo, carPaintMat);
    body.position.set(0, 0.5, 0);

    // Cabin / Roof
    const cabinGeo = new THREE.BoxGeometry(1.4, 0.55, 1.3);
    const cabin = new THREE.Mesh(cabinGeo, windowMat);
    cabin.position.set(0, 1.05, -0.1);

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.15, 12);
    const w1 = new THREE.Mesh(wheelGeo, wheelMat);
    w1.rotation.z = Math.PI / 2;
    w1.position.set(-0.82, 0.25, 0.75);

    const w2 = new THREE.Mesh(wheelGeo, wheelMat);
    w2.rotation.z = Math.PI / 2;
    w2.position.set(0.82, 0.25, 0.75);

    const w3 = new THREE.Mesh(wheelGeo, wheelMat);
    w3.rotation.z = Math.PI / 2;
    w3.position.set(-0.82, 0.25, -0.75);

    const w4 = new THREE.Mesh(wheelGeo, wheelMat);
    w4.rotation.z = Math.PI / 2;
    w4.position.set(0.82, 0.25, -0.75);

    // Chrome bumper
    const bumperGeo = new THREE.BoxGeometry(1.68, 0.12, 0.12);
    const bumper = new THREE.Mesh(bumperGeo, chromeMat);
    bumper.position.set(0, 0.32, 1.22);

    this.mesh.add(body, cabin, w1, w2, w3, w4, bumper);
  }

  // 6. Stray Cow: 7-part low-poly sacred street cow
  private buildStrayCow(): void {
    const hideMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.7 });
    const brownPatchMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.8 });
    const hornMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.5 });

    // Body
    const bodyGeo = new THREE.BoxGeometry(0.85, 0.75, 1.4);
    const body = new THREE.Mesh(bodyGeo, hideMat);
    body.position.set(0, 0.8, 0);

    // Hump (classic Indian zebu cow hump)
    const humpGeo = new THREE.SphereGeometry(0.24, 8, 8);
    const hump = new THREE.Mesh(humpGeo, brownPatchMat);
    hump.position.set(0, 1.25, 0.3);

    // Head & Snout
    const headGeo = new THREE.BoxGeometry(0.45, 0.45, 0.55);
    const head = new THREE.Mesh(headGeo, hideMat);
    head.position.set(0, 1.05, 0.85);

    // Horns
    const hornGeo = new THREE.ConeGeometry(0.06, 0.3, 6);
    const hornL = new THREE.Mesh(hornGeo, hornMat);
    hornL.position.set(-0.2, 1.35, 0.8);
    hornL.rotation.z = 0.3;

    const hornR = new THREE.Mesh(hornGeo, hornMat);
    hornR.position.set(0.2, 1.35, 0.8);
    hornR.rotation.z = -0.3;

    // 4 Legs
    const legGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.7, 6);
    const leg1 = new THREE.Mesh(legGeo, hideMat);
    leg1.position.set(-0.3, 0.35, 0.45);
    const leg2 = new THREE.Mesh(legGeo, hideMat);
    leg2.position.set(0.3, 0.35, 0.45);
    const leg3 = new THREE.Mesh(legGeo, hideMat);
    leg3.position.set(-0.3, 0.35, -0.45);
    const leg4 = new THREE.Mesh(legGeo, hideMat);
    leg4.position.set(0.3, 0.35, -0.45);

    this.mesh.add(body, hump, head, hornL, hornR, leg1, leg2, leg3, leg4);
  }

  private disposeObject(obj: THREE.Object3D): void {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else if (mesh.material) {
        mesh.material.dispose();
      }
    }
  }
}
