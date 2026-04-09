/**
 * Obstacle.js
 * 单个障碍对象：支持高障碍/低障碍，并可被对象池复用。
 */
import * as THREE from 'three';

const TYPE_CONFIG = {
  high: {
    color: 0xf56565,
    size: { x: 1.6, y: 1.6, z: 1.2 },
    centerY: 1.4,
  },
  low: {
    color: 0xf6e05e,
    size: { x: 1.6, y: 0.8, z: 1.2 },
    centerY: 0.4,
  },
};

export class Obstacle {
  constructor() {
    this.type = 'low';
    this.active = false;

    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: TYPE_CONFIG.low.color }),
    );

    this.mesh.visible = false;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }

  activate(type, x, z) {
    const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.low;

    this.type = type;
    this.active = true;
    this.mesh.visible = true;

    this.mesh.material.color.setHex(config.color);
    this.mesh.scale.set(config.size.x, config.size.y, config.size.z);
    this.mesh.position.set(x, config.centerY, z);
  }

  deactivate() {
    this.active = false;
    this.mesh.visible = false;
  }

  getAABB() {
    const halfX = this.mesh.scale.x * 0.5;
    const halfY = this.mesh.scale.y * 0.5;
    const halfZ = this.mesh.scale.z * 0.5;
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
}
