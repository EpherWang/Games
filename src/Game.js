/**
 * Game.js
 * 负责组织场景、相机、渲染器与游戏对象。
 */
import * as THREE from 'three';
import { GameLoop } from './GameLoop.js';
import { Player } from './Player.js';
import { World } from './World.js';
import { InputController } from './InputController.js';
import { ObstacleManager } from './ObstacleManager.js';
import { CoinManager } from './Coin.js';
import { ScoreSystem } from './ScoreSystem.js';

export class Game {
  constructor(container) {
    this.container = container;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffc38a);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2000,
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    if ('outputEncoding' in this.renderer) {
      this.renderer.outputEncoding = 3001;
    }
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    this.world = new World(this.scene);
    this.player = new Player();
    this.scene.add(this.player.mesh);

    this.input = new InputController({
      onMoveLeft: () => this.player.moveLeft(),
      onMoveRight: () => this.player.moveRight(),
    });

    this.cameraOffset = new THREE.Vector3(0, 5, 10);

    this.isGameOver = false;
    this.obstacleManager = new ObstacleManager(
      this.scene,
      this.player,
      () => this.handleGameOver(),
    );
    this.updateCameraFollow(true);

    this.scoreSystem = new ScoreSystem(document.body);
    this.coinManager = new CoinManager(this.scene, this.player, () => {
      this.scoreSystem.addCoin();
    });

    this.loop = new GameLoop((deltaTime) => this.update(deltaTime));

    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  start() {
    this.loop.start();
  }

  update(deltaTime) {
    if (this.isGameOver) return;

    this.scoreSystem.update(deltaTime);
    this.player.speed = this.scoreSystem.getWorldSpeed();

    this.player.update(deltaTime);
    this.obstacleManager.update(deltaTime);
    this.coinManager.update(deltaTime);
    this.updateCameraFollow();
    this.renderer.render(this.scene, this.camera);
  }

  handleGameOver() {
    if (this.isGameOver) return;

    this.isGameOver = true;
    this.loop.stop();
    console.log('Game Over');
  }

  updateCameraFollow(snap = false) {
    const playerPos = this.player.getPosition();
    const targetPos = playerPos.clone().add(this.cameraOffset);

    if (snap) {
      this.camera.position.copy(targetPos);
    } else {
      this.camera.position.lerp(targetPos, 0.08);
    }

    this.camera.lookAt(playerPos.x, playerPos.y + 0.5, playerPos.z - 6);
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
