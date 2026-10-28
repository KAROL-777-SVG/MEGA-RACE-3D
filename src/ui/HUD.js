/**
 * HUD — o'yin ichidagi barcha overlay ma'lumotlarini boshqaradi.
 */
import { Speedometer } from './Speedometer.js';
import { getZoneAtPosition } from '../data/locations.js';

export class HUD {
  constructor(save) {
    this.save = save;
    this.zoneEl = document.getElementById('hud-zone');
    this.timeEl = document.getElementById('hud-time');
    this.moneyEl = document.getElementById('hud-money');
    this.speedo = new Speedometer();
    this.startTime = 0;
    this.raceStatus = null;
    this.hintEl = document.getElementById('hud-hint');
  }

  setRaceStatus(status) {
    this.raceStatus = status;
    this.updateRaceHint();
  }

  updateRaceHint() {
    if (!this.hintEl) return;
    if (this.raceStatus && this.raceStatus.state === 'racing') {
      this.hintEl.textContent =
        `🏁 ${this.raceStatus.name} | CP: ${this.raceStatus.checkpoint}/${this.raceStatus.total} | Vaqt: ${this.raceStatus.time.toFixed(1)}s / ${this.raceStatus.timeLimit}s`;
    } else if (this.raceStatus && this.raceStatus.state === 'countdown') {
      this.hintEl.textContent = `⏱ Poyga boshlanmoqda...`;
    } else {
      this.hintEl.textContent = 'WASD — Harakat | SHIFT — Nitro | SPACE — Qo\'l tormozi | C — Kamera | ESC — Pauza';
    }
  }

  startTimer() {
    this.startTime = performance.now();
  }

  update(car) {
    if (!car) return;

    // Speed + nitro
    this.speedo.update(Math.abs(car.speed) * 3.6, car.nitroAmount);

    // Zone
    if (this.zoneEl) {
      const pos = car.group.position;
      const zone = getZoneAtPosition(pos.x, pos.z);
      this.zoneEl.textContent = zone.name;
    }

    // Money
    if (this.moneyEl) this.moneyEl.textContent = '$' + (this.save.money || 0).toLocaleString();

    // Time
    if (this.timeEl && this.startTime > 0) {
      const elapsed = Math.floor((performance.now() - this.startTime) / 1000);
      const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const ss = String(elapsed % 60).padStart(2, '0');
      this.timeEl.textContent = `${mm}:${ss}`;
    }
  }

  showRaceResult(result) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(8,11,16,0.9);display:flex;
      align-items:center;justify-content:center;z-index:9999;
    `;
    const box = document.createElement('div');
    box.style.cssText = `
      background:#151B24;border:2px solid ${result.success ? '#00C8FF' : '#FF5050'};
      border-radius:16px;padding:2rem 3rem;text-align:center;min-width:300px;
      box-shadow:0 0 40px ${result.success ? 'rgba(0,200,255,0.4)' : 'rgba(255,80,80,0.4)'};
    `;
    box.innerHTML = `
      <h2 style="color:${result.success ? '#00C8FF' : '#FF5050'};margin-bottom:1rem;">
        ${result.success ? '🏆 G\'ALABA!' : '❌ MAG\'LUBIYAT'}
      </h2>
      <p style="margin-bottom:0.5rem;color:#F5F7FA;">${result.raceName}</p>
      <p style="margin-bottom:0.5rem;color:#8899aa;">Vaqt: ${result.time.toFixed(2)}s</p>
      ${result.reward > 0 ? `<p style="color:#00FF88;font-size:1.4rem;font-weight:700;">+$${result.reward}</p>` : ''}
      <button id="close-result" class="menu-btn primary" style="margin-top:1.5rem;">DAVOM ETISH</button>
    `;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    document.getElementById('close-result').addEventListener('click', () => overlay.remove());
  }
}