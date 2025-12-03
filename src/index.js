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
  //left side
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
  //maze wall 1f
  const maze1f = mazeAsset.clone();
  maze1f.position.set(20, 0, 20);
  maze1f.scale.set(0.10, 0.10, 0.10);
  const maze1fEntity = world.createTransformEntity(maze1f).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 2f
  const maze2f = mazeAsset.clone();
  maze2f.position.set(20, 0, 17.5);
  maze2f.scale.set(0.10, 0.10, 0.10);
  const maze2fEntity = world.createTransformEntity(maze2f).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 3f
  const maze3f = mazeAsset.clone();
  maze3f.position.set(20, 0, 10);
  maze3f.scale.set(0.10, 0.10, 0.10);
  const maze3fEntity = world.createTransformEntity(maze3f).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 4f
  const maze4f = mazeAsset.clone();
  maze4f.position.set(20, 0, 2.5);
  maze4f.scale.set(0.10, 0.10, 0.10);
  const maze4fEntity = world.createTransformEntity(maze4f).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 5f
  const maze5f = mazeAsset.clone();
  maze5f.position.set(20, 0, -5);
  maze5f.scale.set(0.10, 0.10, 0.10);
  const maze5fEntity = world.createTransformEntity(maze5f).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 6f
  const maze6f = mazeAsset.clone();
  maze6f.position.set(20, 0, -12.5);
  maze6f.scale.set(0.10, 0.10, 0.10);
  const maze6fEntity = world.createTransformEntity(maze6f).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //right side
    //maze wall 1a
  const maze1a = mazeAsset.clone();
  maze1a.position.set(-25, 0, 25);
  maze1a.scale.set(0.10, 0.10, 0.10);
  const maze1aEntity = world.createTransformEntity(maze1a).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 2a
  const maze2a = mazeAsset.clone();
  maze2a.position.set(-25, 0, 17.5);
  maze2a.scale.set(0.10, 0.10, 0.10);
  const maze2aEntity = world.createTransformEntity(maze2a).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 3a
  const maze3a = mazeAsset.clone();
  maze3a.position.set(-25, 0, 10);
  maze3a.scale.set(0.10, 0.10, 0.10);
  const maze3aEntity = world.createTransformEntity(maze3a).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 4a
  const maze4a = mazeAsset.clone();
  maze4a.position.set(-25, 0, 2.5);
  maze4a.scale.set(0.10, 0.10, 0.10);
  const maze4aEntity = world.createTransformEntity(maze4a).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 5a
  const maze5a = mazeAsset.clone();
  maze5a.position.set(-25, 0, -5);
  maze5a.scale.set(0.10, 0.10, 0.10);
  const maze5aEntity = world.createTransformEntity(maze5a).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 6a
  const maze6a = mazeAsset.clone();
  maze6a.position.set(-25, 0, -12.5);
  maze6a.scale.set(0.10, 0.10, 0.10);
  const maze6aEntity = world.createTransformEntity(maze6a).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 7a
  const maze7a = mazeAsset.clone();
  maze7a.position.set(-25, 0, -20);
  maze7a.scale.set(0.10, 0.10, 0.10);
  const maze7aEntity = world.createTransformEntity(maze7a).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
    //maze wall 1e
  const maze1e = mazeAsset.clone();
  maze1e.position.set(-20, 0, 20);
  maze1e.scale.set(0.10, 0.10, 0.10);
  const maze1eEntity = world.createTransformEntity(maze1e).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 2e
  const maze2e = mazeAsset.clone();
  maze2e.position.set(-20, 0, 17.5);
  maze2e.scale.set(0.10, 0.10, 0.10);
  const maze2eEntity = world.createTransformEntity(maze2e).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 3e
  const maze3e = mazeAsset.clone();
  maze3e.position.set(-20, 0, 10);
  maze3e.scale.set(0.10, 0.10, 0.10);
  const maze3eEntity = world.createTransformEntity(maze3e).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 4e
  const maze4e = mazeAsset.clone();
  maze4e.position.set(-20, 0, 2.5);
  maze4e.scale.set(0.10, 0.10, 0.10);
  const maze4eEntity = world.createTransformEntity(maze4e).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 5e
  const maze5e = mazeAsset.clone();
  maze5e.position.set(-20, 0, -5);
  maze5e.scale.set(0.10, 0.10, 0.10);
  const maze5eEntity = world.createTransformEntity(maze5e).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });


  //back side
    //maze wall 1b
  const maze1b = mazeAsset.clone();
  maze1b.position.set(25, 0, 25);
  maze1b.rotation.y = Math.PI / 2;
  maze1b.scale.set(0.10, 0.10, 0.10);
  const maze1bEntity = world.createTransformEntity(maze1b).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 2b
  const maze2b = mazeAsset.clone();
  maze2b.position.set(17.5, 0, 25);
  maze2b.rotation.y = Math.PI / 2;
  maze2b.scale.set(0.10, 0.10, 0.10);
  const maze2bEntity = world.createTransformEntity(maze2b).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 3b
  const maze3b = mazeAsset.clone();
  maze3b.position.set(10, 0, 25);
  maze3b.rotation.y = Math.PI / 2;
  maze3b.scale.set(0.10, 0.10, 0.10);
  const maze3bEntity = world.createTransformEntity(maze3b).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 4b
  const maze4b = mazeAsset.clone();
  maze4b.position.set(2.5, 0, 25);
  maze4b.rotation.y = Math.PI / 2;
  maze4b.scale.set(0.10, 0.10, 0.10);
  const maze4bEntity = world.createTransformEntity(maze4b).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 5b
  const maze5b = mazeAsset.clone();
  maze5b.position.set(-5, 0, 25);
  maze5b.rotation.y = Math.PI / 2;
  maze5b.scale.set(0.10, 0.10, 0.10);
  const maze5bEntity = world.createTransformEntity(maze5b).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 6b
  const maze6b = mazeAsset.clone();
  maze6b.position.set(-12.5, 0, 25);
  maze6b.rotation.y = Math.PI / 2;
  maze6b.scale.set(0.10, 0.10, 0.10);
  const maze6bEntity = world.createTransformEntity(maze6b).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 7b
  const maze7b = mazeAsset.clone();
  maze7b.position.set(-20, 0, 25);
  maze7b.rotation.y = Math.PI / 2;
  maze7b.scale.set(0.10, 0.10, 0.10);
  const maze7bEntity = world.createTransformEntity(maze7b).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 1g
  const maze1g = mazeAsset.clone();
  maze1g.position.set(20, 0, 20);
  maze1g.rotation.y = Math.PI / 2;
  maze1g.scale.set(0.10, 0.10, 0.10);
  const maze1gEntity = world.createTransformEntity(maze1g).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 2g
  const maze2g = mazeAsset.clone();
  maze2g.position.set(17.5, 0, 20);
  maze2g.rotation.y = Math.PI / 2;
  maze2g.scale.set(0.10, 0.10, 0.10);
  const maze2gEntity = world.createTransformEntity(maze2g).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 3g
  const maze3g = mazeAsset.clone();
  maze3g.position.set(10, 0, 20);
  maze3g.rotation.y = Math.PI / 2;
  maze3g.scale.set(0.10, 0.10, 0.10);
  const maze3gEntity = world.createTransformEntity(maze3g).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 4g
  const maze4g = mazeAsset.clone();
  maze4g.position.set(2.5, 0, 20);
  maze4g.rotation.y = Math.PI / 2;
  maze4g.scale.set(0.10, 0.10, 0.10);
  const maze4gEntity = world.createTransformEntity(maze4g).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 5g
  const maze5g = mazeAsset.clone();
  maze5g.position.set(-5, 0, 20);
  maze5g.rotation.y = Math.PI / 2;
  maze5g.scale.set(0.10, 0.10, 0.10);
  const maze5gEntity = world.createTransformEntity(maze5g).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 6g
  const maze6g = mazeAsset.clone();
  maze6g.position.set(-12.5, 0, 20);
  maze6g.rotation.y = Math.PI / 2;
  maze6g.scale.set(0.10, 0.10, 0.10);
  const maze6gEntity = world.createTransformEntity(maze6g).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });

  //front side
    //maze wall 1c
  const maze1c = mazeAsset.clone();
  maze1c.position.set(25, 0, -25);
  maze1c.rotation.y = Math.PI / 2;
  maze1c.scale.set(0.10, 0.10, 0.10);
  const maze1cEntity = world.createTransformEntity(maze1c).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 2c
  const maze2c = mazeAsset.clone();
  maze2c.position.set(17.5, 0, -25);
  maze2c.rotation.y = Math.PI / 2;
  maze2c.scale.set(0.10, 0.10, 0.10);
  const maze2cEntity = world.createTransformEntity(maze2c).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 3c
  const maze3c = mazeAsset.clone();
  maze3c.position.set(10, 0, -25);
  maze3c.rotation.y = Math.PI / 2;
  maze3c.scale.set(0.10, 0.10, 0.10);
  const maze3cEntity = world.createTransformEntity(maze3c).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 4c
  const maze4c = mazeAsset.clone();
  maze4c.position.set(2.5, 0, -25);
  maze4c.rotation.y = Math.PI / 2;
  maze4c.scale.set(0.10, 0.10, 0.10);
  const maze4cEntity = world.createTransformEntity(maze4c).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 5c
  const maze5c = mazeAsset.clone();
  maze5c.position.set(-5, 0, -25);
  maze5c.rotation.y = Math.PI / 2;
  maze5c.scale.set(0.10, 0.10, 0.10);
  const maze5cEntity = world.createTransformEntity(maze5c).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 6c
  const maze6c = mazeAsset.clone();
  maze6c.position.set(-12.5, 0, -25);
  maze6c.rotation.y = Math.PI / 2;
  maze6c.scale.set(0.10, 0.10, 0.10);
  const maze6cEntity = world.createTransformEntity(maze6c).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall 7c
  const maze7c = mazeAsset.clone();
  maze7c.position.set(-20, 0, -25);
  maze7c.rotation.y = Math.PI / 2;
  maze7c.scale.set(0.10, 0.10, 0.10);
  const maze7cEntity = world.createTransformEntity(maze7c).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall d
  const maze1d = mazeAsset.clone();
  maze1d.position.set(20, 0, -20);
  maze1d.rotation.y = Math.PI / 2;
  maze1d.scale.set(0.10, 0.10, 0.10);
  const maze1dEntity = world.createTransformEntity(maze1d).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  const maze2d = mazeAsset.clone();
  maze2d.position.set(17.5, 0, -20);
  maze2d.rotation.y = Math.PI / 2;
  maze2d.scale.set(0.10, 0.10, 0.10);
  const maze2dEntity = world.createTransformEntity(maze2d).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  const maze3d = mazeAsset.clone();
  maze3d.position.set(10, 0, -20);
  maze3d.rotation.y = Math.PI / 2;
  maze3d.scale.set(0.10, 0.10, 0.10);
  const maze3dEntity = world.createTransformEntity(maze3d).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  const maze4d = mazeAsset.clone();
  maze4d.position.set(2.5, 0, -20);
  maze4d.rotation.y = Math.PI / 2;
  maze4d.scale.set(0.10, 0.10, 0.10);
  const maze4dEntity = world.createTransformEntity(maze4d).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  const maze5d = mazeAsset.clone();
  maze5d.position.set(-5, 0, -20);
  maze5d.rotation.y = Math.PI / 2;
  maze5d.scale.set(0.10, 0.10, 0.10);
  const maze5dEntity = world.createTransformEntity(maze5d).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  const maze6d = mazeAsset.clone();
  maze6d.position.set(-12.5, 0, -20);
  maze6d.rotation.y = Math.PI / 2;
  maze6d.scale.set(0.10, 0.10, 0.10);
  const maze6dEntity = world.createTransformEntity(maze6d).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  const maze7d = mazeAsset.clone();
  maze7d.position.set(-20, 0, -20);
  maze7d.rotation.y = Math.PI / 2;
  maze7d.scale.set(0.10, 0.10, 0.10);
  const maze7dEntity = world.createTransformEntity(maze7d).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  //maze wall h
  const maze2h = mazeAsset.clone();
  maze2h.position.set(15, 0, -15);
  maze2h.rotation.y = Math.PI / 2;
  maze2h.scale.set(0.10, 0.10, 0.10);
  const maze2hEntity = world.createTransformEntity(maze2h).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  const maze3h = mazeAsset.clone();
  maze3h.position.set(10, 0, -15);
  maze3h.rotation.y = Math.PI / 2;
  maze3h.scale.set(0.10, 0.10, 0.10);
  const maze3hEntity = world.createTransformEntity(maze3h).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  const maze4h = mazeAsset.clone();
  maze4h.position.set(2.5, 0, -15);
  maze4h.rotation.y = Math.PI / 2;
  maze4h.scale.set(0.10, 0.10, 0.10);
  const maze4hEntity = world.createTransformEntity(maze4h).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  const maze5h = mazeAsset.clone();
  maze5h.position.set(-5, 0, -15);
  maze5h.rotation.y = Math.PI / 2;
  maze5h.scale.set(0.10, 0.10, 0.10);
  const maze5hEntity = world.createTransformEntity(maze5h).addComponent(PhysicsShape, { 
    shape: PhysicsShapeType.Auto }).addComponent(PhysicsBody, { state: PhysicsState.Static });
  const maze6h = mazeAsset.clone();
  maze6h.position.set(-12.5, 0, -15);
  maze6h.rotation.y = Math.PI / 2;
  maze6h.scale.set(0.10, 0.10, 0.10);
  const maze6hEntity = world.createTransformEntity(maze6h).addComponent(PhysicsShape, { 
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
