/**
 * Obstacle.js
 * 单个障碍对象：支持高障碍/低障碍，并可被对象池复用。
 */
import * as THREE from 'three';

const TYPE_CONFIG = {
  high: {
    // 站立高度会撞上，下滑可通过
    colliderSize: { x: 2.1, y: 0.7, z: 1.1 },
    colliderCenterY: 1.1,
    dangerColor: 0xff3b30,
  },
  low: {
    // 地面阻挡，起跳可越过
    colliderSize: { x: 1.9, y: 0.95, z: 1.3 },
    colliderCenterY: 0.48,
    dangerColor: 0xff8a1f,
  },
};

const invisibleMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});

const highFrameMaterial = new THREE.MeshStandardMaterial({
  color: 0x6a737e,
  roughness: 0.7,
  metalness: 0.35,
});

const highDangerMaterial = new THREE.MeshStandardMaterial({
  color: TYPE_CONFIG.high.dangerColor,
  emissive: TYPE_CONFIG.high.dangerColor,
  emissiveIntensity: 0.85,
  roughness: 0.38,
  metalness: 0.18,
});

const lowRockMaterial = new THREE.MeshStandardMaterial({
  color: 0x4f3a30,
  roughness: 0.88,
  metalness: 0.04,
});

const lowDangerMaterial = new THREE.MeshStandardMaterial({
  color: TYPE_CONFIG.low.dangerColor,
  emissive: TYPE_CONFIG.low.dangerColor,
  emissiveIntensity: 0.95,
  roughness: 0.32,
  metalness: 0.05,
});

export class Obstacle {
  constructor() {
    this.type = 'low';
    this.active = false;

    this.mesh = new THREE.Group();
    this.mesh.visible = false;

    this.collider = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), invisibleMaterial);
    this.collider.visible = false;
    this.mesh.add(this.collider);

    this.highGroup = this.createHighObstacle();
    this.lowGroup = this.createLowObstacle();
    this.mesh.add(this.highGroup);
    this.mesh.add(this.lowGroup);

    this.tmpWorldPos = new THREE.Vector3();
  }

  createHighObstacle() {
    const group = new THREE.Group();

    const sideGeo = new THREE.BoxGeometry(0.24, 1.6, 0.24);
    const topGeo = new THREE.BoxGeometry(2.2, 0.36, 0.75);
    const warningGeo = new THREE.BoxGeometry(2.2, 0.08, 0.2);

    const leftPost = new THREE.Mesh(sideGeo, highFrameMaterial);
    leftPost.position.set(-0.96, 0.8, 0);

    const rightPost = new THREE.Mesh(sideGeo, highFrameMaterial);
    rightPost.position.set(0.96, 0.8, 0);

    const topBar = new THREE.Mesh(topGeo, highDangerMaterial);
    topBar.position.set(0, 1.38, 0);

    const warningStrip = new THREE.Mesh(warningGeo, highDangerMaterial);
    warningStrip.position.set(0, 0.78, 0.36);

    group.add(leftPost, rightPost, topBar, warningStrip);
    group.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    return group;
  }

  createLowObstacle() {
    const group = new THREE.Group();

    const baseGeo = new THREE.BoxGeometry(1.95, 0.56, 1.35);
    const emberGeo = new THREE.BoxGeometry(1.65, 0.16, 1.02);
    const coreGeo = new THREE.BoxGeometry(1.05, 0.24, 0.62);

    const rockBase = new THREE.Mesh(baseGeo, lowRockMaterial);
    rockBase.position.set(0, 0.28, 0);

    const emberLayer = new THREE.Mesh(emberGeo, lowDangerMaterial);
    emberLayer.position.set(0, 0.66, 0);

    const hotCore = new THREE.Mesh(coreGeo, lowDangerMaterial);
    hotCore.position.set(0, 0.86, 0);

    group.add(rockBase, emberLayer, hotCore);
    group.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    return group;
  }

  activate(type, x, z) {
    const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.low;

    this.type = type;
    this.active = true;
    this.mesh.visible = true;

    this.mesh.position.set(x, 0, z);
    this.collider.scale.set(
      config.colliderSize.x,
      config.colliderSize.y,
      config.colliderSize.z,
    );
    this.collider.position.set(0, config.colliderCenterY, 0);

    this.highGroup.visible = type === 'high';
    this.lowGroup.visible = type === 'low';
  }

  deactivate() {
    this.active = false;
    this.mesh.visible = false;
  }

  getAABB() {
    this.collider.getWorldPosition(this.tmpWorldPos);

    const halfX = this.collider.scale.x * 0.5;
    const halfY = this.collider.scale.y * 0.5;
    const halfZ = this.collider.scale.z * 0.5;
    const { x, y, z } = this.tmpWorldPos;

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
