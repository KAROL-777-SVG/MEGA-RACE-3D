/**
 * MobileControls — mobil qurilmalar uchun touch boshqaruv.
 * InputManager bilan integratsiyalashgan.
 */
export class MobileControls {
  constructor(input, cameraManager) {
    this.input = input;
    this.cameraManager = cameraManager;
    this.enabled = this.detectMobile();
    this.container = document.getElementById('mobile-controls');
    this.bind();
  }

  detectMobile() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
           window.innerWidth < 900 ||
           'ontouchstart' in window;
  }

  bind() {
    if (!this.container) return;

    // Bind all mc-btn with data-key
    this.container.querySelectorAll('.mc-btn[data-key]').forEach(el => {
      const key = el.dataset.key;
      this.input.bindButton(el, key);
    });

    // Camera button
    const camBtn = document.getElementById('mc-camera');
    if (camBtn) {
      camBtn.addEventListener('click', () => {
        if (this.cameraManager) this.cameraManager.cycle();
      });
    }

    // Prevent context menu on long press
    this.container.addEventListener('contextmenu', e => e.preventDefault());
  }

  show() {
    if (this.container && this.enabled) {
      this.container.classList.remove('hidden');
    }
  }

  hide() {
    if (this.container) this.container.classList.add('hidden');
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (enabled) this.show();
    else this.hide();
  }
}