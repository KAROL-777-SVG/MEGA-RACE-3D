import * as THREE from 'three';
import { CARS } from '../data/cars.js';

export class Car {
  constructor(scene, carId, colorOverride = null) {
    this.scene = scene;
    this.data = CARS[carId] || CARS.street_x;
    this.group = new THREE.Group();
    this.color = colorOverride ?? this.data.color;

    this.velocity = new THREE.Vector3();
    this.speed = 0;
    this.steer = 0;
    this.nitroActive = false;
    this.nitroAmount = 1;
    this.wheels = [];
    this.wheelSpin = 0;

    this.buildMesh();
    scene.add(this.group);
  }

  buildMesh() {
    const bodyMat = new THREE.MeshStandardMaterial({
      color: this.color, metalness: 0.85, roughness: 0.25
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x111122, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.85
    });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 1, roughness: 0.2 });

    // Body (chassis)
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.55, 4.2), bodyMat);
    body.position.y = 0.55;
    body.castShadow = true;
    this.group.add(body);

    // Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 1.9), glassMat);
    cabin.position.set(0, 1.0, -0.1);
    cabin.castShadow = true;
    this.group.add(cabin);

    // Hood
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.15, 1.4), bodyMat);
    hood.position.set(0, 0.85, 1.35);
    this.group.add(hood);

    // Spoiler
    const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.35), bodyMat);
    spoiler.position.set(0, 1.05, -1.95);
    this.group.add(spoiler);

    // Headlights
    const lightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x00C8FF, emissiveIntensity: 2 });
    const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.1), lightMat);
    hlL.position.set(-0.6, 0.65, 2.1);
    const hlR = hlL.clone(); hlR.position.x = 0.6;
    this.group.add(hlL, hlR);

    // Taillights
    const tailMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0022, emissiveIntensity: 1.5 });
    const tlL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.08), tailMat);
    tlL.position.set(-0.55, 0.7, -2.1);
    const tlR = tlL.clone(); tlR.position.x = 0.55;
    this.group.add(tlL, tlR);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 16);
    const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.33, 8);
    const positions = [
      [-0.95, 0.42, 1.35], [0.95, 0.42, 1.35],
      [-0.95, 0.42, -1.35], [0.95, 0.42, -1.35]
    ];
    positions.forEach(([x, y, z]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, y, z);
      w.castShadow = true;
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.z = Math.PI / 2;
      w.add(rim);
      this.group.add(w);
      this.wheels.push({ mesh: w, isFront: z > 0 });
    });

    this.group.traverse(o => { if (o.isMesh) o.castShadow = true; });
  }

  update(dt, input, sceneBounds) {
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.group.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.group.quaternion);

    const accelInput = input.forward ? 1 : (input.back ? -1 : 0);
    const steerInput = input.left ? 1 : (input.right ? -1 : 0);
    const brakeInput = input.brake ? 1 : 0;

    // Nitro
    this.nitroActive = input.nitro && this.nitroAmount > 0;
    if (this.nitroActive) this.nitroAmount = Math.max(0, this.nitroAmount - dt * 0.4);
    else this.nitroAmount = Math.min(1, this.nitroAmount + dt * 0.15);

    const maxSpeed = this.data.maxSpeed * (this.nitroActive ? 1.45 : 1) / 3.6; // m/s
    const accel = this.data.accel * (this.nitroActive ? 1.8 : 1);

    // Longitudinal physics
    if (accelInput > 0) this.speed += accel * dt;
    else if (accelInput < 0) this.speed -= accel * 1.4 * dt;
    else {
      this.speed *= Math.pow(0.4, dt);
      if (Math.abs(this.speed) < 0.1) this.speed = 0;
    }

    // Handbrake / Brake
    if (brakeInput) this.speed *= Math.pow(0.05, dt);
    if (input.handbrake) this.speed *= Math.pow(0.02, dt);

    // Drag
    this.speed *= Math.pow(0.75, dt);
    this.speed = Math.max(-maxSpeed * 0.35, Math.min(maxSpeed, this.speed));

    // Steering
    const speedFactor = Math.min(1, Math.abs(this.speed) / 8);
    const steerSpeed = (3.0 + speedFactor * 1.2) * this.data.handling;
    const targetSteer = steerInput * steerSpeed;
    this.steer += (targetSteer - this.steer) * Math.min(1, dt * 8);

    if (Math.abs(this.speed) > 0.3) {
      const dir = this.speed > 0 ? 1 : -1;
      this.group.rotateY(this.steer * dt * dir * (1 - Math.min(0.75, Math.abs(this.speed) / maxSpeed * 0.7)));
    }

    // Move
    this.group.position.addScaledVector(forward, this.speed * dt);

    // Wheel spin
    this.wheelSpin += this.speed * dt * 3;
    this.wheels.forEach(w => {
      w.mesh.rotation.x = this.wheelSpin;
      if (w.isFront) w.mesh.rotation.y = -this.steer * 0.25;
    });

    // World bounds
    if (sceneBounds) {
      const b = sceneBounds;
      this.group.position.x = Math.max(b.min, Math.min(b.max, this.group.position.x));
      this.group.position.z = Math.max(b.min, Math.min(b.max, this.group.position.z));
    }
    this.group.position.y = 0.02;

    return { speedKmh: Math.abs(this.speed) * 3.6 };
  }

  dispose() {
    this.scene.remove(this.group);
    this.group.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
        else o.material.dispose();
      }
    });
  }
}