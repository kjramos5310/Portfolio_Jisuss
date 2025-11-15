# Matrix Terminal Component

Componente de terminal interactivo estilo Matrix con efectos visuales CRT y comandos simulados.

## Características

- ✨ **Efecto Typewriter**: Texto que se escribe automáticamente
- 💻 **Comandos Simulados**: Comandos interactivos predefinidos
- 🟢 **Cursor Parpadeante**: Cursor verde tipo Matrix
- 📜 **Scroll Automático**: Se desplaza automáticamente al final
- 🔄 **History de Comandos**: Navega con flechas ↑↓
- 📺 **Estilos CRT**: Efectos de monitor CRT retro opcionales
- 🎨 **Tema Matrix**: Colores verde neón con efectos de brillo

## Instalación

1. Importa el componente en tu archivo JavaScript:

```javascript
import { MatrixTerminal } from './components/Terminal.js';
```

2. Agrega un contenedor en tu HTML:

```html
<div id="terminal-container"></div>
```

3. Inicializa el terminal:

```javascript
const terminal = new MatrixTerminal('terminal-container', {
  enableCRT: true,
  typewriterSpeed: 30
});
```

## Uso Básico

```javascript
// Crear terminal con opciones por defecto
const terminal = new MatrixTerminal('terminal-container');
```

## Opciones de Configuración

```javascript
const terminal = new MatrixTerminal('terminal-container', {
  enableCRT: true,         // Habilitar efecto CRT (default: true)
  typewriterSpeed: 30,     // Velocidad en ms (default: 30)
  promptSymbol: '$ ',      // Símbolo del prompt (default: '$ ')
  userName: 'jebus'        // Nombre de usuario (default: 'jebus')
});
```

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `whoami` | Muestra información del usuario |
| `cat skills.txt` | Lista de habilidades técnicas |
| `ls projects/` | Lista de proyectos |
| `about` | Información sobre Jebus |
| `contact` | Información de contacto |
| `neofetch` | Información del sistema estilo neofetch |
| `clear` | Limpia la pantalla del terminal |
| `help` | Muestra la ayuda de comandos |

## Métodos del Terminal

### `runCommand(command)`
Ejecuta un comando programáticamente:

```javascript
terminal.runCommand('whoami');
```

### `toggleCRT(enable)`
Habilita o deshabilita el efecto CRT:

```javascript
terminal.toggleCRT(true);  // Habilitar
terminal.toggleCRT(false); // Deshabilitar
```

### `addOutput(text, type, useTypewriter)`
Agrega texto al output del terminal:

```javascript
terminal.addOutput('Hola mundo', 'success', true);
```

Tipos disponibles: `'command'`, `'error'`, `'success'`, `'warning'`

### `destroy()`
Destruye el terminal y libera recursos:

```javascript
terminal.destroy();
```

## Ejemplo Avanzado

```javascript
import { MatrixTerminal } from './components/Terminal.js';

// Inicializar terminal
const terminal = new MatrixTerminal('terminal-container', {
  enableCRT: true,
  typewriterSpeed: 20
});

// Ejecutar secuencia de comandos
async function runDemo() {
  await terminal.sleep(2000);
  await terminal.runCommand('whoami');

  await terminal.sleep(2000);
  await terminal.runCommand('cat skills.txt');

  await terminal.sleep(2000);
  await terminal.runCommand('ls projects/');
}

runDemo();
```

## Integración con Three.js

Para integrar el terminal con la aplicación Three.js existente:

```javascript
// En main.js
import { MatrixTerminal } from './components/Terminal.js';

class ThreeApp {
  constructor() {
    // ... código existente ...

    // Inicializar terminal
    this.initTerminal();
  }

  initTerminal() {
    this.terminal = new MatrixTerminal('terminal-container', {
      enableCRT: true
    });
  }

  onEnterMatrix() {
    // Mostrar el terminal cuando se presiona "Enter the Matrix"
    const terminalContainer = document.getElementById('terminal-container');
    terminalContainer.style.display = 'block';

    // Ejecutar comando de bienvenida
    this.terminal.runCommand('neofetch');
  }
}
```

## Personalización de Datos

Los datos del usuario se configuran en el objeto `userData` dentro del componente:

```javascript
this.userData = {
  name: 'Jebus',
  role: 'Cybersecurity Analyst @ SOC',
  location: 'Ecuador',
  skills: [
    'Microsoft Sentinel',
    'Microsoft Defender',
    'Spring Boot',
    'React',
    'WebSocket'
  ],
  projects: [
    'SOC-Dashboard/',
    'ThreatIntel-Analyzer/'
  ]
};
```

## Personalización de Estilos

Los estilos se aplican automáticamente, pero puedes modificarlos editando el método `applyStyles()` en el componente.

### Cambiar colores:

```css
/* Cambiar el color principal del verde Matrix a otro */
--matrix-green: #00ff41;  /* Original */
--matrix-green: #00ffff;  /* Cyan */
--matrix-green: #ff00ff;  /* Magenta */
```

## Navegación con Teclado

- `Enter`: Ejecutar comando
- `↑` (Flecha arriba): Comando anterior en el historial
- `↓` (Flecha abajo): Comando siguiente en el historial

## Datos Mostrados

El terminal muestra la siguiente información de Jebus:

- **Nombre**: Jebus
- **Rol**: Cybersecurity Analyst @ SOC
- **Skills**:
  - Microsoft Sentinel
  - Microsoft Defender
  - Spring Boot
  - React
  - WebSocket
  - SIEM & Log Analysis
  - Threat Detection
  - Incident Response
- **Location**: Ecuador
- **Projects**:
  - SOC-Dashboard/
  - ThreatIntel-Analyzer/
  - SecureAuth-API/
  - RealTime-Monitor/
  - Portfolio-3D/

## Browser Support

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Opera: ✅

## License

MIT License - Úsalo libremente en tus proyectos.

---

Desarrollado con 💚 por Jebus
