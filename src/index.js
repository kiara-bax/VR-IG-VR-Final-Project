// imports
import {
  AssetType, Mesh, PlaneGeometry, SessionMode,
  AssetManager, World, MeshStandardMaterial,
  LocomotionEnvironment, EnvironmentType, PanelUI, Interactable, ScreenSpace,
  PhysicsBody, PhysicsShape, PhysicsShapeType, PhysicsState, PhysicsSystem, OneHandGrabbable
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
  const floorGeometry = new PlaneGeometry(50, 50);
  const floorMaterial = new MeshStandardMaterial({ color: 'green' });
  const floorMesh = new Mesh(floorGeometry, floorMaterial);
  floorMesh.rotation.x = -Math.PI / 2;
  const floorEntity = world.createTransformEntity(floorMesh);

  floorEntity.addComponent(LocomotionEnvironment, { type: EnvironmentType.STATIC });
  floorEntity.addComponent(PhysicsShape, { shape: PhysicsShapeType.Auto });
  floorEntity.addComponent(PhysicsBody, { state: PhysicsState.Static });

  // import maze wall
  const mazeAsset = AssetManager.getGLTF('maze').scene;
  //maze wall 1
  const maze1 = mazeAsset.clone();
  maze1.position.set(25, 0, 25);
  maze1.scale.set(0.10, 0.10, 0.10);
  const maze1Entity = world.createTransformEntity(maze1).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 2
  const maze2 = mazeAsset.clone();
  maze2.position.set(25, 0, 17.5);
  maze2.scale.set(0.10, 0.10, 0.10);
  const maze2Entity = world.createTransformEntity(maze2).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 3
  const maze3 = mazeAsset.clone();
  maze3.position.set(25, 0, 10);
  maze3.scale.set(0.10, 0.10, 0.10);
  const maze3Entity = world.createTransformEntity(maze3).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 4
  const maze4 = mazeAsset.clone();
  maze4.position.set(25, 0, 2.5);
  maze4.scale.set(0.10, 0.10, 0.10);
  const maze4Entity = world.createTransformEntity(maze4).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 5
  const maze5 = mazeAsset.clone();
  maze5.position.set(25, 0, -5);
  maze5.scale.set(0.10, 0.10, 0.10);
  const maze5Entity = world.createTransformEntity(maze5).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 6
  const maze6 = mazeAsset.clone();
  maze6.position.set(25, 0, -12.5);
  maze6.scale.set(0.10, 0.10, 0.10);
  const maze6Entity = world.createTransformEntity(maze6).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 7
  const maze7 = mazeAsset.clone();
  maze7.position.set(25, 0, -20);
  maze7.scale.set(0.10, 0.10, 0.10);
  const maze7Entity = world.createTransformEntity(maze7).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });




  //import coin 3d object
  const coinAsset = AssetManager.getGLTF('coin').scene;
  // coin1 clone
  const coin1 = coinAsset.clone();
  coin1.position.set(6, 1, 6);
  coin1.scale.set(0.5, 0.5, 0.5);
  const coin1Entity = world.createTransformEntity(coin1).addComponent(Interactable);
  coin1Entity.object3D.addEventListener("pointerdown", removeCoin1);

  function removeCoin1(){
    coin1Entity.destroy();
    score += 1;
    updateScoreboard();
  }

  // coin2 clone
  const coin2 = coinAsset.clone();
  coin2.position.set(20, 1, -25);
  coin2.scale.set(0.5, 0.5, 0.5);
  const coin2Entity = world.createTransformEntity(coin2).addComponent(Interactable);
  coin2Entity.object3D.addEventListener("pointerdown", removeCoin2);

  function removeCoin2(){
    coin2Entity.destroy();
    score += 1;
    updateScoreboard();
  }

  //coin3 clone
  const coin3 = coinAsset.clone();
  coin3.position.set(30, 1, 8);
  coin3.scale.set(0.5, 0.5, 0.5);
  const coin3Entity = world.createTransformEntity(coin3).addComponent(Interactable);
  coin3Entity.object3D.addEventListener("pointerdown", removeCoin3);

  function removeCoin3(){
    coin3Entity.destroy();
    score += 1;
    updateScoreboard();
  }
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
