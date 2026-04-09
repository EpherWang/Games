/**
 * GameLoop.js
 * 负责 requestAnimationFrame 主循环。
 */
export class GameLoop {
  constructor(update) {
    this.update = update;
    this.rafId = null;
    this.isRunning = false;
    this.lastTime = 0;

    this.tick = this.tick.bind(this);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop() {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  tick(now) {
    if (!this.isRunning) return;

    const deltaTime = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    this.update(deltaTime);
    this.rafId = requestAnimationFrame(this.tick);
  }
}
