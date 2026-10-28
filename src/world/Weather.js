/**
 * Weather.js — kun/tun sikli va ob-havo.
 * Vaqt o'tishi bilan quyosh, ambient, fog rangi o'zgaradi.
 */
import * as THREE from 'three';

export const TIME_PRESETS = {
  dawn: {
    sunColor: 0xFFB88A, sunIntensity: 0.8,
    hemiSky: 0xFFCCAA, hemiGround: 0x1a1020, hemiIntensity: 0.5,
    fogColor: 0x2a1a2a, fogDensity: 0.004,
    sunPos: new THREE.Vector3(300, 80, 100)
  },
  day: {
    sunColor: 0xFFFFFF, sunIntensity: 1.5,
    hemiSky: 0x88AAFF, hemiGround: 0x080818, hemiIntensity: 0.7,
    fogColor: 0x0a1424, fogDensity: 0.0025,
    sunPos: new THREE.Vector3(200, 300, 100)
  },
  dusk: {
    sunColor: 0xFF6644, sunIntensity: 1.0,
    hemiSky: 0xFF8866, hemiGround: 0x200a10, hemiIntensity: 0.5,
    fogColor: 0x2a1424, fogDensity: 0.004,
    sunPos: new THREE.Vector3(-300, 80, 100)
  },
  night: {
    sunColor: 0x8899FF, sunIntensity: 0.2,
    hemiSky: 0x1a2050, hemiGround: 0x050510, hemiIntensity: 0.3,
    fogColor: 0x050510, fogDensity: 0.006,
    sunPos: new THREE.Vector3(100, 150, -100)
  }
};

export class Weather {
  constructor(scene, sun, hemi) {
    this.scene = scene;
    this.sun = sun;
    this.hemi = hemi;
    this.timeOfDay = 0.4; // 0..1 (0=midnight, 0.25=sunrise, 0.5=noon, 0.75=sunset)
    this.dayLength = 300; // seconds per full day
    this.paused = false;
    this.weatherType = 'clear';
    this._smoothState = this._getStateForTime(this.timeOfDay);
  }

  _getStateForTime(t) {
    // 4 phases: dawn (0.2-0.3), day (0.3-0.7), dusk (0.7-0.8), night (0.8-1.0 & 0-0.2)
    if (t < 0.2 || t > 0.8) return TIME_PRESETS.night;
    if (t < 0.3) return TIME_PRESETS.dawn;
    if (t < 0.7) return TIME_PRESETS.day;
    return TIME_PRESETS.dusk;
  }

  setTimeOfDay(t) {
    this.timeOfDay = ((t % 1) + 1) % 1;
  }

  setWeather(type) {
    this.weatherType = type;
    if (type === 'rain') {
      this.scene.fog.density = 0.01;
    } else if (type === 'fog') {
      this.scene.fog.density = 0.015;
    } else {
      this.scene.fog.density = 0.004;
    }
  }

  update(dt) {
    if (!this.paused) {
      this.timeOfDay = (this.timeOfDay + dt / this.dayLength) % 1;
    }

    const target = this._getStateForTime(this.timeOfDay);
    // Smooth lerp
    const lerp = Math.min(1, dt * 0.5);
    this._smoothState = this._smoothState || target;

    if (this.sun) {
      this.sun.color.lerp(new THREE.Color(target.sunColor), lerp);
      this.sun.intensity += (target.sunIntensity - this.sun.intensity) * lerp;
      this.sun.position.lerp(target.sunPos, lerp);
    }
    if (this.hemi) {
      this.hemi.color.lerp(new THREE.Color(target.hemiSky), lerp);
      this.hemi.groundColor.lerp(new THREE.Color(target.hemiGround), lerp);
      this.hemi.intensity += (target.hemiIntensity - this.hemi.intensity) * lerp;
    }
    if (this.scene.fog) {
      this.scene.fog.color.lerp(new THREE.Color(target.fogColor), lerp);
      // Rain/fog override
      if (this.weatherType === 'clear') {
        this.scene.fog.density += (target.fogDensity - this.scene.fog.density) * lerp;
      }
    }
  }

  getTimeString() {
    const totalMin = Math.floor(this.timeOfDay * 24 * 60);
    const hh = String(Math.floor(totalMin / 60)).padStart(2, '0');
    const mm = String(totalMin % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  }
}