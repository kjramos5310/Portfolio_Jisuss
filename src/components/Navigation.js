/**
 * Navigation - Sistema de navegación entre escenas con mini-mapa radar
 *
 * Características:
 * - Menú lateral/top con indicador de sección actual
 * - Navegación por teclado (flechas, números)
 * - Mini-mapa tipo radar en esquina superior derecha
 * - Smooth transitions entre secciones
 * - Integración completa con SceneManager
 */
export class Navigation {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;

    // Referencias DOM
    this.navContainer = null;
    this.radarContainer = null;
    this.navButtons = new Map();

    // Estado
    this.isEnabled = false;
    this.keyboardEnabled = true;

    // Configuración de navegación
    this.keyMap = {
      'ArrowUp': 'previous',
      'ArrowDown': 'next',
      'ArrowLeft': 'previous',
      'ArrowRight': 'next',
      '1': 'hero',
      '2': 'about',
      '3': 'techstack',
      '4': 'projects'
    };

    // Inicializar
    this.init();
  }

  /**
   * Inicializa el sistema de navegación
   */
  init() {
    this.createNavigationUI();
    this.createRadarMinimap();
    this.setupEventListeners();
    this.setupSceneManagerCallbacks();

    console.log('✅ Navigation system initialized');
  }

  /**
   * Crea la UI de navegación principal
   */
  createNavigationUI() {
    // Verificar si ya existe
    let existingNav = document.getElementById('sceneNav');

    if (existingNav) {
      this.navContainer = existingNav;
      // Limpiar contenido existente
      this.navContainer.innerHTML = '';
    } else {
      // Crear nuevo contenedor
      this.navContainer = document.createElement('nav');
      this.navContainer.id = 'sceneNav';
      this.navContainer.className = 'scene-nav';
      document.body.appendChild(this.navContainer);
    }

    // Crear botones de navegación
    const scenes = this.sceneManager.getAllScenes();

    scenes.forEach((scene, index) => {
      const button = this.createNavButton(scene, index + 1);
      this.navButtons.set(scene.id, button);
      this.navContainer.appendChild(button);
    });

    // Inicialmente oculto
    this.navContainer.style.display = 'none';
    this.navContainer.style.opacity = '0';
  }

  /**
   * Crea un botón de navegación
   */
  createNavButton(scene, index) {
    const button = document.createElement('button');
    button.className = 'nav-button';
    button.dataset.sceneId = scene.id;
    button.dataset.index = index;

    // Contenido del botón
    button.innerHTML = `
      <span class="nav-number">${index}</span>
      <span class="nav-label">${scene.name}</span>
      <span class="nav-indicator"></span>
    `;

    // Event listener
    button.addEventListener('click', () => {
      this.navigateToScene(scene.id);
    });

    return button;
  }

  /**
   * Crea el mini-mapa tipo radar
   */
  createRadarMinimap() {
    // Contenedor del radar
    this.radarContainer = document.createElement('div');
    this.radarContainer.id = 'radarMinimap';
    this.radarContainer.className = 'radar-minimap';

    // Canvas para el radar
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 150;
    canvas.className = 'radar-canvas';
    this.radarCanvas = canvas;
    this.radarCtx = canvas.getContext('2d');

    // Título del radar
    const title = document.createElement('div');
    title.className = 'radar-title';
    title.textContent = 'NAVIGATION';

    this.radarContainer.appendChild(title);
    this.radarContainer.appendChild(canvas);

    // Añadir al DOM
    document.body.appendChild(this.radarContainer);

    // Inicialmente oculto
    this.radarContainer.style.display = 'none';
    this.radarContainer.style.opacity = '0';

    // Iniciar animación del radar
    this.startRadarAnimation();

    // Click en radar para navegar
    this.setupRadarClickNavigation();
  }

  /**
   * Configura navegación por click en el radar
   */
  setupRadarClickNavigation() {
    this.radarCanvas.addEventListener('click', (e) => {
      const rect = this.radarCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Convertir a coordenadas del canvas
      const centerX = this.radarCanvas.width / 2;
      const centerY = this.radarCanvas.height / 2;

      const clickX = x - centerX;
      const clickY = y - centerY;

      // Determinar qué escena está más cerca del click
      const sceneId = this.getSceneFromRadarPosition(clickX, clickY);

      if (sceneId) {
        this.navigateToScene(sceneId);
      }
    });

    // Cursor pointer en hover
    this.radarCanvas.style.cursor = 'pointer';
  }

  /**
   * Determina la escena según la posición en el radar
   */
  getSceneFromRadarPosition(x, y) {
    const scenes = this.sceneManager.getAllScenes();
    const angle = Math.atan2(y, x);
    const angleStep = (Math.PI * 2) / scenes.length;

    let closestScene = null;
    let minDiff = Infinity;

    scenes.forEach((scene, index) => {
      const sceneAngle = (index * angleStep) - Math.PI / 2;
      let diff = Math.abs(angle - sceneAngle);

      // Normalizar diferencia de ángulo
      if (diff > Math.PI) diff = Math.PI * 2 - diff;

      if (diff < minDiff) {
        minDiff = diff;
        closestScene = scene.id;
      }
    });

    return closestScene;
  }

  /**
   * Inicia la animación del radar
   */
  startRadarAnimation() {
    let rotation = 0;

    const animate = () => {
      if (!this.radarCtx) return;

      this.drawRadar(rotation);
      rotation += 0.02;

      requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Dibuja el radar
   */
  drawRadar(rotation) {
    const ctx = this.radarCtx;
    const width = this.radarCanvas.width;
    const height = this.radarCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);

    // Fondo semi-transparente
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, width, height);

    // Círculos concéntricos
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.lineWidth = 1;

    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius / 3) * i, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Líneas de grid
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.stroke();

    // Línea de escaneo rotativa
    const gradient = ctx.createLinearGradient(
      centerX,
      centerY,
      centerX + Math.cos(rotation) * radius,
      centerY + Math.sin(rotation) * radius
    );
    gradient.addColorStop(0, 'rgba(0, 255, 0, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(rotation) * radius,
      centerY + Math.sin(rotation) * radius
    );
    ctx.stroke();

    // Dibujar puntos de escenas
    this.drawScenePoints(ctx, centerX, centerY, radius);

    // Borde del radar
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  /**
   * Dibuja los puntos de las escenas en el radar
   */
  drawScenePoints(ctx, centerX, centerY, radius) {
    const scenes = this.sceneManager.getAllScenes();
    const currentSceneId = this.sceneManager.getCurrentSceneId();
    const angleStep = (Math.PI * 2) / scenes.length;

    scenes.forEach((scene, index) => {
      const angle = (index * angleStep) - Math.PI / 2;
      const x = centerX + Math.cos(angle) * (radius * 0.7);
      const y = centerY + Math.sin(angle) * (radius * 0.7);

      // Punto de escena
      const isActive = scene.id === currentSceneId;

      ctx.fillStyle = isActive
        ? 'rgba(0, 255, 0, 1)'
        : 'rgba(0, 255, 0, 0.5)';

      ctx.beginPath();
      ctx.arc(x, y, isActive ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();

      // Pulso en punto activo
      if (isActive) {
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = isActive
        ? 'rgba(0, 255, 0, 1)'
        : 'rgba(0, 255, 0, 0.6)';
      ctx.font = isActive ? 'bold 10px monospace' : '9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Posición del texto ajustada para que no se superponga
      const labelDistance = radius * 0.85;
      const labelX = centerX + Math.cos(angle) * labelDistance;
      const labelY = centerY + Math.sin(angle) * labelDistance;

      ctx.fillText(scene.name, labelX, labelY);
    });
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Navegación por teclado
    document.addEventListener('keydown', (e) => {
      if (!this.keyboardEnabled || !this.isEnabled) return;

      const action = this.keyMap[e.key];

      if (!action) return;

      e.preventDefault();

      if (action === 'next') {
        this.sceneManager.nextScene();
      } else if (action === 'previous') {
        this.sceneManager.previousScene();
      } else {
        // Navegar a escena específica
        this.navigateToScene(action);
      }
    });

    // Hover effects en botones
    this.navButtons.forEach((button, sceneId) => {
      button.addEventListener('mouseenter', () => {
        button.classList.add('hover');
      });

      button.addEventListener('mouseleave', () => {
        button.classList.remove('hover');
      });
    });
  }

  /**
   * Configura callbacks del SceneManager
   */
  setupSceneManagerCallbacks() {
    // Actualizar UI cuando cambia la escena
    this.sceneManager.onSceneChange((newSceneId, oldSceneId) => {
      this.updateActiveIndicator(newSceneId);
    });

    // Animaciones de transición
    this.sceneManager.onTransitionStart((fromId, toId) => {
      this.setTransitioning(true);
    });

    this.sceneManager.onTransitionEnd((fromId, toId) => {
      this.setTransitioning(false);
    });
  }

  /**
   * Navega a una escena específica
   */
  navigateToScene(sceneId) {
    this.sceneManager.transitionTo(sceneId);
  }

  /**
   * Actualiza el indicador de escena activa
   */
  updateActiveIndicator(activeSceneId) {
    this.navButtons.forEach((button, sceneId) => {
      if (sceneId === activeSceneId) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  /**
   * Marca el estado de transición
   */
  setTransitioning(isTransitioning) {
    if (isTransitioning) {
      this.navContainer?.classList.add('transitioning');
      this.radarContainer?.classList.add('transitioning');
    } else {
      this.navContainer?.classList.remove('transitioning');
      this.radarContainer?.classList.remove('transitioning');
    }
  }

  /**
   * Muestra la navegación
   */
  show() {
    if (this.navContainer) {
      this.navContainer.style.display = 'flex';
      setTimeout(() => {
        this.navContainer.style.opacity = '1';
      }, 10);
    }

    if (this.radarContainer) {
      this.radarContainer.style.display = 'block';
      setTimeout(() => {
        this.radarContainer.style.opacity = '1';
      }, 10);
    }

    this.isEnabled = true;
  }

  /**
   * Oculta la navegación
   */
  hide() {
    if (this.navContainer) {
      this.navContainer.style.opacity = '0';
      setTimeout(() => {
        this.navContainer.style.display = 'none';
      }, 300);
    }

    if (this.radarContainer) {
      this.radarContainer.style.opacity = '0';
      setTimeout(() => {
        this.radarContainer.style.display = 'none';
      }, 300);
    }

    this.isEnabled = false;
  }

  /**
   * Habilitar/deshabilitar navegación por teclado
   */
  setKeyboardEnabled(enabled) {
    this.keyboardEnabled = enabled;
  }

  /**
   * Obtener estado de navegación
   */
  isActive() {
    return this.isEnabled;
  }

  /**
   * Limpiar recursos
   */
  dispose() {
    // Remover event listeners
    this.navButtons.forEach((button) => {
      button.remove();
    });

    // Remover elementos DOM
    this.navContainer?.remove();
    this.radarContainer?.remove();

    // Limpiar referencias
    this.navButtons.clear();
    this.radarCtx = null;
  }
}
