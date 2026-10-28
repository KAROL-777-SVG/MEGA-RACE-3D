import * as THREE from 'three';

export class CameraManager {
  constructor(camera) {
    this.camera = camera;
    this.modes = ['third', 'chase', 'first'];
    this.modeIndex = 0;
    this.mode = this.modes[0];
    this.tempVec = new THREE.Vector3();
    this.tempVec2 = new THREE.Vector3();
    this.lookAt = new THREE.Vector3();
  }

  cycle() {
    this.modeIndex = (this.modeIndex + 1) % this.modes.length;
    this.mode = this.modes[this.modeIndex];
  }

  update(dt, car) {
    if (!car) return;
    const carPos = car.group.position;
    const carQuat = car.group.quaternion;

    let offset;
    if (this.mode === 'third') offset = new THREE.Vector3(0, 3.2, -8);
    else if (this.mode === 'chase') offset = new THREE.Vector3(0, 2.0, -5.5);
    else offset = new THREE.Vector3(0, 1.1, 0.4);

    this.tempVec.copy(offset).applyQuaternion(carQuat).add(carPos);
    this.tempVec.y = Math.max(this.tempVec.y, 0.6);

    // Smooth
    const lerp = this.mode === 'first' ? 1 : Math.min(1, dt * 6);
    this.camera.position.lerp(this.tempVec, lerp);

    // Look target
    this.lookAt.copy(carPos).add(new THREE.Vector3(0, 1.0, 6).applyQuaternion(carQuat));
    this.camera.lookAt(this.lookAt);

    // FOV based on speed
    const targetFov = 65 + Math.min(20, Math.abs(car.speed) * 1.5);
    this.camera.fov += (targetFov - this.camera.fov) * Math.min(1, dt * 3);
    this.camera.updateProjectionMatrix();
  }
}