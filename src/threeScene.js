import * as THREE from 'three';

export function initThreeScene() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  // Add a slight fog to blend with the background organically
  scene.fog = new THREE.FogExp2(0x0a0a0a, 0.02);

  // Camera
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 22;
  camera.position.y = 2;
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);
  
  // A glowing red light in the center to highlight the AI vibe
  const pointLight = new THREE.PointLight(0xb91c1c, 2.5, 50);
  pointLight.position.set(0, 0, 5);
  scene.add(pointLight);

  // Groups
  const droplets = [];
  const aiNodes = [];
  const explosions = [];

  // Geometries & Materials
  // Droplet: dark, incredibly shiny physical material
  const dropletGeo = new THREE.SphereGeometry(0.35, 32, 32);
  const dropletMat = new THREE.MeshPhysicalMaterial({
    color: 0x050505,
    metalness: 0.9,
    roughness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });

  // AI Nodes: geometric wireframe that looks highly technical
  const aiNodeGeo = new THREE.IcosahedronGeometry(0.4, 0);
  const aiNodeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xb91c1c,
    emissiveIntensity: 1.2,
    wireframe: true
  });

  // Create Oil Droplets
  for (let i = 0; i < 70; i++) {
    const mesh = new THREE.Mesh(dropletGeo, dropletMat);
    mesh.position.set(
      (Math.random() - 0.5) * 40,
      10 + Math.random() * 30, // Start high
      (Math.random() - 0.5) * 20
    );
    scene.add(mesh);
    droplets.push({
      mesh,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        -0.03 - Math.random() * 0.04, // Fall downwards
        (Math.random() - 0.5) * 0.01
      ),
      baseScale: 0.5 + Math.random() * 0.8 // Random droplet sizes
    });
  }

  // Create AI Nodes
  for (let i = 0; i < 25; i++) {
    const mesh = new THREE.Mesh(aiNodeGeo, aiNodeMat);
    mesh.position.set(
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 15
    );
    scene.add(mesh);
    aiNodes.push({
      mesh,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      ),
      target: null
    });
  }

  // Cool Explosion Effect
  function createExplosion(position) {
    const explosionGeo = new THREE.BufferGeometry();
    const particleCount = 60;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = [];

    const sparkColor1 = new THREE.Color(0xff4400); // Bright orange/red
    const sparkColor2 = new THREE.Color(0xffcc00); // Yellow/gold

    for (let i = 0; i < particleCount; i++) {
      positions[i*3]     = position.x;
      positions[i*3+1] = position.y;
      positions[i*3+2] = position.z;
      
      // Explosion velocities outwards spherically
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const speed = 0.2 + Math.random() * 0.3;

      velocities.push(new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
        Math.cos(phi) * speed
      ));

      // Colors
      const clr = sparkColor1.clone().lerp(sparkColor2, Math.random());
      colors[i*3]     = clr.r;
      colors[i*3+1] = clr.g;
      colors[i*3+2] = clr.b;
    }
    
    explosionGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    explosionGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const explosionMat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    const explosionPoints = new THREE.Points(explosionGeo, explosionMat);
    scene.add(explosionPoints);
    
    explosions.push({
      points: explosionPoints,
      velocities,
      life: 1.0,
      scale: 1.0
    });
    
    // Create a momentary intense flash of light
    const flash = new THREE.PointLight(0xff5500, 5, 10);
    flash.position.copy(position);
    scene.add(flash);
    setTimeout(() => {
      scene.remove(flash);
      flash.dispose();
    }, 150);
  }

  const clock = new THREE.Clock();

  // Mouse interactivity
  let mouseX = 0;
  let mouseY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
  });

  // Core Animation Loop
  function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.1);
    const time = Date.now();

    // Scene Parallax logic
    scene.rotation.y += 0.05 * ((mouseX * 0.0005) - scene.rotation.y);
    scene.rotation.x += 0.05 * ((mouseY * 0.0005) - scene.rotation.x);

    // Update Droplets
    droplets.forEach(droplet => {
      droplet.mesh.position.add(droplet.velocity);
      
      // Wobbling effect to simulate liquid deformation relative to y-pos
      const wobble = Math.sin(time * 0.005 + droplet.mesh.position.y) * 0.15;
      droplet.mesh.scale.set(
        droplet.baseScale * (1 + wobble),
        droplet.baseScale * (1 - wobble),
        droplet.baseScale * (1 + wobble)
      );
      
      // Reset if it drops off the bottom
      if (droplet.mesh.position.y < -20) {
        droplet.mesh.position.y = 20 + Math.random() * 10;
        droplet.mesh.position.x = (Math.random() - 0.5) * 40;
        droplet.mesh.scale.setScalar(droplet.baseScale);
      }
    });

    // Update AI Nodes (Seeking behavior)
    aiNodes.forEach(node => {
      // Rotating the node for a technical feel
      node.mesh.rotation.x += delta * 1.5;
      node.mesh.rotation.y += delta * 1.5;
      
      let closestDist = Infinity;
      let closestDroplet = null;

      // Find the nearest oil droplet to track
      droplets.forEach(droplet => {
        const dist = node.mesh.position.distanceTo(droplet.mesh.position);
        if (dist < closestDist) {
          closestDist = dist;
          closestDroplet = droplet;
        }
      });

      // Flocking / Seeking Logic
      if (closestDroplet && closestDist < 12) {
        // Accelerate towards the droplet
        const dir = new THREE.Vector3().subVectors(closestDroplet.mesh.position, node.mesh.position).normalize();
        node.velocity.lerp(dir.multiplyScalar(0.2), 0.05); // Smooth turning
        
        // Intensity of the AI node increases when it smells oil!
        node.mesh.material.emissiveIntensity = 2.0;
        node.mesh.scale.setScalar(1 + (12 - closestDist) * 0.05);
      } else {
        // Random wander if nothing is nearby
        node.velocity.x += (Math.random() - 0.5) * 0.03;
        node.velocity.y += (Math.random() - 0.5) * 0.03;
        node.velocity.z += (Math.random() - 0.5) * 0.03;
        
        // Relax intensity and scale
        node.mesh.material.emissiveIntensity = 1.0;
        node.mesh.scale.lerp(new THREE.Vector3(1,1,1), 0.05);
      }

      // Limit Max Speed
      node.velocity.clampLength(0, 0.15);
      node.mesh.position.add(node.velocity);

      // Bounce limits so nodes don't fly off forever
      if (Math.abs(node.mesh.position.x) > 20) node.velocity.x *= -1;
      if (node.mesh.position.y > 20 || node.mesh.position.y < -10) node.velocity.y *= -1;
      if (Math.abs(node.mesh.position.z) > 15) node.velocity.z *= -1;

      // Check Collision!
      if (closestDroplet && closestDist < 0.6 + (closestDroplet.baseScale * 0.35)) {
        // BAM! Collision
        createExplosion(node.mesh.position.clone());
        
        // Reset Droplet high up
        closestDroplet.mesh.position.y = 20 + Math.random() * 10;
        closestDroplet.mesh.position.x = (Math.random() - 0.5) * 40;
        
        // Repel the AI node backward aggressively
        node.velocity.multiplyScalar(-2);
      }
    });

    // Update Explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
      const exp = explosions[i];
      exp.life -= delta * 1.2; // Fade rate
      
      if (exp.life <= 0) {
        scene.remove(exp.points);
        exp.points.geometry.dispose();
        exp.points.material.dispose();
        explosions.splice(i, 1);
        continue;
      }

      const positions = exp.points.geometry.attributes.position.array;
      for (let j = 0; j < exp.velocities.length; j++) {
        // Move particle
        positions[j*3]   += exp.velocities[j].x;
        positions[j*3+1] += exp.velocities[j].y;
        positions[j*3+2] += exp.velocities[j].z;
        
        // Apply gravity & drag to particles for realistic fireworks fall
        exp.velocities[j].y -= 0.008; 
        exp.velocities[j].multiplyScalar(0.96);
      }
      
      exp.points.geometry.attributes.position.needsUpdate = true;
      exp.points.material.opacity = exp.life;
      
      // Expand the points scale slightly over time
      exp.scale += delta;
      exp.points.scale.setScalar(exp.scale);
    }

    // Gentle global scene rotation
    scene.rotation.y += 0.0005;

    renderer.render(scene, camera);
  }

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
}
