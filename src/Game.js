import * as THREE from 'three';
import { Engine } from './core/Engine.js';
import { GameLoop } from './core/GameLoop.js';
import { InputManager } from './core/InputManager.js';
import { SaveManager } from './core/SaveManager.js';
import { AssetManager } from './core/AssetManager.js';
import { World } from './world/World.js';
import { CameraManager } from './camera/CameraManager.js';
import { CarManager } from './vehicles/CarManager.js';
import { MiniMap } from './ui/MiniMap.js';
import { HUD } from './ui/HUD.js';
import { MainMenu } from './ui/MainMenu.js';
import { MobileControls } from './ui/MobileControls.js';
import { Garage } from './garage/Garage.js';
import { UpgradeSystem } from './garage/UpgradeSystem.js';
import { RaceManager } from './races/RaceManager.js';
import { CARS } from './data/cars.js';
import { RACES } from './data/races.js';
import { getZoneAtPosition } from './data/locations.js';

export class Game {
  constructor() {
    this.state = 'loading';
    this.save = SaveManager.load();
    this.isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 900;
  }

  async init() {
    // Core
    this.engine = new Engine(document.getElementById('game-canvas'));
    this.scene = this.engine.scene;
    this.camera = this.engine.camera;
    this.assets = new AssetManager();
    this.input = new InputManager();

    // Lights
    this.setupLights();

    // World
    this.world = new World(this.scene, this.sun, this.hemi, this.isMobile);

    // Camera manager
    this.cameraManager = new CameraManager(this.camera);

    // Upgrade system + Car manager
    this.upgradeSystem = new UpgradeSystem(this.save);
    this.carManager = new CarManager(this.scene, this.input, this.save);
    this.carManager.setUpgradeSystem(this.upgradeSystem);
    this.car = this.carManager.spawn(this.save.selectedCar);
    if (this.car) this.car.group.position.set(0, 0.02, 20);

    // UI
    this.hud = new HUD(this.save);
    this.mainMenu = new MainMenu(this);
    this.mobileControls = new MobileControls(this.input, this.cameraManager);
    this.minimap = new MiniMap(document.getElementById('minimap'), this.world);
    this.garage = new Garage(this.save, (carId) => this.onCarChanged(carId));

    // Races
    this.raceManager = new RaceManager(this.scene, this.car, this.save, (result) => {
      this.hud.showRaceResult(result);
      this.hud.updateRaceHint();
      this.save = SaveManager.save(this.save);
    });
    this.raceManager.onStateChange = (state, value) => {
      if (state === 'countdown') this.showCountdown(value);
      this.hud.setRaceStatus(this.raceManager.getStatus());
    };

    // Game loop
    this.loop = new GameLoop(
      (dt) => this.fixedUpdate(dt),
      (dt) => this.renderUpdate(dt)
    );

    // Settings
    this.applySettings();

    // Loading screen fake progress
    await this.fakeLoading();

    this.loop.start();
    this.showMenu();
  }

  setupLights() {
    this.hemi = new THREE.HemisphereLight(0x88aaff, 0x080818, 0.7);
    this.scene.add(this.hemi);

    this.sun = new THREE.DirectionalLight(0xffffff, 1.5);
    this.sun.position.set(200, 300, 100);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(this.isMobile ? 1024 : 2048, this.isMobile ? 1024 : 2048);
    const d = 400;
    this.sun.shadow.camera.left = -d;
    this.sun.shadow.camera.right = d;
    this.sun.shadow.camera.top = d;
    this.sun.shadow.camera.bottom = -d;
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 800;
    this.sun.shadow.bias = -0.0005;
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);

    const fill = new THREE.DirectionalLight(0x00C8FF, 0.4);
    fill.position.set(-100, 50, -100);
    this.scene.add(fill);
  }

  applySettings() {
    const q = this.save.settings?.quality || 'medium';
    this.engine.setQuality(q);
    const sens = this.save.settings?.camSens || 1;
    this.cameraManager.sensitivity = sens;
  }

  async fakeLoading() {
    const fill = document.getElementById('progress-fill');
    const txt = document.getElementById('loading-text');
    const steps = [
      { p: 0.2, t: 'Dunyo yaratilmoqda...' },
      { p: 0.5, t: 'Avtomobil yuklanmoqda...' },
      { p: 0.8, t: 'Trafik AI ishga tushmoqda...' },
      { p: 1.0, t: 'Tayyor!' }
    ];
    for (const s of steps) {
      if (fill) fill.style.width = (s.p * 100) + '%';
      if (txt) txt.textContent = s.t;
      await new Promise(r => setTimeout(r, 250));
    }
  }

  showMenu() {
    this.state = 'menu';
    this.mainMenu.showScreen('main-menu');
    document.getElementById('hud').classList.add('hidden');
    this.mobileControls.hide();
    this.mainMenu.updateMoney(this.save.money);
  }

  startGame() {
    this.mainMenu.showScreen(null);
    document.getElementById('hud').classList.remove('hidden');
    this.hud.startTimer();
    this.mobileControls.show();
    this.state = 'playing';
    this.resetCar();
    this.carManager.spawn(this.save.selectedCar);
    this.car = this.carManager.current;
    this.raceManager.car = this.car;
  }

  resetCar() {
    if (this.carManager.current) {
      this.carManager.current.group.position.set(0, 0.02, 20);
      this.carManager.current.group.quaternion.identity();
      this.carManager.current.speed = 0;
      this.carManager.current.steer = 0;
      this.carManager.current.nitroAmount = 1;
      this.carManager.controller.physics.reset();
    }
  }

  pause() {
    this.state = 'paused';
    this.mainMenu.showScreen('pause-menu');
  }

  resume() {
    this.state = 'playing';
    this.mainMenu.showScreen(null);
  }

  openGarage() {
    this.state = 'garage';
    this.mainMenu.showScreen('garage-menu');
    this.garage.render();
  }

  onCarChanged(carId) {
    this.carManager.spawn(carId);
    this.car = this.carManager.current;
    this.raceManager.car = this.car;
    this.mainMenu.updateMoney(this.save.money);
  }

  showCountdown(value) {
    // Simple visual countdown overlay
    let el = document.getElementById('countdown-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'countdown-overlay';
      el.style.cssText = `
        position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
        font-size:8rem;font-weight:900;color:#00C8FF;text-shadow:0 0 40px #00C8FF;
        pointer-events:none;z-index:9000;
      `;
      document.body.appendChild(el);
    }
    if (value > 0) {
      el.textContent = value;
      el.style.display = 'flex';
    } else {
      el.textContent = 'GO!';
      setTimeout(() => { el.style.display = 'none'; }, 800);
    }
  }

  fixedUpdate(dt) {
    if (this.state === 'playing') {
      const carResult = this.carManager.update(dt, this.world.bounds);
      this.car = this.carManager.current;
      if (this.car) {
        this.raceManager.update(dt, this.car.group.position);
        this.cameraManager.update(dt, this.car);
      }
      this.world.update(dt, this.carManager.position);
    } else {
      this.world.update(dt, this.carManager.position);
    }
  }

  renderUpdate(dt) {
    if (this.state === 'menu') {
      const t = performance.now() * 0.0002;
      this.camera.position.set(Math.sin(t) * 60, 25 + Math.sin(t * 2) * 5, Math.cos(t) * 60);
      this.camera.lookAt(0, 10, 0);
    }

    if (this.car) {
      // Sun follows car for shadows
      this.sun.position.copy(this.car.group.position).add(new THREE.Vector3(200, 300, 100));
      this.sun.target.position.copy(this.car.group.position);

      if (this.state === 'playing') {
        this.hud.update(this.car);
        this.minimap.draw(this.car);
        this.hud.setRaceStatus(this.raceManager.getStatus());
      }
    }

    this.engine.render();
  }
}