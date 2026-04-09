/**
 * ObstacleManager.js
 * 障碍生成、更新、回收与碰撞检测。
 */
import { Obstacle } from './Obstacle.js';

export class ObstacleManager {
  constructor(scene, player, onGameOver) {
    this.scene = scene;
    this.player = player;
    this.onGameOver = onGameOver;

    this.laneXPositions = [-3, 0, 3];

    // 生成参数
    this.spawnIntervalMin = 0.7;
    this.spawnIntervalMax = 1.4;
    this.spawnDistanceMin = 28;
    this.spawnDistanceMax = 44;

    this.activeObstacles = [];
    this.pool = [];
    this.poolSize = 24;

    this.spawnTimer = 0;
    this.nextSpawnInterval = this.randomBetween(
      this.spawnIntervalMin,
      this.spawnIntervalMax,
    );

    this.initPool();
  }

  initPool() {
    for (let i = 0; i < this.poolSize; i += 1) {
      const obstacle = new Obstacle();
      this.pool.push(obstacle);
      this.scene.add(obstacle.mesh);
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
      this.spawnObstacleWave();
    }

    this.recyclePassedObstacles();

    if (this.checkCollisions()) {
      this.onGameOver?.();
    }
  }

  spawnObstacleWave() {
    if (this.pool.length === 0) return;

    const playerZ = this.player.getPosition().z;
    const baseSpawnZ =
      playerZ - this.randomBetween(this.spawnDistanceMin, this.spawnDistanceMax);

    const shouldSpawnCombo = Math.random() < 0.58;

    if (!shouldSpawnCombo || this.pool.length < 2) {
      const laneIndex = this.randomLaneIndex();
      this.spawnAtLane(this.randomType(), laneIndex, baseSpawnZ);
      return;
    }

    // 组合障碍：始终保留一条安全车道，保证可通过。
    const safeLaneIndex = this.randomLaneIndex();
    const blockedLaneIndices = [0, 1, 2].filter((idx) => idx !== safeLaneIndex);
    const [typeA, typeB] = this.createComboTypes();

    // 轻微前后错位，增强可读性但不造成不可能关卡。
    const offsetA = this.randomBetween(-0.8, 0.8);
    const offsetB = this.randomBetween(-0.8, 0.8);

    this.spawnAtLane(typeA, blockedLaneIndices[0], baseSpawnZ + offsetA);
    this.spawnAtLane(typeB, blockedLaneIndices[1], baseSpawnZ + offsetB);
  }

  spawnAtLane(type, laneIndex, z) {
    if (this.pool.length === 0) return;

    const obstacle = this.pool.pop();
    const laneX = this.laneXPositions[laneIndex];
    obstacle.activate(type, laneX, z);
    this.activeObstacles.push(obstacle);
  }

  createComboTypes() {
    const roll = Math.random();
    if (roll < 0.34) return ['high', 'low'];
    if (roll < 0.68) return ['low', 'high'];
    return Math.random() < 0.5 ? ['high', 'high'] : ['low', 'low'];
  }

  randomType() {
    return Math.random() < 0.5 ? 'high' : 'low';
  }

  randomLaneIndex() {
    return Math.floor(Math.random() * this.laneXPositions.length);
  }

  recyclePassedObstacles() {
    const playerZ = this.player.getPosition().z;

    for (let i = this.activeObstacles.length - 1; i >= 0; i -= 1) {
      const obstacle = this.activeObstacles[i];
      if (obstacle.mesh.position.z > playerZ + 10) {
        obstacle.deactivate();
        this.activeObstacles.splice(i, 1);
        this.pool.push(obstacle);
      }
    }
  }

  checkCollisions() {
    const playerAABB = this.player.getAABB();

    for (let i = 0; i < this.activeObstacles.length; i += 1) {
      const obstacleAABB = this.activeObstacles[i].getAABB();
      if (this.isAABBOverlap(playerAABB, obstacleAABB)) {
        return true;
      }
    }

    return false;
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
