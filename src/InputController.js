/**
 * InputController.js
 * 负责键盘输入映射与分发。
 */
export class InputController {
  constructor({ onMoveLeft, onMoveRight }) {
    this.onMoveLeft = onMoveLeft;
    this.onMoveRight = onMoveRight;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(event) {
    if (event.repeat) return;

    if (event.code === 'KeyA' || event.code === 'ArrowLeft') {
      this.onMoveLeft?.();
      return;
    }

    if (event.code === 'KeyD' || event.code === 'ArrowRight') {
      this.onMoveRight?.();
    }
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }
}
