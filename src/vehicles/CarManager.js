/**
 * CarManager — mashinalarni yaratish, almashtirish, saqlash.
 */
import { Car } from './Car.js';
import { CarController } from './CarController.js';
import { CARS } from '../data/cars.js';

export class CarManager {
  constructor(scene, input, save) {
    this.scene = scene;
    this.input = input;
    this.save = save;
    this.current = null;
    this.controller = null;
    this.upgradeSystem = null;
  }

  setUpgradeSystem(sys) {
    this.upgradeSystem = sys;
  }

  spawn(carId) {
    if (this.current) {
      this.controller = null;
      this.current.dispose();
    }
    const data = CARS[carId];
    if (!data) return null;

    // Apply upgrades
    let stats = data;
    if (this.upgradeSystem) {
      stats = this.upgradeSystem.applyToCar(carId, data);
    }

    this.current = new Car(this.scene, carId);
    // Override with upgraded stats
    this.current.data = { ...data, ...stats };

    this.current.group.position.set(0, 0.02, 20);
    this.current.group.quaternion.identity();
    this.current.speed = 0;

    this.controller = new CarController(this.current, this.input);
    return this.current;
  }

  update(dt, worldBounds) {
    if (this.controller) {
      return this.controller.update(dt, worldBounds);
    }
    return null;
  }

  get position() {
    return this.current ? this.current.group.position : null;
  }

  dispose() {
    if (this.current) this.current.dispose();
    this.current = null;
    this.controller = null;
  }
}