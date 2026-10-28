export class MiniMap {
  constructor(canvas, world) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.world = world;
    this.size = canvas.width;
    this.scale = this.size / 900; // world width approx
  }

  draw(car) {
    const ctx = this.ctx;
    const s = this.size;
    ctx.clearRect(0, 0, s, s);

    // Background
    ctx.fillStyle = 'rgba(8,11,16,0.9)';
    ctx.fillRect(0, 0, s, s);

    const cx = car.group.position.x;
    const cz = car.group.position.z;
    const range = 220;
    const scale = s / (range * 2);

    const toScreen = (x, z) => [
      s / 2 + (x - cx) * scale,
      s / 2 + (z - cz) * scale
    ];

    // Roads
    ctx.strokeStyle = '#2a3a55';
    ctx.lineWidth = 3;
    for (let i = -5; i <= 5; i++) {
      const x = i * 80;
      const [sx1, sy1] = toScreen(x, cz - range);
      const [sx2, sy2] = toScreen(x, cz + range);
      ctx.beginPath(); ctx.moveTo(sx1, sy1); ctx.lineTo(sx2, sy2); ctx.stroke();

      const z = i * 80;
      const [sx3, sy3] = toScreen(cx - range, z);
      const [sx4, sy4] = toScreen(cx + range, z);
      ctx.beginPath(); ctx.moveTo(sx3, sy3); ctx.lineTo(sx4, sy4); ctx.stroke();
    }

    // Player arrow
    const dir = new (window.THREE_V3 || Object)(); // fallback
    // Compute forward manually
    const q = car.group.quaternion;
    const fx = 2 * (q.x * q.z + q.w * q.y);
    const fz = 1 - 2 * (q.x * q.x + q.y * q.y);
    // Note: for forward vector (0,0,1) rotated:
    // Use three.js if available via window.__THREE
    let fwdX = 0, fwdZ = 1;
    if (window.__THREE) {
      const v = new window.__THREE.Vector3(0, 0, 1).applyQuaternion(q);
      fwdX = v.x; fwdZ = v.z;
    }

    const [px, py] = toScreen(cx, cz);
    const angle = Math.atan2(fwdX, fwdZ);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-angle);
    ctx.fillStyle = '#00C8FF';
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(6, 6);
    ctx.lineTo(-6, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Border
    ctx.strokeStyle = '#00C8FF';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, s - 2, s - 2);
  }
}