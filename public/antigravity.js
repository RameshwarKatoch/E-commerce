class Antigravity {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // The theme uses an earthy, premium green/brown brand. We'll use the accent color text (#CDA15C).
    this.color = options.color || '#CDA15C'; 
    this.count = options.count || 450;
    this.magnetRadius = options.magnetRadius || 20;
    this.ringRadius = options.ringRadius || 4;
    this.waveSpeed = options.waveSpeed || 1.6;
    this.waveAmplitude = options.waveAmplitude || 2.9;
    this.particleSize = options.particleSize || 1;
    this.lerpSpeed = options.lerpSpeed || 0.1;
    this.autoAnimate = options.autoAnimate !== undefined ? options.autoAnimate : false;
    this.particleVariance = options.particleVariance || 2.5;
    this.rotationSpeed = options.rotationSpeed || 0;
    this.depthFactor = options.depthFactor || 1;
    this.pulseSpeed = options.pulseSpeed || 3;
    this.fieldStrength = options.fieldStrength || 10;

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    // Transparent background so we can layer it above the CSS gradients
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(35, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
    this.camera.position.z = 50;

    this.clock = new THREE.Clock();
    this.dummy = new THREE.Object3D();

    this.lastMousePos = { x: 0, y: 0 };
    this.lastMouseMoveTime = 0;
    this.virtualMouse = { x: 0, y: 0 };
    this.pointer = { x: 0, y: 0 }; 

    window.addEventListener('resize', this.onWindowResize.bind(this));
    // Listen to window so effect applies even though container is under an overlay!
    window.addEventListener('pointermove', this.onPointerMove.bind(this));

    this.setupParticles();
    this.createMesh();

    this.animate();
  }

  getViewport() {
    const fov = this.camera.fov * (Math.PI / 180);
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    return { width, height };
  }

  setupParticles() {
    this.particles = [];
    const { width, height } = this.getViewport();

    for (let i = 0; i < this.count; i++) {
      const t = Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      
      const x = (Math.random() - 0.5) * width;
      const y = (Math.random() - 0.5) * height;
      const z = (Math.random() - 0.5) * 20;

      const randomRadiusOffset = (Math.random() - 0.5) * 2;

      this.particles.push({
        t,
        speed,
        mx: x,
        my: y,
        mz: z,
        cx: x,
        cy: y,
        cz: z,
        randomRadiusOffset
      });
    }
  }

  createMesh() {
    // Equivalent of <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
    const geometry = new THREE.CapsuleGeometry(0.1, 0.4, 4, 8);
    const material = new THREE.MeshBasicMaterial({ color: this.color });
    this.mesh = new THREE.InstancedMesh(geometry, material, this.count);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.mesh);
  }

  onPointerMove(event) {
    const rect = this.container.getBoundingClientRect();
    const clientX = event.clientX - rect.left;
    const clientY = event.clientY - rect.top;
    
    const nx = (clientX / rect.width) * 2 - 1;
    const ny = -(clientY / rect.height) * 2 + 1;

    this.pointer.x = nx;
    this.pointer.y = ny;

    const mouseDist = Math.sqrt(Math.pow(this.pointer.x - this.lastMousePos.x, 2) + Math.pow(this.pointer.y - this.lastMousePos.y, 2));

    if (mouseDist > 0.001) {
      this.lastMouseMoveTime = Date.now();
      this.lastMousePos = { x: this.pointer.x, y: this.pointer.y };
    }
  }

  onWindowResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    const viewport = this.getViewport();
    
    let destX = (this.pointer.x * viewport.width) / 2;
    let destY = (this.pointer.y * viewport.height) / 2;

    if (this.autoAnimate && (Date.now() - this.lastMouseMoveTime > 2000)) {
      const time = this.clock.getElapsedTime();
      destX = Math.sin(time * 0.5) * (viewport.width / 4);
      destY = Math.cos(time * 0.5 * 2) * (viewport.height / 4);
    }

    const smoothFactor = 0.05;
    this.virtualMouse.x += (destX - this.virtualMouse.x) * smoothFactor;
    this.virtualMouse.y += (destY - this.virtualMouse.y) * smoothFactor;

    const targetX = this.virtualMouse.x;
    const targetY = this.virtualMouse.y;
    const globalRotation = this.clock.getElapsedTime() * this.rotationSpeed;

    this.particles.forEach((particle, i) => {
      let { speed, mx, my, mz, cz, randomRadiusOffset } = particle;

      particle.t += speed / 2;
      const t = particle.t;

      const projectionFactor = 1 - cz / 50;
      const projectedTargetX = targetX * projectionFactor;
      const projectedTargetY = targetY * projectionFactor;

      const dx = mx - projectedTargetX;
      const dy = my - projectedTargetY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let targetPos = { x: mx, y: my, z: mz * this.depthFactor };

      if (dist < this.magnetRadius) {
        const angle = Math.atan2(dy, dx) + globalRotation;
        const wave = Math.sin(t * this.waveSpeed + angle) * (0.5 * this.waveAmplitude);
        const deviation = randomRadiusOffset * (5 / (this.fieldStrength + 0.1));
        const currentRingRadius = this.ringRadius + wave + deviation;

        targetPos.x = projectedTargetX + currentRingRadius * Math.cos(angle);
        targetPos.y = projectedTargetY + currentRingRadius * Math.sin(angle);
        targetPos.z = mz * this.depthFactor + Math.sin(t) * (1 * this.waveAmplitude * this.depthFactor);
      }

      particle.cx += (targetPos.x - particle.cx) * this.lerpSpeed;
      particle.cy += (targetPos.y - particle.cy) * this.lerpSpeed;
      particle.cz += (targetPos.z - particle.cz) * this.lerpSpeed;

      this.dummy.position.set(particle.cx, particle.cy, particle.cz);

      // Dummy look at projected target
      this.dummy.lookAt(projectedTargetX, projectedTargetY, particle.cz);
      this.dummy.rotateX(Math.PI / 2);

      const currentDistToMouse = Math.sqrt(
        Math.pow(particle.cx - projectedTargetX, 2) + Math.pow(particle.cy - projectedTargetY, 2)
      );

      const distFromRing = Math.abs(currentDistToMouse - this.ringRadius);
      let scaleFactor = 1 - distFromRing / 10;

      scaleFactor = Math.max(0, Math.min(1, scaleFactor));

      const finalScale = scaleFactor * (0.8 + Math.sin(t * this.pulseSpeed) * 0.2 * this.particleVariance) * this.particleSize;
      
      this.dummy.scale.set(finalScale, finalScale, finalScale);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(i, this.dummy.matrix);
    });

    this.mesh.instanceMatrix.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  }
}

function initAntigravity() {
    if (!document.getElementById('antigravity-hero')) return;
    new Antigravity('antigravity-hero', {
        count: 450,
        magnetRadius: 20,
        ringRadius: 4,
        waveSpeed: 1.6,
        waveAmplitude: 2.9,
        particleSize: 1,
        lerpSpeed: 0.1,
        color: '#CDA15C',      // Overridden default pink to fit the premium green/brown theme
        autoAnimate: true,     // Changed to true to guarantee initial visual demonstration
        particleVariance: 2.5,
        rotationSpeed: 0.5,    // Give it a gentle rotation
        depthFactor: 1,
        pulseSpeed: 3,
        fieldStrength: 10
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAntigravity);
} else {
    initAntigravity();
}
