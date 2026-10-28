/**
 * City.js — Mega City hududini quradi (binolar, neon chiroqlar, ko'cha chiroqlari).
 */
import * as THREE from 'three';

export class City {
  constructor(scene) {
    this.scene = scene;
    this.buildings = [];
    this.lights = [];
  }

  build() {
    const buildingColors = [0x1a2035, 0x223050, 0x152238, 0x2a3550, 0x1e2a44];
    const neonColors = [0x00C8FF, 0x246BFD, 0xB100FF, 0xFF00E0, 0xFF8A00];
    const gridSpacing = 80;
    const blocksPerSide = 5;

    for (let bx = -blocksPerSide; bx <= blocksPerSide; bx++) {
      for (let bz = -blocksPerSide; bz <= blocksPerSide; bz++) {
        if (bx === 0 && bz === 0) continue; // plaza
        const centerX = bx * gridSpacing + (bx > 0 ? 35 : -35);
        const centerZ = bz * gridSpacing + (bz > 0 ? 35 : -35);
        const count = 2 + Math.floor(Math.random() * 3);

        for (let k = 0; k < count; k++) {
          const w = 10 + Math.random() * 15;
          const d = 10 + Math.random() * 15;
          const h = 20 + Math.random() * 90;
          const ox = (Math.random() - 0.5) * 20;
          const oz = (Math.random() - 0.5) * 20;
          const col = buildingColors[Math.floor(Math.random() * buildingColors.length)];
          const mat = new THREE.MeshStandardMaterial({
            color: col, metalness: 0.4, roughness: 0.6,
            emissive: col, emissiveIntensity: 0.1
          });
          const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
          b.position.set(centerX + ox, h / 2, centerZ + oz);
          b.castShadow = true;
          b.receiveShadow = true;
          this.scene.add(b);
          this.buildings.push(b);

          if (Math.random() > 0.4) {
            const neon = neonColors[Math.floor(Math.random() * neonColors.length)];
            const nmat = new THREE.MeshStandardMaterial({
              color: neon, emissive: neon, emissiveIntensity: 2
            });
            const strip = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 1.5, d + 0.2), nmat);
            strip.position.set(centerX + ox, h * (0.3 + Math.random() * 0.5), centerZ + oz);
            this.scene.add(strip);
            this.lights.push(strip);
          }
        }
      }
    }

    this.buildStreetLights();
    this.buildLandmark();
  }

  buildStreetLights() {
    const lightMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xFFEECC, emissive: 0xFFCC88, emissiveIntensity: 3
    });
    const gridSpacing = 80;
    for (let i = -4; i <= 4; i++) {
      for (let j = -4; j <= 4; j++) {
        const x = i * gridSpacing + 8;
        const z = j * gridSpacing + 8;
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 8, 6), lightMat);
        pole.position.set(x, 4, z);
        this.scene.add(pole);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), bulbMat);
        bulb.position.set(x, 8.2, z);
        this.scene.add(bulb);
        const pl = new THREE.PointLight(0xFFCC88, 0.7, 20, 2);
        pl.position.set(x, 8, z);
        this.scene.add(pl);
        this.lights.push(pl);
      }
    }
  }

  buildLandmark() {
    const mat = new THREE.MeshStandardMaterial({
      color: 0x0a1526, metalness: 0.9, roughness: 0.2,
      emissive: 0x00C8FF, emissiveIntensity: 0.4
    });
    const pL = new THREE.Mesh(new THREE.BoxGeometry(3, 30, 3), mat);
    pL.position.set(-30, 15, 0);
    const pR = pL.clone(); pR.position.x = 30;
    const top = new THREE.Mesh(new THREE.BoxGeometry(63, 3, 3), mat);
    top.position.set(0, 30, 0);
    this.scene.add(pL, pR, top);
    this.buildings.push(pL, pR, top);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(12, 0.6, 16, 32),
      new THREE.MeshStandardMaterial({
        color: 0x00C8FF, emissive: 0x00C8FF, emissiveIntensity: 3
      })
    );
    ring.position.set(0, 20, 0);
    this.scene.add(ring);
    this.lights.push(ring);
  }

  dispose() {
    [...this.buildings, ...this.lights].forEach(o => {
      this.scene.remove(o);
      if (o.geometry) o.geometry.dispose();
      if (o.material) Array.isArray(o.material)
        ? o.material.forEach(m => m.dispose())
        : o.material.dispose();
    });
    this.buildings = [];
    this.lights = [];
  }
}