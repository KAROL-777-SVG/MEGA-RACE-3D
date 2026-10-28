/**
 * UpgradeSystem — avtomobil yangilanishlarini boshqaradi va narxlarni hisoblaydi.
 */
export const UPGRADES = {
  engine: {
    id: 'engine',
    name: 'Dvigatel',
    levels: [
      { level: 0, name: 'Stock', cost: 0, accelBonus: 0, maxSpeedBonus: 0 },
      { level: 1, name: 'Stage 1', cost: 2000, accelBonus: 2, maxSpeedBonus: 10 },
      { level: 2, name: 'Stage 2', cost: 5000, accelBonus: 4, maxSpeedBonus: 20 },
      { level: 3, name: 'Stage 3', cost: 10000, accelBonus: 6, maxSpeedBonus: 30 }
    ]
  },
  turbo: {
    id: 'turbo',
    name: 'Turbo',
    levels: [
      { level: 0, name: 'Yo\'q', cost: 0, accelBonus: 0, nitroBonus: 0 },
      { level: 1, name: 'T1', cost: 3000, accelBonus: 3, nitroBonus: 0.2 },
      { level: 2, name: 'T2', cost: 7000, accelBonus: 5, nitroBonus: 0.4 }
    ]
  },
  brakes: {
    id: 'brakes',
    name: 'Tormoz',
    levels: [
      { level: 0, name: 'Stock', cost: 0, brakeBonus: 0 },
      { level: 1, name: 'Sport', cost: 1500, brakeBonus: 5 },
      { level: 2, name: 'Racing', cost: 4000, brakeBonus: 10 }
    ]
  },
  suspension: {
    id: 'suspension',
    name: 'Suspension',
    levels: [
      { level: 0, name: 'Stock', cost: 0, handlingBonus: 0 },
      { level: 1, name: 'Sport', cost: 2000, handlingBonus: 0.1 },
      { level: 2, name: 'Racing', cost: 5000, handlingBonus: 0.2 }
    ]
  },
  nitro: {
    id: 'nitro',
    name: 'Nitro',
    levels: [
      { level: 0, name: 'Stock', cost: 0, nitroBonus: 0 },
      { level: 1, name: 'Boost', cost: 3500, nitroBonus: 0.3 },
      { level: 2, name: 'Mega', cost: 8000, nitroBonus: 0.6 }
    ]
  }
};

export class UpgradeSystem {
  constructor(save) {
    this.save = save;
    this.save.upgrades = this.save.upgrades || {};
  }

  getCurrentLevel(carId, upgradeId) {
    const carUpgrades = this.save.upgrades[carId] || {};
    return carUpgrades[upgradeId] || 0;
  }

  getUpgradeInfo(upgradeId, level) {
    const up = UPGRADES[upgradeId];
    if (!up) return null;
    return up.levels[level] || null;
  }

  canUpgrade(carId, upgradeId) {
    const current = this.getCurrentLevel(carId, upgradeId);
    const up = UPGRADES[upgradeId];
    if (!up) return false;
    if (current >= up.levels.length - 1) return false;
    const next = up.levels[current + 1];
    return (this.save.money || 0) >= next.cost;
  }

  purchaseUpgrade(carId, upgradeId) {
    if (!this.canUpgrade(carId, upgradeId)) return false;
    const current = this.getCurrentLevel(carId, upgradeId);
    const next = UPGRADES[upgradeId].levels[current + 1];
    this.save.money -= next.cost;
    if (!this.save.upgrades[carId]) this.save.upgrades[carId] = {};
    this.save.upgrades[carId][upgradeId] = current + 1;
    return true;
  }

  /** Avtomobilga qo'llangan bonuslarni qaytaradi */
  applyToCar(carId, baseStats) {
    const result = { ...baseStats };
    const carUpgrades = this.save.upgrades[carId] || {};
    for (const [upgradeId, level] of Object.entries(carUpgrades)) {
      const info = UPGRADES[upgradeId]?.levels[level];
      if (!info) continue;
      if (info.accelBonus) result.accel = (result.accel || 0) + info.accelBonus;
      if (info.maxSpeedBonus) result.maxSpeed = (result.maxSpeed || 0) + info.maxSpeedBonus;
      if (info.brakeBonus) result.brake = (result.brake || 0) + info.brakeBonus;
      if (info.handlingBonus) result.handling = (result.handling || 1) + info.handlingBonus;
      if (info.nitroBonus) result.nitro = (result.nitro || 1) + info.nitroBonus;
    }
    return result;
  }
}