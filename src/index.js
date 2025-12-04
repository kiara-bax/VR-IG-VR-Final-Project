// imports
import {
  AssetType, Mesh, PlaneGeometry, SessionMode,
  AssetManager, World, MeshStandardMaterial,
  LocomotionEnvironment, EnvironmentType, PanelUI, Interactable, ScreenSpace,
  PhysicsBody, PhysicsShape, PhysicsShapeType, PhysicsState, PhysicsSystem, OneHandGrabbable,
  AudioUtils,
  AudioSource
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
  maze: {
    url: 'public/glxf/hedge_block.glb',
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

  boardEntity.object3D.position.set(-25, 5, -25);  // in front of the user
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
  const floorGeometry = new PlaneGeometry(55, 55);
  const floorMaterial = new MeshStandardMaterial({ color: 'green' });
  const floorMesh = new Mesh(floorGeometry, floorMaterial);
  floorMesh.rotation.x = -Math.PI / 2;
  const floorEntity = world.createTransformEntity(floorMesh);

  floorEntity.addComponent(LocomotionEnvironment, { type: EnvironmentType.STATIC });
  floorEntity.addComponent(PhysicsShape, { shape: PhysicsShapeType.Auto });
  floorEntity.addComponent(PhysicsBody, { state: PhysicsState.Static });

  // import maze wall
  const mazeAsset = AssetManager.getGLTF('maze').scene;
  const wallPositions = [
    // right side (a)
    { x: 25, y: 0, z: 25 },
    { x: 25, y: 0, z: 17.5 },
    { x: 25, y: 0, z: 10 },
    { x: 25, y: 0, z: 2.5 },
    { x: 25, y: 0, z: -5 },
    { x: 25, y: 0, z: -12.5 },
    { x: 25, y: 0, z: -20 },
    // left side (b)
    { x: -25, y: 0, z: 25 },
    { x: -25, y: 0, z: 17.5 },
    { x: -25, y: 0, z: 10 },
    { x: -25, y: 0, z: 2.5 },
    { x: -25, y: 0, z: -5 },
    { x: -25, y: 0, z: -12.5 },
    { x: -25, y: 0, z: -20 },
    // back side (c)
    { x: 25,   y: 0, z: 25, rotY: Math.PI / 2 },
    { x: 17.5, y: 0, z: 25, rotY: Math.PI / 2 },
    { x: 10,   y: 0, z: 25, rotY: Math.PI / 2 },
    { x: 2.5,  y: 0, z: 25, rotY: Math.PI / 2 },
    { x: -5,   y: 0, z: 25, rotY: Math.PI / 2 },
    { x: -12.5,y: 0, z: 25, rotY: Math.PI / 2 },
    { x: -20,  y: 0, z: 25, rotY: Math.PI / 2 },
    // front side (d)
    { x: 25,   y: 0, z: -25, rotY: Math.PI / 2 },
    { x: 17.5, y: 0, z: -25, rotY: Math.PI / 2 },
    { x: 10,   y: 0, z: -25, rotY: Math.PI / 2 },
    { x: 2.5,  y: 0, z: -25, rotY: Math.PI / 2 },
    { x: -5,   y: 0, z: -25, rotY: Math.PI / 2 },
    { x: -12.5,y: 0, z: -25, rotY: Math.PI / 2 },
    { x: -20,  y: 0, z: -25, rotY: Math.PI / 2 },
    // e
    { x: 20,   y: 0, z: -20, rotY: Math.PI / 2 },
    { x: 17.5, y: 0, z: -20, rotY: Math.PI / 2 },
    { x: 10,   y: 0, z: -20, rotY: Math.PI / 2 },
    { x: 2.5,  y: 0, z: -20, rotY: Math.PI / 2 },
    { x: -5,   y: 0, z: -20, rotY: Math.PI / 2 },
    { x: -12.5,y: 0, z: -20, rotY: Math.PI / 2 },
    { x: -20,  y: 0, z: -20, rotY: Math.PI / 2 },
    //f
    { x: -20, y: 0, z: 20 },
    { x: -20, y: 0, z: 17.5 },
    { x: -20, y: 0, z: 10 },
    { x: -20, y: 0, z: 2.5 },
    { x: -20, y: 0, z: -5 },
    { x: -20, y: 0, z: -7.5},
    //g
    { x: 20, y: 0, z: 20 },
    { x: 20, y: 0, z: 17.5 },
    { x: 20, y: 0, z: 10 },
    { x: 20, y: 0, z: 2.5 },
    { x: 20, y: 0, z: -5 },
    { x: 20, y: 0, z: -12.5 },
    //h
    { x: 20,   y: 0, z: 20, rotY: Math.PI / 2 },
    { x: 17.5, y: 0, z: 20, rotY: Math.PI / 2 },
    { x: 10,   y: 0, z: 20, rotY: Math.PI / 2 },
    { x: 2.5,  y: 0, z: 20, rotY: Math.PI / 2 },
    { x: -5,   y: 0, z: 20, rotY: Math.PI / 2 },
    { x: -12.5,y: 0, z: 20, rotY: Math.PI / 2 },
    //i
    { x: 15, y: 0, z: -15, rotY: Math.PI / 2 },
    { x: 10,   y: 0, z: -15, rotY: Math.PI / 2 },
    { x: 2.5,  y: 0, z: -15, rotY: Math.PI / 2 },
    { x: -5,   y: 0, z: -15, rotY: Math.PI / 2 },
    { x: -12.5,y: 0, z: -15, rotY: Math.PI / 2 },
    //j
    { x: 15, y: 0, z: 15},
    { x: 15, y: 0, z: 8 },
    { x: 15, y: 0, z: 0.5 },
    { x: 15, y: 0, z: -7 },
    //k
    { x: 15, y: 0, z: 15, rotY: Math.PI / 2 },
    { x: 8,   y: 0, z: 15, rotY: Math.PI / 2 },
    { x: 0.5,  y: 0, z: 15, rotY: Math.PI / 2 },
    { x: -7,   y: 0, z: 15, rotY: Math.PI / 2 },
    //l
    { x: -15, y: 0, z: 15},
    { x: -15, y: 0, z: 8 },
    { x: -15, y: 0, z: 0.5 },
    { x: -15, y: 0, z: -2},
    //m
    { x: 10,   y: 0, z: -10, rotY: Math.PI / 2 },
    { x: 8,   y: 0, z: -10, rotY: Math.PI / 2 },
    { x: 0.5,  y: 0, z: -10, rotY: Math.PI / 2 },
    { x: -7,   y: 0, z: -10, rotY: Math.PI / 2 },
    //n
    { x: 10, y: 0, z: 10 },
    { x: 10, y: 0, z: 2.5 },
    { x: 10, y: 0, z: -2},
    //o
    { x: 10,   y: 0, z: 10, rotY: Math.PI / 2 },
    { x: 2.5,  y: 0, z: 10, rotY: Math.PI / 2 },
    { x: -2,   y: 0, z: 10, rotY: Math.PI / 2 },
    //p
    { x: -10, y: 0, z: 10 },
    { x: -10, y: 0, z: 2.5 },
    //q
    { x: 5,   y: 0, z: -5, rotY: Math.PI / 2 },
    { x: 2.5,  y: 0, z: -5, rotY: Math.PI / 2 },
    { x: -2,   y: 0, z: -5, rotY: Math.PI / 2 },
  ];

  //spawn walls loop
  function spawnWalls(){
    wallPositions.forEach(pos =>{
      const wall = mazeAsset.clone();
      wall.position.set(pos.x, pos.y, pos.z);
      wall.scale.set(0.1, 0.1, 0.1);

      if (pos.rotY !== undefined) {
        wall.rotation.y = pos.rotY;
      }

      world.createTransformEntity(wall).addComponent(LocomotionEnvironment, { type: EnvironmentType.STATIC });
    });
  }

  spawnWalls();
  //import coin 3d object
  const coinAsset = AssetManager.getGLTF('coin').scene;
  //coin positions
  const coinPositions = [
    { x: 5,   y: 1, z: -14.5,  },
    { x: 2.5,  y: 1, z: -19.5, rotY: Math.PI / 2 },
    { x: -2,   y: 1, z: -9.5, rotY: Math.PI / 2 },
  ];

  //spawn coin loop
  function spawnCoins(){
    coinPositions.forEach(pos =>{
      const coin = coinAsset.clone();
      coin.position.set(pos.x, pos.y, pos.z);
      coin.scale.set(0.15, 0.15, 0.15);

  // const soundEntity = world.createTransformEntity(soundAsset);
  //soundEntity.addComponent(AudioSource, {
  //   src: '/public/audio/chime.mp3',
  //   loop: false,
  //   volume: 1,
  //   positional: false
  // });
  const coinEntity = world.createTransformEntity(coin).addComponent(Interactable);
  coinEntity.object3D.addEventListener("pointerdown", removeCoin);

  function removeCoin(){
    coinEntity.destroy();
    score += 1;
    updateScoreboard();
  }
    });
  }

  spawnCoins();

  // // coin1 clone
  // const coin1 = coinAsset.clone();
  // coin1.position.set(6, 1, 6);
  // coin1.scale.set(0.5, 0.5, 0.5);
  // const coin1Entity = world.createTransformEntity(coin1).addComponent(Interactable);
  // coin1Entity.object3D.addEventListener("pointerdown", removeCoin1);

  // function removeCoin1(){
  //   coin1Entity.destroy();
  //   score += 1;
  //   updateScoreboard();
  // }

  // // coin2 clone
  // const coin2 = coinAsset.clone();
  // coin2.position.set(20, 1, -25);
  // coin2.scale.set(0.5, 0.5, 0.5);
  // const coin2Entity = world.createTransformEntity(coin2).addComponent(Interactable);
  // coin2Entity.object3D.addEventListener("pointerdown", removeCoin2);

  // function removeCoin2(){
  //   coin2Entity.destroy();
  //   score += 1;
  //   updateScoreboard();
  // }

  // //coin3 clone
  // const coin3 = coinAsset.clone();
  // coin3.position.set(30, 1, 8);
  // coin3.scale.set(0.5, 0.5, 0.5);
  // const coin3Entity = world.createTransformEntity(coin3).addComponent(Interactable);
  // coin3Entity.object3D.addEventListener("pointerdown", removeCoin3);

  // function removeCoin3(){
  //   coin3Entity.destroy();
  //   score += 1;
  //   updateScoreboard();
  // }
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
