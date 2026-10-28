/**
 * Traffic.js — NPC avtomobillar (AI yo'l bo'ylab harakatlanishi).
 * Oddiy AI: yo'l bo'ylab ma'lum nuqtalar orasida harakatlanadi.
 */
import * as THREE from 'three';

const NPC_COLORS = [0xFF2E63, 0xFFC400, 0x00FF88, 0xFF8A00, 0xB100FF, 0xF5F7FA];

export class Traffic {
  constructor(scene, roads, maxCars = 15) {
    this.scene = scene;
    this.roads = roads;
    this.maxCars = maxCars;
    this.npcs = [];
    this.spawnTimer = 0;
    this.spawnInterval = 2.0;
  }

  buildNpc() {
    const group = new THREE.Group();
    const color = NPC_COLORS[Math.floor(Math.random() * NPC_COLORS.length)];

    const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.4 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.55, 4.0), bodyMat);
    body.position.y = 0.55;
    body.castShadow = true;
    group.add(body);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.5, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x111122, metalness: 0.9, roughness: 0.1 })
    );
    cabin.position.set(0, 1.0, -0.1);
    group.add(cabin);

    // Wheels
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9 });
    const wGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12);
    [[-0.9, 1.3], [0.9, 1.3], [-0.9, -1.3], [0.9, -1.3]].forEach(([x, z]) => {
      const w = new THREE.Mesh(wGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.4, z);
      group.add(w);
    });

    // Headlights
    const hlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.5 });
    const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.1), hlMat);
    hlL.position.set(-0.5, 0.65, 2.0);
    const hlR = hlL.clone(); hlR.position.x = 0.5;
    group.add(hlL, hlR);

    return group;
  }

  spawn() {
    const road = this.roads.roadZones[Math.floor(Math.random() * this.roads.roadZones.length)];
    let x, z, dir;
    if (road.axis === 'z') {
      x = road.x + (Math.random() > 0.5 ? 3 : -3);
      z = (Math.random() - 0.5) * 600;
      dir = Math.random() > 0.5 ? 0 : Math.PI;
    } else {
      x = (Math.random() - 0.5) * 600;
      z = road.z + (Math.random() > 0.5 ? 3 : -3);
      dir = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
    }

    // Avoid spawning near player
    const player = this.scene.userData.playerPos;
    if (player) {
      const d = (x - player.x) ** 2 + (z - player.z) ** 2;
      if (d < 100 * 100) return;
    }

    const mesh = this.buildNpc();
    mesh.position.set(x, 0.02, z);
    mesh.rotation.y = dir;
    this.scene.add(mesh);

    this.npcs.push({
      mesh,
      speed: 8 + Math.random() * 10,
      dir,
      lane: 0,
      targetX: x,
      targetZ: z,
      axis: road.axis,
      baseX: road.x,
      baseZ: road.z
    });
  }

  update(dt, playerPos) {
    if (playerPos) this.scene.userData.playerPos = playerPos;

    // Spawn
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.npcs.length < this.maxCars) {
      this.spawn();
      this.spawnTimer = this.spawnInterval;
    }

    // Update each NPC
    for (let i = this.npcs.length - 1; i >= 0; i--) {
      const npc = this.npcs[i];
      const m = npc.mesh;
      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(m.quaternion);
      m.position.addScaledVector(forward, npc.speed * dt);

      // Despawn far away
      if (playerPos) {
        const dx = m.position.x - playerPos.x;
        const dz = m.position.z - playerPos.z;
        if (dx * dx + dz * dz > 350 * 350) {
          this.scene.remove(m);
          this.npcs.splice(i, 1);
        }
      }

      // Bounds
      if (Math.abs(m.position.x) > 550 || Math.abs(m.position.z) > 550) {
        this.scene.remove(m);
        this.npcs.splice(i, 1);
      }
    }
  }

  dispose() {
    this.npcs.forEach(n => this.scene.remove(n.mesh));
    this.npcs = [];
  }
}