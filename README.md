# Portfolio 3D - Matrix Theme

Portfolio interactivo en 3D con temática Matrix usando Three.js y Vite.

## 🚀 Características

- ✅ Configuración base de Three.js
- ✅ Scene, Camera y Renderer configurados
- ✅ Canvas responsive
- ✅ OrbitControls para navegación
- ✅ Animation loop optimizado
- ✅ Tema Matrix con colores verdes

## 📁 Estructura del Proyecto

```
portfolioRamos/
├── src/
│   ├── scenes/        # Escenas 3D
│   ├── components/    # Componentes reutilizables
│   ├── utils/         # Utilidades y helpers
│   ├── shaders/       # Shaders personalizados
│   ├── main.js        # Punto de entrada
│   └── style.css      # Estilos globales
├── index.html
├── package.json
├── vite.config.js
└── .gitignore
```

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

## 🎨 Tema Matrix

Variables CSS disponibles:
- `--matrix-green-primary`: #00ff41
- `--matrix-green-secondary`: #008f11
- `--matrix-green-dark`: #003b00
- `--matrix-green-glow`: #39ff14

## 📦 Tecnologías

- Three.js v0.159.0
- Vite v5.0.8
- OrbitControls

## 🎯 Próximos Pasos

- Agregar efectos visuales Matrix
- Implementar secciones del portfolio
- Añadir animaciones y transiciones
- Integrar shaders personalizados
