/**
 * Roads.js — yo'l tarmog'i, asfalt, markirovka, chorrahalar.
 */
import * as THREE from 'three';

export class Roads {
  constructor(scene) {
    this.scene = scene;
    this.roadZones = [];
    this.meshes = [];
  }

  build() {
    const asphalt = new THREE.MeshStandardMaterial({ color: 0x111820, roughness: 0.85, metalness: 0.15 });
    const mark = new THREE.MeshStandardMaterial({ color: 0xFFD700, emissive: 0xFFAA00, emissiveIntensity: 0.8 });
    const roadWidth = 14;
    const gridSpacing = 80;
    const range = 5;

    // Roads along Z
    for (let i = -range; i <= range; i++) {
      const x = i * gridSpacing;
      const road = new THREE.Mesh(new THREE.BoxGeometry(roadWidth, 0.1, 1000), asphalt);
      road.position.set(x, 0.05, 0);
      road.receiveShadow = true;
      this.scene.add(road);
      this.meshes.push(road);
      this.roadZones.push({ axis: 'z', x, width: roadWidth });

      for (let z = -480; z < 480; z += 12) {
        const dash = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 5), mark);
        dash.position.set(x, 0.11, z);
        this.scene.add(dash);
        this.meshes.push(dash);
      }
    }

    // Roads along X
    for (let i = -range; i <= range; i++) {
      const z = i * gridSpacing;
      const road = new THREE.Mesh(new THREE.BoxGeometry(1000, 0.1, roadWidth), asphalt);
      road.position.set(0, 0.05, z);
      road.receiveShadow = true;
      this.scene.add(road);
      this.meshes.push(road);
      this.roadZones.push({ axis: 'x', z, width: roadWidth });

      for (let x = -480; x < 480; x += 12) {
        const dash = new THREE.Mesh(new THREE.BoxGeometry(5, 0.02, 0.3), mark);
        dash.position.set(x, 0.11, z);
        this.scene.add(dash);
        this.meshes.push(dash);
      }
    }

    // Ground plane
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a2230, roughness: 0.95 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1500, 1500), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.position.y = -0.01;
    this.scene.add(ground);
    this.meshes.push(ground);
  }

  /** Berilgan nuqta yo'lda yoki yo'qligini tekshirish (traffic AI uchun) */
  isOnRoad(x, z, tolerance = 2) {
    for (const zone of this.roadZones) {
      if (zone.axis === 'z') {
        if (Math.abs(x - zone.x) < zone.width / 2 + tolerance) return true;
      } else {
        if (Math.abs(z - zone.z) < zone.width / 2 + tolerance) return true;
      }
    }
    return false;
  }

  /** Eng yaqin yo'l markazini topish (NPC spawn uchun) */
  getNearestRoadPoint(x, z) {
    let best = null;
    let bestDist = Infinity;
    for (const zone of this.roadZones) {
      let px, pz;
      if (zone.axis === 'z') {
        px = zone.x;
        pz = Math.round(z / 80) * 80;
      } else {
        px = Math.round(x / 80) * 80;
        pz = zone.z;
      }
      const d = (px - x) ** 2 + (pz - z) ** 2;
      if (d < bestDist) { bestDist = d; best = { x: px, z: pz, axis: zone.axis }; }
    }
    return best;
  }

  dispose() {
    this.meshes.forEach(m => {
      this.scene.remove(m);
      if (m.geometry) m.geometry.dispose();
      if (m.material) Array.isArray(m.material)
        ? m.material.forEach(mat => mat.dispose())
        : m.material.dispose();
    });
    this.meshes = [];
    this.roadZones = [];
  }
}