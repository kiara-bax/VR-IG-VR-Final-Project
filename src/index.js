// imports
import {
  AssetType, Mesh, PlaneGeometry, SessionMode,
  AssetManager, World, MeshStandardMaterial,
  LocomotionEnvironment, EnvironmentType, PanelUI, Interactable, ScreenSpace,
  PhysicsBody, PhysicsShape, PhysicsShapeType, PhysicsState, PhysicsSystem,
  Interactable, OneHandGrabbable
} from '@iwsdk/core';

import { PanelSystem } from './panel.js';

import { CanvasTexture, MeshBasicMaterial, DoubleSide } from 'three';
// assets
const assets = {
  chimeSound: {
    url: '/audio/chime.mp3',
    type: AssetType.Audio,
    priority: 'background'
  },
  coin: {
    url: '/glxf/coin.glb',
    type: AssetType.GLTF,
    priority: 'critical',
  },
  hedge: {
    url: '/glxf/hedge_block.glb',
    type: AssetType.GLTF,
    priority: 'critical',
  },
};

// create world
World.create(document.getElementById('scene-container'), {
  assets,
  xr: {
    sessionMode: SessionMode.ImmersiveVR,
    offer: 'always',
    features: {  }
  },
  features: { 
    handTracking: true, locomotion: { useWorker: true }, 
    grabbing: true, physics: true 
  },

}).then((world) => {

  const {camera} = world;

  //scoreboard
  // create a message board using a canvas texture (scoreBox)
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.font = 'bold 120px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'red';
  ctx.fillText('Score: 0', canvas.width / 2, canvas.height / 2 + 16);
  
  const texture = new CanvasTexture(canvas);
  const aspect = canvas.width / canvas.height;
  const boardWidth = 2;                 // world units
  const boardHeight = boardWidth / aspect;
  
  const boardMat = new MeshBasicMaterial({ 
    map: texture, 
    transparent: true,  
    side: DoubleSide,});

  const boardGeo = new PlaneGeometry(12, 1.5);
  const boardMesh = new Mesh(boardGeo, boardMat);
  const boardEntity = world.createTransformEntity(boardMesh);

  boardEntity.object3D.position.set(10, 5, -20);  // in front of the user
  boardEntity.object3D.visible = true; // start hidden
  boardEntity.object3D.rotation.set(0, Math.PI / 4, 0);
  boardEntity.object3D.lookAt(camera.position);

  let score = 0;
  function updateScoreboard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (score >= 3){
      ctx.font = 'bold 200px sans-serif';
      ctx.fillStyle = 'green';
      ctx.textAlign = 'center';
      ctx.fillText('YOU WIN!!!', canvas.width / 2, canvas.height / 2 + 50);
    } else {
      // Display regular score
      ctx.font = 'bold 200px sans-serif';
      ctx.fillStyle = 'red';
      ctx.textAlign = 'center';
      ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
    }
      texture.needsUpdate = true;

  }
  updateScoreboard();

  function hideMessage() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      texture.needsUpdate = true;
      boardEntity.object3D.visible = false;
  }
  function showTemporaryMessage(message, duration = 2000) {
      updateScoreboard(message);
      setTimeout(() => {
          hideMessage();
      }, duration);
  }
  

  // create floor
  const floorGeometry = new Mesh(new PlaneGeometry(200, 200));
  const floorMaterial = new MeshStandardMaterial({ color: 'green' });
  const floorMesh = new Mesh(floorGeometry, floorMaterial);
  floorMesh.rotation.x = -Math.PI / 2;
  const floorEntity = world.createTransformEntity(floorMesh);
  
  floorEntity.addComponent(LocomotionEnvironment, { type: EnvironmentType.STATIC });
  floorEntity.addComponent(PhysicsShape, { shape: PhysicsShapeType.Auto });
  floorEntity.addComponent(PhysicsBody, { state: PhysicsState.Static });

  // maze definition (1 = hedge, 0 = open)
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

  const rows = maze.length;
  const cols = maze[0].length;
  const cellSize = floorSize / rows;

  const startX = -floorSize / 2;
  const startZ = floorSize / 2;

  const entrance = { row: 1, col: 1 };
  const exit = { row: 5, col: 6 };

  const hedgeAsset = AssetManager.getGLTF('hedge').scene;
  const coinAsset = AssetManager.getGLTF('coin').scene;

  const openCells = [];

  // spawn hedge function
  function spawnHedge(x, z) {
    const hedge = hedgeAsset.clone();
    hedge.scale.set(0.25, 0.25, 0.25);
    hedge.position.set(x, 0.5, z); // half height above floor

    const hedgeEntity = world.createTransformEntity(hedge);
    hedgeEntity.addComponent(PhysicsShape, {
      shape: PhysicsShapeType.Box,
      size: { x: cellSize * 0.25, y: 4 * 0.25, z: cellSize * 0.25 }
    });
    hedgeEntity.addComponent(PhysicsBody, { state: PhysicsState.Static });
  }

  // spawn coin function
  function spawnCoin(x, z) {
    const coin = coinAsset.clone();
    coin.scale.set(0.5, 0.5, 0.5);
    coin.position.set(x, 1.5, z); // above floor

    const coinEntity = world.createTransformEntity(coin);
    coinEntity.addComponent(PhysicsShape, { shape: PhysicsShapeType.Auto });
    coinEntity.addComponent(PhysicsBody, { state: PhysicsState.Kinematic });
  }

  // create maze
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = startX + col * cellSize;
      const z = startZ - row * cellSize;

      if (maze[row][col] === 1) {
        spawnHedge(x, z);
      } else {
        openCells.push({ x, z });
      }
    }
  }

  // player start position
  const player = world.getPlayer();
  player.setPosition(startX + entrance.col * cellSize, 1, startZ - entrance.row * cellSize);
  player.setRotation(0, Math.PI, 0);

  // exit coin
  spawnCoin(startX + exit.col * cellSize, startZ - exit.row * cellSize);

  // additional random coins
  for (let i = 0; i < 5; i++) {
    const cell = openCells[Math.floor(Math.random() * openCells.length)];
    if (cell) spawnCoin(cell.x, cell.z);
  }

  // game loop for end detection
  const chime = AssetManager.getAudio("chimeSound");

  function gameLoop() {
    const cam = world.camera.position;
    const exitX = startX + exit.col * cellSize;
    const exitZ = startZ - exit.row * cellSize;

    const dx = cam.x - exitX;
    const dz = cam.z - exitZ;

    if (Math.sqrt(dx * dx + dz * dz) < 1.2) {
      chime.play();
      console.log("You have reached the end of the maze!");
    }

    requestAnimationFrame(gameLoop);
  }

  gameLoop();
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
