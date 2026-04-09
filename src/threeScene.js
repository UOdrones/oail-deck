import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export function initThreeScene() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // Video-game quality tone mapping for PBR realism
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfdfdfd);
  scene.fog = new THREE.Fog(0xfdfdfd, 20, 80);

  // High-end Environment Map for Hyper-realistic Oil Reflections
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

  // Camera setup
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 10, 35);
  camera.lookAt(0, 5, -10);

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

  // Main Core Base
  const coreGeo = new THREE.BoxGeometry(80, 60, 10);
  const coreMesh = new THREE.Mesh(coreGeo, gpuMat);
  coreMesh.position.y = 30; // Towering into the background
  coreMesh.receiveShadow = true;
  coreMesh.castShadow = true;
  gpuGroup.add(coreMesh);

  // Advanced Heat Fins on GPU
  const finGeo = new THREE.BoxGeometry(75, 50, 1.5);
  const finMat = new THREE.MeshStandardMaterial({ color: 0x0f0f0f, metalness: 1.0, roughness: 0.3 });
  for (let z = 0; z < 6; z += 1.5) {
      if (z === 0) continue;
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.position.set(0, 30, 5 + z);
      fin.receiveShadow = true;
      fin.castShadow = true;
      gpuGroup.add(fin);
  }

  // Glowing GPU seams (Emissive Lines)
  const seamGeo = new THREE.PlaneGeometry(76, 1.5);
  const seamMat = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0xff0800,
      emissiveIntensity: 0.0, // defaults to off
  });
  
  const seams = [];
  for (let y = 10; y < 50; y += 8) {
      const seam = new THREE.Mesh(seamGeo, seamMat.clone());
      seam.position.set(0, y, 10.1);
      gpuGroup.add(seam);
      seams.push(seam);
  }

  // Center GPU Flash
  const coreLight = new THREE.PointLight(0xff1100, 0, 70);
  coreLight.position.set(0, 5, 12);
  gpuGroup.add(coreLight);

  // Clean White Floor
  const floorGeo = new THREE.PlaneGeometry(200, 200);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xe8ecef, // Slightly cool white
    metalness: 0.3,  // Metallic reflection
    roughness: 0.15, // Smooth but not a mirror
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Circuit Ends and physical floor traces
  const traces = [];
  const padGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.1, 32);
  const padMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.1,
  });

  const traceMaterial = new THREE.MeshStandardMaterial({
      color: 0xd0d5db,
      metalness: 1.0,
      roughness: 0.2
  });

  for (let i = 0; i < 24; i++) {
    const startX = (Math.random() - 0.5) * 60;
    const startZ = Math.random() * 35; // Spread out toward camera
    
    // The "Circuit End" target pad
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(startX, 0.05, startZ);
    pad.receiveShadow = true;
    scene.add(pad);

    const points = [];
    points.push(new THREE.Vector3(startX, 0.05, startZ));
    
    // 90-degree orthogonal paths for realistic circuit visual
    const zTurn = -5 + (Math.random() - 0.5) * 15; 
    points.push(new THREE.Vector3(startX, 0.05, zTurn));
    
    const targetX = startX * 0.15; // funnels into the massive base
    points.push(new THREE.Vector3(targetX, 0.05, zTurn));

    const endZ = -20; // Goes all the way into the massive GPU board
    points.push(new THREE.Vector3(targetX, 0.05, endZ));
    
    // Render actual deep trace lines built into the floor
    for(let j=0; j<points.length-1; j++) {
        const p1 = points[j];
        const p2 = points[j+1];
        const dist = p1.distanceTo(p2);
        if (dist === 0) continue;
        
        const boxGeo = new THREE.BoxGeometry(0.4, 0.06, dist);
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

  // Hyper-realistic Oil Droplets
  const droplets = [];
  const dropletGeo = new THREE.SphereGeometry(0.4, 64, 64);
  const oilMat = new THREE.MeshPhysicalMaterial({
    color: 0x010101,     // Pitch black base
    metalness: 1.0,      // Max metalness for strong liquid reflections
    roughness: 0.0,      // Pristine smooth surface
    clearcoat: 1.0,      // High gloss layer
    clearcoatRoughness: 0.0,
    ior: 1.5             // Realistic fluid index of refraction
  });

  function spawnDroplet() {
    const mesh = new THREE.Mesh(dropletGeo, oilMat);
    const traceData = traces[Math.floor(Math.random() * traces.length)];
    
    // Start high up to drop beautifully
    mesh.position.set(traceData.start.x, 25 + Math.random() * 20, traceData.start.z);
    mesh.castShadow = true;
    scene.add(mesh);
    
    droplets.push({
      mesh,
      traceData,
      velocity: 0,
    });
  }

  // Init Droplets
  for (let i=0; i<10; i++) spawnDroplet();
  
  // Real Physics Splash Arrays
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
        
        const vel = new THREE.Vector3(
           (Math.random() - 0.5) * 8, // Burst outwards
           Math.random() * 10 + 4,    // Arc upwards
           (Math.random() - 0.5) * 8
        );
        splashes.push({ mesh, vel, life: 1.0 });
     }
  }

  // Glowing "Reddish Runs" that traverse the traces
  const runs = [];
  const runGeo = new THREE.CapsuleGeometry(0.25, 2.0, 16, 16);
  runGeo.rotateX(Math.PI/2); // Align capsule natively along the Z axis

  const runMat = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0a00,
      emissiveIntensity: 6.0
  });

  function spawnRun(traceData) {
     const mesh = new THREE.Mesh(runGeo, runMat);
     mesh.position.copy(traceData.waypoints[0]);
     scene.add(mesh);

     // Emit light natively across the white floor as it travels
     const light = new THREE.PointLight(0xff0800, 2.5, 7);
     mesh.add(light);
     
     // Point correctly exactly at birth
     if (traceData.waypoints.length > 1) {
         mesh.lookAt(traceData.waypoints[1]);
     }

     runs.push({
        mesh,
        waypoints: traceData.waypoints,
        currentWp: 0,
        progress: 0,
        speed: 0.015 + Math.random() * 0.005 // Moving SLOWLY as requested
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

  function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.1);

    // Smooth Mouse Parallax
    camera.position.x += (mouseX * 0.012 - camera.position.x) * 0.05;
    camera.position.y += (10 + mouseY * 0.012 - camera.position.y) * 0.05;
    camera.lookAt(0, 6, -10);

    // Droplet physics & rendering
    for (let i=0; i<droplets.length; i++) {
        const drop = droplets[i];
        drop.velocity += 18 * delta; // Native gravity accel
        drop.mesh.position.y -= drop.velocity * delta;
        
        // Stretch droplet dynamically based on fall velocity to look perfectly liquid
        const stretch = Math.min(1 + drop.velocity * 0.03, 3.0);
        const squish = 1 / Math.sqrt(stretch);
        drop.mesh.scale.set(squish, stretch, squish);

        if (drop.mesh.position.y <= drop.traceData.start.y + 0.2) {
           createSplash(drop.traceData.start);
           spawnRun(drop.traceData);
           
           // Immediate reset out of view
           const newTrace = traces[Math.floor(Math.random() * traces.length)];
           drop.mesh.position.set(newTrace.start.x, 30 + Math.random() * 50, newTrace.start.z);
           drop.traceData = newTrace;
           drop.velocity = 0;
           drop.mesh.scale.setScalar(1);
        }
    }
    
    // Splashes physics execution
    for(let i=splashes.length-1; i>=0; i--) {
       const sp = splashes[i];
       sp.vel.y -= 25 * delta; // Splash arching gravity
       sp.mesh.position.addScaledVector(sp.vel, delta);
       sp.life -= delta * 1.5;
       
       sp.mesh.scale.setScalar(sp.life); // Fade out size organically

       // Destroy if floor is hit or dead
       if(sp.life <= 0 || sp.mesh.position.y <= 0.05) {
          scene.remove(sp.mesh);
          splashes.splice(i,1);
       }
    }

    // Circuit Runs traversal
    for(let i=runs.length-1; i>=0; i--) {
        const run = runs[i];
        if (run.currentWp >= run.waypoints.length - 1) {
           // Impacted GPU!
           gpuFlashTimer = 1.0;
           scene.remove(run.mesh);
           run.mesh.geometry.dispose();
           runs.splice(i,1);
           continue;
        }

        const p1 = run.waypoints[run.currentWp];
        const p2 = run.waypoints[run.currentWp + 1];
        
        const dist = p1.distanceTo(p2);
        
        // Normalize speed to distance so it crawls slowly and evenly
        if (dist > 0) {
            const progressIncrement = (run.speed * 20 * delta) / dist;
            run.progress += progressIncrement;
        } else {
            run.progress = 1;
        }
        
        if (run.progress >= 1) {
           run.mesh.position.copy(p2);
           run.currentWp++;
           run.progress = 0;
           
           // Turn exactly 90 deg directly towards next waypoint
           if (run.currentWp < run.waypoints.length - 1) {
              const nextP2 = run.waypoints[run.currentWp + 1];
              run.mesh.lookAt(nextP2);
           }
        } else {
           run.mesh.position.copy(p1).lerp(p2, run.progress);
        }
    }
    
    // Smooth GPU Core Lighting
    if (gpuFlashTimer > 0) {
       gpuFlashTimer -= delta * 1.2;
       coreLight.intensity = Math.min(18, coreLight.intensity + delta * 80);
       seams.forEach(seam => {
          seam.material.emissiveIntensity = 8.0 * Math.max(0, gpuFlashTimer);
       });
    } else {
       if (coreLight.intensity > 0) {
          // Fade down naturally
          coreLight.intensity = Math.max(0, coreLight.intensity - delta * 15);
       }
       seams.forEach(seam => {
          if (seam.material.emissiveIntensity > 0) {
              seam.material.emissiveIntensity = Math.max(0, seam.material.emissiveIntensity - delta * 5);
          }
       });
    }

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
}
