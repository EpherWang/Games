/**
 * Game.js
 * 负责组织场景、相机、渲染器与游戏对象。
 */
import * as THREE from 'three';
import { GameLoop } from './GameLoop.js';
import { Player } from './Player.js';
import { World } from './World.js';
import { InputController } from './InputController.js';

export class Game {
  constructor(container) {
    this.container = container;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b1020);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2000,
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;

    this.container.appendChild(this.renderer.domElement);

    this.world = new World(this.scene);
    this.player = new Player();
    this.scene.add(this.player.mesh);

    this.input = new InputController({
      onMoveLeft: () => this.player.moveLeft(),
      onMoveRight: () => this.player.moveRight(),
    });

    this.cameraOffset = new THREE.Vector3(0, 5, 10);
    this.updateCameraFollow(true);

    this.loop = new GameLoop((deltaTime) => this.update(deltaTime));

    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  start() {
    this.loop.start();
  }

  update(deltaTime) {
    this.player.update(deltaTime);
    this.updateCameraFollow();
    this.renderer.render(this.scene, this.camera);
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
