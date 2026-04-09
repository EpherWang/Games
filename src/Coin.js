/**
 * Coin.js
 * 金币实体与金币管理：沿三车道生成并可被玩家自动收集。
 */
import * as THREE from 'three';

export class Coin {
  constructor() {
    const geometry = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 24);
    const material = new THREE.MeshStandardMaterial({
      color: 0xf6e05e,
      emissive: 0xa77900,
      emissiveIntensity: 0.35,
      metalness: 0.65,
      roughness: 0.3,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.rotation.z = Math.PI * 0.5;
    this.mesh.visible = false;
    this.mesh.castShadow = true;

    this.isActive = false;
  }

  activate(laneX, z) {
    this.isActive = true;
    this.mesh.visible = true;
    this.mesh.position.set(laneX, 1.1, z);
  }

  deactivate() {
    this.isActive = false;
    this.mesh.visible = false;
  }

  getAABB() {
    const halfX = 0.35;
    const halfY = 0.35;
    const halfZ = 0.08;
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

export class CoinManager {
  constructor(scene, player, onCollect) {
    this.scene = scene;
    this.player = player;
    this.onCollect = onCollect;

    this.laneXPositions = [-3, 0, 3];
    this.activeCoins = [];
    this.pool = [];
    this.poolSize = 28;

    this.spawnTimer = 0;
    this.spawnIntervalMin = 0.35;
    this.spawnIntervalMax = 0.8;
    this.spawnDistanceMin = 20;
    this.spawnDistanceMax = 40;
    this.nextSpawnInterval = this.randomBetween(
      this.spawnIntervalMin,
      this.spawnIntervalMax,
    );

    this.initPool();
  }

  initPool() {
    for (let i = 0; i < this.poolSize; i += 1) {
      const coin = new Coin();
      this.pool.push(coin);
      this.scene.add(coin.mesh);
    }
  }

  update(deltaTime) {
    this.spawnTimer += deltaTime;

    if (this.spawnTimer >= this.nextSpawnInterval) {
      this.spawnTimer = 0;
      this.nextSpawnInterval = this.randomBetween(
        this.spawnIntervalMin,
        this.spawnIntervalMax,
      );
      this.spawnCoin();
    }

    this.spinActiveCoins(deltaTime);
    this.recyclePassedCoins();
    this.collectCollisions();
  }

  spawnCoin() {
    if (this.pool.length === 0) return;

    const coin = this.pool.pop();
    const laneX = this.laneXPositions[Math.floor(Math.random() * this.laneXPositions.length)];
    const playerZ = this.player.getPosition().z;
    const spawnZ =
      playerZ - this.randomBetween(this.spawnDistanceMin, this.spawnDistanceMax);

    coin.activate(laneX, spawnZ);
    this.activeCoins.push(coin);
  }

  spinActiveCoins(deltaTime) {
    for (let i = 0; i < this.activeCoins.length; i += 1) {
      this.activeCoins[i].mesh.rotation.y += deltaTime * 8;
    }
  }

  recyclePassedCoins() {
    const playerZ = this.player.getPosition().z;

    for (let i = this.activeCoins.length - 1; i >= 0; i -= 1) {
      const coin = this.activeCoins[i];
      if (coin.mesh.position.z > playerZ + 8) {
        this.recycleCoin(i);
      }
    }
  }

  collectCollisions() {
    const playerAABB = this.player.getAABB();

    for (let i = this.activeCoins.length - 1; i >= 0; i -= 1) {
      const coin = this.activeCoins[i];
      const coinAABB = coin.getAABB();
      if (this.isAABBOverlap(playerAABB, coinAABB)) {
        this.onCollect?.();
        this.recycleCoin(i);
      }
    }
  }

  recycleCoin(index) {
    const [coin] = this.activeCoins.splice(index, 1);
    coin.deactivate();
    this.pool.push(coin);
  }

  isAABBOverlap(a, b) {
    return (
      a.minX <= b.maxX &&
      a.maxX >= b.minX &&
      a.minY <= b.maxY &&
      a.maxY >= b.minY &&
      a.minZ <= b.maxZ &&
      a.maxZ >= b.minZ
    );
  }

  randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }
}
