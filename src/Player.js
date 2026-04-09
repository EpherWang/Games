/**
 * Player.js
 * 玩家实体：使用简单 box 作为占位模型。
 */
import * as THREE from 'three';

export class Player {
  constructor() {
    this.speed = 8; // 每秒前进速度（沿 -Z 方向）

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x4fd1c5 });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, 0.5, 2);
    this.mesh.castShadow = true;
  }

  update(deltaTime) {
    this.mesh.position.z -= this.speed * deltaTime;
  }

  getPosition() {
    return this.mesh.position;
  }
}
