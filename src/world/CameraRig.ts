import * as THREE from 'three';
import { damp } from '../utils/math';

export class CameraRig {
  public camera: THREE.PerspectiveCamera;
  private targetOffset: THREE.Vector3 = new THREE.Vector3(0, 3.8, -6.5);
  private lookAtOffset: THREE.Vector3 = new THREE.Vector3(0, 1.4, 6.0);
  private currentX: number = 0;
  private currentY: number = 3.8;
  private shakeTimer: number = 0;
  private shakeIntensity: number = 0;
  private baseFov: number = 60;
  private reducedMotion: boolean = false;

  constructor(fov: number = 60, aspect: number = 1.0) {
    this.baseFov = fov;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 200);
    this.camera.position.set(0, 3.8, -6.5);
  }

  public setReducedMotion(enabled: boolean): void {
    this.reducedMotion = enabled;
  }

  public triggerShake(intensity: number = 0.25, duration: number = 0.3): void {
    if (this.reducedMotion) return;
    this.shakeIntensity = intensity;
    this.shakeTimer = duration;
  }

  public update(playerX: number, playerY: number, speed: number, dt: number): void {
    // Slight lag on lane switch for cinematic weight
    this.currentX = damp(this.currentX, playerX * 0.45, 10, dt);
    this.currentY = damp(this.currentY, 3.8 + playerY * 0.5, 8, dt);

    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const progress = Math.max(0, this.shakeTimer / 0.3);
      shakeX = (Math.random() - 0.5) * this.shakeIntensity * progress;
      shakeY = (Math.random() - 0.5) * this.shakeIntensity * progress;
    }

    this.camera.position.set(
      this.currentX + shakeX,
      this.currentY + shakeY,
      this.targetOffset.z
    );

    // Dynamic FOV increase with speed (60 -> ~70 at max speed)
    const targetFov = this.baseFov + (speed - 12) * 0.45;
    this.camera.fov = damp(this.camera.fov, Math.min(74, targetFov), 5, dt);
    this.camera.updateProjectionMatrix();

    // Look slightly ahead of player down the track
    this.camera.lookAt(this.currentX * 0.2, 1.4 + playerY * 0.3, this.lookAtOffset.z);
  }
}
