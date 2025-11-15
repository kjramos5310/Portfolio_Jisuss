/**
 * MatrixTerminal - Componente de terminal estilo Matrix con efectos CRT
 *
 * Características:
 * - Efecto typewriter para texto
 * - Comandos simulados interactivos
 * - Cursor parpadeante verde
 * - Scroll automático
 * - History de comandos con flechas arriba/abajo
 * - Estilos CRT opcionales
 * - Tema verde Matrix
 */
export class MatrixTerminal {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);

    if (!this.container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }

    // Opciones configurables
    this.options = {
      enableCRT: options.enableCRT !== undefined ? options.enableCRT : true,
      typewriterSpeed: options.typewriterSpeed || 30,
      promptSymbol: options.promptSymbol || '$ ',
      userName: options.userName || 'jebus',
      ...options
    };

    // Estado del terminal
    this.commandHistory = [];
    this.historyIndex = -1;
    this.currentCommand = '';
    this.isTyping = false;

    // Datos del usuario
    this.userData = {
      name: 'Jebus',
      role: 'Cybersecurity Analyst @ SOC',
      location: 'Ecuador',
      skills: [
        'Microsoft Sentinel',
        'Microsoft Defender',
        'Spring Boot',
        'React',
        'WebSocket',
        'SIEM & Log Analysis',
        'Threat Detection',
        'Incident Response'
      ],
      projects: [
        'SOC-Dashboard/',
        'ThreatIntel-Analyzer/',
        'SecureAuth-API/',
        'RealTime-Monitor/',
        'Portfolio-3D/'
      ]
    };

    // Comandos disponibles
    this.commands = {
      whoami: this.cmdWhoami.bind(this),
      'cat skills.txt': this.cmdCatSkills.bind(this),
      'ls projects/': this.cmdLsProjects.bind(this),
      help: this.cmdHelp.bind(this),
      clear: this.cmdClear.bind(this),
      about: this.cmdAbout.bind(this),
      contact: this.cmdContact.bind(this),
      neofetch: this.cmdNeofetch.bind(this)
    };

    this.init();
  }

  /**
   * Inicializa el terminal
   */
  init() {
    this.createTerminalStructure();
    this.setupEventListeners();
    this.displayWelcomeMessage();
  }

  /**
   * Crea la estructura HTML del terminal
   */
  createTerminalStructure() {
    this.container.innerHTML = `
      <div class="matrix-terminal ${this.options.enableCRT ? 'crt-effect' : ''}">
        <div class="terminal-header">
          <div class="terminal-buttons">
            <span class="terminal-button close"></span>
            <span class="terminal-button minimize"></span>
            <span class="terminal-button maximize"></span>
          </div>
          <div class="terminal-title">jebus@matrix:~</div>
        </div>
        <div class="terminal-body">
          <div class="terminal-output" id="${this.containerId}-output"></div>
          <div class="terminal-input-line">
            <span class="terminal-prompt">${this.options.promptSymbol}</span>
            <input
              type="text"
              class="terminal-input"
              id="${this.containerId}-input"
              autocomplete="off"
              spellcheck="false"
              autofocus
            />
            <span class="terminal-cursor">█</span>
          </div>
        </div>
      </div>
    `;

    this.output = document.getElementById(`${this.containerId}-output`);
    this.input = document.getElementById(`${this.containerId}-input`);

    this.applyStyles();
  }

  /**
   * Aplica los estilos CSS al terminal
   */
  applyStyles() {
    const styleId = 'matrix-terminal-styles';

    // Evitar duplicar estilos si ya existen
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .matrix-terminal {
        background: #0a0a0a;
        border: 2px solid #00ff41;
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(0, 255, 65, 0.3),
                    inset 0 0 50px rgba(0, 255, 65, 0.05);
        font-family: 'Courier New', monospace;
        color: #00ff41;
        overflow: hidden;
        max-width: 900px;
        margin: 0 auto;
      }

      /* Efecto CRT */
      .matrix-terminal.crt-effect {
        animation: crt-flicker 0.15s infinite;
      }

      .matrix-terminal.crt-effect::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          to bottom,
          transparent 50%,
          rgba(0, 255, 65, 0.03) 51%
        );
        background-size: 100% 4px;
        pointer-events: none;
        z-index: 10;
      }

      .matrix-terminal.crt-effect::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(
          ellipse at center,
          transparent 0%,
          rgba(0, 0, 0, 0.3) 100%
        );
        pointer-events: none;
        z-index: 11;
      }

      @keyframes crt-flicker {
        0%, 100% { opacity: 0.98; }
        50% { opacity: 1; }
      }

      /* Header */
      .terminal-header {
        background: #0d0d0d;
        padding: 10px 15px;
        border-bottom: 1px solid #00ff41;
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .terminal-buttons {
        display: flex;
        gap: 8px;
      }

      .terminal-button {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        display: inline-block;
      }

      .terminal-button.close {
        background: #ff5f56;
        box-shadow: 0 0 5px #ff5f56;
      }

      .terminal-button.minimize {
        background: #ffbd2e;
        box-shadow: 0 0 5px #ffbd2e;
      }

      .terminal-button.maximize {
        background: #27c93f;
        box-shadow: 0 0 5px #27c93f;
      }

      .terminal-title {
        font-size: 13px;
        color: #00ff41;
        text-shadow: 0 0 10px #00ff41;
      }

      /* Body */
      .terminal-body {
        padding: 20px;
        min-height: 400px;
        max-height: 600px;
        overflow-y: auto;
        position: relative;
      }

      .terminal-body::-webkit-scrollbar {
        width: 10px;
      }

      .terminal-body::-webkit-scrollbar-track {
        background: #0a0a0a;
      }

      .terminal-body::-webkit-scrollbar-thumb {
        background: #00ff41;
        border-radius: 5px;
        box-shadow: 0 0 10px #00ff41;
      }

      /* Output */
      .terminal-output {
        margin-bottom: 10px;
        line-height: 1.6;
      }

      .terminal-line {
        margin: 5px 0;
        white-space: pre-wrap;
        word-wrap: break-word;
      }

      .terminal-line.command {
        color: #00ff41;
        text-shadow: 0 0 5px #00ff41;
      }

      .terminal-line.error {
        color: #ff4444;
        text-shadow: 0 0 5px #ff4444;
      }

      .terminal-line.success {
        color: #00ffff;
        text-shadow: 0 0 5px #00ffff;
      }

      .terminal-line.warning {
        color: #ffaa00;
        text-shadow: 0 0 5px #ffaa00;
      }

      /* Input */
      .terminal-input-line {
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .terminal-prompt {
        color: #00ff41;
        text-shadow: 0 0 10px #00ff41;
        font-weight: bold;
      }

      .terminal-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: #00ff41;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        caret-color: transparent;
      }

      /* Cursor parpadeante */
      .terminal-cursor {
        color: #00ff41;
        animation: cursor-blink 1s infinite;
        text-shadow: 0 0 10px #00ff41;
        font-weight: bold;
      }

      @keyframes cursor-blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }

      /* Efectos de brillo */
      .terminal-glow {
        text-shadow: 0 0 10px #00ff41, 0 0 20px #00ff41;
      }

      /* ASCII Art */
      .ascii-art {
        color: #00ffff;
        text-shadow: 0 0 5px #00ffff;
        font-size: 12px;
        line-height: 1.2;
      }

      /* Animaciones */
      @keyframes text-flicker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }

      .text-typing {
        animation: text-flicker 0.1s infinite;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Enter para ejecutar comando
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleCommand();
      }
      // Flecha arriba - comando anterior
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigateHistory('up');
      }
      // Flecha abajo - comando siguiente
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.navigateHistory('down');
      }
    });

    // Click en el terminal para hacer focus en el input
    this.container.addEventListener('click', () => {
      this.input.focus();
    });
  }

  /**
   * Navega por el historial de comandos
   */
  navigateHistory(direction) {
    if (this.commandHistory.length === 0) return;

    if (direction === 'up') {
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        this.input.value = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
      }
    } else if (direction === 'down') {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.input.value = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
      } else if (this.historyIndex === 0) {
        this.historyIndex = -1;
        this.input.value = '';
      }
    }
  }

  /**
   * Maneja la ejecución de un comando
   */
  async handleCommand() {
    const command = this.input.value.trim();

    if (!command) return;

    // Agregar al historial
    this.commandHistory.push(command);
    this.historyIndex = -1;

    // Mostrar el comando ejecutado
    this.addOutput(`${this.options.promptSymbol}${command}`, 'command');

    // Limpiar input
    this.input.value = '';

    // Ejecutar comando
    await this.executeCommand(command);

    // Scroll automático al final
    this.scrollToBottom();
  }

  /**
   * Ejecuta un comando
   */
  async executeCommand(command) {
    const cmd = command.toLowerCase().trim();

    // Buscar comando exacto o parcial
    if (this.commands[cmd]) {
      await this.commands[cmd]();
    } else if (this.commands[command]) {
      await this.commands[command]();
    } else {
      this.addOutput(`bash: ${command}: command not found`, 'error');
      this.addOutput(`Type 'help' for available commands`, 'warning');
    }
  }

  /**
   * Agrega texto al output con efecto typewriter
   */
  async addOutput(text, type = '', useTypewriter = false) {
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;

    if (useTypewriter) {
      this.isTyping = true;
      line.classList.add('text-typing');
      this.output.appendChild(line);

      for (let i = 0; i < text.length; i++) {
        line.textContent += text[i];
        await this.sleep(this.options.typewriterSpeed);
      }

      line.classList.remove('text-typing');
      this.isTyping = false;
    } else {
      line.textContent = text;
      this.output.appendChild(line);
    }
  }

  /**
   * Agrega múltiples líneas al output
   */
  async addMultipleLines(lines, type = '', useTypewriter = false) {
    for (const line of lines) {
      await this.addOutput(line, type, useTypewriter);
    }
  }

  /**
   * Scroll automático al final del terminal
   */
  scrollToBottom() {
    const terminalBody = this.container.querySelector('.terminal-body');
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  /**
   * Utilidad para esperar
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Mensaje de bienvenida
   */
  async displayWelcomeMessage() {
    const welcome = [
      '',
      '╔═══════════════════════════════════════════════════════════╗',
      '║          MATRIX TERMINAL v1.0.0 - SECURE ACCESS          ║',
      '╚═══════════════════════════════════════════════════════════╝',
      '',
      '> Initializing secure connection...',
      '> Loading cybersecurity modules...',
      '> Welcome to the Matrix, Jebus',
      '',
      'Type "help" to see available commands',
      'Type "neofetch" for system information',
      ''
    ];

    await this.addMultipleLines(welcome, 'success', true);
  }

  // ==================== COMANDOS ====================

  /**
   * Comando: whoami
   */
  async cmdWhoami() {
    const output = [
      '',
      `┌─ USER IDENTIFICATION ─────────────────────────┐`,
      `│                                               │`,
      `│  Name:     ${this.userData.name.padEnd(33)} │`,
      `│  Role:     ${this.userData.role.padEnd(33)} │`,
      `│  Location: ${this.userData.location.padEnd(33)} │`,
      `│                                               │`,
      `└───────────────────────────────────────────────┘`,
      ''
    ];

    await this.addMultipleLines(output, 'success', true);
  }

  /**
   * Comando: cat skills.txt
   */
  async cmdCatSkills() {
    const output = [
      '',
      '📄 skills.txt',
      '─────────────────────────────────────────────',
      ''
    ];

    await this.addMultipleLines(output, '', false);

    // Mostrar skills con efecto typewriter
    for (let i = 0; i < this.userData.skills.length; i++) {
      const skill = this.userData.skills[i];
      await this.addOutput(`  ${(i + 1).toString().padStart(2, '0')}. ${skill}`, 'success', true);
    }

    await this.addOutput('', '', false);
  }

  /**
   * Comando: ls projects/
   */
  async cmdLsProjects() {
    await this.addOutput('', '', false);

    for (const project of this.userData.projects) {
      const icon = '📁';
      await this.addOutput(`${icon} ${project}`, 'success', true);
      await this.sleep(100);
    }

    await this.addOutput('', '', false);
  }

  /**
   * Comando: help
   */
  async cmdHelp() {
    const output = [
      '',
      '╭─ AVAILABLE COMMANDS ──────────────────────────────╮',
      '│                                                   │',
      '│  whoami            - Display user information     │',
      '│  cat skills.txt    - List technical skills        │',
      '│  ls projects/      - List projects                │',
      '│  about             - About Jebus                  │',
      '│  contact           - Contact information          │',
      '│  neofetch          - System information           │',
      '│  clear             - Clear terminal screen        │',
      '│  help              - Show this help message       │',
      '│                                                   │',
      '│  TIP: Use ↑↓ arrows to navigate command history  │',
      '│                                                   │',
      '╰───────────────────────────────────────────────────╯',
      ''
    ];

    await this.addMultipleLines(output, '', true);
  }

  /**
   * Comando: clear
   */
  async cmdClear() {
    this.output.innerHTML = '';
  }

  /**
   * Comando: about
   */
  async cmdAbout() {
    const output = [
      '',
      '╔═══════════════════════════════════════════════════════════╗',
      '║                       ABOUT JEBUS                         ║',
      '╚═══════════════════════════════════════════════════════════╝',
      '',
      '  🛡️  Cybersecurity Analyst working at a SOC',
      '  🌎  Based in Ecuador',
      '  💻  Passionate about security, development, and innovation',
      '',
      '  EXPERTISE:',
      '  ──────────',
      '  • Security Operations & Monitoring',
      '  • SIEM (Microsoft Sentinel)',
      '  • Endpoint Protection (Microsoft Defender)',
      '  • Full-Stack Development (Spring Boot + React)',
      '  • Real-time Communication (WebSocket)',
      '',
      '  MISSION:',
      '  ────────',
      '  Protecting digital assets while building innovative',
      '  solutions that combine security and technology.',
      ''
    ];

    await this.addMultipleLines(output, 'success', true);
  }

  /**
   * Comando: contact
   */
  async cmdContact() {
    const output = [
      '',
      '╭─ CONTACT INFORMATION ─────────────────────────────╮',
      '│                                                   │',
      '│  📧  Email:    jebus@matrix.dev                   │',
      '│  💼  LinkedIn: linkedin.com/in/jebus              │',
      '│  🐙  GitHub:   github.com/jebus                   │',
      '│  🌐  Website:  jebus.dev                          │',
      '│                                                   │',
      '╰───────────────────────────────────────────────────╯',
      ''
    ];

    await this.addMultipleLines(output, 'success', true);
  }

  /**
   * Comando: neofetch
   */
  async cmdNeofetch() {
    const asciiArt = [
      '',
      '         ▟█▙            ',
      '        ▟███▙           ',
      '       ▟█████▙          ',
      '      ▟███████▙         ',
      '     ▂▔▔▔▔▔▔▔▔▔▂        ',
      '    ▕ MATRIX OS ▏       ',
      '     ▔▔▔▔▔▔▔▔▔▔▔        ',
      ''
    ];

    const info = [
      `jebus@matrix`,
      `─────────────`,
      `OS: Matrix OS v13.37`,
      `Host: SOC Terminal`,
      `Kernel: SecureCore 5.15.0`,
      `Uptime: 365 days`,
      `Shell: bash 5.1.16`,
      `Resolution: ${window.innerWidth}x${window.innerHeight}`,
      `Terminal: MatrixTerminal`,
      `CPU: Neural Processor i9`,
      `Memory: Unlimited`,
      ``,
      `███ ███ ███ ███ ███ ███ ███ ███`,
      ``
    ];

    // Mostrar ASCII art y info lado a lado
    await this.addOutput('', '', false);

    const maxLines = Math.max(asciiArt.length, info.length);
    for (let i = 0; i < maxLines; i++) {
      const art = asciiArt[i] || '';
      const infoLine = info[i] || '';
      const line = `${art.padEnd(25)}  ${infoLine}`;
      await this.addOutput(line, i < asciiArt.length ? 'success' : '', i === 0);
      await this.sleep(50);
    }
  }

  /**
   * Habilitar/Deshabilitar efecto CRT
   */
  toggleCRT(enable) {
    const terminal = this.container.querySelector('.matrix-terminal');
    if (enable) {
      terminal.classList.add('crt-effect');
    } else {
      terminal.classList.remove('crt-effect');
    }
  }

  /**
   * Ejecutar comando programáticamente
   */
  async runCommand(command) {
    this.input.value = command;
    await this.handleCommand();
  }

  /**
   * Destruir el terminal y limpiar recursos
   */
  destroy() {
    this.container.innerHTML = '';
    this.commandHistory = [];
  }
}

export default MatrixTerminal;
