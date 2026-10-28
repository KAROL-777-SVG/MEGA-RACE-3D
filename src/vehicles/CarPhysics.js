/**
 * CarPhysics — avtomobil fizikasi (keyinchalik Cannon.js ga ko'chirishga tayyor).
 * Hozircha custom kinematic physics.
 */
import * as THREE from 'three';

export class CarPhysics {
  constructor(carData) {
    this.data = carData;
    this.velocity = new THREE.Vector3();
    this.speed = 0;          // m/s (longitudinal)
    this.lateralSpeed = 0;   // m/s (drift)
    this.steerAngle = 0;
    this.angularVelocity = 0;
    this.driftFactor = 0;
  }

  applyUpgrades(stats) {
    this.data = { ...this.data, ...stats };
  }

  /**
   * @param {number} dt
   * @param {object} input { forward, back, left, right, brake, handbrake, nitro }
   * @returns {{speedKmh, drift, nitroActive}}
   */
  update(dt, input) {
    const data = this.data;
    const maxSpeed = (data.maxSpeed || 180) * (input.nitro ? 1.45 : 1) / 3.6;
    const accel = (data.accel || 12) * (input.nitro ? 1.8 : 1);
    const brakePower = data.brake || 20;

    // Longitudinal
    if (input.forward) this.speed += accel * dt;
    else if (input.back) this.speed -= accel * 1.2 * dt;
    else this.speed *= Math.pow(0.4, dt);

    if (input.brake) this.speed *= Math.pow(0.05, dt);
    if (input.handbrake) this.speed *= Math.pow(0.1, dt);

    // Drag
    this.speed *= Math.pow(0.75, dt);
    this.speed = Math.max(-maxSpeed * 0.35, Math.min(maxSpeed, this.speed));

    // Steering
    const speedFactor = Math.min(1, Math.abs(this.speed) / 8);
    const steerSpeed = (3.0 + speedFactor * 1.2) * (data.handling || 1.0);
    const targetSteer = (input.left ? 1 : 0) - (input.right ? 1 : 0);
    this.steerAngle += (targetSteer * steerSpeed - this.steerAngle) * Math.min(1, dt * 8);

    // Drift factor
    const wantDrift = input.handbrake && Math.abs(this.speed) > 10;
    const targetDrift = wantDrift ? 1 : 0;
    this.driftFactor += (targetDrift - this.driftFactor) * Math.min(1, dt * 3);

    return {
      speedKmh: Math.abs(this.speed) * 3.6,
      drift: this.driftFactor,
      nitroActive: !!input.nitro
    };
  }

  reset() {
    this.speed = 0;
    this.lateralSpeed = 0;
    this.steerAngle = 0;
    this.driftFactor = 0;
    this.velocity.set(0, 0, 0);
  }
}