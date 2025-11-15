import * as THREE from 'three';

/**
 * SceneManager - Sistema de gestión de escenas para el portfolio 3D
 *
 * Características:
 * - Control de escenas activas con preloading
 * - Transiciones suaves entre secciones
 * - Gestión de posiciones de cámara
 * - Callbacks para eventos de navegación
 * - Sistema de caché para optimización
 */
export class SceneManager {
  constructor(camera, renderer) {
    this.camera = camera;
    this.renderer = renderer;

    // Escenas registradas
    this.scenes = new Map();

    // Estado actual
    this.currentSceneId = null;
    this.previousSceneId = null;
    this.isTransitioning = false;

    // Cola de transiciones
    this.transitionQueue = [];

    // Configuración de escenas
    this.sceneConfigs = {
      hero: {
        id: 'hero',
        name: 'Home',
        cameraPosition: { x: 0, y: 0, z: 5 },
        cameraTarget: { x: 0, y: 0, z: 0 },
        showUI: true,
        showNav: false,
        preload: ['about']  // Precargar siguiente escena
      },
      about: {
        id: 'about',
        name: 'About Me',
        cameraPosition: { x: 2, y: 0, z: 8 },
        cameraTarget: { x: 0, y: 0, z: 0 },
        showUI: false,
        showNav: true,
        preload: ['techstack']
      },
      techstack: {
        id: 'techstack',
        name: 'Tech Stack',
        cameraPosition: { x: 0, y: 0, z: 15 },
        cameraTarget: { x: 0, y: 0, z: 0 },
        showUI: false,
        showNav: true,
        preload: ['projects']
      },
      projects: {
        id: 'projects',
        name: 'Projects',
        cameraPosition: { x: 0, y: 2, z: 12 },
        cameraTarget: { x: 0, y: 0, z: 0 },
        showUI: false,
        showNav: true,
        preload: ['hero']
      }
    };

    // Callbacks para eventos
    this.onSceneChangeCallbacks = [];
    this.onTransitionStartCallbacks = [];
    this.onTransitionEndCallbacks = [];

    // Configuración de transición
    this.transitionDuration = 2000; // ms
    this.transitionEasing = 'easeInOutQuad';
  }

  /**
   * Registra una escena en el manager
   */
  registerScene(id, sceneInstance) {
    if (!this.sceneConfigs[id]) {
      console.warn(`SceneManager: No config found for scene "${id}"`);
      return;
    }

    this.scenes.set(id, sceneInstance);
    console.log(`✅ Scene registered: ${id}`);

    // Si es la primera escena, activarla
    if (this.scenes.size === 1) {
      this.currentSceneId = id;
    }
  }

  /**
   * Obtiene la configuración de una escena
   */
  getSceneConfig(sceneId) {
    return this.sceneConfigs[sceneId] || null;
  }

  /**
   * Obtiene la escena actual
   */
  getCurrentScene() {
    return this.currentSceneId ? this.scenes.get(this.currentSceneId) : null;
  }

  /**
   * Obtiene el ID de la escena actual
   */
  getCurrentSceneId() {
    return this.currentSceneId;
  }

  /**
   * Transición a una nueva escena
   */
  async transitionTo(sceneId, options = {}) {
    // Validaciones
    if (!this.sceneConfigs[sceneId]) {
      console.error(`SceneManager: Scene "${sceneId}" not found`);
      return false;
    }

    if (this.currentSceneId === sceneId) {
      console.log(`SceneManager: Already in scene "${sceneId}"`);
      return false;
    }

    if (this.isTransitioning) {
      console.log(`SceneManager: Adding "${sceneId}" to transition queue`);
      this.transitionQueue.push({ sceneId, options });
      return false;
    }

    // Iniciar transición
    this.isTransitioning = true;
    this.previousSceneId = this.currentSceneId;

    const config = this.sceneConfigs[sceneId];
    const duration = options.duration || this.transitionDuration;

    console.log(`🎬 Scene transition: ${this.currentSceneId} → ${sceneId}`);

    // Callbacks de inicio de transición
    this.notifyTransitionStart(this.currentSceneId, sceneId);

    // Desactivar escena anterior
    const previousScene = this.getCurrentScene();
    if (previousScene && previousScene.deactivate) {
      previousScene.deactivate();
    }

    // Actualizar escena actual
    this.currentSceneId = sceneId;

    // Activar nueva escena
    const newScene = this.scenes.get(sceneId);
    if (newScene && newScene.activate) {
      newScene.activate();
    }

    // Animar transición de cámara
    await this.animateCameraTransition(
      this.camera.position,
      config.cameraPosition,
      config.cameraTarget,
      duration
    );

    // Actualizar UI
    this.updateUI(config);

    // Precargar siguiente escena si está configurado
    if (config.preload && config.preload.length > 0) {
      this.preloadScenes(config.preload);
    }

    // Callbacks de cambio de escena
    this.notifySceneChange(sceneId, this.previousSceneId);

    // Transición completada
    this.isTransitioning = false;

    // Callbacks de fin de transición
    this.notifyTransitionEnd(this.previousSceneId, sceneId);

    // Procesar cola de transiciones
    if (this.transitionQueue.length > 0) {
      const next = this.transitionQueue.shift();
      setTimeout(() => {
        this.transitionTo(next.sceneId, next.options);
      }, 100);
    }

    return true;
  }

  /**
   * Anima la transición de cámara
   */
  animateCameraTransition(fromPos, toPos, target, duration) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const startPos = { ...fromPos };

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Aplicar easing
        const eased = this.easeInOutQuad(progress);

        // Interpolar posición
        this.camera.position.x = startPos.x + (toPos.x - startPos.x) * eased;
        this.camera.position.y = startPos.y + (toPos.y - startPos.y) * eased;
        this.camera.position.z = startPos.z + (toPos.z - startPos.z) * eased;

        // Hacer que la cámara mire al objetivo
        this.camera.lookAt(target.x, target.y, target.z);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Función de easing ease-in-out-quad
   */
  easeInOutQuad(t) {
    return t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  /**
   * Actualiza la UI según la configuración de la escena
   */
  updateUI(config) {
    // Hero UI
    const heroUI = document.querySelector('.hero-ui');
    if (heroUI) {
      if (config.showUI) {
        heroUI.style.display = 'block';
        setTimeout(() => { heroUI.style.opacity = '1'; }, 10);
      } else {
        heroUI.style.opacity = '0';
        setTimeout(() => { heroUI.style.display = 'none'; }, 300);
      }
    }

    // Scene Navigation
    const sceneNav = document.getElementById('sceneNav');
    if (sceneNav) {
      if (config.showNav) {
        sceneNav.style.display = 'flex';
        setTimeout(() => { sceneNav.style.opacity = '1'; }, 10);
      } else {
        sceneNav.style.opacity = '0';
        setTimeout(() => { sceneNav.style.display = 'none'; }, 300);
      }
    }
  }

  /**
   * Precarga las escenas especificadas
   */
  preloadScenes(sceneIds) {
    sceneIds.forEach(sceneId => {
      const scene = this.scenes.get(sceneId);
      if (scene && scene.preload) {
        console.log(`⏳ Preloading scene: ${sceneId}`);
        scene.preload();
      }
    });
  }

  /**
   * Navegar a la siguiente escena
   */
  nextScene() {
    const sceneOrder = ['hero', 'about', 'techstack', 'projects'];
    const currentIndex = sceneOrder.indexOf(this.currentSceneId);
    const nextIndex = (currentIndex + 1) % sceneOrder.length;
    this.transitionTo(sceneOrder[nextIndex]);
  }

  /**
   * Navegar a la escena anterior
   */
  previousScene() {
    const sceneOrder = ['hero', 'about', 'techstack', 'projects'];
    const currentIndex = sceneOrder.indexOf(this.currentSceneId);
    const prevIndex = (currentIndex - 1 + sceneOrder.length) % sceneOrder.length;
    this.transitionTo(sceneOrder[prevIndex]);
  }

  /**
   * Registrar callback para cambio de escena
   */
  onSceneChange(callback) {
    this.onSceneChangeCallbacks.push(callback);
  }

  /**
   * Registrar callback para inicio de transición
   */
  onTransitionStart(callback) {
    this.onTransitionStartCallbacks.push(callback);
  }

  /**
   * Registrar callback para fin de transición
   */
  onTransitionEnd(callback) {
    this.onTransitionEndCallbacks.push(callback);
  }

  /**
   * Notificar callbacks de cambio de escena
   */
  notifySceneChange(newSceneId, oldSceneId) {
    this.onSceneChangeCallbacks.forEach(callback => {
      callback(newSceneId, oldSceneId);
    });
  }

  /**
   * Notificar callbacks de inicio de transición
   */
  notifyTransitionStart(fromSceneId, toSceneId) {
    this.onTransitionStartCallbacks.forEach(callback => {
      callback(fromSceneId, toSceneId);
    });
  }

  /**
   * Notificar callbacks de fin de transición
   */
  notifyTransitionEnd(fromSceneId, toSceneId) {
    this.onTransitionEndCallbacks.forEach(callback => {
      callback(fromSceneId, toSceneId);
    });
  }

  /**
   * Obtener lista de todas las escenas
   */
  getAllScenes() {
    return Array.from(this.scenes.keys()).map(id => ({
      id,
      name: this.sceneConfigs[id]?.name || id,
      config: this.sceneConfigs[id]
    }));
  }

  /**
   * Actualizar configuración de transición
   */
  setTransitionDuration(duration) {
    this.transitionDuration = duration;
  }

  /**
   * Limpiar recursos
   */
  dispose() {
    this.scenes.clear();
    this.onSceneChangeCallbacks = [];
    this.onTransitionStartCallbacks = [];
    this.onTransitionEndCallbacks = [];
    this.transitionQueue = [];
  }
}
