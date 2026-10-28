const KEY = 'mega_race_3d_save_v1';

const DEFAULT_SAVE = {
  money: 5000,
  selectedCar: 'street_x',
  ownedCars: ['street_x'],
  upgrades: {},
  completedRaces: [],
  settings: { quality: 'medium', camSens: 1, volume: 0.5 }
};

export class SaveManager {
  static load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...DEFAULT_SAVE };
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SAVE, ...parsed };
    } catch {
      return { ...DEFAULT_SAVE };
    }
  }
  static save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  }
  static reset() { localStorage.removeItem(KEY); }
}