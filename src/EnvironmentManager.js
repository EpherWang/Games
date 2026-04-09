/**
 * EnvironmentManager.js
 * 提供环境氛围、道路两侧装饰与远景层（对象池 + 回收）。
 */
import * as THREE from 'three';

const SIDE_TYPES = ['tree', 'rock', 'pillar'];
const FAR_TYPES = ['hill', 'spire', 'plateau'];

const shared = {
  materials: {
    bark: new THREE.MeshStandardMaterial({
      color: 0x6d4a2e,
      roughness: 0.9,
      metalness: 0.02,
    }),
    leaves: new THREE.MeshStandardMaterial({
      color: 0x3e7c43,
      roughness: 0.85,
      metalness: 0.0,
      flatShading: true,
    }),
    rock: new THREE.MeshStandardMaterial({
      color: 0x7a7f87,
      roughness: 0.92,
      metalness: 0.01,
      flatShading: true,
    }),
    pillar: new THREE.MeshStandardMaterial({
      color: 0xb2a28c,
      roughness: 0.78,
      metalness: 0.05,
    }),
    far: new THREE.MeshStandardMaterial({
      color: 0x8ea0a7,
      roughness: 0.96,
      metalness: 0.0,
      flatShading: true,
    }),
  },
  geometries: {
    trunk: new THREE.CylinderGeometry(0.18, 0.24, 1.7, 8),
    leaves: new THREE.ConeGeometry(0.9, 2.3, 7),
    rock: new THREE.DodecahedronGeometry(0.65, 0),
    pillarBody: new THREE.CylinderGeometry(0.3, 0.35, 2.7, 10),
    pillarTop: new THREE.CylinderGeometry(0.5, 0.52, 0.26, 10),
    farHill: new THREE.ConeGeometry(2.4, 5.0, 6),
    farSpire: new THREE.CylinderGeometry(0.5, 0.9, 6.2, 6),
    farPlateau: new THREE.BoxGeometry(4.2, 2.2, 3.8),
  },
};

function setShadowFlags(object3d, enabled) {
  object3d.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = enabled;
    child.receiveShadow = enabled;
  });
}

function createTree() {
  const group = new THREE.Group();

  const trunk = new THREE.Mesh(shared.geometries.trunk, shared.materials.bark);
  trunk.position.y = 0.85;

  const leaves = new THREE.Mesh(shared.geometries.leaves, shared.materials.leaves);
  leaves.position.y = 2.2;

  group.add(trunk, leaves);
  setShadowFlags(group, true);
  return group;
}

function createRock() {
  const mesh = new THREE.Mesh(shared.geometries.rock, shared.materials.rock);
  mesh.position.y = 0.45;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createPillar() {
  const group = new THREE.Group();

  const body = new THREE.Mesh(shared.geometries.pillarBody, shared.materials.pillar);
  body.position.y = 1.35;

  const cap = new THREE.Mesh(shared.geometries.pillarTop, shared.materials.pillar);
  cap.position.y = 2.8;

  group.add(body, cap);
  setShadowFlags(group, true);
  return group;
}

function createSideDecoration(type) {
  if (type === 'tree') return createTree();
  if (type === 'pillar') return createPillar();
  return createRock();
}

function createFarScenery(type) {
  let mesh;

  if (type === 'hill') {
    mesh = new THREE.Mesh(shared.geometries.farHill, shared.materials.far);
    mesh.position.y = 2.2;
  } else if (type === 'spire') {
    mesh = new THREE.Mesh(shared.geometries.farSpire, shared.materials.far);
    mesh.position.y = 3.2;
  } else {
    mesh = new THREE.Mesh(shared.geometries.farPlateau, shared.materials.far);
    mesh.position.y = 1.1;
  }

  mesh.castShadow = false;
  mesh.receiveShadow = false;
  return mesh;
}

class PooledObject {
  constructor(type, object) {
    this.type = type;
    this.object = object;
    this.object.visible = false;
    this.active = false;
  }

  activate(position, scale = 1, rotationY = 0) {
    this.active = true;
    this.object.visible = true;
    this.object.position.copy(position);
    this.object.scale.setScalar(scale);
    this.object.rotation.set(0, rotationY, 0);
  }

  deactivate() {
    this.active = false;
    this.object.visible = false;
  }
}

export class EnvironmentManager {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;

    this.setupAtmosphere();

    this.activeSide = [];
    this.sidePool = [];
    this.sidePoolSize = 72;
    this.sideSpawnTimer = 0;
    this.sideSpawnIntervalMin = 0.18;
    this.sideSpawnIntervalMax = 0.4;
    this.nextSideSpawn = this.randomBetween(
      this.sideSpawnIntervalMin,
      this.sideSpawnIntervalMax,
    );

    this.activeFar = [];
    this.farPool = [];
    this.farPoolSize = 30;
    this.farSpawnTimer = 0;
    this.farSpawnIntervalMin = 0.55;
    this.farSpawnIntervalMax = 1.05;
    this.nextFarSpawn = this.randomBetween(
      this.farSpawnIntervalMin,
      this.farSpawnIntervalMax,
    );

    this.initPools();
  }

  setupAtmosphere() {
    this.scene.background = new THREE.Color(0x9bc6ff);
    this.scene.fog = new THREE.Fog(0x9bc6ff, 45, 180);
  }

  initPools() {
    for (let i = 0; i < this.sidePoolSize; i += 1) {
      const type = SIDE_TYPES[i % SIDE_TYPES.length];
      const object = createSideDecoration(type);
      const item = new PooledObject(type, object);
      this.sidePool.push(item);
      this.scene.add(item.object);
    }

    for (let i = 0; i < this.farPoolSize; i += 1) {
      const type = FAR_TYPES[i % FAR_TYPES.length];
      const object = createFarScenery(type);
      const item = new PooledObject(type, object);
      this.farPool.push(item);
      this.scene.add(item.object);
    }
  }

  update(deltaTime) {
    this.sideSpawnTimer += deltaTime;
    this.farSpawnTimer += deltaTime;

    if (this.sideSpawnTimer >= this.nextSideSpawn) {
      this.sideSpawnTimer = 0;
      this.nextSideSpawn = this.randomBetween(
        this.sideSpawnIntervalMin,
        this.sideSpawnIntervalMax,
      );
      this.spawnSidePair();
    }

    if (this.farSpawnTimer >= this.nextFarSpawn) {
      this.farSpawnTimer = 0;
      this.nextFarSpawn = this.randomBetween(
        this.farSpawnIntervalMin,
        this.farSpawnIntervalMax,
      );
      this.spawnFarItem();
    }

    this.recyclePassedItems();
  }

  spawnSidePair() {
    this.spawnSideItem(-1);
    this.spawnSideItem(1);
  }

  spawnSideItem(sideSign) {
    if (this.sidePool.length === 0) return;

    const item = this.sidePool.pop();
    const playerZ = this.player.getPosition().z;
    const spawnZ = playerZ - this.randomBetween(25, 70);
    const x = sideSign * this.randomBetween(7.5, 12.2);

    let scale = 1;
    if (item.type === 'tree') scale = this.randomBetween(0.9, 1.35);
    if (item.type === 'rock') scale = this.randomBetween(0.7, 1.45);
    if (item.type === 'pillar') scale = this.randomBetween(0.85, 1.25);

    const position = new THREE.Vector3(x, 0, spawnZ);
    item.activate(position, scale, Math.random() * Math.PI * 2);
    this.activeSide.push(item);
  }

  spawnFarItem() {
    if (this.farPool.length === 0) return;

    const item = this.farPool.pop();
    const playerZ = this.player.getPosition().z;
    const spawnZ = playerZ - this.randomBetween(85, 170);
    const sideSign = Math.random() < 0.5 ? -1 : 1;
    const x = sideSign * this.randomBetween(16, 30);

    let scale = this.randomBetween(1.5, 2.9);
    if (item.type === 'spire') {
      scale = this.randomBetween(1.25, 2.4);
    }

    const position = new THREE.Vector3(x, 0, spawnZ);
    item.activate(position, scale, Math.random() * Math.PI * 2);
    this.activeFar.push(item);
  }

  recyclePassedItems() {
    const playerZ = this.player.getPosition().z;

    for (let i = this.activeSide.length - 1; i >= 0; i -= 1) {
      const item = this.activeSide[i];
      if (item.object.position.z > playerZ + 14) {
        this.recycleItem(this.activeSide, this.sidePool, i);
      }
    }

    for (let i = this.activeFar.length - 1; i >= 0; i -= 1) {
      const item = this.activeFar[i];
      if (item.object.position.z > playerZ + 26) {
        this.recycleItem(this.activeFar, this.farPool, i);
      }
    }
  }

  recycleItem(activeList, poolList, index) {
    const [item] = activeList.splice(index, 1);
    item.deactivate();
    poolList.push(item);
  }

  randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }
}
