export class InputManager {
  constructor() {
    this.keys = {};
    this.listeners = {};
    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));
  }
  onKey(e, down) {
    const k = e.key.toLowerCase();
    this.keys[k] = down;
    if (down && this.listeners[k]) this.listeners[k].forEach(cb => cb());
    // Prevent scroll
    if (['w','a','s','d',' '].includes(k)) e.preventDefault();
  }
  isDown(key) { return !!this.keys[key.toLowerCase()]; }
  onPress(key, cb) {
    key = key.toLowerCase();
    if (!this.listeners[key]) this.listeners[key] = [];
    this.listeners[key].push(cb);
  }
  // Mobile virtual buttons
  bindButton(el, key) {
    const down = () => { this.keys[key] = true; };
    const up = () => { this.keys[key] = false; };
    el.addEventListener('touchstart', (e) => { e.preventDefault(); down(); }, { passive: false });
    el.addEventListener('touchend', (e) => { e.preventDefault(); up(); }, { passive: false });
    el.addEventListener('mousedown', down);
    el.addEventListener('mouseup', up);
    el.addEventListener('mouseleave', up);
  }
}