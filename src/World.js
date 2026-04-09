/**
 * World.js
 * 创建基础世界：地面、光照与辅助元素。
 */
import * as THREE from 'three';

function createGroundTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#7f674d';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 220; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = Math.random() * 1.7 + 0.3;
    const value = 95 + Math.floor(Math.random() * 60);
    ctx.fillStyle = `rgba(${value}, ${value - 8}, ${value - 18}, 0.24)`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 180);
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

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
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x9f7f61,
      roughness: 0.8,
      metalness: 0.02,
      map: createGroundTexture(),
    });

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
