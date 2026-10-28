/**
 * Checkpoint — poyga nuqtalari uchun vizual marker va trigger.
 */
import * as THREE from 'three';

export class Checkpoint {
  constructor(scene, position, radius = 8, isFinish = false) {
    this.scene = scene;
    this.position = new THREE.Vector3(position.x, 0, position.z);
    this.radius = radius;
    this.isFinish = isFinish;
    this.passed = false;

    this.group = new THREE.Group();
    this.group.position.copy(this.position);

    const color = isFinish ? 0x00FF88 : 0x00C8FF;
    const ringMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 2,
      transparent: true,
      opacity: 0.9
    });

    // Ground ring
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.4, 8, 32), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.1;
    this.group.add(ring);

    // Vertical beam
    const beamMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, 30, 16, 1, true),
      beamMat
    );
    beam.position.y = 15;
    this.group.add(beam);

    // Point light
    this.light = new THREE.PointLight(color, 1.5, radius * 4);
    this.light.position.y = 2;
    this.group.add(this.light);

    scene.add(this.group);
  }

  update(dt) {
    // Animate ring
    this.group.rotation.y += dt * 0.8;
    this.group.children[0].scale.setScalar(1 + Math.sin(performance.now() * 0.003) * 0.05);
  }

  checkPass(carPos) {
    if (this.passed) return false;
    const dx = carPos.x - this.position.x;
    const dz = carPos.z - this.position.z;
    if (dx * dx + dz * dz < this.radius * this.radius) {
      this.passed = true;
      this.setPassedVisual();
      return true;
    }
    return false;
  }

  setPassedVisual() {
    const color = 0x00FF88;
    this.group.children[0].material.color.setHex(color);
    this.group.children[0].material.emissive.setHex(color);
    this.group.children[1].material.color.setHex(color);
    this.group.children[1].material.emissive.setHex(color);
    this.light.color.setHex(color);
  }

  dispose() {
    this.scene.remove(this.group);
    this.group.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
  }
}