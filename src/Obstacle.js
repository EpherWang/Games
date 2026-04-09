/**
 * Obstacle.js
 * 单个障碍对象：支持高障碍/低障碍，并可被对象池复用。
 */
import * as THREE from 'three';

const TYPE_CONFIG = {
  high: {
    materialType: 'stone',
    size: { x: 1.6, y: 1.6, z: 1.2 },
    centerY: 1.4,
  },
  low: {
    materialType: 'wood',
    size: { x: 1.6, y: 0.8, z: 1.2 },
    centerY: 0.4,
  },
};

function applyRepeatUV(geometry, repeatX, repeatY) {
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i += 1) {
    uv.setXY(i, uv.getX(i) * repeatX, uv.getY(i) * repeatY);
  }
  uv.needsUpdate = true;
}

function createStoneTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#6b7280';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 210; i += 1) {
    const shade = 85 + Math.floor(Math.random() * 95);
    ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade + 2}, 0.32)`;
    ctx.beginPath();
    ctx.arc(
      Math.random() * size,
      Math.random() * size,
      Math.random() * 2 + 0.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.8, 1.2);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createWoodTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#8a5d37';
  ctx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 6) {
    const toneShift = (Math.random() * 34 - 17) | 0;
    const r = 139 + toneShift;
    const g = 92 + toneShift;
    const b = 53 + toneShift;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.55)`;
    ctx.fillRect(0, y, size, 2);
  }

  for (let i = 0; i < 7; i += 1) {
    const y = Math.random() * size;
    const w = 12 + Math.random() * 24;
    ctx.strokeStyle = 'rgba(70, 38, 18, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(
      Math.random() * size,
      y,
      w,
      2.2 + Math.random() * 1.8,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.2, 1.3);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const sharedGeometry = new THREE.BoxGeometry(1, 1, 1);
applyRepeatUV(sharedGeometry, 1.6, 1.3);

const sharedMaterials = {
  stone: new THREE.MeshStandardMaterial({
    color: 0x848b97,
    map: createStoneTexture(),
    roughness: 0.86,
    metalness: 0.04,
  }),
  wood: new THREE.MeshStandardMaterial({
    color: 0x99643a,
    map: createWoodTexture(),
    roughness: 0.76,
    metalness: 0.03,
  }),
};

export class Obstacle {
  constructor() {
    this.type = 'low';
    this.active = false;

    this.mesh = new THREE.Mesh(sharedGeometry, sharedMaterials.wood);

    this.mesh.visible = false;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }

  activate(type, x, z) {
    const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.low;

    this.type = type;
    this.active = true;
    this.mesh.visible = true;

    this.mesh.material = sharedMaterials[config.materialType] ?? sharedMaterials.wood;
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
