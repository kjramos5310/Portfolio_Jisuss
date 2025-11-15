import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HeroScene } from './scenes/HeroScene.js';
import { AboutScene } from './scenes/AboutScene.js';
import { TechStackScene } from './scenes/TechStackScene.js';

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

    // Inicializar About Scene
    this.aboutScene = new AboutScene(this.scene, this.camera, this.renderer);

    // Inicializar TechStack Scene
    this.techStackScene = new TechStackScene(this.scene, this.camera, this.renderer);

    // Estado de la escena actual
    this.currentScene = 'hero'; // 'hero', 'about', o 'techstack'

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
    const navHero = document.getElementById('navHero');

    if (navAbout) {
      navAbout.addEventListener('click', () => {
        this.transitionToAbout();
      });
    }

    if (navTechStack) {
      navTechStack.addEventListener('click', () => {
        this.transitionToTechStack();
      });
    }

    if (navHero) {
      navHero.addEventListener('click', () => {
        this.transitionToHero();
      });
    }
  }

  onEnterMatrix() {
    // Callback para cuando se presiona el botón "Enter the Matrix"
    console.log('✨ Matrix entered! Transitioning to About scene...');

    // Animación de transición del botón
    const heroUI = document.querySelector('.hero-ui');
    const sceneNav = document.getElementById('sceneNav');

    if (heroUI) {
      heroUI.style.transition = 'opacity 1s ease';
      heroUI.style.opacity = '0';

      setTimeout(() => {
        heroUI.style.display = 'none';

        // Mostrar navegación
        if (sceneNav) {
          sceneNav.style.display = 'flex';
          setTimeout(() => {
            sceneNav.style.opacity = '1';
          }, 10);
        }

        // Cambiar a la escena About
        this.transitionToAbout();

        console.log('🚀 Transition complete - About scene active');
      }, 1000);
    }
  }

  /**
   * Transición de regreso a Hero Scene
   */
  transitionToHero() {
    // Cambiar estado de escena
    this.currentScene = 'hero';

    // Desactivar otras escenas
    if (this.aboutScene && this.aboutScene.isActive) {
      this.aboutScene.deactivate();
    }
    if (this.techStackScene && this.techStackScene.isActive) {
      this.techStackScene.deactivate();
    }

    // Ocultar navegación y mostrar Hero UI
    const heroUI = document.querySelector('.hero-ui');
    const sceneNav = document.getElementById('sceneNav');

    if (sceneNav) {
      sceneNav.style.opacity = '0';
      setTimeout(() => {
        sceneNav.style.display = 'none';
      }, 300);
    }

    if (heroUI) {
      heroUI.style.display = 'block';
      setTimeout(() => {
        heroUI.style.opacity = '1';
      }, 10);
    }

    // Animar cámara de regreso a posición Hero
    this.animateCameraTransition(
      this.camera.position,
      { x: 0, y: 0, z: 5 },
      2000
    );
  }

  /**
   * Transición suave desde Hero a About Scene
   */
  transitionToAbout() {
    // Cambiar estado de escena
    this.currentScene = 'about';

    // Activar la escena About
    if (this.aboutScene) {
      this.aboutScene.activate();
    }

    // Animar la cámara suavemente hacia la nueva posición
    this.animateCameraTransition(
      { x: 0, y: 0, z: 5 },      // Posición inicial (Hero)
      { x: 2, y: 0, z: 8 },      // Posición final (About)
      2000                        // Duración en ms
    );
  }

  /**
   * Transición a TechStack Scene
   */
  transitionToTechStack() {
    // Cambiar estado de escena
    this.currentScene = 'techstack';

    // Desactivar About si está activa
    if (this.aboutScene && this.aboutScene.isActive) {
      this.aboutScene.deactivate();
    }

    // Activar la escena TechStack
    if (this.techStackScene) {
      this.techStackScene.activate();
    }

    // Animar la cámara para ver el grid completo
    this.animateCameraTransition(
      this.camera.position,       // Posición actual
      { x: 0, y: 0, z: 15 },      // Posición para ver todo el grid
      2000                         // Duración en ms
    );
  }

  /**
   * Anima la cámara suavemente entre dos posiciones
   */
  animateCameraTransition(from, to, duration) {
    const startTime = Date.now();
    const startPos = { ...from };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-in-out)
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      // Interpolar posición
      this.camera.position.x = startPos.x + (to.x - startPos.x) * eased;
      this.camera.position.y = startPos.y + (to.y - startPos.y) * eased;
      this.camera.position.z = startPos.z + (to.z - startPos.z) * eased;

      // Hacer que la cámara mire al centro
      this.camera.lookAt(0, 0, 0);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
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
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());

    // Update controls
    this.controls.update();

    // Update la escena activa
    if (this.currentScene === 'hero' && this.heroScene) {
      this.heroScene.update();
    } else if (this.currentScene === 'about' && this.aboutScene) {
      this.aboutScene.update();
    } else if (this.currentScene === 'techstack' && this.techStackScene) {
      this.techStackScene.update();
    }

    // Render usando post-processing de la escena activa o default renderer
    if (this.currentScene === 'hero' && this.heroScene && this.heroScene.composer) {
      this.heroScene.render();
    } else if (this.currentScene === 'techstack' && this.techStackScene && this.techStackScene.composer) {
      this.techStackScene.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

// Initialize app
const app = new ThreeApp();

export default app;
