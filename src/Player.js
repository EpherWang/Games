/**
 * Player.js
 * 玩家实体：使用简单 box 作为占位模型。
 * 新增三车道系统：只允许在左/中/右车道之间平滑切换。
 */
import * as THREE from 'three';

export class Player {
  constructor() {
    this.speed = 8; // 每秒前进速度（沿 -Z 方向）
    this.state = 'running'; // running | jumping | sliding

    // 三车道配置：0=左, 1=中, 2=右
    this.laneXPositions = [-3, 0, 3];
    this.laneIndex = 1;
    this.targetLaneX = this.laneXPositions[this.laneIndex];
    this.laneSwitchLerpSpeed = 12;

    // 垂直运动参数（无物理引擎）
    this.gravity = 26;
    this.jumpInitialVelocity = 9.5;
    this.verticalVelocity = 0;

    // 下滑参数
    this.slideDuration = 0.7;
    this.slideTimer = 0;
    this.standScaleY = 1;
    this.slideScaleY = 0.55;
    this.groundY = 0.5; // 站立高度时，1x1x1 box 的中心点 y

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x4fd1c5 });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(this.targetLaneX, this.groundY, 2);
    this.mesh.castShadow = true;

    this.handleActionKeyDown = this.handleActionKeyDown.bind(this);
    window.addEventListener('keydown', this.handleActionKeyDown);
  }

  moveLeft() {
    this.setLane(this.laneIndex - 1);
  }

  moveRight() {
    this.setLane(this.laneIndex + 1);
  }

  setLane(nextLaneIndex) {
    const clampedLaneIndex = THREE.MathUtils.clamp(nextLaneIndex, 0, 2);
    if (clampedLaneIndex === this.laneIndex) return;

    this.laneIndex = clampedLaneIndex;
    this.targetLaneX = this.laneXPositions[this.laneIndex];
  }

  update(deltaTime) {
    this.mesh.position.z -= this.speed * deltaTime;

    const lerpAlpha = 1 - Math.exp(-this.laneSwitchLerpSpeed * deltaTime);
    this.mesh.position.x = THREE.MathUtils.lerp(
      this.mesh.position.x,
      this.targetLaneX,
      lerpAlpha,
    );

    this.updateState(deltaTime);
  }

  getPosition() {
    return this.mesh.position;
  }

  handleActionKeyDown(event) {
    if (event.repeat) return;

    if (event.code === 'Space') {
      this.startJump();
      return;
    }

    if (event.code === 'KeyS' || event.code === 'ArrowDown') {
      this.startSlide();
    }
  }

  startJump() {
    if (this.state !== 'running') return;

    this.state = 'jumping';
    this.verticalVelocity = this.jumpInitialVelocity;
    this.restoreStandPose();
  }

  startSlide() {
    if (this.state !== 'running') return;

    this.state = 'sliding';
    this.slideTimer = this.slideDuration;
    this.applySlidePose();
  }

  updateState(deltaTime) {
    if (this.state === 'jumping') {
      this.verticalVelocity -= this.gravity * deltaTime;
      this.mesh.position.y += this.verticalVelocity * deltaTime;

      if (this.mesh.position.y <= this.groundY) {
        this.mesh.position.y = this.groundY;
        this.verticalVelocity = 0;
        this.state = 'running';
      }
      return;
    }

    if (this.state === 'sliding') {
      this.slideTimer -= deltaTime;

      if (this.slideTimer <= 0) {
        this.slideTimer = 0;
        this.restoreStandPose();
        this.state = 'running';
      }
    }
  }

  applySlidePose() {
    this.mesh.scale.y = this.slideScaleY;
    this.mesh.position.y = this.slideScaleY * 0.5;
  }

  restoreStandPose() {
    this.mesh.scale.y = this.standScaleY;
    this.mesh.position.y = this.groundY;
  }

  destroy() {
    window.removeEventListener('keydown', this.handleActionKeyDown);
  }
}
