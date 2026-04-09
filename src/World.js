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
    const ambientLight = new THREE.AmbientLight(0xffb784, 0.22);
    this.scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffd7a8, 0x4a3b2c, 0.5);
    this.scene.add(hemisphereLight);

    const directionalLight = new THREE.DirectionalLight(0xffbe7a, 2.6);
    directionalLight.position.set(18, 22, 18);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(2048, 2048);
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 120;
    directionalLight.shadow.camera.left = -40;
    directionalLight.shadow.camera.right = 40;
    directionalLight.shadow.camera.top = 35;
    directionalLight.shadow.camera.bottom = -35;
    directionalLight.shadow.bias = -0.00015;
    directionalLight.shadow.normalBias = 0.018;
    directionalLight.shadow.radius = 2.0;
    directionalLight.target.position.set(0, 0, -60);
    this.scene.add(directionalLight);
    this.scene.add(directionalLight.target);
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
