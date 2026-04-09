import * as THREE from 'three';

export function initThreeScene() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf1f3f5); // Soft white room background
  scene.fog = new THREE.Fog(0xf1f3f5, 10, 60); // Fade into white

  // Camera
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 150);
  camera.position.set(0, 15, 25);
  camera.lookAt(0, 0, -5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambientLight);
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(20, 30, 10);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 100;
  dirLight.shadow.camera.left = -30;
  dirLight.shadow.camera.right = 30;
  dirLight.shadow.camera.top = 30;
  dirLight.shadow.camera.bottom = -30;
  scene.add(dirLight);

  // The Floor (Chip surface)
  const floorGeo = new THREE.PlaneGeometry(100, 100);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.15,
    metalness: 0.05
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // The GPU Processor
  const gpuGroup = new THREE.Group();
  gpuGroup.position.set(0, 0.8, -12);
  scene.add(gpuGroup);

  const gpuGeo = new THREE.BoxGeometry(6, 1.6, 6);
  const gpuMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.9,
    roughness: 0.1,
  });
  const gpu = new THREE.Mesh(gpuGeo, gpuMat);
  gpu.castShadow = true;
  gpu.receiveShadow = true;
  gpuGroup.add(gpu);

  // GPU Light emission
  const gpuLight = new THREE.PointLight(0xb91c1c, 0, 30);
  gpuLight.position.set(0, 2, 0);
  gpuGroup.add(gpuLight);

  // Add some aesthetic fins to GPU
  const finMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 1 });
  for (let i=-2; i<=2; i+=0.5) {
     const fin = new THREE.Mesh(new THREE.BoxGeometry(5.8, 2, 0.2), finMat);
     fin.position.set(0, 0, i);
     fin.castShadow = true;
     gpuGroup.add(fin);
  }

  // Circuit Traces
  const traces = []; 
  // Arrays to hold the routing logic
  for (let i = 0; i < 25; i++) {
    // Random input spots scattered around the floor
    const startPt = new THREE.Vector3(
      (Math.random() - 0.5) * 50,
      0.01,
      (Math.random() - 0.5) * 30 + 5
    );

    // Filter points too close to GPU to avoid clipping
    if (startPt.distanceTo(gpuGroup.position) < 8) continue;

    const points = [];
    points.push(startPt);
    
    // Orthogonal routing for circuit board look
    const turn1 = new THREE.Vector3(startPt.x, 0.01, gpuGroup.position.z + (Math.random()-0.5)*2);
    points.push(turn1);
    
    const turn2 = new THREE.Vector3(gpuGroup.position.x + (Math.random()-0.5)*4, 0.01, turn1.z);
    points.push(turn2);

    const endPt = new THREE.Vector3(turn2.x, 0.01, gpuGroup.position.z);
    points.push(endPt);

    const traceGeo = new THREE.BufferGeometry().setFromPoints(points);
    const traceMat = new THREE.LineBasicMaterial({ color: 0xcccccc, linewidth: 2 });
    const traceLine = new THREE.Line(traceGeo, traceMat);
    scene.add(traceLine);
    
    traces.push({
      start: startPt,
      waypoints: [startPt, turn1, turn2, endPt]
    });
  }

  // Droplets
  const droplets = [];
  const dropletGeo = new THREE.SphereGeometry(0.3, 32, 32);
  // Dripping black oil
  const dropletMat = new THREE.MeshPhysicalMaterial({
    color: 0x050505,
    metalness: 1.0,
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });

  function spawnDroplet() {
    const mesh = new THREE.Mesh(dropletGeo, dropletMat);
    const traceData = traces[Math.floor(Math.random() * traces.length)];
    
    mesh.position.set(traceData.start.x, 20 + Math.random() * 15, traceData.start.z);
    mesh.castShadow = true;
    scene.add(mesh);
    
    droplets.push({
      mesh,
      traceData,
      velocity: 0
    });
  }

  // Initialize droplets
  for (let i=0; i<8; i++) spawnDroplet();

  // AI Data Packets shooting down traces
  const packets = [];
  function spawnPacket(traceData) {
    const packetGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const packetMat = new THREE.MeshBasicMaterial({ color: 0xe11d48 });
    const mesh = new THREE.Mesh(packetGeo, packetMat);
    
    mesh.position.copy(traceData.start);
    scene.add(mesh);
    
    const light = new THREE.PointLight(0xe11d48, 2, 5);
    mesh.add(light);
    
    packets.push({
      mesh,
      waypoints: traceData.waypoints,
      currentWaypoint: 0,
      progress: 0,
      speed: 0.04 + Math.random() * 0.03
    });
  }

  // Splash Effect
  const splashes = [];
  function createSplash(position) {
    const splashGeo = new THREE.BufferGeometry();
    const count = 15;
    const posArray = new Float32Array(count * 3);
    const vels = [];
    for(let i=0; i<count; i++) {
        posArray[i*3] = position.x;
        posArray[i*3+1] = position.y;
        posArray[i*3+2] = position.z;
        vels.push(new THREE.Vector3(
           (Math.random()-0.5)*0.3,
           0.1 + Math.random()*0.3,
           (Math.random()-0.5)*0.3
        ));
    }
    splashGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const splashMat = new THREE.PointsMaterial({ color: 0x050505, size: 0.2 }); // Black oil splash
    const points = new THREE.Points(splashGeo, splashMat);
    scene.add(points);
    splashes.push({ points, vels, life: 1.0 });
  }

  // Mouse interaction for slight parallax
  let mouseX = 0;
  let mouseY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.1);
    
    // Smooth Parallax
    camera.position.x += (mouseX * 0.01 - camera.position.x) * 0.05;
    camera.position.y += (15 + mouseY * 0.01 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, -5);

    // Droplet physics
    for(let i=0; i<droplets.length; i++) {
      const drop = droplets[i];
      drop.velocity += 15 * delta; // Gravity
      drop.mesh.position.y -= drop.velocity * delta;
      
      // Wobble stretch as it falls
      drop.mesh.scale.y = 1 + (drop.velocity * 0.04);
      drop.mesh.scale.x = 1 - (drop.velocity * 0.01);
      drop.mesh.scale.z = 1 - (drop.velocity * 0.01);

      if (drop.mesh.position.y <= 0.1) {
         // Splat!
         createSplash(drop.mesh.position.clone());
         spawnPacket(drop.traceData);
         
         // Reset droplet
         const traceData = traces[Math.floor(Math.random() * traces.length)];
         drop.mesh.position.set(traceData.start.x, 20 + Math.random() * 20, traceData.start.z);
         drop.traceData = traceData;
         drop.velocity = 0;
      }
    }

    // Packet Navigation
    for(let i=packets.length-1; i>=0; i--) {
       const p = packets[i];
       if (p.currentWaypoint >= p.waypoints.length - 1) {
          // Packet reached GPU!
          gpuLight.intensity = Math.min(gpuLight.intensity + 1.0, 5.0); // Flare up the GPU
          scene.remove(p.mesh);
          packets.splice(i, 1);
          continue;
       }
       
       const wpStart = p.waypoints[p.currentWaypoint];
       const wpEnd = p.waypoints[p.currentWaypoint + 1];
       
       p.progress += p.speed;
       p.mesh.position.lerpVectors(wpStart, wpEnd, p.progress);
       
       if (p.progress >= 1) {
          p.progress = 0;
          p.currentWaypoint++;
          p.mesh.position.copy(wpEnd);
       }
    }
    
    // GPU Light fade
    if (gpuLight.intensity > 0) {
       gpuLight.intensity -= delta * 1.5;
    }

    // Splashes physics
    for(let i=splashes.length-1; i>=0; i--) {
       const sp = splashes[i];
       sp.life -= delta * 2;
       if (sp.life <= 0) {
          scene.remove(sp.points);
          sp.points.geometry.dispose();
          sp.points.material.dispose();
          splashes.splice(i,1);
          continue;
       }
       const pos = sp.points.geometry.attributes.position.array;
       for(let j=0; j<sp.vels.length; j++) {
          pos[j*3] += sp.vels[j].x;
          pos[j*3+1] += sp.vels[j].y;
          pos[j*3+2] += sp.vels[j].z;
          sp.vels[j].y -= delta * 1.5; // Gravity
       }
       sp.points.geometry.attributes.position.needsUpdate = true;
       // We fade points by scaling. Since size attenuation is on, we'll fake opacity using size if using simple mat.
       // Actually size attenuation controls scale, opacity for PointsMaterial works fine if transparent.
       sp.points.material.transparent = true;
       sp.points.material.opacity = sp.life;
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
