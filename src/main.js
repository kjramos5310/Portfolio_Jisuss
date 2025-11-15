import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HeroScene } from './scenes/HeroScene.js';
import { MatrixTerminal } from './components/Terminal.js';

/**
 * Setup principal de Three.js para el portfolio
 */
class ThreeApp {
  constructor() {
    // Canvas
    this.canvas = document.querySelector('#webgl');

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // Sizes
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Camera
    this.setupCamera();

    // Renderer
    this.setupRenderer();

    // Controls
    this.setupControls();

    // Inicializar Hero Scene
    this.heroScene = new HeroScene(this.scene, this.camera, this.renderer);

    // Inicializar Terminal
    this.initTerminal();

    // Setup button interactions
    this.setupButtonInteractions();

    // Event listeners
    this.setupEventListeners();

    // Start animation loop
    this.animate();
  }
  
  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );
    this.camera.position.set(0, 0, 5);
    this.scene.add(this.camera);
  }
  
  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  
  setupControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 20;
  }

  initTerminal() {
    // Inicializar el terminal Matrix
    this.terminal = new MatrixTerminal('terminal-container', {
      enableCRT: true,
      typewriterSpeed: 30,
      promptSymbol: '$ ',
      userName: 'jebus'
    });
  }
  
  setupButtonInteractions() {
    // Setup "Enter the Matrix" button
    const enterButton = document.getElementById('enterMatrix');
    if (enterButton) {
      enterButton.addEventListener('click', () => {
        console.log('🎯 Transitioning to next section...');
        // TODO: Implementar transición a la siguiente sección
        // Por ahora solo mostramos un mensaje en consola
        this.onEnterMatrix();
      });
    }
  }

  onEnterMatrix() {
    // Callback para cuando se presiona el botón "Enter the Matrix"
    console.log('✨ Matrix entered! Activating terminal...');

    // Obtener elementos
    const heroUI = document.getElementById('heroUI');
    const terminalSection = document.getElementById('terminal-section');

    // Ocultar hero UI con transición
    heroUI.classList.add('hidden');

    // Mostrar terminal después de un breve delay
    setTimeout(() => {
      terminalSection.classList.add('active');

      // Ejecutar comando de bienvenida automático
      setTimeout(() => {
        this.terminal.runCommand('neofetch');
      }, 1000);
    }, 500);
  }
  
  setupEventListeners() {
    window.addEventListener('resize', () => this.onResize());
  }
  
  onResize() {
    // Update sizes
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;

    // Update camera
    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();

    // Update renderer
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Update Hero Scene
    if (this.heroScene) {
      this.heroScene.onResize(this.sizes.width, this.sizes.height);
    }
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());

    // Update controls
    this.controls.update();

    // Update Hero Scene
    if (this.heroScene) {
      this.heroScene.update();
    }

    // Render using Hero Scene's post-processing or default renderer
    if (this.heroScene && this.heroScene.composer) {
      this.heroScene.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

// Initialize app
const app = new ThreeApp();

export default app;
