import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

/**
 * HeroScene - Escena principal Hero/Landing del portfolio
 *
 * Características:
 * - Cubo 3D central rotando con texto "JEBUS_DEV"
 * - Material con brillo verde neón y efecto bloom
 * - Texto holográfico flotante con shader scan-line
 * - Sistema de partículas con caracteres de código
 * - Preparado para botón interactivo "Enter the Matrix"
 */
export class HeroScene {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    // Referencias a objetos
    this.cube = null;
    this.holographicText = null;
    this.particles = null;
    this.composer = null;

    // Control de animación
    this.clock = new THREE.Clock();

    // Inicializar todos los elementos
    this.init();
  }

  /**
   * Inicializa todos los elementos de la escena
   */
  init() {
    this.setupLights();
    this.createNeonCube();
    this.createHolographicText();
    this.createParticleSystem();
    this.setupPostProcessing();
  }

  /**
   * Configura las luces de la escena
   */
  setupLights() {
    // Luz ambiental suave
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);

    // Luz direccional para dar profundidad
    const directionalLight = new THREE.DirectionalLight(0x00ff41, 0.8);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    // Luz puntual verde para efecto neón
    const pointLight = new THREE.PointLight(0x00ff41, 2, 10);
    pointLight.position.set(0, 0, 3);
    this.scene.add(pointLight);
  }

  /**
   * Crea el cubo central con material neón y texto en cada cara
   */
  createNeonCube() {
    const geometry = new THREE.BoxGeometry(2, 2, 2);

    // Crear textura de canvas para el texto "JEBUS_DEV"
    const textTexture = this.createTextTexture('JEBUS_DEV');

    // Material con brillo verde neón y emisión para bloom
    const material = new THREE.MeshStandardMaterial({
      map: textTexture,
      color: 0x00ff41,
      emissive: 0x00ff41,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.95
    });

    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.set(0, 0, 0);
    this.scene.add(this.cube);

    // Añadir wireframe adicional para efecto neón
    const wireframeGeometry = new THREE.EdgesGeometry(geometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff41,
      linewidth: 2
    });
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    this.cube.add(wireframe);
  }

  /**
   * Crea una textura de canvas con texto para las caras del cubo
   */
  createTextTexture(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Fondo negro con transparencia
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Texto verde neón
    ctx.fillStyle = '#00ff41';
    ctx.font = 'bold 60px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Efecto de brillo (shadow)
    ctx.shadowColor = '#00ff41';
    ctx.shadowBlur = 20;

    // Dibujar el texto en el centro
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // Añadir líneas de grid para efecto tech
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Crea el texto holográfico flotante con shader personalizado
   */
  createHolographicText() {
    // Crear textura de canvas para el texto holográfico
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Fondo transparente
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Texto holográfico
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 72px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15;
    ctx.fillText('Cybersecurity Analyst & Full-Stack Developer', canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);

    // Shader personalizado con efecto scan-line
    const holographicMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x00ffff) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uTime;
        uniform vec3 uColor;
        varying vec2 vUv;

        void main() {
          vec4 texColor = texture2D(uTexture, vUv);

          // Efecto scan-line
          float scanLine = sin(vUv.y * 100.0 + uTime * 3.0) * 0.1 + 0.9;

          // Efecto de parpadeo holográfico
          float flicker = sin(uTime * 2.0) * 0.05 + 0.95;

          // Distorsión horizontal sutil
          float distortion = sin(vUv.y * 5.0 + uTime) * 0.02;
          vec2 distortedUv = vec2(vUv.x + distortion, vUv.y);
          texColor = texture2D(uTexture, distortedUv);

          // Aplicar efectos
          vec3 finalColor = texColor.rgb * uColor * scanLine * flicker;
          float alpha = texColor.a * scanLine;

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    // Crear geometría del plano para el texto
    const geometry = new THREE.PlaneGeometry(8, 1);
    this.holographicText = new THREE.Mesh(geometry, holographicMaterial);
    this.holographicText.position.set(0, 3, 0);
    this.scene.add(this.holographicText);
  }

  /**
   * Crea el sistema de partículas con caracteres de código
   */
  createParticleSystem() {
    const particleCount = 250;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    // Crear textura de caracteres de código
    const codeTexture = this.createCodeCharacterTexture();

    // Inicializar posiciones y velocidades aleatorias
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Posiciones aleatorias en un espacio cúbico
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 10 - 5;

      // Velocidades aleatorias lentas
      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Material de partículas con textura de caracteres
    const material = new THREE.PointsMaterial({
      size: 0.3,
      map: codeTexture,
      transparent: true,
      opacity: 0.6,
      color: 0x00ff41,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.particles.userData.velocities = velocities;
    this.scene.add(this.particles);
  }

  /**
   * Crea una textura con un carácter de código aleatorio
   */
  createCodeCharacterTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Fondo transparente
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Caracteres de código para mostrar
    const chars = ['0', '1', '{', '}', '<', '>', '/', '*', '+', '-', '=', '$', '#', '@'];
    const randomChar = chars[Math.floor(Math.random() * chars.length)];

    // Dibujar el carácter
    ctx.fillStyle = '#00ff41';
    ctx.font = 'bold 48px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#00ff41';
    ctx.shadowBlur = 10;
    ctx.fillText(randomChar, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Configura el post-processing para el efecto bloom/glow
   */
  setupPostProcessing() {
    // Crear el composer de efectos
    this.composer = new EffectComposer(this.renderer);

    // Añadir el render pass base
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Añadir el bloom pass para el efecto glow neón
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,  // Intensidad del bloom
      0.4,  // Radio
      0.85  // Threshold
    );
    this.composer.addPass(bloomPass);
  }

  /**
   * Actualiza la animación de todos los elementos
   */
  update() {
    const elapsedTime = this.clock.getElapsedTime();

    // Rotación suave del cubo
    if (this.cube) {
      this.cube.rotation.x = Math.sin(elapsedTime * 0.3) * 0.2;
      this.cube.rotation.y += 0.005;
      this.cube.rotation.z = Math.cos(elapsedTime * 0.2) * 0.1;

      // Animación de flotación sutil
      this.cube.position.y = Math.sin(elapsedTime * 0.5) * 0.2;
    }

    // Actualizar shader del texto holográfico
    if (this.holographicText) {
      this.holographicText.material.uniforms.uTime.value = elapsedTime;

      // Rotación sutil para que siempre mire a la cámara
      this.holographicText.lookAt(this.camera.position);

      // Animación de flotación
      this.holographicText.position.y = 3 + Math.sin(elapsedTime * 0.7) * 0.1;
    }

    // Animar partículas
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      const velocities = this.particles.userData.velocities;

      for (let i = 0; i < velocities.length; i++) {
        const i3 = i * 3;

        // Actualizar posiciones con velocidades
        positions[i3] += velocities[i].x;
        positions[i3 + 1] += velocities[i].y;
        positions[i3 + 2] += velocities[i].z;

        // Mantener partículas dentro de los límites
        if (Math.abs(positions[i3]) > 10) velocities[i].x *= -1;
        if (Math.abs(positions[i3 + 1]) > 10) velocities[i].y *= -1;
        if (Math.abs(positions[i3 + 2]) > 5) velocities[i].z *= -1;
      }

      this.particles.geometry.attributes.position.needsUpdate = true;

      // Rotación lenta del sistema completo
      this.particles.rotation.y += 0.001;
    }
  }

  /**
   * Renderiza la escena con post-processing
   */
  render() {
    if (this.composer) {
      this.composer.render();
    }
  }

  /**
   * Maneja el redimensionamiento de la ventana
   */
  onResize(width, height) {
    if (this.composer) {
      this.composer.setSize(width, height);
    }
  }

  /**
   * Limpia los recursos cuando se destruye la escena
   */
  dispose() {
    // Limpiar geometrías y materiales
    if (this.cube) {
      this.cube.geometry.dispose();
      this.cube.material.dispose();
      if (this.cube.material.map) this.cube.material.map.dispose();
    }

    if (this.holographicText) {
      this.holographicText.geometry.dispose();
      this.holographicText.material.dispose();
    }

    if (this.particles) {
      this.particles.geometry.dispose();
      this.particles.material.dispose();
      if (this.particles.material.map) this.particles.material.map.dispose();
    }

    if (this.composer) {
      this.composer.dispose();
    }
  }
}

export default HeroScene;
