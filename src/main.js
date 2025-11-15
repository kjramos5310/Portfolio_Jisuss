import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import MatrixRain from './components/MatrixRain.js';

/**
 * Setup básico de Three.js
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
    
    // Cube de prueba (para verificar que funciona)
    this.addTestCube();
    
    // Matrix Rain Effect
    this.matrixRain = new MatrixRain();

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
  
  addTestCube() {
    // Cubo simple con color verde Matrix
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ff41,
      wireframe: true 
    });
    this.testCube = new THREE.Mesh(geometry, material);
    this.scene.add(this.testCube);
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
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    // Update controls
    this.controls.update();
    
    // Rotar el cubo de prueba
    if (this.testCube) {
      this.testCube.rotation.x += 0.01;
      this.testCube.rotation.y += 0.01;
    }
    
    // Render
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize app
const app = new ThreeApp();

// Exponer globalmente para acceso desde HTML
window.threeApp = app;
window.matrixRain = app.matrixRain;

export default app;
