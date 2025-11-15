import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

/**
 * ProjectsScene - Carrusel 3D interactivo de proyectos
 *
 * Características:
 * - Carrusel circular con 4 proyectos
 * - Navegación: flechas del teclado o mouse drag
 * - Cada card muestra: título, descripción, tech badges, botón "View Project"
 * - Animaciones suaves entre proyectos
 * - Proyecto activo en centro con zoom
 */
export class ProjectsScene {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    // Referencias a objetos
    this.projectCards = [];
    this.composer = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.isActive = false;

    // Control de carrusel
    this.currentProjectIndex = 0;
    this.targetRotation = 0;
    this.currentRotation = 0;
    this.isRotating = false;

    // Control de drag
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragCurrentX = 0;
    this.dragVelocity = 0;

    // Control de animación
    this.clock = new THREE.Clock();

    // Grupo principal del carrusel
    this.carouselGroup = new THREE.Group();
    this.scene.add(this.carouselGroup);

    // Datos de proyectos
    this.projectsData = this.getProjectsData();

    // Inicializar todos los elementos
    this.init();
  }

  /**
   * Retorna los datos de los proyectos
   */
  getProjectsData() {
    return [
      {
        title: 'Plataforma Onboarding PYMES',
        description: 'Sistema completo de onboarding para pequeñas y medianas empresas con gestión de usuarios y autenticación segura.',
        technologies: ['Spring Boot', 'JWT', 'SCRUM'],
        link: 'https://nocountry.tech/simulacion-laboral-septiembre-2025/cmg4lhrm20049gx01cnx2u5t',
        color: 0x00ff41,
        icon: '🏢'
      },
      {
        title: 'Chatbot Tiempo Real',
        description: 'Aplicación de chat en tiempo real con arquitectura de microservicios y comunicación bidireccional.',
        technologies: ['Node.js', 'Express', 'WebSocket'],
        link: '#',
        color: 0x00ffff,
        icon: '💬'
      },
      {
        title: 'Sistema Donaciones',
        description: 'Plataforma de gestión de donaciones con arquitectura MVC, contenedorizada con Docker para fácil despliegue.',
        technologies: ['React', 'TypeScript', 'Docker', 'MVC'],
        link: '#',
        color: 0xff00ff,
        icon: '💝'
      },
      {
        title: 'SOAP Concesionarias',
        description: 'Sistema de integración para concesionarias utilizando servicios web SOAP con procesamiento de XML.',
        technologies: ['SOAP', 'XML', 'Web Services'],
        link: '#',
        color: 0xffff00,
        icon: '🚗'
      }
    ];
  }

  /**
   * Inicializa todos los elementos de la escena
   */
  init() {
    this.setupLights();
    this.createCarousel();
    this.setupPostProcessing();
    this.setupEventListeners();
  }

  /**
   * Configura las luces de la escena
   */
  setupLights() {
    // Luz ambiental suave
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    // Luces direccionales para dar profundidad
    const directionalLight1 = new THREE.DirectionalLight(0x00ff41, 0.6);
    directionalLight1.position.set(5, 5, 5);
    this.scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0x00ffff, 0.4);
    directionalLight2.position.set(-5, 3, -5);
    this.scene.add(directionalLight2);

    // Luz focal para el proyecto activo
    this.spotLight = new THREE.SpotLight(0xffffff, 1);
    this.spotLight.position.set(0, 5, 5);
    this.spotLight.angle = Math.PI / 6;
    this.spotLight.penumbra = 0.3;
    this.spotLight.decay = 2;
    this.spotLight.distance = 20;
    this.scene.add(this.spotLight);
  }

  /**
   * Crea el carrusel con todos los proyectos
   */
  createCarousel() {
    const radius = 8;
    const angleStep = (Math.PI * 2) / this.projectsData.length;

    this.projectsData.forEach((project, index) => {
      const angle = index * angleStep;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      const card = this.createProjectCard(project, index);
      card.position.set(x, 0, z);
      card.rotation.y = -angle;

      this.carouselGroup.add(card);
      this.projectCards.push(card);
    });
  }

  /**
   * Crea una tarjeta 3D para un proyecto
   */
  createProjectCard(project, index) {
    const cardGroup = new THREE.Group();

    // Contenedor principal de la tarjeta
    const cardWidth = 4;
    const cardHeight = 5;
    const cardDepth = 0.2;

    // Geometría principal de la tarjeta
    const cardGeometry = new THREE.BoxGeometry(cardWidth, cardHeight, cardDepth);
    const cardMaterial = new THREE.MeshStandardMaterial({
      color: project.color,
      emissive: project.color,
      emissiveIntensity: 0.2,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9
    });

    const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
    cardGroup.add(cardMesh);

    // Borde brillante
    const edgesGeometry = new THREE.EdgesGeometry(cardGeometry);
    const edgesMaterial = new THREE.LineBasicMaterial({
      color: project.color,
      linewidth: 2
    });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    cardGroup.add(edges);

    // Crear textura con contenido de la tarjeta
    const cardTexture = this.createCardTexture(project);
    const frontMaterial = new THREE.MeshBasicMaterial({
      map: cardTexture,
      transparent: true,
      opacity: 1
    });

    const frontGeometry = new THREE.PlaneGeometry(cardWidth - 0.2, cardHeight - 0.2);
    const frontMesh = new THREE.Mesh(frontGeometry, frontMaterial);
    frontMesh.position.z = cardDepth / 2 + 0.01;
    cardGroup.add(frontMesh);

    // Partículas alrededor de la tarjeta
    this.createCardParticles(cardGroup, project.color);

    // Guardar datos del proyecto en userData
    cardGroup.userData = {
      project: project,
      index: index,
      originalScale: 1,
      isCard: true
    };

    // Inicialmente todas las tarjetas están a escala normal excepto la activa
    cardGroup.scale.set(
      index === 0 ? 1.3 : 1,
      index === 0 ? 1.3 : 1,
      index === 0 ? 1.3 : 1
    );

    return cardGroup;
  }

  /**
   * Crea textura de canvas para la tarjeta del proyecto
   */
  createCardTexture(project) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1280;
    const ctx = canvas.getContext('2d');

    // Fondo con gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `rgba(${(project.color >> 16) & 255}, ${(project.color >> 8) & 255}, ${project.color & 255}, 0.3)`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid de fondo para efecto tech
    ctx.strokeStyle = `rgba(${(project.color >> 16) & 255}, ${(project.color >> 8) & 255}, ${project.color & 255}, 0.1)`;
    ctx.lineWidth = 2;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Ícono del proyecto
    ctx.font = 'bold 180px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(project.icon, canvas.width / 2, 180);

    // Título del proyecto
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px "Courier New", monospace';
    ctx.shadowColor = `#${project.color.toString(16).padStart(6, '0')}`;
    ctx.shadowBlur = 20;

    // Dividir título en líneas si es muy largo
    const titleWords = project.title.split(' ');
    let titleLines = [];
    let currentLine = '';

    titleWords.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > canvas.width - 100 && currentLine) {
        titleLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    titleLines.push(currentLine);

    titleLines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, 380 + index * 65);
    });

    // Descripción del proyecto
    ctx.font = '32px "Courier New", monospace';
    ctx.fillStyle = '#cccccc';
    ctx.shadowBlur = 10;

    const words = project.description.split(' ');
    let lines = [];
    let line = '';

    words.forEach(word => {
      const testLine = line + (line ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > canvas.width - 120) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    });
    lines.push(line);

    const descriptionStartY = 380 + titleLines.length * 65 + 40;
    lines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, descriptionStartY + index * 40);
    });

    // Tech badges
    ctx.font = 'bold 28px "Courier New", monospace';
    const badgeY = descriptionStartY + lines.length * 40 + 60;
    const badgeSpacing = 50;
    const totalBadgeWidth = project.technologies.length * 200 - badgeSpacing;
    let badgeX = (canvas.width - totalBadgeWidth) / 2;

    project.technologies.forEach((tech, index) => {
      const badgeWidth = 200;
      const badgeHeight = 50;
      const currentBadgeY = badgeY + Math.floor(index / 2) * 70;
      const currentBadgeX = badgeX + (index % 2) * (badgeWidth + badgeSpacing);

      // Badge background
      ctx.fillStyle = `rgba(${(project.color >> 16) & 255}, ${(project.color >> 8) & 255}, ${project.color & 255}, 0.3)`;
      ctx.strokeStyle = `#${project.color.toString(16).padStart(6, '0')}`;
      ctx.lineWidth = 2;

      const radius = 10;
      ctx.beginPath();
      ctx.moveTo(currentBadgeX + radius, currentBadgeY);
      ctx.lineTo(currentBadgeX + badgeWidth - radius, currentBadgeY);
      ctx.arcTo(currentBadgeX + badgeWidth, currentBadgeY, currentBadgeX + badgeWidth, currentBadgeY + radius, radius);
      ctx.lineTo(currentBadgeX + badgeWidth, currentBadgeY + badgeHeight - radius);
      ctx.arcTo(currentBadgeX + badgeWidth, currentBadgeY + badgeHeight, currentBadgeX + badgeWidth - radius, currentBadgeY + badgeHeight, radius);
      ctx.lineTo(currentBadgeX + radius, currentBadgeY + badgeHeight);
      ctx.arcTo(currentBadgeX, currentBadgeY + badgeHeight, currentBadgeX, currentBadgeY + badgeHeight - radius, radius);
      ctx.lineTo(currentBadgeX, currentBadgeY + radius);
      ctx.arcTo(currentBadgeX, currentBadgeY, currentBadgeX + radius, currentBadgeY, radius);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Badge text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "Courier New", monospace';
      ctx.fillText(tech, currentBadgeX + badgeWidth / 2, currentBadgeY + badgeHeight / 2 + 2);
    });

    // Botón "View Project"
    const buttonY = badgeY + Math.ceil(project.technologies.length / 2) * 70 + 40;
    const buttonWidth = 280;
    const buttonHeight = 60;
    const buttonX = (canvas.width - buttonWidth) / 2;

    // Button background
    ctx.fillStyle = `#${project.color.toString(16).padStart(6, '0')}`;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    ctx.fill();
    ctx.stroke();

    // Button text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 36px "Courier New", monospace';
    ctx.shadowColor = 'transparent';
    ctx.fillText('VIEW PROJECT', canvas.width / 2, buttonY + buttonHeight / 2 + 4);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Crea partículas alrededor de la tarjeta
   */
  createCardParticles(cardGroup, color) {
    const particleCount = 50;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      color: color,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    cardGroup.add(particles);

    cardGroup.userData.particles = particles;
  }

  /**
   * Configura el post-processing para el efecto bloom/glow
   */
  setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,  // Intensidad del bloom
      0.6,  // Radio
      0.8   // Threshold
    );
    this.composer.addPass(bloomPass);
  }

  /**
   * Configura los event listeners para interacción
   */
  setupEventListeners() {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onClick = this.onClick.bind(this);

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('click', this.onClick);
  }

  /**
   * Maneja las teclas de navegación
   */
  onKeyDown(event) {
    if (!this.isActive || this.isRotating) return;

    if (event.key === 'ArrowLeft') {
      this.rotateToPrevious();
    } else if (event.key === 'ArrowRight') {
      this.rotateToNext();
    }
  }

  /**
   * Maneja el inicio del drag
   */
  onMouseDown(event) {
    if (!this.isActive) return;

    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragCurrentX = event.clientX;
    this.dragVelocity = 0;
    document.body.style.cursor = 'grabbing';
  }

  /**
   * Maneja el movimiento del drag
   */
  onMouseMove(event) {
    if (!this.isActive) return;

    if (this.isDragging) {
      const deltaX = event.clientX - this.dragCurrentX;
      this.dragVelocity = deltaX;
      this.dragCurrentX = event.clientX;

      // Rotar el carrusel según el drag
      this.currentRotation += deltaX * 0.005;
      this.carouselGroup.rotation.y = this.currentRotation;
    } else {
      // Raycasting para detectar hover en botones
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.projectCards, true);

      if (intersects.length > 0) {
        let card = intersects[0].object;
        while (card.parent && !card.userData.isCard) {
          card = card.parent;
        }

        if (card.userData.isCard && card.userData.index === this.currentProjectIndex) {
          document.body.style.cursor = 'pointer';
          return;
        }
      }

      document.body.style.cursor = 'default';
    }
  }

  /**
   * Maneja el fin del drag
   */
  onMouseUp(event) {
    if (!this.isActive || !this.isDragging) return;

    this.isDragging = false;
    document.body.style.cursor = 'default';

    const totalDrag = event.clientX - this.dragStartX;
    const threshold = 100;

    if (Math.abs(totalDrag) > threshold) {
      if (totalDrag > 0) {
        this.rotateToPrevious();
      } else {
        this.rotateToNext();
      }
    } else {
      // Volver a la posición más cercana
      this.snapToNearest();
    }
  }

  /**
   * Maneja clicks en la tarjeta activa
   */
  onClick(event) {
    if (!this.isActive || this.isDragging) return;

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.projectCards, true);

    if (intersects.length > 0) {
      let card = intersects[0].object;
      while (card.parent && !card.userData.isCard) {
        card = card.parent;
      }

      if (card.userData.isCard && card.userData.index === this.currentProjectIndex) {
        const project = card.userData.project;
        if (project.link && project.link !== '#') {
          window.open(project.link, '_blank');
        }
      }
    }
  }

  /**
   * Rota al proyecto anterior
   */
  rotateToPrevious() {
    this.currentProjectIndex = (this.currentProjectIndex - 1 + this.projectsData.length) % this.projectsData.length;
    this.animateToProject();
  }

  /**
   * Rota al siguiente proyecto
   */
  rotateToNext() {
    this.currentProjectIndex = (this.currentProjectIndex + 1) % this.projectsData.length;
    this.animateToProject();
  }

  /**
   * Ajusta a la posición del proyecto más cercano
   */
  snapToNearest() {
    const angleStep = (Math.PI * 2) / this.projectsData.length;
    const currentAngle = this.currentRotation % (Math.PI * 2);
    const nearestIndex = Math.round(currentAngle / angleStep);

    this.currentProjectIndex = (this.projectsData.length - nearestIndex) % this.projectsData.length;
    this.animateToProject();
  }

  /**
   * Anima la transición al proyecto seleccionado
   */
  animateToProject() {
    this.isRotating = true;
    const angleStep = (Math.PI * 2) / this.projectsData.length;
    this.targetRotation = -this.currentProjectIndex * angleStep;

    // Normalizar rotaciones
    while (this.currentRotation - this.targetRotation > Math.PI) {
      this.targetRotation += Math.PI * 2;
    }
    while (this.targetRotation - this.currentRotation > Math.PI) {
      this.targetRotation -= Math.PI * 2;
    }
  }

  /**
   * Activa la escena de proyectos
   */
  activate() {
    if (this.isActive) return;
    this.isActive = true;

    // Hacer visibles todas las tarjetas
    this.projectCards.forEach(card => {
      card.visible = true;
    });

    // Activar la primera tarjeta
    this.updateActiveCard();
  }

  /**
   * Desactiva la escena de proyectos
   */
  deactivate() {
    if (!this.isActive) return;
    this.isActive = false;

    // Ocultar todas las tarjetas
    this.projectCards.forEach(card => {
      card.visible = false;
    });
  }

  /**
   * Actualiza cuál tarjeta está activa (con zoom)
   */
  updateActiveCard() {
    this.projectCards.forEach((card, index) => {
      const isActive = index === this.currentProjectIndex;
      const targetScale = isActive ? 1.3 : 1;

      // Animar escala suavemente
      card.scale.x += (targetScale - card.scale.x) * 0.1;
      card.scale.y += (targetScale - card.scale.y) * 0.1;
      card.scale.z += (targetScale - card.scale.z) * 0.1;

      // Ajustar intensidad de emisión
      card.traverse((child) => {
        if (child.material && child.material.emissiveIntensity !== undefined) {
          const targetIntensity = isActive ? 0.5 : 0.2;
          child.material.emissiveIntensity += (targetIntensity - child.material.emissiveIntensity) * 0.1;
        }
      });
    });
  }

  /**
   * Actualiza la animación de todos los elementos
   */
  update() {
    if (!this.isActive) return;

    const elapsedTime = this.clock.getElapsedTime();

    // Animar rotación del carrusel hacia el objetivo
    if (this.isRotating) {
      const diff = this.targetRotation - this.currentRotation;
      const delta = diff * 0.1;

      if (Math.abs(diff) < 0.001) {
        this.currentRotation = this.targetRotation;
        this.isRotating = false;
      } else {
        this.currentRotation += delta;
      }

      this.carouselGroup.rotation.y = this.currentRotation;
    }

    // Actualizar escalas de tarjetas activas/inactivas
    this.updateActiveCard();

    // Animar partículas
    this.projectCards.forEach((card) => {
      if (card.userData.particles) {
        card.userData.particles.rotation.y += 0.005;
        card.userData.particles.rotation.x = Math.sin(elapsedTime * 0.5) * 0.1;
      }
    });

    // Actualizar spotlight para seguir la tarjeta activa
    const activeCard = this.projectCards[this.currentProjectIndex];
    if (activeCard) {
      const worldPos = new THREE.Vector3();
      activeCard.getWorldPosition(worldPos);
      this.spotLight.target.position.copy(worldPos);
      this.spotLight.target.updateMatrixWorld();
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
    // Remover event listeners
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('click', this.onClick);

    // Limpiar tarjetas
    this.projectCards.forEach((card) => {
      card.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      });
      this.carouselGroup.remove(card);
    });

    // Limpiar carrusel
    this.scene.remove(this.carouselGroup);

    // Limpiar composer
    if (this.composer) {
      this.composer.dispose();
    }

    this.projectCards = [];
  }
}

export default ProjectsScene;
