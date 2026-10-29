import * as THREE from 'three';
import { LANE_WIDTH } from '../config/constants';

const SEGMENT_LENGTH = 30;
const SEGMENT_COUNT = 5;
const ROAD_WIDTH = LANE_WIDTH * 3 + 1.6; // ~8.2 units wide

export class Track {
  public group: THREE.Group;
  private segments: THREE.Group[] = [];
  private roadMaterial: THREE.MeshStandardMaterial;
  private curbMaterial: THREE.MeshStandardMaterial;
  private stripeMaterial: THREE.MeshBasicMaterial;

  constructor() {
    this.group = new THREE.Group();

    this.roadMaterial = new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.85,
      metalness: 0.1,
    });

    this.curbMaterial = new THREE.MeshStandardMaterial({
      color: '#94a3b8',
      roughness: 0.7,
    });

    this.stripeMaterial = new THREE.MeshBasicMaterial({
      color: '#facc15',
    });

    // Create pooled road segments
    for (let i = 0; i < SEGMENT_COUNT; i++) {
      const segment = this.createSegment();
      segment.position.z = i * SEGMENT_LENGTH;
      this.segments.push(segment);
      this.group.add(segment);
    }
  }

  public setColors(roadColor: string, curbColor: string, stripeColor: string): void {
    this.roadMaterial.color.set(roadColor);
    this.curbMaterial.color.set(curbColor);
    this.stripeMaterial.color.set(stripeColor);
  }

  public update(scrollDistance: number): void {
    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i];
      seg.position.z -= scrollDistance;

      // Wrap behind segment to front of track
      if (seg.position.z < -SEGMENT_LENGTH) {
        // Find furthest segment
        let maxZ = -Infinity;
        for (let j = 0; j < this.segments.length; j++) {
          if (this.segments[j].position.z > maxZ) {
            maxZ = this.segments[j].position.z;
          }
        }
        seg.position.z = maxZ + SEGMENT_LENGTH;
      }
    }
  }

  private createSegment(): THREE.Group {
    const seg = new THREE.Group();

    // Road asphalt bed
    const roadGeo = new THREE.PlaneGeometry(ROAD_WIDTH, SEGMENT_LENGTH);
    const road = new THREE.Mesh(roadGeo, this.roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, SEGMENT_LENGTH / 2);
    road.receiveShadow = true;
    seg.add(road);

    // Left and Right Curbs / Sidewalks
    const curbGeo = new THREE.BoxGeometry(0.8, 0.22, SEGMENT_LENGTH);
    const curbL = new THREE.Mesh(curbGeo, this.curbMaterial);
    curbL.position.set(-(ROAD_WIDTH / 2 + 0.4), 0.1, SEGMENT_LENGTH / 2);
    const curbR = new THREE.Mesh(curbGeo, this.curbMaterial);
    curbR.position.set(ROAD_WIDTH / 2 + 0.4, 0.1, SEGMENT_LENGTH / 2);
    seg.add(curbL, curbR);

    // Lane divider stripes (2 dividers for 3 lanes)
    const stripeCount = 6;
    const stripeGeo = new THREE.PlaneGeometry(0.12, 2.2);
    const leftDividerX = -LANE_WIDTH / 2;
    const rightDividerX = LANE_WIDTH / 2;

    for (let s = 0; s < stripeCount; s++) {
      const zOffset = (s + 0.5) * (SEGMENT_LENGTH / stripeCount);

      const sL = new THREE.Mesh(stripeGeo, this.stripeMaterial);
      sL.rotation.x = -Math.PI / 2;
      sL.position.set(leftDividerX, 0.015, zOffset);

      const sR = new THREE.Mesh(stripeGeo, this.stripeMaterial);
      sR.rotation.x = -Math.PI / 2;
      sR.position.set(rightDividerX, 0.015, zOffset);

      seg.add(sL, sR);
    }

    return seg;
  }
}
