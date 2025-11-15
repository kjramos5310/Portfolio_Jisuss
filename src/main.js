import { MatrixTerminal } from './components/Terminal.js';

/**
 * Inicialización del Portfolio - Terminal Matrix
 */
class PortfolioApp {
  constructor() {
    console.log('🚀 Iniciando Portfolio de Jebus...');
    this.terminal = null;
    this.init();
  }

  init() {
    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initTerminal());
    } else {
      this.initTerminal();
    }
  }

  initTerminal() {
    console.log('🔄 Inicializando terminal...');

    const container = document.getElementById('terminal-container');

    if (!container) {
      console.error('❌ Error: No se encontró el contenedor del terminal');
      return;
    }

    try {
      // Crear instancia del terminal
      this.terminal = new MatrixTerminal('terminal-container', {
        enableCRT: true,
        typewriterSpeed: 30,
        promptSymbol: '$ ',
        userName: 'jebus'
      });

      console.log('✅ Terminal inicializado correctamente');
      console.log('💡 Prueba los comandos: whoami, cat skills.txt, ls projects/, neofetch, help');

      // Auto-ejecutar neofetch después de 2 segundos
      setTimeout(() => {
        console.log('🎬 Ejecutando comando de bienvenida...');
        if (this.terminal && this.terminal.runCommand) {
          this.terminal.runCommand('neofetch');
        }
      }, 2000);

    } catch (error) {
      console.error('❌ Error al inicializar el terminal:', error);
    }
  }
}

// Inicializar la aplicación
const app = new PortfolioApp();

export default app;
