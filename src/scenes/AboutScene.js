import * as THREE from 'three';
import { MatrixTerminal } from '../components/Terminal.js';

/**
 * AboutScene - Sección "About Me" del portfolio
 *
 * Características:
 * - Terminal integrado con comandos personalizados
 * - Modelo 3D de servidor con luces pulsantes
 * - Sistema de partículas representando flujo de datos
 * - Layout responsivo con transición smooth desde Hero
 */
export class AboutScene {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    // Referencias a objetos
    this.server = null;
    this.serverLights = [];
    this.dataParticles = null;
    this.terminal = null;
    this.isActive = false;

    // Control de animación
    this.clock = new THREE.Clock();

    // Inicializar todos los elementos
    this.init();
  }

  /**
   * Inicializa todos los elementos de la escena
   */
  init() {
    this.createServerModel();
    this.createDataParticleSystem();
    this.createTerminalUI();
  }

  /**
   * Crea el modelo 3D del servidor con decoraciones
   */
  createServerModel() {
    // Grupo principal del servidor
    const serverGroup = new THREE.Group();

    // Cuerpo principal del servidor (rack)
    const rackGeometry = new THREE.BoxGeometry(3, 4, 1.5);
    const rackMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.8,
      roughness: 0.3,
      emissive: 0x0a0a0a,
      emissiveIntensity: 0.2
    });
    const rack = new THREE.Mesh(rackGeometry, rackMaterial);
    serverGroup.add(rack);

    // Bordes y detalles del rack
    const edgesGeometry = new THREE.EdgesGeometry(rackGeometry);
    const edgesMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff41,
      linewidth: 2
    });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    serverGroup.add(edges);

    // Unidades del servidor (bandejas horizontales)
    const unitHeight = 0.3;
    const unitGap = 0.1;
    const numUnits = 8;

    for (let i = 0; i < numUnits; i++) {
      const yPos = 1.5 - i * (unitHeight + unitGap);

      // Bandeja de la unidad
      const unitGeometry = new THREE.BoxGeometry(2.8, unitHeight, 1.3);
      const unitMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        metalness: 0.9,
        roughness: 0.2
      });
      const unit = new THREE.Mesh(unitGeometry, unitMaterial);
      unit.position.y = yPos;
      serverGroup.add(unit);

      // Luz pulsante verde en cada unidad
      const lightGeometry = new THREE.SphereGeometry(0.08, 16, 16);
      const lightMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff41,
        emissive: 0x00ff41,
        emissiveIntensity: 1,
        transparent: true,
        opacity: 0.9
      });
      const light = new THREE.Mesh(lightGeometry, lightMaterial);
      light.position.set(1.2, yPos, 0.7);

      // Añadir punto de luz real
      const pointLight = new THREE.PointLight(0x00ff41, 0.5, 3);
      pointLight.position.copy(light.position);
      serverGroup.add(pointLight);

      serverGroup.add(light);
      this.serverLights.push({ mesh: light, pointLight: pointLight, offset: i * 0.5 });

      // Detalles de ventilación (pequeños agujeros)
      const ventCount = 10;
      for (let v = 0; v < ventCount; v++) {
        const ventGeometry = new THREE.BoxGeometry(0.05, unitHeight * 0.6, 0.05);
        const ventMaterial = new THREE.MeshStandardMaterial({
          color: 0x000000,
          metalness: 0.5,
          roughness: 0.8
        });
        const vent = new THREE.Mesh(ventGeometry, ventMaterial);
        vent.position.set(-1.2 + v * 0.25, yPos, 0.7);
        serverGroup.add(vent);
      }
    }

    // Panel frontal con detalles
    const panelGeometry = new THREE.PlaneGeometry(2.9, 3.9);
    const panelMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.7,
      roughness: 0.4,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.z = 0.76;
    serverGroup.add(panel);

    // Texto "SERVER-01" en el panel
    const textCanvas = this.createServerTextTexture('SERVER-01');
    const textTexture = new THREE.CanvasTexture(textCanvas);
    const textMaterial = new THREE.MeshBasicMaterial({
      map: textTexture,
      transparent: true,
      opacity: 0.8
    });
    const textGeometry = new THREE.PlaneGeometry(2, 0.5);
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2.2, 0.77);
    serverGroup.add(textMesh);

    // Base del servidor
    const baseGeometry = new THREE.BoxGeometry(3.2, 0.2, 1.7);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      metalness: 0.9,
      roughness: 0.1
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -2.1;
    serverGroup.add(base);

    // Posicionar el servidor a la derecha de la escena
    serverGroup.position.set(4, 0, -2);
    serverGroup.rotation.y = -Math.PI / 6; // Rotación leve hacia la cámara

    // Inicialmente invisible hasta que se active la escena
    serverGroup.visible = false;

    this.server = serverGroup;
    this.scene.add(serverGroup);
  }

  /**
   * Crea textura de canvas con texto para el servidor
   */
  createServerTextTexture(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Fondo transparente
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Texto verde neón
    ctx.fillStyle = '#00ff41';
    ctx.font = 'bold 48px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#00ff41';
    ctx.shadowBlur = 15;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    return canvas;
  }

  /**
   * Crea el sistema de partículas que representan flujo de datos
   */
  createDataParticleSystem() {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    const lifetimes = [];

    // Crear textura para las partículas
    const particleTexture = this.createDataParticleTexture();

    // Inicializar partículas que salen del servidor
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Posición inicial cerca del servidor
      positions[i3] = 4 + (Math.random() - 0.5) * 2;
      positions[i3 + 1] = (Math.random() - 0.5) * 3;
      positions[i3 + 2] = -2 + (Math.random() - 0.5);

      // Velocidad: las partículas fluyen hacia afuera
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.01 + Math.random() * 0.02;
      velocities.push({
        x: Math.cos(angle) * speed,
        y: (Math.random() - 0.5) * speed * 0.5,
        z: Math.sin(angle) * speed
      });

      // Tiempo de vida aleatorio
      lifetimes.push(Math.random() * 100);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Material de partículas brillantes
    const material = new THREE.PointsMaterial({
      size: 0.15,
      map: particleTexture,
      transparent: true,
      opacity: 0.8,
      color: 0x00ff41,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.dataParticles = new THREE.Points(geometry, material);
    this.dataParticles.userData.velocities = velocities;
    this.dataParticles.userData.lifetimes = lifetimes;
    this.dataParticles.userData.particleCount = particleCount;

    // Inicialmente invisible hasta que se active la escena
    this.dataParticles.visible = false;

    this.scene.add(this.dataParticles);
  }

  /**
   * Crea textura para las partículas de datos
   */
  createDataParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Crear un círculo brillante
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(0, 255, 65, 1)');
    gradient.addColorStop(0.3, 'rgba(0, 255, 65, 0.8)');
    gradient.addColorStop(0.6, 'rgba(0, 255, 65, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 255, 65, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Crea la interfaz del terminal
   */
  createTerminalUI() {
    // Crear contenedor del terminal en el HTML
    const terminalContainer = document.createElement('div');
    terminalContainer.id = 'about-terminal-container';
    terminalContainer.style.cssText = `
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 900px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 1s ease;
      z-index: 10;
    `;
    document.body.appendChild(terminalContainer);

    // Inicializar el terminal con comandos personalizados
    this.terminal = new MatrixTerminal('about-terminal-container', {
      enableCRT: true,
      typewriterSpeed: 20,
      promptSymbol: '$ ',
      userName: 'jebus'
    });

    // Personalizar los comandos del terminal
    this.customizeTerminalCommands();
  }

  /**
   * Personaliza los comandos del terminal según los requisitos
   */
  customizeTerminalCommands() {
    if (!this.terminal) return;

    // Reemplazar comandos con los personalizados
    this.terminal.commands = {
      whoami: async () => {
        await this.terminal.addOutput('', '', false);
        await this.terminal.addOutput('> Jebus - Cybersecurity Analyst & IT Engineering Student', 'success', true);
        await this.terminal.addOutput('', '', false);
      },
      'cat experience.txt': async () => {
        const lines = [
          '',
          '> SOC Analyst Intern - $156/mo',
          '> Tools: Microsoft Sentinel, Defender, Lumu, Sophos',
          '> Focus: Log analysis, Incident Response, Vulnerability Assessment',
          ''
        ];
        await this.terminal.addMultipleLines(lines, 'success', true);
      },
      'ls interests/': async () => {
        const lines = [
          '',
          '> philosophy/  calisthenics/  flow-states/  automotive/',
          ''
        ];
        await this.terminal.addMultipleLines(lines, 'success', true);
      },
      'pwd': async () => {
        await this.terminal.addOutput('', '', false);
        await this.terminal.addOutput('> /home/jebus/ESPE/final-semester', 'success', true);
        await this.terminal.addOutput('', '', false);
      },
      help: async () => {
        const output = [
          '',
          '╭─ AVAILABLE COMMANDS ──────────────────────────────╮',
          '│                                                   │',
          '│  whoami               - Display user info         │',
          '│  cat experience.txt   - Show work experience      │',
          '│  ls interests/        - List interests            │',
          '│  pwd                  - Current directory         │',
          '│  clear                - Clear terminal screen     │',
          '│  help                 - Show this help message    │',
          '│                                                   │',
          '│  TIP: Use ↑↓ arrows to navigate command history  │',
          '│                                                   │',
          '╰───────────────────────────────────────────────────╯',
          ''
        ];
        await this.terminal.addMultipleLines(output, '', true);
      },
      clear: async () => {
        this.terminal.output.innerHTML = '';
      }
    };

    // Actualizar el mensaje de bienvenida
    this.terminal.displayWelcomeMessage = async () => {
      const welcome = [
        '',
        '╔═══════════════════════════════════════════════════════════╗',
        '║              ABOUT JEBUS - SECURE TERMINAL                ║',
        '╚═══════════════════════════════════════════════════════════╝',
        '',
        '> Loading profile...',
        '> Cybersecurity protocols active',
        '> System ready',
        '',
        'Type "help" to see available commands',
        ''
      ];
      await this.terminal.addMultipleLines(welcome, 'success', true);
    };
  }

  /**
   * Activa la escena About (transición desde Hero)
   */
  async activate() {
    if (this.isActive) return;
    this.isActive = true;

    // Hacer visibles los elementos 3D
    if (this.server) {
      this.server.visible = true;
    }
    if (this.dataParticles) {
      this.dataParticles.visible = true;
    }

    // Mostrar el terminal con fade-in
    const container = document.getElementById('about-terminal-container');
    if (container) {
      container.style.opacity = '1';
      container.style.pointerEvents = 'auto';
    }

    // Reinicializar el terminal con el mensaje de bienvenida
    if (this.terminal) {
      this.terminal.output.innerHTML = '';
      await this.terminal.displayWelcomeMessage();
    }

    // Animar la cámara para enfocar el servidor
    this.animateCamera();
  }

  /**
   * Desactiva la escena About
   */
  deactivate() {
    if (!this.isActive) return;
    this.isActive = false;

    // Ocultar elementos 3D
    if (this.server) {
      this.server.visible = false;
    }
    if (this.dataParticles) {
      this.dataParticles.visible = false;
    }

    // Ocultar el terminal con fade-out
    const container = document.getElementById('about-terminal-container');
    if (container) {
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
    }
  }

  /**
   * Anima la cámara para enfocar el servidor
   */
  animateCamera() {
    // La animación de cámara se maneja en main.js via animateCameraTransition
    console.log('📹 About scene activated - Camera transitioning');

    // Ajustar controles de órbita para mejor visualización del servidor
    // Esto se podría expandir en el futuro si es necesario
  }

  /**
   * Actualiza la animación de todos los elementos
   */
  update() {
    if (!this.isActive) return;

    const elapsedTime = this.clock.getElapsedTime();

    // Animar luces pulsantes del servidor
    if (this.serverLights.length > 0) {
      this.serverLights.forEach((light) => {
        // Pulso sinusoidal con offset para efecto secuencial
        const pulse = Math.sin(elapsedTime * 2 + light.offset) * 0.3 + 0.7;
        light.mesh.material.emissiveIntensity = pulse;
        light.pointLight.intensity = pulse * 0.5;
      });
    }

    // Rotación lenta del servidor
    if (this.server) {
      this.server.rotation.y = Math.sin(elapsedTime * 0.2) * 0.1 - Math.PI / 6;
      this.server.position.y = Math.sin(elapsedTime * 0.5) * 0.1;
    }

    // Animar partículas de datos
    if (this.dataParticles) {
      const positions = this.dataParticles.geometry.attributes.position.array;
      const velocities = this.dataParticles.userData.velocities;
      const lifetimes = this.dataParticles.userData.lifetimes;
      const particleCount = this.dataParticles.userData.particleCount;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Actualizar posiciones
        positions[i3] += velocities[i].x;
        positions[i3 + 1] += velocities[i].y;
        positions[i3 + 2] += velocities[i].z;

        // Actualizar tiempo de vida
        lifetimes[i] += 1;

        // Resetear partícula si está muy lejos o ha vivido mucho tiempo
        const distance = Math.sqrt(
          Math.pow(positions[i3] - 4, 2) +
          Math.pow(positions[i3 + 1], 2) +
          Math.pow(positions[i3 + 2] + 2, 2)
        );

        if (distance > 8 || lifetimes[i] > 200) {
          // Resetear a la posición inicial cerca del servidor
          positions[i3] = 4 + (Math.random() - 0.5) * 2;
          positions[i3 + 1] = (Math.random() - 0.5) * 3;
          positions[i3 + 2] = -2 + (Math.random() - 0.5);

          // Nueva velocidad
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.01 + Math.random() * 0.02;
          velocities[i].x = Math.cos(angle) * speed;
          velocities[i].y = (Math.random() - 0.5) * speed * 0.5;
          velocities[i].z = Math.sin(angle) * speed;

          lifetimes[i] = 0;
        }
      }

      this.dataParticles.geometry.attributes.position.needsUpdate = true;
    }
  }

  /**
   * Maneja el redimensionamiento de la ventana
   */
  onResize(width, height) {
    // Ajustar posición del terminal si es necesario
    const container = document.getElementById('about-terminal-container');
    if (container && width < 768) {
      container.style.width = '95%';
    } else if (container) {
      container.style.width = '90%';
    }
  }

  /**
   * Limpia los recursos cuando se destruye la escena
   */
  dispose() {
    // Limpiar servidor
    if (this.server) {
      this.server.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      });
      this.scene.remove(this.server);
    }

    // Limpiar partículas
    if (this.dataParticles) {
      this.dataParticles.geometry.dispose();
      this.dataParticles.material.dispose();
      if (this.dataParticles.material.map) {
        this.dataParticles.material.map.dispose();
      }
      this.scene.remove(this.dataParticles);
    }

    // Limpiar terminal UI
    const container = document.getElementById('about-terminal-container');
    if (container) {
      container.remove();
    }

    if (this.terminal) {
      this.terminal.destroy();
    }

    this.serverLights = [];
  }
}

export default AboutScene;
