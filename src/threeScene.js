import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

let targetCameraPos = new THREE.Vector3(0, 10, 35);
let targetCameraLookAt = new THREE.Vector3(0, 5, -10);

export function updateCameraScroll(progress) {
  // Creates a cinematic flythrough based on scroll progress (0.0 to 1.0)
  if (progress < 0.25) {
    const p = progress / 0.25;
    targetCameraPos.lerpVectors(new THREE.Vector3(0, 10, 35), new THREE.Vector3(0, 2, 15), p);
    targetCameraLookAt.lerpVectors(new THREE.Vector3(0, 5, -10), new THREE.Vector3(0, 2, -20), p);
  } else if (progress < 0.6) {
    const p = (progress - 0.25) / 0.35;
    targetCameraPos.lerpVectors(new THREE.Vector3(0, 2, 15), new THREE.Vector3(0, 0.5, -5), p);
    targetCameraLookAt.lerpVectors(new THREE.Vector3(0, 2, -20), new THREE.Vector3(0, 10, -25), p);
  } else {
    const p = (progress - 0.6) / 0.4;
    targetCameraPos.lerpVectors(new THREE.Vector3(0, 0.5, -5), new THREE.Vector3(0, 25, -12), p);
    targetCameraLookAt.lerpVectors(new THREE.Vector3(0, 10, -25), new THREE.Vector3(0, 40, -25), p);
  }
}

export function initThreeScene() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf6f8fc);
  scene.fog = new THREE.Fog(0xf6f8fc, 10, 80);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 250);
  camera.position.copy(targetCameraPos);
  
  // Custom Post-Processing for Bloom
  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  bloomPass.threshold = 0.6; // Only extremely bright things bloom
  bloomPass.strength = 1.6;
  bloomPass.radius = 0.5;

  const composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(15, 30, 20);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 100;
  dirLight.shadow.camera.left = -40;
  dirLight.shadow.camera.right = 40;
  dirLight.shadow.camera.top = 40;
  dirLight.shadow.camera.bottom = -40;
  dirLight.shadow.bias = -0.0005;
  scene.add(dirLight);

  // Massive GPU Core Background
  const gpuGroup = new THREE.Group();
  gpuGroup.position.set(0, -2, -25);
  scene.add(gpuGroup);

  const gpuMat = new THREE.MeshStandardMaterial({
    color: 0x1a1c23,
    metalness: 0.9,
    roughness: 0.2,
  });

  const coreGeo = new THREE.BoxGeometry(80, 80, 10);
  const coreMesh = new THREE.Mesh(coreGeo, gpuMat);
  coreMesh.position.y = 40;
  coreMesh.receiveShadow = true;
  coreMesh.castShadow = true;
  gpuGroup.add(coreMesh);

  const finGeo = new THREE.BoxGeometry(75, 75, 1.5);
  const finMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 1.0, roughness: 0.3 });
  for (let z = 0; z < 6; z += 1.5) {
      if (z === 0) continue;
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.position.set(0, 40, 5 + z);
      fin.receiveShadow = true;
      fin.castShadow = true;
      gpuGroup.add(fin);
  }

  // Glowing GPU seams
  const seamGeo = new THREE.PlaneGeometry(76, 1.5);
  const seamMat = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0xff0a00,
      emissiveIntensity: 0.0,
  });
  
  const seams = [];
  for (let y = 10; y < 70; y += 8) {
      const seam = new THREE.Mesh(seamGeo, seamMat.clone());
      seam.position.set(0, y, 10.1);
      gpuGroup.add(seam);
      seams.push(seam);
  }

  const coreLight = new THREE.PointLight(0xff1100, 0, 90);
  coreLight.position.set(0, 10, 12);
  gpuGroup.add(coreLight);

  // Floor
  const floorGeo = new THREE.PlaneGeometry(250, 250);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xe5e9eb,
    metalness: 0.4,
    roughness: 0.1,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Circuits
  const traces = [];
  const padGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.1, 32);
  const padMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.1,
  });

  const traceMaterial = new THREE.MeshStandardMaterial({
      color: 0xc8ced4,
      metalness: 1.0,
      roughness: 0.2
  });

  for (let i = 0; i < 30; i++) {
    const startX = (Math.random() - 0.5) * 80;
    const startZ = Math.random() * 45; 
    
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(startX, 0.05, startZ);
    pad.receiveShadow = true;
    scene.add(pad);

    const points = [];
    points.push(new THREE.Vector3(startX, 0.05, startZ));
    
    const zTurn = -5 + (Math.random() - 0.5) * 15; 
    points.push(new THREE.Vector3(startX, 0.05, zTurn));
    
    const targetX = startX * 0.1;
    points.push(new THREE.Vector3(targetX, 0.05, zTurn));

    const endZ = -20;
    points.push(new THREE.Vector3(targetX, 0.05, endZ));
    
    for(let j=0; j<points.length-1; j++) {
        const p1 = points[j];
        const p2 = points[j+1];
        const dist = p1.distanceTo(p2);
        if (dist === 0) continue;
        
        const boxGeo = new THREE.BoxGeometry(0.5, 0.06, dist);
        const box = new THREE.Mesh(boxGeo, traceMaterial);
        
        box.position.copy(p1).lerp(p2, 0.5);
        box.lookAt(p2);
        box.receiveShadow = true;
        scene.add(box);
    }

    traces.push({
      start: new THREE.Vector3(startX, 0.1, startZ),
      waypoints: points
    });
  }

  // Physics Arrays
  const droplets = [];
  const dropletGeo = new THREE.SphereGeometry(0.4, 64, 64);
  const oilMat = new THREE.MeshPhysicalMaterial({
    color: 0x010101,
    metalness: 1.0,
    roughness: 0.0,
    clearcoat: 1.0,
    ior: 1.5
  });

  function spawnDroplet() {
    const mesh = new THREE.Mesh(dropletGeo, oilMat);
    const traceData = traces[Math.floor(Math.random() * traces.length)];
    mesh.position.set(traceData.start.x, 30 + Math.random() * 20, traceData.start.z);
    mesh.castShadow = true;
    scene.add(mesh);
    droplets.push({ mesh, traceData, velocity: 0 });
  }

  for (let i=0; i<12; i++) spawnDroplet();
  
  const splashes = [];
  const splashGeo = new THREE.SphereGeometry(0.12, 16, 16);

  function createSplash(position) {
     const count = 12 + Math.floor(Math.random() * 6);
     for(let i=0; i<count; i++) {
        const mesh = new THREE.Mesh(splashGeo, oilMat);
        mesh.position.copy(position);
        mesh.position.y += 0.2;
        mesh.castShadow = true;
        scene.add(mesh);
        
        const vel = new THREE.Vector3((Math.random() - 0.5) * 8, Math.random() * 10 + 4, (Math.random() - 0.5) * 8);
        splashes.push({ mesh, vel, life: 1.0 });
     }
  }

  const runs = [];
  const runGeo = new THREE.CapsuleGeometry(0.3, 2.5, 16, 16);
  runGeo.rotateX(Math.PI/2); 

  const runMat = new THREE.MeshStandardMaterial({
      color: 0xffaaaa,
      emissive: 0xff0a00,
      emissiveIntensity: 10.0 // Extreme intensity for Bloom
  });

  function spawnRun(traceData) {
     const mesh = new THREE.Mesh(runGeo, runMat);
     mesh.position.copy(traceData.waypoints[0]);
     scene.add(mesh);

     const light = new THREE.PointLight(0xff0800, 3.0, 10);
     mesh.add(light);
     
     if (traceData.waypoints.length > 1) {
         mesh.lookAt(traceData.waypoints[1]);
     }

     runs.push({
        mesh,
        waypoints: traceData.waypoints,
        currentWp: 0,
        progress: 0,
        speed: 0.015 + Math.random() * 0.005
     });
  }

  let mouseX = 0;
  let mouseY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
  });

  const clock = new THREE.Clock();
  let gpuFlashTimer = 0;
  let simulatedCameraPos = new THREE.Vector3().copy(targetCameraPos);
  let simulatedCameraLookAt = new THREE.Vector3().copy(targetCameraLookAt);

  function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.1);

    // Camera Interpolation for Flythrough
    simulatedCameraPos.lerp(targetCameraPos, 0.08);
    simulatedCameraLookAt.lerp(targetCameraLookAt, 0.08);

    camera.position.copy(simulatedCameraPos);
    
    // Tiny Parallax additive
    const parallaxX = (mouseX * 0.005);
    const parallaxY = (mouseY * 0.005);
    camera.position.x += parallaxX;
    camera.position.y += parallaxY;

    camera.lookAt(simulatedCameraLookAt.x + parallaxX, simulatedCameraLookAt.y + parallaxY, simulatedCameraLookAt.z);

    // Droplet physics
    for (let i=0; i<droplets.length; i++) {
        const drop = droplets[i];
        drop.velocity += 18 * delta; 
        drop.mesh.position.y -= drop.velocity * delta;
        
        const stretch = Math.min(1 + drop.velocity * 0.03, 3.0);
        const squish = 1 / Math.sqrt(stretch);
        drop.mesh.scale.set(squish, stretch, squish);

        if (drop.mesh.position.y <= drop.traceData.start.y + 0.2) {
           createSplash(drop.traceData.start);
           spawnRun(drop.traceData);
           
           const newTrace = traces[Math.floor(Math.random() * traces.length)];
           drop.mesh.position.set(newTrace.start.x, 30 + Math.random() * 50, newTrace.start.z);
           drop.traceData = newTrace;
           drop.velocity = 0;
           drop.mesh.scale.setScalar(1);
        }
    }
    
    // Splashes 
    for(let i=splashes.length-1; i>=0; i--) {
       const sp = splashes[i];
       sp.vel.y -= 25 * delta; 
       sp.mesh.position.addScaledVector(sp.vel, delta);
       sp.life -= delta * 1.5;
       sp.mesh.scale.setScalar(Math.max(sp.life, 0.001));

       if(sp.life <= 0 || sp.mesh.position.y <= 0.05) {
          scene.remove(sp.mesh);
          splashes.splice(i,1);
       }
    }

    // Circuit Runs 
    for(let i=runs.length-1; i>=0; i--) {
        const run = runs[i];
        if (run.currentWp >= run.waypoints.length - 1) {
           gpuFlashTimer = 1.0;
           scene.remove(run.mesh);
           run.mesh.geometry.dispose();
           runs.splice(i,1);
           continue;
        }

        const p1 = run.waypoints[run.currentWp];
        const p2 = run.waypoints[run.currentWp + 1];
        const dist = p1.distanceTo(p2);
        
        if (dist > 0) {
            run.progress += (run.speed * 20 * delta) / dist;
        } else {
            run.progress = 1;
        }
        
        if (run.progress >= 1) {
           run.mesh.position.copy(p2);
           run.currentWp++;
           run.progress = 0;
           if (run.currentWp < run.waypoints.length - 1) {
              run.mesh.lookAt(run.waypoints[run.currentWp + 1]);
           }
        } else {
           run.mesh.position.copy(p1).lerp(p2, run.progress);
        }
    }
    
    // GPU Lighting
    if (gpuFlashTimer > 0) {
       gpuFlashTimer -= delta * 1.2;
       coreLight.intensity = Math.min(25, coreLight.intensity + delta * 100);
       seams.forEach(seam => {
          seam.material.emissiveIntensity = 8.0 * Math.max(0, gpuFlashTimer);
       });
    } else {
       if (coreLight.intensity > 0) {
          coreLight.intensity = Math.max(0, coreLight.intensity - delta * 15);
       }
       seams.forEach(seam => {
          if (seam.material.emissiveIntensity > 0) {
              seam.material.emissiveIntensity = Math.max(0, seam.material.emissiveIntensity - delta * 5);
          }
       });
    }

    // Use Composer instead of renderer for Bloom
    composer.render();
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  });
}
