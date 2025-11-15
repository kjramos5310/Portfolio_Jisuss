/**
 * Ejemplo de uso del componente MatrixTerminal
 *
 * Este archivo muestra cómo integrar el terminal en tu aplicación
 */
import { MatrixTerminal } from './Terminal.js';

/**
 * Función para inicializar el terminal en una página
 */
export function initializeTerminal() {
  // Crear el terminal con opciones personalizadas
  const terminal = new MatrixTerminal('terminal-container', {
    enableCRT: true,              // Habilitar efecto CRT
    typewriterSpeed: 30,           // Velocidad del efecto typewriter (ms)
    promptSymbol: '$ ',            // Símbolo del prompt
    userName: 'jebus'              // Nombre de usuario
  });

  // Opcional: Ejecutar comandos programáticamente
  // setTimeout(() => {
  //   terminal.runCommand('neofetch');
  // }, 2000);

  return terminal;
}

/**
 * Ejemplo de integración en HTML
 *
 * Agrega este div en tu index.html:
 *
 * <div id="terminal-container"></div>
 *
 * Y luego en tu main.js:
 *
 * import { initializeTerminal } from './components/TerminalExample.js';
 *
 * // Inicializar el terminal cuando el DOM esté listo
 * document.addEventListener('DOMContentLoaded', () => {
 *   const terminal = initializeTerminal();
 * });
 */

/**
 * Ejemplo de uso avanzado
 */
export function advancedTerminalExample() {
  const terminal = new MatrixTerminal('terminal-container', {
    enableCRT: true,
    typewriterSpeed: 20
  });

  // Ejecutar una secuencia de comandos
  const runCommandSequence = async () => {
    await terminal.sleep(2000);
    await terminal.runCommand('whoami');

    await terminal.sleep(2000);
    await terminal.runCommand('cat skills.txt');

    await terminal.sleep(2000);
    await terminal.runCommand('ls projects/');
  };

  // Ejecutar la secuencia
  runCommandSequence();

  // Toggle CRT effect con un botón
  const crtButton = document.getElementById('toggle-crt');
  if (crtButton) {
    let crtEnabled = true;
    crtButton.addEventListener('click', () => {
      crtEnabled = !crtEnabled;
      terminal.toggleCRT(crtEnabled);
    });
  }

  return terminal;
}

export default initializeTerminal;
