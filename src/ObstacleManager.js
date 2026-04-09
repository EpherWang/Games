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
    this.poolSize = 20;

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
      this.spawnObstacle();
    }

    this.recyclePassedObstacles();

    if (this.checkCollisions()) {
      this.onGameOver?.();
    }
  }

  spawnObstacle() {
    if (this.pool.length === 0) return;

    const obstacle = this.pool.pop();
    const laneX = this.laneXPositions[Math.floor(Math.random() * this.laneXPositions.length)];
    const type = Math.random() < 0.5 ? 'high' : 'low';
    const playerZ = this.player.getPosition().z;
    const spawnZ =
      playerZ - this.randomBetween(this.spawnDistanceMin, this.spawnDistanceMax);

    obstacle.activate(type, laneX, spawnZ);
    this.activeObstacles.push(obstacle);
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
