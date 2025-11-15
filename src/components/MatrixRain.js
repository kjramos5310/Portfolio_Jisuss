/**
 * Matrix Rain Effect
 * Canvas 2D overlay con efecto de lluvia de caracteres estilo Matrix
 */
class MatrixRain {
  constructor() {
    // Canvas y contexto
    this.canvas = null;
    this.ctx = null;

    // Estado
    this.isActive = false;
    this.animationId = null;

    // Configuración de colores
    this.colors = {
      bright: '#00FF41',   // Verde brillante
      medium: '#008F11',   // Verde medio
      dark: '#003B00'      // Verde oscuro
    };

    // Caracteres a usar
    this.characters = this.generateCharacters();

    // Configuración de columnas
    this.columns = [];
    this.fontSize = 16;
    this.columnCount = 0;

    // Performance
    this.lastFrameTime = 0;
    this.targetFPS = 60;
    this.frameInterval = 1000 / this.targetFPS;

    // Inicializar
    this.init();
  }

  /**
   * Genera el conjunto de caracteres para la lluvia
   * Incluye números, letras y símbolos japoneses (katakana)
   */
  generateCharacters() {
    const chars = [];

    // Números
    for (let i = 0; i <= 9; i++) {
      chars.push(i.toString());
    }

    // Letras mayúsculas
    for (let i = 65; i <= 90; i++) {
      chars.push(String.fromCharCode(i));
    }

    // Símbolos japoneses (Katakana)
    // Rango Unicode: 0x30A0 - 0x30FF
    for (let i = 0x30A0; i <= 0x30FF; i++) {
      chars.push(String.fromCharCode(i));
    }

    // Algunos símbolos adicionales
    chars.push('¦', '｜', '▌', '▐', '░', '▒', '▓');

    return chars;
  }

  /**
   * Obtiene un caracter aleatorio del conjunto
   */
  getRandomChar() {
    return this.characters[Math.floor(Math.random() * this.characters.length)];
  }

  /**
   * Inicializa el canvas y las columnas
   */
  init() {
    // Crear canvas
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'matrix-rain';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none'; // No interferir con interacciones
    this.canvas.style.zIndex = '1'; // Sobre el canvas de Three.js
    this.canvas.style.opacity = '0'; // Inicialmente invisible
    this.canvas.style.transition = 'opacity 0.5s ease';

    // Obtener contexto
    this.ctx = this.canvas.getContext('2d');

    // Agregar al DOM
    document.body.appendChild(this.canvas);

    // Configurar tamaño
    this.resize();

    // Event listeners
    window.addEventListener('resize', () => this.resize());
  }

  /**
   * Ajusta el tamaño del canvas y reinicializa las columnas
   */
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Calcular número de columnas
    this.columnCount = Math.floor(this.canvas.width / this.fontSize);

    // Inicializar columnas
    this.initColumns();
  }

  /**
   * Inicializa las columnas con posiciones y velocidades aleatorias
   */
  initColumns() {
    this.columns = [];

    for (let i = 0; i < this.columnCount; i++) {
      this.columns.push({
        // Posición Y actual (en caracteres)
        y: Math.random() * -50, // Empezar arriba del canvas

        // Velocidad (caracteres por frame)
        speed: 0.3 + Math.random() * 0.7, // Entre 0.3 y 1.0

        // Caracteres de esta columna
        chars: [],

        // Longitud de la cola
        trailLength: 10 + Math.floor(Math.random() * 20), // Entre 10 y 30

        // Tiempo hasta el próximo cambio de caracter
        nextCharChange: 0
      });

      // Inicializar caracteres de la columna
      for (let j = 0; j < this.columns[i].trailLength; j++) {
        this.columns[i].chars.push(this.getRandomChar());
      }
    }
  }

  /**
   * Dibuja una columna específica
   */
  drawColumn(columnIndex) {
    const column = this.columns[columnIndex];
    const x = columnIndex * this.fontSize;

    // Dibujar cada caracter de la cola
    for (let i = 0; i < column.chars.length; i++) {
      const y = (column.y - i) * this.fontSize;

      // No dibujar si está fuera del canvas
      if (y < -this.fontSize || y > this.canvas.height) {
        continue;
      }

      // Calcular color basado en la posición en la cola
      let color;
      if (i === 0) {
        // Cabeza: color brillante
        color = this.colors.bright;
      } else if (i < 3) {
        // Cerca de la cabeza: color medio
        color = this.colors.medium;
      } else {
        // Cola: color oscuro con fade
        const alpha = 1 - (i / column.chars.length);
        color = this.colors.dark;
        this.ctx.globalAlpha = alpha;
      }

      // Dibujar caracter
      this.ctx.fillStyle = color;
      this.ctx.font = `${this.fontSize}px monospace`;
      this.ctx.fillText(column.chars[i], x, y);

      // Resetear alpha
      this.ctx.globalAlpha = 1;
    }
  }

  /**
   * Actualiza una columna
   */
  updateColumn(column) {
    // Mover hacia abajo
    column.y += column.speed;

    // Si salió de la pantalla, resetear
    if (column.y * this.fontSize > this.canvas.height + column.trailLength * this.fontSize) {
      column.y = Math.random() * -20;
      column.speed = 0.3 + Math.random() * 0.7;
    }

    // Cambiar caracteres aleatoriamente para efecto de "glitch"
    column.nextCharChange--;
    if (column.nextCharChange <= 0) {
      const charIndex = Math.floor(Math.random() * column.chars.length);
      column.chars[charIndex] = this.getRandomChar();
      column.nextCharChange = 2 + Math.floor(Math.random() * 5); // Cada 2-7 frames
    }
  }

  /**
   * Renderiza un frame
   */
  render(currentTime) {
    if (!this.isActive) return;

    // Control de FPS
    const deltaTime = currentTime - this.lastFrameTime;
    if (deltaTime < this.frameInterval) {
      this.animationId = requestAnimationFrame((time) => this.render(time));
      return;
    }
    this.lastFrameTime = currentTime - (deltaTime % this.frameInterval);

    // Fade effect: llenar con negro semi-transparente
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Actualizar y dibujar cada columna
    for (let i = 0; i < this.columns.length; i++) {
      this.updateColumn(this.columns[i]);
      this.drawColumn(i);
    }

    // Próximo frame
    this.animationId = requestAnimationFrame((time) => this.render(time));
  }

  /**
   * Activa el efecto
   */
  start() {
    if (this.isActive) return;

    this.isActive = true;
    this.canvas.style.opacity = '1';
    this.lastFrameTime = performance.now();
    this.animationId = requestAnimationFrame((time) => this.render(time));
  }

  /**
   * Desactiva el efecto
   */
  stop() {
    if (!this.isActive) return;

    this.isActive = false;
    this.canvas.style.opacity = '0';

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Limpiar canvas
    setTimeout(() => {
      if (!this.isActive) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }, 500); // Esperar a que termine la transición
  }

  /**
   * Toggle del efecto
   */
  toggle() {
    if (this.isActive) {
      this.stop();
    } else {
      this.start();
    }
    return this.isActive;
  }

  /**
   * Destruye el componente
   */
  destroy() {
    this.stop();
    window.removeEventListener('resize', () => this.resize());
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

export default MatrixRain;
