import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

/**
 * TechStackScene - Escena 3D interactiva con grid de tecnologías
 *
 * Características:
 * - Grid 3D con tarjetas de tecnologías organizadas por categorías
 * - Animación de entrada escalonada
 * - Hover: rotación + glow effect
 * - Click: muestra descripción de la tecnología
 * - Efectos de partículas y bloom
 */
export class TechStackScene {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    // Referencias a objetos
    this.cards = [];
    this.hoveredCard = null;
    this.selectedCard = null;
    this.composer = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.isActive = false;

    // Control de animación
    this.clock = new THREE.Clock();

    // Datos de tecnologías organizadas por categoría
    this.techData = this.getTechData();

    // Inicializar todos los elementos
    this.init();
  }

  /**
   * Retorna los datos de las tecnologías organizadas por categoría
   */
  getTechData() {
    return {
      cybersecurity: {
        title: 'Cybersecurity',
        color: 0xff0000,
        techs: [
          {
            name: 'Microsoft Sentinel',
            icon: '🛡️',
            description: 'Cloud-native SIEM and SOAR solution for intelligent security analytics and threat response.'
          },
          {
            name: 'Microsoft Defender',
            icon: '🔒',
            description: 'Advanced threat protection platform for endpoints, identities, and cloud applications.'
          },
          {
            name: 'Lumu',
            icon: '👁️',
            description: 'Continuous compromise assessment platform for real-time threat detection.'
          },
          {
            name: 'Sophos',
            icon: '🔐',
            description: 'Next-gen cybersecurity solutions with synchronized security and AI-powered threat prevention.'
          }
        ]
      },
      backend: {
        title: 'Backend',
        color: 0x00ff00,
        techs: [
          {
            name: 'Spring Boot',
            icon: '🍃',
            description: 'Java-based framework for building production-ready microservices and enterprise applications.'
          },
          {
            name: 'NestJS',
            icon: '🦅',
            description: 'Progressive Node.js framework for building efficient, reliable, and scalable server-side applications.'
          },
          {
            name: 'SOAP/XML',
            icon: '📨',
            description: 'Protocol for exchanging structured information in web services implementation.'
          },
          {
            name: 'JWT',
            icon: '🎫',
            description: 'JSON Web Tokens for secure authentication and information exchange between parties.'
          }
        ]
      },
      frontend: {
        title: 'Frontend',
        color: 0x00ffff,
        techs: [
          {
            name: 'React',
            icon: '⚛️',
            description: 'JavaScript library for building fast and interactive user interfaces with component-based architecture.'
          },
          {
            name: 'Three.js',
            icon: '🎮',
            description: 'JavaScript 3D library for creating stunning WebGL-powered graphics and animations.'
          },
          {
            name: 'WebSocket',
            icon: '🔌',
            description: 'Protocol for full-duplex, real-time communication between client and server.'
          },
          {
            name: 'TypeScript',
            icon: '📘',
            description: 'Strongly typed programming language that builds on JavaScript with better tooling and scalability.'
          }
        ]
      },
      tools: {
        title: 'Tools',
        color: 0xffff00,
        techs: [
          {
            name: 'Docker',
            icon: '🐳',
            description: 'Platform for developing, shipping, and running applications in isolated containers.'
          },
          {
            name: 'Git',
            icon: '📚',
            description: 'Distributed version control system for tracking changes and collaborating on code.'
          },
          {
            name: 'SQL',
            icon: '🗄️',
            description: 'Standard language for managing and manipulating relational databases.'
          },
          {
            name: 'MongoDB',
            icon: '🍃',
            description: 'NoSQL document database for modern applications with flexible schema design.'
          }
        ]
      }
    };
  }

  /**
   * Inicializa todos los elementos de la escena
   */
  init() {
    this.setupLights();
    this.createTechCards();
    this.setupPostProcessing();
    this.setupEventListeners();
  }

  /**
   * Configura las luces de la escena
   */
  setupLights() {
    // Luz ambiental suave
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    // Luces direccionales para dar profundidad
    const directionalLight1 = new THREE.DirectionalLight(0x00ff41, 0.5);
    directionalLight1.position.set(5, 5, 5);
    this.scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0x00ffff, 0.3);
    directionalLight2.position.set(-5, 3, -5);
    this.scene.add(directionalLight2);
  }

  /**
   * Crea todas las tarjetas de tecnologías en un grid 3D
   */
  createTechCards() {
    const categories = Object.keys(this.techData);
    const cardSpacing = 3;
    const categorySpacing = 5;

    let categoryIndex = 0;

    categories.forEach((categoryKey) => {
      const category = this.techData[categoryKey];
      const techs = category.techs;

      // Calcular posición base para esta categoría
      const categoryX = (categoryIndex - categories.length / 2 + 0.5) * categorySpacing;

      // Crear título de categoría
      this.createCategoryTitle(category.title, categoryX, category.color);

      // Crear tarjetas para cada tecnología
      techs.forEach((tech, techIndex) => {
        const posX = categoryX;
        const posY = 2 - techIndex * cardSpacing;
        const posZ = 0;

        const card = this.createTechCard(tech, posX, posY, posZ, category.color, categoryIndex * 4 + techIndex);
        this.cards.push(card);
      });

      categoryIndex++;
    });
  }

  /**
   * Crea el título de categoría flotante
   */
  createCategoryTitle(title, x, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Fondo transparente
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Texto brillante
    ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    ctx.font = 'bold 48px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = `#${color.toString(16).padStart(6, '0')}`;
    ctx.shadowBlur = 20;
    ctx.fillText(title, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });

    const geometry = new THREE.PlaneGeometry(4, 1);
    const titleMesh = new THREE.Mesh(geometry, material);
    titleMesh.position.set(x, 4, 0);
    titleMesh.visible = false; // Invisible hasta que se active la escena

    this.scene.add(titleMesh);
    this.cards.push(titleMesh);
  }

  /**
   * Crea una tarjeta 3D para una tecnología
   */
  createTechCard(tech, x, y, z, categoryColor, animationDelay) {
    const cardGroup = new THREE.Group();

    // Geometría principal de la tarjeta
    const cardGeometry = new THREE.BoxGeometry(2.5, 2.5, 0.1);

    // Material con color de categoría
    const cardMaterial = new THREE.MeshStandardMaterial({
      color: categoryColor,
      emissive: categoryColor,
      emissiveIntensity: 0.3,
      metalness: 0.7,
      roughness: 0.3,
      transparent: true,
      opacity: 0.85
    });

    const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
    cardGroup.add(cardMesh);

    // Borde brillante
    const edgesGeometry = new THREE.EdgesGeometry(cardGeometry);
    const edgesMaterial = new THREE.LineBasicMaterial({
      color: categoryColor,
      linewidth: 2
    });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    cardGroup.add(edges);

    // Textura con ícono y nombre
    const cardTexture = this.createCardTexture(tech.icon, tech.name, categoryColor);
    const frontMaterial = new THREE.MeshBasicMaterial({
      map: cardTexture,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide
    });

    const frontGeometry = new THREE.PlaneGeometry(2.4, 2.4);
    const frontMesh = new THREE.Mesh(frontGeometry, frontMaterial);
    frontMesh.position.z = 0.06;
    cardGroup.add(frontMesh);

    // Posicionar el grupo
    cardGroup.position.set(x, y, z);

    // Guardar datos de la tecnología en userData
    cardGroup.userData = {
      tech: tech,
      categoryColor: categoryColor,
      originalPosition: { x, y, z },
      originalRotation: { x: 0, y: 0, z: 0 },
      animationDelay: animationDelay * 0.1,
      isCard: true,
      hovered: false,
      floatOffset: Math.random() * Math.PI * 2
    };

    // Inicialmente invisible para animación de entrada
    cardGroup.visible = false;
    cardGroup.scale.set(0, 0, 0);

    this.scene.add(cardGroup);
    return cardGroup;
  }

  /**
   * Crea textura de canvas para la tarjeta
   */
  createCardTexture(icon, name, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Fondo con gradiente sutil
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, `rgba(${(color >> 16) & 255}, ${(color >> 8) & 255}, ${color & 255}, 0.2)`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ícono
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, canvas.width / 2, canvas.height / 2 - 60);

    // Nombre de la tecnología
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Courier New", monospace';
    ctx.shadowColor = `#${color.toString(16).padStart(6, '0')}`;
    ctx.shadowBlur = 15;

    // Dividir el nombre en líneas si es muy largo
    const words = name.split(' ');
    if (words.length > 1) {
      words.forEach((word, index) => {
        ctx.fillText(word, canvas.width / 2, canvas.height / 2 + 80 + index * 40);
      });
    } else {
      ctx.fillText(name, canvas.width / 2, canvas.height / 2 + 80);
    }

    // Grid de fondo para efecto tech
    ctx.strokeStyle = `rgba(${(color >> 16) & 255}, ${(color >> 8) & 255}, ${color & 255}, 0.1)`;
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 30) {
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
   * Configura el post-processing para el efecto bloom/glow
   */
  setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.2,  // Intensidad del bloom
      0.5,  // Radio
      0.7   // Threshold
    );
    this.composer.addPass(bloomPass);
  }

  /**
   * Configura los event listeners para interacción
   */
  setupEventListeners() {
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onClick = this.onClick.bind(this);

    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('click', this.onClick);
  }

  /**
   * Maneja el movimiento del mouse para hover effects
   */
  onMouseMove(event) {
    if (!this.isActive) return;

    // Calcular posición normalizada del mouse
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Raycasting para detectar hover
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.cards, true);

    // Reset hover anterior
    if (this.hoveredCard && this.hoveredCard !== this.selectedCard) {
      this.hoveredCard.userData.hovered = false;
    }
    this.hoveredCard = null;

    // Detectar nueva tarjeta hovered
    if (intersects.length > 0) {
      let card = intersects[0].object;
      // Buscar el grupo padre que es la tarjeta
      while (card.parent && !card.userData.isCard) {
        card = card.parent;
      }

      if (card.userData.isCard && card.userData.tech) {
        this.hoveredCard = card;
        card.userData.hovered = true;
        document.body.style.cursor = 'pointer';
        return;
      }
    }

    document.body.style.cursor = 'default';
  }

  /**
   * Maneja clicks en las tarjetas
   */
  onClick(event) {
    if (!this.isActive || !this.hoveredCard) return;

    // Si ya hay una tarjeta seleccionada, deseleccionarla
    if (this.selectedCard) {
      this.hideDescription();
    }

    // Seleccionar la nueva tarjeta
    this.selectedCard = this.hoveredCard;
    this.showDescription(this.selectedCard.userData.tech);
  }

  /**
   * Muestra la descripción de la tecnología
   */
  showDescription(tech) {
    // Buscar o crear el contenedor de descripción
    let descContainer = document.getElementById('tech-description');

    if (!descContainer) {
      descContainer = document.createElement('div');
      descContainer.id = 'tech-description';
      descContainer.style.cssText = `
        position: fixed;
        bottom: 50px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid #00ff41;
        border-radius: 10px;
        padding: 20px 30px;
        max-width: 600px;
        color: #00ff41;
        font-family: 'Courier New', monospace;
        box-shadow: 0 0 30px rgba(0, 255, 65, 0.5);
        z-index: 100;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: auto;
      `;
      document.body.appendChild(descContainer);
    }

    descContainer.innerHTML = `
      <h3 style="margin: 0 0 10px 0; font-size: 24px; text-shadow: 0 0 10px #00ff41;">
        ${tech.icon} ${tech.name}
      </h3>
      <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #ffffff;">
        ${tech.description}
      </p>
      <button id="close-description" style="
        margin-top: 15px;
        padding: 8px 20px;
        background: transparent;
        border: 1px solid #00ff41;
        color: #00ff41;
        font-family: 'Courier New', monospace;
        cursor: pointer;
        border-radius: 5px;
        transition: all 0.3s ease;
      " onmouseover="this.style.background='#00ff41'; this.style.color='#000000';"
         onmouseout="this.style.background='transparent'; this.style.color='#00ff41';">
        CLOSE
      </button>
    `;

    setTimeout(() => {
      descContainer.style.opacity = '1';
    }, 10);

    // Agregar evento para cerrar
    const closeBtn = document.getElementById('close-description');
    closeBtn.addEventListener('click', () => this.hideDescription());
  }

  /**
   * Oculta la descripción de la tecnología
   */
  hideDescription() {
    const descContainer = document.getElementById('tech-description');
    if (descContainer) {
      descContainer.style.opacity = '0';
      setTimeout(() => {
        if (descContainer.parentNode) {
          descContainer.parentNode.removeChild(descContainer);
        }
      }, 300);
    }
    this.selectedCard = null;
  }

  /**
   * Activa la escena TechStack
   */
  activate() {
    if (this.isActive) return;
    this.isActive = true;

    // Activar la animación de entrada escalonada
    this.playEntranceAnimation();
  }

  /**
   * Reproduce la animación de entrada escalonada
   */
  playEntranceAnimation() {
    this.cards.forEach((card) => {
      if (!card.userData.animationDelay) {
        card.visible = true;
        return;
      }

      setTimeout(() => {
        card.visible = true;

        // Animar escala
        const startTime = Date.now();
        const duration = 800;

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Easing con bounce
          const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

          card.scale.set(eased, eased, eased);

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        animate();
      }, card.userData.animationDelay * 1000);
    });
  }

  /**
   * Desactiva la escena TechStack
   */
  deactivate() {
    if (!this.isActive) return;
    this.isActive = false;

    // Ocultar todas las tarjetas
    this.cards.forEach((card) => {
      card.visible = false;
      card.scale.set(0, 0, 0);
    });

    // Limpiar descripción si está visible
    this.hideDescription();
  }

  /**
   * Actualiza la animación de todos los elementos
   */
  update() {
    if (!this.isActive) return;

    const elapsedTime = this.clock.getElapsedTime();

    this.cards.forEach((card) => {
      if (!card.userData.isCard || !card.userData.tech) return;

      // Efecto de flotación
      const floatY = Math.sin(elapsedTime * 0.5 + card.userData.floatOffset) * 0.1;
      card.position.y = card.userData.originalPosition.y + floatY;

      // Rotación suave constante
      card.rotation.y = Math.sin(elapsedTime * 0.3 + card.userData.floatOffset) * 0.05;

      // Efectos de hover
      if (card.userData.hovered) {
        // Rotación más pronunciada
        card.rotation.x = Math.sin(elapsedTime * 2) * 0.1;
        card.rotation.y += 0.02;

        // Aumentar brillo
        card.children.forEach((child) => {
          if (child.material && child.material.emissiveIntensity !== undefined) {
            child.material.emissiveIntensity = Math.min(
              child.material.emissiveIntensity + 0.02,
              0.8
            );
          }
        });

        // Acercar ligeramente
        const targetZ = card.userData.originalPosition.z + 0.5;
        card.position.z += (targetZ - card.position.z) * 0.1;
      } else {
        // Volver a la rotación normal
        card.rotation.x += (0 - card.rotation.x) * 0.1;

        // Reducir brillo
        card.children.forEach((child) => {
          if (child.material && child.material.emissiveIntensity !== undefined) {
            child.material.emissiveIntensity = Math.max(
              child.material.emissiveIntensity - 0.02,
              0.3
            );
          }
        });

        // Volver a la posición original en Z
        card.position.z += (card.userData.originalPosition.z - card.position.z) * 0.1;
      }
    });
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
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('click', this.onClick);

    // Limpiar tarjetas
    this.cards.forEach((card) => {
      card.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      });
      this.scene.remove(card);
    });

    // Limpiar descripción
    this.hideDescription();

    // Limpiar composer
    if (this.composer) {
      this.composer.dispose();
    }

    this.cards = [];
  }
}

export default TechStackScene;
