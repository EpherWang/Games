/**
 * Player.js
 * 玩家实体：使用简单 box 作为占位模型。
 * 新增三车道系统：只允许在左/中/右车道之间平滑切换。
 */
import * as THREE from 'three';

export class Player {
  constructor() {
    this.speed = 8; // 每秒前进速度（沿 -Z 方向）

    // 三车道配置：0=左, 1=中, 2=右
    this.laneXPositions = [-3, 0, 3];
    this.laneIndex = 1;
    this.targetLaneX = this.laneXPositions[this.laneIndex];
    this.laneSwitchLerpSpeed = 12;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x4fd1c5 });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(this.targetLaneX, 0.5, 2);
    this.mesh.castShadow = true;
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
  }

  getPosition() {
    return this.mesh.position;
  }
}
