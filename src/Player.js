/**
 * Player.js
 * 玩家实体：使用简单 box 作为占位模型。
 * 新增三车道系统：只允许在左/中/右车道之间平滑切换。
 */
import * as THREE from 'three';

export class Player {
  constructor() {
    this.speed = 8; // 每秒前进速度（沿 -Z 方向）
    this.baseSpeed = 8;
    this.maxSpeed = 22;
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
    const material = new THREE.MeshStandardMaterial({
      color: 0x43c4ba,
      emissive: 0x0a1f2b,
      emissiveIntensity: 0.18,
      metalness: 0.2,
      roughness: 0.42,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(this.targetLaneX, this.groundY, 2);
    this.mesh.castShadow = true;
    this.baseColor = new THREE.Color(0x43c4ba);
    this.speedBoostColor = new THREE.Color(0x70b8ff);
    this.baseEmissive = new THREE.Color(0x0a1f2b);
    this.hitFlashColor = new THREE.Color(0xff4545);
    this.fxMix = 0;
    this.hitFlashTimer = 0;
    this.hitFlashDuration = 0.28;
    this.isHitFlashing = false;

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

  update(deltaTime, options = {}) {
    const { freezeMovement = false } = options;

    if (!freezeMovement) {
      this.mesh.position.z -= this.speed * deltaTime;
    }

    const lerpAlpha = 1 - Math.exp(-this.laneSwitchLerpSpeed * deltaTime);
    this.mesh.position.x = THREE.MathUtils.lerp(
      this.mesh.position.x,
      this.targetLaneX,
      lerpAlpha,
    );

    if (!freezeMovement) {
      this.updateState(deltaTime);
    }
    this.updateVisualFx(deltaTime);
  }

  getPosition() {
    return this.mesh.position;
  }

  getAABB() {
    const halfX = 0.5 * this.mesh.scale.x;
    const halfY = 0.5 * this.mesh.scale.y;
    const halfZ = 0.5 * this.mesh.scale.z;
    const { x, y, z } = this.mesh.position;

    return {
      minX: x - halfX,
      maxX: x + halfX,
      minY: y - halfY,
      maxY: y + halfY,
      minZ: z - halfZ,
      maxZ: z + halfZ,
    };
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

  triggerCollisionFx() {
    this.isHitFlashing = true;
    this.hitFlashTimer = this.hitFlashDuration;
  }

  updateVisualFx(deltaTime) {
    const speedRatio = THREE.MathUtils.clamp(
      (this.speed - this.baseSpeed) / (this.maxSpeed - this.baseSpeed),
      0,
      1,
    );
    const pulse = Math.sin(performance.now() * 0.015) * 0.5 + 0.5;
    this.fxMix = THREE.MathUtils.lerp(this.fxMix, speedRatio, 0.1);

    this.mesh.material.color.copy(this.baseColor).lerp(this.speedBoostColor, this.fxMix * 0.6);
    this.mesh.material.emissive.copy(this.baseEmissive).lerp(this.speedBoostColor, this.fxMix * 0.28);
    this.mesh.material.emissiveIntensity = 0.18 + this.fxMix * 0.35 + pulse * this.fxMix * 0.1;

    if (!this.isHitFlashing) return;

    this.hitFlashTimer = Math.max(0, this.hitFlashTimer - deltaTime);
    const hitProgress = 1 - this.hitFlashTimer / this.hitFlashDuration;
    const blink = Math.sin(hitProgress * Math.PI * 10) > 0 ? 1 : 0.2;
    this.mesh.material.color.lerp(this.hitFlashColor, 0.75 * blink);
    this.mesh.material.emissive.copy(this.hitFlashColor);
    this.mesh.material.emissiveIntensity = 0.8;

    if (this.hitFlashTimer <= 0) {
      this.isHitFlashing = false;
    }
  }

  destroy() {
    window.removeEventListener('keydown', this.handleActionKeyDown);
  }
}
