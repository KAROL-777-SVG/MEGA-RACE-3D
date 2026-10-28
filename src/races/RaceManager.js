/**
 * RaceManager — poygalarni boshqarish, checkpoint triggerlar, countdown,
 * finish detection va natijalar.
 */
import * as THREE from 'three';
import { Checkpoint } from './Checkpoint.js';
import { RACES, getRaceById } from '../data/races.js';

export class RaceManager {
  constructor(scene, car, save, onFinish) {
    this.scene = scene;
    this.car = car;
    this.save = save;
    this.onFinish = onFinish;

    this.currentRace = null;
    this.checkpoints = [];
    this.currentIndex = 0;
    this.state = 'idle'; // idle | countdown | racing | finished
    this.startTime = 0;
    this.lap = 0;
    this.elapsed = 0;
    this.countdownTimer = 0;

    this.onStateChange = null;
  }

  startRace(raceId) {
    const data = getRaceById(raceId);
    if (!data) return false;

    this.clearRace();
    this.currentRace = data;
    this.currentIndex = 0;
    this.lap = 0;
    this.elapsed = 0;
    this.startTime = performance.now();
    this.state = 'countdown';
    this.countdownTimer = 3.5;

    // Spawn car at start
    if (this.car) {
      this.car.group.position.set(data.start.x, 0.02, data.start.z);
      this.car.group.quaternion.identity();
      this.car.speed = 0;
      this.car.steer = 0;
    }

    // Create checkpoints
    data.checkpoints.forEach((cp, i) => {
      const isLast = i === data.checkpoints.length - 1;
      const isFinish = isLast && data.type === 'circuit';
      this.checkpoints.push(new Checkpoint(this.scene, cp, cp.radius || 8, isFinish));
    });

    if (this.onStateChange) this.onStateChange('countdown', 3);
    return true;
  }

  update(dt, carPos) {
    if (this.state === 'countdown') {
      this.countdownTimer -= dt;
      const sec = Math.ceil(this.countdownTimer - 0.5);
      if (this.onStateChange) this.onStateChange('countdown', sec);
      if (this.countdownTimer <= 0) {
        this.state = 'racing';
        this.startTime = performance.now();
        if (this.onStateChange) this.onStateChange('racing', 0);
      }
      return;
    }

    if (this.state !== 'racing') return;

    this.elapsed = (performance.now() - this.startTime) / 1000;

    // Check time limit
    if (this.currentRace.timeLimit && this.elapsed > this.currentRace.timeLimit) {
      this.finish(false);
      return;
    }

    // Update checkpoint visuals
    this.checkpoints.forEach(cp => cp.update(dt));

    // Check current checkpoint
    const current = this.checkpoints[this.currentIndex];
    if (current && current.checkPass(carPos)) {
      this.currentIndex++;
      if (this.onStateChange) this.onStateChange('checkpoint', this.currentIndex);

      if (this.currentIndex >= this.checkpoints.length) {
        // Lap or finish
        if (this.currentRace.type === 'circuit' && this.lap < this.currentRace.laps - 1) {
          this.lap++;
          this.currentIndex = 0;
          this.checkpoints.forEach(cp => {
            cp.passed = false;
            cp.group.children[0].material.color.setHex(0x00C8FF);
            cp.group.children[0].material.emissive.setHex(0x00C8FF);
            cp.group.children[1].material.color.setHex(0x00C8FF);
            cp.group.children[1].material.emissive.setHex(0x00C8FF);
          });
          if (this.onStateChange) this.onStateChange('lap', this.lap + 1);
        } else {
          this.finish(true);
        }
      }
    }
  }

  finish(success) {
    this.state = 'finished';
    const time = this.elapsed;
    if (success) {
      this.save.money = (this.save.money || 0) + this.currentRace.reward;
      this.save.completedRaces = this.save.completedRaces || [];
      if (!this.save.completedRaces.includes(this.currentRace.id)) {
        this.save.completedRaces.push(this.currentRace.id);
      }
    }
    if (this.onFinish) {
      this.onFinish({
        success,
        raceId: this.currentRace.id,
        raceName: this.currentRace.name,
        time,
        reward: success ? this.currentRace.reward : 0
      });
    }
  }

  clearRace() {
    this.checkpoints.forEach(cp => cp.dispose());
    this.checkpoints = [];
    this.currentRace = null;
    this.state = 'idle';
    this.currentIndex = 0;
    this.lap = 0;
    this.elapsed = 0;
  }

  getStatus() {
    if (!this.currentRace) return null;
    return {
      name: this.currentRace.name,
      state: this.state,
      checkpoint: this.currentIndex + 1,
      total: this.checkpoints.length,
      lap: this.lap + 1,
      laps: this.currentRace.laps || 1,
      time: this.elapsed,
      timeLimit: this.currentRace.timeLimit
    };
  }
}