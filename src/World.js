/**
 * World.js
 * 创建基础世界：地面、光照与辅助元素。
 */
import * as THREE from 'three';

export class World {
  constructor(scene) {
    this.scene = scene;
    this.setupLights();
    this.createGround();
    this.createAxisHelper();
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 10, 6);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(2048, 2048);
    this.scene.add(directionalLight);
  }

  createGround() {
    const groundGeometry = new THREE.PlaneGeometry(20, 600);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x2d3748 });

    this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.z = -280;
    this.ground.receiveShadow = true;

    this.scene.add(this.ground);
  }

  createAxisHelper() {
    const axesHelper = new THREE.AxesHelper(2);
    this.scene.add(axesHelper);
  }
}
