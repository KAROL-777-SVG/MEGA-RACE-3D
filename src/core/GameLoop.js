/**
 * GameLoop — Fixed timestep bilan requestAnimationFrame loop.
 */
export class GameLoop {
  constructor(updateFn, renderFn, fpsCap = 0) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
    this.fpsCap = fpsCap;
    this.running = false;
    this.lastTime = 0;
    this.accumulator = 0;
    this.fixedDt = 1 / 60; // 60 FPS physics
    this.maxFrameTime = 0.1;
    this.frameTimeAccum = 0;
    this.frameCount = 0;
    this.fps = 0;
    this._rafId = null;
    this._boundLoop = this.loop.bind(this);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this._rafId = requestAnimationFrame(this._boundLoop);
  }

  stop() {
    this.running = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._rafId = null;
  }

  loop(now) {
    if (!this.running) return;
    this._rafId = requestAnimationFrame(this._boundLoop);

    const elapsed = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // FPS calculation
    this.frameCount++;
    this.frameTimeAccum += elapsed;
    if (this.frameTimeAccum >= 1) {
      this.fps = this.frameCount / this.frameTimeAccum;
      this.frameCount = 0;
      this.frameTimeAccum = 0;
    }

    // FPS cap
    if (this.fpsCap > 0 && elapsed < 1 / this.fpsCap) return;

    // Clamp big gaps
    const dt = Math.min(elapsed, this.maxFrameTime);

    // Fixed-step update
    this.accumulator += dt;
    while (this.accumulator >= this.fixedDt) {
      this.updateFn(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }

    // Render
    this.renderFn(dt);
  }
}