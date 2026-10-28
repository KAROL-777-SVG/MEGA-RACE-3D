/**
 * Speedometer — analog + raqamli tezlik ko'rsatkichi va nitro bar.
 */
export class Speedometer {
  constructor() {
    this.speedNumEl = document.getElementById('speed-num');
    this.nitroFillEl = document.getElementById('nitro-fill');
    this.lastSpeed = 0;
    this.displaySpeed = 0;
  }

  update(speedKmh, nitroAmount) {
    // Smooth display
    this.displaySpeed += (speedKmh - this.displaySpeed) * 0.15;
    if (this.speedNumEl) {
      this.speedNumEl.textContent = Math.round(this.displaySpeed);
      // Color shift based on speed
      const ratio = Math.min(1, this.displaySpeed / 260);
      const r = Math.floor(0 + ratio * 255);
      const g = Math.floor(200 - ratio * 100);
      const b = Math.floor(255 - ratio * 150);
      this.speedNumEl.style.color = `rgb(${r},${g},${b})`;
    }
    if (this.nitroFillEl) {
      this.nitroFillEl.style.width = Math.max(0, Math.min(100, nitroAmount * 100)) + '%';
      // Purple when low
      if (nitroAmount < 0.2) this.nitroFillEl.style.background = '#FF8A00';
      else if (nitroAmount < 0.5) this.nitroFillEl.style.background = '#B100FF';
      else this.nitroFillEl.style.background = 'linear-gradient(90deg, #B100FF, #FF00E0)';
    }
  }
}