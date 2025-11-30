//imports
import {
  AssetType, Mesh, MeshBasicMaterial, PlaneGeometry, SessionMode,
  SRGBColorSpace, AssetManager, World, SphereGeometry, MeshStandardMaterial,
  LocomotionEnvironment, EnvironmentType, PanelUI, Interactable, ScreenSpace,
  PhysicsBody, PhysicsShape, PhysicsShapeType, PhysicsState, PhysicsSystem
} from '@iwsdk/core';

import { PanelSystem } from './panel.js';
//assets
const assets = {
  chimeSound: {
    url: '/audio/chime.mp3',
    type: AssetType.Audio,
    priority: 'background'
  },
  candyCane: {
    url: '/glxf/the-sugar-cane-red/source/The Sugar Cane (Red).glb',
    type: AssetType.GLTF,
    priority: 'critical',
  },
  hedge: {
    url: '/glxf/hedge_block.glb',
    type: AssetType.GLTF,
    priority: 'critical',
  },
};

World.create(document.getElementById('scene-container'), {
  assets,
  xr: {
    sessionMode: SessionMode.ImmersiveVR,
    offer: 'always',
    features: { handTracking: true, layers: false, locomotion: true, grabbing: true } 
  },
  features: { locomotion: { useWorker: true }, grabbing: true, physics: true},
  level: '/glxf/Composition.glxf' 
}).then((world) => {
  const { camera } = world;

  //floor
  const floorMesh = new Mesh(new PlaneGeometry(100, 100), new MeshStandardMaterial({color:"green"}));
  floorMesh.rotation.x = -Math.PI / 2;
  //floor entity
  const floorEntity = world.createTransformEntity(floorMesh);
  floorEntity.addComponent(LocomotionEnvironment, { type: EnvironmentType.STATIC });
  floorEntity.addComponent(PhysicsShape, { shape: PhysicsShapeType.Auto});
  floorEntity.addComponent(PhysicsBody, { state: PhysicsState.Static });

  //maze
  const maze = [
    [1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,1],
    [1,0,1,0,1,0,1,1],
    [1,0,1,0,0,0,0,1],
    [1,0,1,1,1,1,0,1],
    [1,0,0,0,0,1,0,1],
    [1,1,1,1,0,1,0,1],
    [1,1,1,1,1,1,1,1],
  ];
  
  const floorSize = 100;
  const rows = maze.length;
  const cols = maze[0].length;
  const cellSize = floorSize / rows;

  const startX = -floorSize / 2;
  const startZ = floorSize / 2;
  const entrance = {row: 1, col: 1};
  const exit = {row: 5, col: 6};

  const hedgeAsset = AssetManager.getGLTF('hedge').scene;
  const candyCaneAsset = AssetManager.getGLTF('candyCane').scene;

  //spawn random hedges
  function spawnHedge(world, hedgeAsset, x, z) {
    const hedge = hedgeAsset.clone();
    hedge.position.set(x, 0, z);
    hedge.scale.set(0.25, 0.25, 0.25);

    const hedgeEntity = world.createTransformEntity(hedge);

    const hedgeBody = new PhysicsBody({
      type: PhysicsState.STATIC,
      shapes: [new PhysicsShape({
        shape: PhysicsShapeType.BOX,
        size: {x: cellSize * 0.9, y: 4, z: cellSize * 0.9}, }), ], });

    world.addPhysicsBody(hedgeEntity, hedgeBody);
  }

  //spawn random candycanes
  function spawnCollectible(world, candyCaneAsset, x, z) {
    const candyCane = candyCaneAsset.clone();
    candyCane.position.set(x, 0.5, z);
    candyCane.scale.set(0.35, 0.35, 0.35);

    const candyCaneEntity = world.createTransformEntity(candyCane);
    candyCaneEntity.addComponent(PhysicsShape, { shape: PhysicsShapeType.Auto });
    candyCaneEntity.addComponent(PhysicsBody, { state: PhysicsState.Static });
  }

  function randomPlace(list){
    return list[Math.floor(Math.random() * list.length)];
  }

  //create maze
  const openCells = [];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = startX + col * cellSize;
      const z = startZ - row * cellSize; 
      
      if (maze[row][col] === 1) {
        spawnHedge(world, hedgeAsset, x, z, cellSize);
      } else {
        openCells.push({ x, z });
      }
    }
  }

  //player start position
  const entranceX = startX + entrance.col * cellSize;
  const entranceZ = startZ - entrance.row * cellSize;
  
  const player = world.getPlayer();
  player.setPosition(entranceX, 1, entranceZ);
  player.setRotation(0, Math.PI, 0);

  //exit indicator
  const exitX = startX + exit.col * cellSize;
  const exitZ = startZ - exit.row * cellSize;

  spawnCollectible(world, candyCaneAsset, exitX, exitZ);

  //randomize collectibles
  for (let i = 0; i < 5; i++) {
    const cell = randomPlace(openCells);
    spawnCollectible(world, candyCaneAsset, cell.x, cell.z);
  }

  //game loop
  const chime = AssetManager.getAudio("chimeSound");

  function gameLoop(){
    const cam = world.camera.position;

    const dx = cam.x - exitX;
    const dz = cam.z - exitZ;

    if (Math.sqrt(dx * dx + dz * dz) < 1.2 ){
      chime.play();
      console.log("You have reached the end of the maze!");
    }
    requestAnimationFrame(gameLoop);
  }

  gameLoop();

  world.registerSystem(PhysicsSystem).registerComponent(PhysicsBody).registerComponent(PhysicsShape);
  
  // vvvvvvvv EVERYTHING BELOW WAS ADDED TO DISPLAY A BUTTON TO ENTER VR FOR QUEST 1 DEVICES vvvvvv
  //          (for some reason IWSDK doesn't show Enter VR button on Quest 1)
  world.registerSystem(PanelSystem);
  
  if (isMetaQuest1()) {
    const panelEntity = world
      .createTransformEntity()
      .addComponent(PanelUI, {
        config: '/ui/welcome.json',
        maxHeight: 0.8,
        maxWidth: 1.6
      })
      .addComponent(Interactable)
      .addComponent(ScreenSpace, {
        top: '20px',
        left: '20px',
        height: '40%'
      });
    panelEntity.object3D.position.set(0, 1.29, -1.9);
  } else {
    // Skip panel on non-Meta-Quest-1 devices
    // Useful for debugging on desktop or newer headsets.
    console.log('Panel UI skipped: not running on Meta Quest 1 (heuristic).');
  }
  function isMetaQuest1() {
    try {
      const ua = (navigator && (navigator.userAgent || '')) || '';
      const hasOculus = /Oculus|Quest|Meta Quest/i.test(ua);
      const isQuest2or3 = /Quest\s?2|Quest\s?3|Quest2|Quest3|MetaQuest2|Meta Quest 2/i.test(ua);
      return hasOculus && !isQuest2or3;
    } catch (e) {
      return false;
    }
  }
});
