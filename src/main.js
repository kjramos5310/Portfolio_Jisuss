import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HeroScene } from './scenes/HeroScene.js';
import { AboutScene } from './scenes/AboutScene.js';
import { TechStackScene } from './scenes/TechStackScene.js';
import { ProjectsScene } from './scenes/ProjectsScene.js';
import { SceneManager } from './utils/SceneManager.js';
import { Navigation } from './components/Navigation.js';

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

    // Inicializar SceneManager
    this.sceneManager = new SceneManager(this.camera, this.renderer);

    // Inicializar Hero Scene
    this.heroScene = new HeroScene(this.scene, this.camera, this.renderer);
    this.sceneManager.registerScene('hero', this.heroScene);

    // Inicializar About Scene
    this.aboutScene = new AboutScene(this.scene, this.camera, this.renderer);
    this.sceneManager.registerScene('about', this.aboutScene);

    // Inicializar TechStack Scene
    this.techStackScene = new TechStackScene(this.scene, this.camera, this.renderer);
    this.sceneManager.registerScene('techstack', this.techStackScene);

    // Inicializar Projects Scene
    this.projectsScene = new ProjectsScene(this.scene, this.camera, this.renderer);
    this.sceneManager.registerScene('projects', this.projectsScene);

    // Inicializar Navigation
    this.navigation = new Navigation(this.sceneManager);

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
  
  setupButtonInteractions() {
    // Setup "Enter the Matrix" button
    const enterButton = document.getElementById('enterMatrix');
    console.log('🔍 Looking for button:', enterButton);

    if (enterButton) {
      console.log('✅ Button found!');

      enterButton.addEventListener('click', (e) => {
        console.log('🎯 Button clicked!', e);
        this.onEnterMatrix();
      });

      // Verificar que el botón es clickeable
      enterButton.addEventListener('mouseenter', () => {
        console.log('👆 Mouse over button');
      });
    } else {
      console.error('❌ Button not found!');
    }

    // Setup navigation buttons
    const navAbout = document.getElementById('navAbout');
    const navTechStack = document.getElementById('navTechStack');
    const navProjects = document.getElementById('navProjects');
    const navHero = document.getElementById('navHero');

    // Nota: Los botones de navegación ahora son manejados por el componente Navigation
    // que se integra automáticamente con el SceneManager
  }

  onEnterMatrix() {
    // Callback para cuando se presiona el botón "Enter the Matrix"
    console.log('✨ Matrix entered! Transitioning to About scene...');

    // Animación de transición del botón
    const heroUI = document.querySelector('.hero-ui');

    if (heroUI) {
      heroUI.style.transition = 'opacity 1s ease';
      heroUI.style.opacity = '0';

      setTimeout(() => {
        heroUI.style.display = 'none';

        // Mostrar navegación
        this.navigation.show();

        // Cambiar a la escena About usando SceneManager
        this.sceneManager.transitionTo('about');

        console.log('🚀 Transition complete - About scene active');
      }, 1000);
    }
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

    // Update About Scene
    if (this.aboutScene) {
      this.aboutScene.onResize(this.sizes.width, this.sizes.height);
    }

    // Update TechStack Scene
    if (this.techStackScene) {
      this.techStackScene.onResize(this.sizes.width, this.sizes.height);
    }

    // Update Projects Scene
    if (this.projectsScene) {
      this.projectsScene.onResize(this.sizes.width, this.sizes.height);
    }
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());

    // Update controls
    this.controls.update();

    // Obtener escena actual del SceneManager
    const currentSceneId = this.sceneManager.getCurrentSceneId();
    const currentScene = this.sceneManager.getCurrentScene();

    // Update la escena activa
    if (currentScene && currentScene.update) {
      currentScene.update();
    }

    // Render usando post-processing de la escena activa o default renderer
    if (currentSceneId === 'hero' && this.heroScene && this.heroScene.composer) {
      this.heroScene.render();
    } else if (currentSceneId === 'techstack' && this.techStackScene && this.techStackScene.composer) {
      this.techStackScene.render();
    } else if (currentSceneId === 'projects' && this.projectsScene && this.projectsScene.composer) {
      this.projectsScene.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

// Initialize app
const app = new ThreeApp();

export default app;
