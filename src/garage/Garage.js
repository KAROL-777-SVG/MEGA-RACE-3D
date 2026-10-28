/**
 * Garage — garage UI, mashina tanlash, sotib olish, upgrade o'rnatish.
 */
import { CARS } from '../data/cars.js';
import { UpgradeSystem, UPGRADES } from './UpgradeSystem.js';
import { SaveManager } from '../core/SaveManager.js';

export class Garage {
  constructor(save, onCarChanged) {
    this.save = save;
    this.onCarChanged = onCarChanged;
    this.upgradeSystem = new UpgradeSystem(save);
    this.container = document.getElementById('garage-list');
    this.currentTab = 'cars';
    this.selectedUpgradeCar = save.selectedCar;
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';

    // Tab bar
    const tabBar = document.createElement('div');
    tabBar.className = 'garage-tabs';
    tabBar.style.cssText = 'display:flex;gap:8px;margin-bottom:12px;grid-column:1/-1;';
    ['cars', 'upgrades'].forEach(tab => {
      const btn = document.createElement('button');
      btn.className = 'menu-btn' + (this.currentTab === tab ? ' primary' : '');
      btn.textContent = tab === 'cars' ? '🚗 MASHINALAR' : '⚙ UPGRADELAR';
      btn.style.flex = '1';
      btn.addEventListener('click', () => { this.currentTab = tab; this.render(); });
      tabBar.appendChild(btn);
    });
    this.container.appendChild(tabBar);

    if (this.currentTab === 'cars') this.renderCars();
    else this.renderUpgrades();
  }

  renderCars() {
    Object.values(CARS).forEach(car => {
      const owned = this.save.ownedCars.includes(car.id);
      const stats = this.upgradeSystem.applyToCar(car.id, car);
      const div = document.createElement('div');
      div.className = 'car-card' + (this.save.selectedCar === car.id ? ' selected' : '');
      div.innerHTML = `
        <h3>${car.name}</h3>
        <div class="car-stat">Tezlik: ${Math.round(stats.maxSpeed)} km/h</div>
        <div class="car-stat">Tezlanish: ${stats.accel}</div>
        <div class="car-stat">Tormoz: ${stats.brake}</div>
        <div class="car-stat">Boshqaruv: ${stats.handling.toFixed(2)}</div>
        <div class="car-stat" style="margin-top:6px;color:${owned ? '#00C8FF' : '#FFAA00'}">
          ${owned ? (this.save.selectedCar === car.id ? '✅ TANLANGAN' : 'TANLASH') : '$' + car.price}
        </div>
      `;
      div.addEventListener('click', () => this.selectOrBuy(car));
      this.container.appendChild(div);
    });
  }

  renderUpgrades() {
    const carId = this.selectedUpgradeCar;
    const car = CARS[carId];
    if (!car) return;

    const header = document.createElement('div');
    header.style.cssText = 'grid-column:1/-1;color:#00C8FF;font-weight:700;margin-bottom:8px;';
    header.textContent = `Avtomobil: ${car.name} | Pul: $${(this.save.money || 0).toLocaleString()}`;
    this.container.appendChild(header);

    Object.values(UPGRADES).forEach(upgrade => {
      const currentLvl = this.upgradeSystem.getCurrentLevel(carId, upgrade.id);
      const nextLvl = upgrade.levels[currentLvl + 1];
      const div = document.createElement('div');
      div.className = 'car-card';

      let actionText;
      if (!nextLvl) actionText = '✅ MAX';
      else if (this.save.money >= nextLvl.cost) actionText = `SOTIB OLISH $${nextLvl.cost}`;
      else actionText = `❌ $${nextLvl.cost}`;

      div.innerHTML = `
        <h3>${upgrade.name}</h3>
        <div class="car-stat">Daraja: ${currentLvl} / ${upgrade.levels.length - 1}</div>
        <div class="car-stat">${upgrade.levels[currentLvl].name}</div>
        ${nextLvl ? `<div class="car-stat" style="color:#8899aa">Keyingi: ${nextLvl.name}</div>` : ''}
        <div class="car-stat" style="margin-top:6px;color:${nextLvl && this.save.money >= nextLvl.cost ? '#00C8FF' : '#FF8A00'}">${actionText}</div>
      `;
      div.addEventListener('click', () => this.buyUpgrade(upgrade.id));
      this.container.appendChild(div);
    });
  }

  selectOrBuy(car) {
    if (this.save.ownedCars.includes(car.id)) {
      this.save.selectedCar = car.id;
      this.selectedUpgradeCar = car.id;
      SaveManager.save(this.save);
      if (this.onCarChanged) this.onCarChanged(car.id);
      this.render();
    } else if ((this.save.money || 0) >= car.price) {
      this.save.money -= car.price;
      this.save.ownedCars.push(car.id);
      this.save.selectedCar = car.id;
      SaveManager.save(this.save);
      if (this.onCarChanged) this.onCarChanged(car.id);
      this.render();
    } else {
      this.showToast('Yetarli pulingiz yo\'q!');
    }
  }

  buyUpgrade(upgradeId) {
    const ok = this.upgradeSystem.purchaseUpgrade(this.selectedUpgradeCar, upgradeId);
    if (ok) {
      SaveManager.save(this.save);
      if (this.onCarChanged) this.onCarChanged(this.save.selectedCar);
      this.showToast('Upgrade o\'rnatildi!');
    } else {
      this.showToast('Sotib olib bo\'lmadi — pul yetarli emas yoki MAX');
    }
    this.render();
  }

  showToast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = `
      position:fixed;top:20px;left:50%;transform:translateX(-50%);
      background:rgba(0,200,255,0.9);color:#000;padding:10px 20px;
      border-radius:8px;font-weight:700;z-index:10000;pointer-events:none;
    `;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1800);
  }
}