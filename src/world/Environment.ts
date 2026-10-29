import * as THREE from 'three';
import { getThemeForDistance, ThemeDef } from '../config/themes';

export class Environment {
  public group: THREE.Group;
  public dirLight: THREE.DirectionalLight;
  public hemiLight: THREE.HemisphereLight;
  public fog: THREE.Fog;

  private sideProps: THREE.Group[] = [];
  private propSpacing: number = 18;
  private propCount: number = 8;
  private buildingMaterials: THREE.MeshStandardMaterial[] = [];

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();

    // Balanced studio 3-point lighting setup
    this.hemiLight = new THREE.HemisphereLight('#bae6fd', '#334155', 0.8);
    scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight('#fffbeb', 1.5);
    this.dirLight.position.set(12, 22, 10);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 1;
    this.dirLight.shadow.camera.far = 80;
    this.dirLight.shadow.camera.left = -15;
    this.dirLight.shadow.camera.right = 15;
    this.dirLight.shadow.camera.top = 20;
    this.dirLight.shadow.camera.bottom = -10;
    this.dirLight.shadow.bias = -0.0005;
    scene.add(this.dirLight);

    this.fog = new THREE.Fog('#bae6fd', 45, 110);
    scene.fog = this.fog;

    // Palette materials
    const palette = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#fb923c'];
    this.buildingMaterials = palette.map(
      (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.1 })
    );

    // Create side scenery props along left and right flanks
    for (let i = 0; i < this.propCount; i++) {
      const propGroup = this.createSceneryPair(i % 3);
      propGroup.position.z = i * this.propSpacing;
      this.sideProps.push(propGroup);
      this.group.add(propGroup);
    }
  }

  public update(scrollDistance: number, distance: number): void {
    const theme = getThemeForDistance(distance);
    this.applyTheme(theme);

    // Scroll side props and wrap
    const totalSpan = this.propCount * this.propSpacing;
    for (let i = 0; i < this.sideProps.length; i++) {
      const prop = this.sideProps[i];
      prop.position.z -= scrollDistance;

      if (prop.position.z < -this.propSpacing) {
        let maxZ = -Infinity;
        for (let j = 0; j < this.sideProps.length; j++) {
          if (this.sideProps[j].position.z > maxZ) {
            maxZ = this.sideProps[j].position.z;
          }
        }
        prop.position.z = maxZ + this.propSpacing;
      }
    }
  }

  private applyTheme(theme: ThemeDef): void {
    this.fog.color.lerp(new THREE.Color(theme.fogColor), 0.05);
    this.fog.near = theme.fogNear;
    this.fog.far = theme.fogFar;

    this.dirLight.color.lerp(new THREE.Color(theme.sunColor), 0.05);
    this.dirLight.intensity = theme.sunIntensity;

    this.hemiLight.color.lerp(new THREE.Color(theme.skyColor), 0.05);
    this.hemiLight.intensity = theme.ambientIntensity;
  }

  private createSceneryPair(variant: number): THREE.Group {
    const pair = new THREE.Group();
    const roadOffset = 6.2;

    const left = this.createSideBuilding(variant);
    left.position.set(-roadOffset, 0, 0);

    const right = this.createSideBuilding((variant + 1) % 3);
    right.position.set(roadOffset, 0, 0);
    right.rotation.y = Math.PI;

    pair.add(left, right);
    return pair;
  }

  private createSideBuilding(variant: number): THREE.Group {
    const b = new THREE.Group();
    const mat = this.buildingMaterials[Math.floor(Math.random() * this.buildingMaterials.length)];

    // Main storefront block
    const height = 4.5 + Math.random() * 3.5;
    const bodyGeo = new THREE.BoxGeometry(4.2, height, 5.5);
    const body = new THREE.Mesh(bodyGeo, mat);
    body.position.y = height / 2;
    b.add(body);

    // Awning / Canopy
    const awningGeo = new THREE.BoxGeometry(4.4, 0.25, 1.4);
    const awningMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.6 });
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.position.set(0, 2.8, 2.2);
    awning.rotation.x = 0.2;
    b.add(awning);

    // Streetlamp pole
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.07, 4.2, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.7 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(-1.8, 2.1, 3.2);

    const lampHeadGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const lampHeadMat = new THREE.MeshBasicMaterial({ color: '#fef08a' });
    const lampHead = new THREE.Mesh(lampHeadGeo, lampHeadMat);
    lampHead.position.set(-1.8, 4.2, 3.2);

    b.add(pole, lampHead);

    return b;
  }
}
