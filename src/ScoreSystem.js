/**
 * ScoreSystem.js
 * 管理分数、金币与速度增长，并通过简单 DOM 实现左上角 HUD。
 */
export class ScoreSystem {
  constructor(container) {
    this.container = container;

    this.score = 0;
    this.coins = 0;

    this.baseSpeed = 8;
    this.speedIncreasePerSecond = 0.16;
    this.maxSpeed = 22;
    this.currentSpeed = this.baseSpeed;

    this.root = null;
    this.scoreEl = null;
    this.coinEl = null;
    this.speedEl = null;

    this.setupDOM();
    this.render();
  }

  setupDOM() {
    const root = document.createElement('div');
    root.style.position = 'fixed';
    root.style.top = '12px';
    root.style.left = '12px';
    root.style.padding = '10px 12px';
    root.style.borderRadius = '8px';
    root.style.background = 'rgba(5, 10, 20, 0.55)';
    root.style.color = '#e2e8f0';
    root.style.fontFamily = "'Segoe UI', Arial, sans-serif";
    root.style.fontSize = '16px';
    root.style.lineHeight = '1.45';
    root.style.pointerEvents = 'none';
    root.style.userSelect = 'none';
    root.style.zIndex = '99';

    this.scoreEl = document.createElement('div');
    this.coinEl = document.createElement('div');
    this.speedEl = document.createElement('div');

    root.appendChild(this.scoreEl);
    root.appendChild(this.coinEl);
    root.appendChild(this.speedEl);

    this.container.appendChild(root);
    this.root = root;
  }

  update(deltaTime) {
    this.score += deltaTime * 10;

    const nextSpeed = this.currentSpeed + this.speedIncreasePerSecond * deltaTime;
    this.currentSpeed = Math.min(nextSpeed, this.maxSpeed);

    this.render();
  }

  addCoin() {
    this.coins += 1;
    this.score += 25;
    this.render();
  }

  getWorldSpeed() {
    return this.currentSpeed;
  }

  render() {
    if (!this.scoreEl || !this.coinEl || !this.speedEl) return;

    this.scoreEl.textContent = `Score: ${Math.floor(this.score)}`;
    this.coinEl.textContent = `Coins: ${this.coins}`;
    this.speedEl.textContent = `Speed: ${this.currentSpeed.toFixed(1)}`;
  }
}
