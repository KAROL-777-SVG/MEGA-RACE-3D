/**
 * CarController — input, physics va mesh yangilanishlarini birlashtiradi.
 * Car.js ni physics'dan ajratadi.
 */
import * as THREE from 'three';
import { CarPhysics } from './CarPhysics.js';

export class CarController {
  constructor(car, input) {
    this.car = car;
    this.input = input;
    this.physics = new CarPhysics(car.data);
    this._forward = new THREE.Vector3();
    this._up = new THREE.Vector3(0, 1, 0);
  }

  applyUpgrades(stats) {
    this.physics.applyUpgrades(stats);
  }

  update(dt, worldBounds) {
    const input = {
      forward: this.input.isDown('w'),
      back: this.input.isDown('s'),
      left: this.input.isDown('a'),
      right: this.input.isDown('d'),
      brake: this.input.isDown('s'),
      handbrake: this.input.isDown(' '),
      nitro: this.input.isDown('shift') && this.car.nitroAmount > 0
    };

    // Nitro
    this.car.nitroActive = input.nitro;
    if (input.nitro) this.car.nitroAmount = Math.max(0, this.car.nitroAmount - dt * 0.4);
    else this.car.nitroAmount = Math.min(1, this.car.nitroAmount + dt * 0.15);

    const result = this.physics.update(dt, input);
    this.car.speed = this.physics.speed;
    this.car.steer = this.physics.steerAngle;

    // Apply rotation
    const forward = this._forward.set(0, 0, 1).applyQuaternion(this.car.group.quaternion);
    if (Math.abs(this.car.speed) > 0.3) {
      const dir = this.car.speed > 0 ? 1 : -1;
      const maxSp = (this.car.data.maxSpeed || 180) / 3.6;
      const speedRatio = Math.min(1, Math.abs(this.car.speed) / maxSp);
      this.car.group.rotateY(this.car.steer * dt * dir * (1 - speedRatio * 0.7));
    }

    // Move
    this.car.group.position.addScaledVector(forward, this.car.speed * dt);

    // Bounds
    if (worldBounds) {
      const b = worldBounds;
      this.car.group.position.x = Math.max(b.min, Math.min(b.max, this.car.group.position.x));
      this.car.group.position.z = Math.max(b.min, Math.min(b.max, this.car.group.position.z));
    }
    this.car.group.position.y = 0.02;

    // Wheels
    this.car.wheelSpin += this.car.speed * dt * 3;
    this.car.wheels.forEach(w => {
      w.mesh.rotation.x = this.car.wheelSpin;
      if (w.isFront) w.mesh.rotation.y = -this.car.steer * 0.25;
    });

    return result;
  }
}