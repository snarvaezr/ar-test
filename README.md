# Aplicación de Escaneo 3D Profesional con Realidad Aumentada

Una aplicación web comercial que permite escanear objetos desde múltiples ángulos usando la cámara del dispositivo, reconstruye modelos 3D fotogramétricos reales y los visualiza en realidad aumentada usando WebXR y Model Viewer.

## 🎯 Características Profesionales

✅ **Reconstrucción 3D Real** - No solo un cubo texturizado
✅ **Backend Python con Open3D/COLMAP** - Fotogrametría de calidad profesional
✅ **Fallback Local** - Funciona sin backend (calidad reducida)
✅ **Integración AR** - WebXR, ARCore, ARKit
✅ **Debug en Móvil** - Consola visual para smartphones
✅ **Producción Ready** - Listo para despliegue comercial

## Características

- **Escaneo Multi-Ángulo**: Captura imágenes de un objeto desde 12 ángulos diferentes
- **Generación de Modelo 3D**: Simula la creación de un modelo 3D basado en las capturas
- **Vista Previa 3D Interactiva**: Visualiza y rota el modelo 3D antes de verlo en AR
- **Realidad Aumentada**: Coloca el modelo en tu espacio real usando WebXR/ARCore
- **Interfaz Intuitiva**: Guías visuales y controles fáciles de usar
- **Responsive**: Funciona en dispositivos móviles y desktop

## Tecnologías Utilizadas

- **HTML5**: Estructura de la aplicación
- **CSS3**: Estilos modernos con animaciones y gradientes
- **JavaScript (ES6+)**: Lógica de la aplicación
- **Three.js**: Renderizado y manipulación de modelos 3D
- **Model Viewer**: Componente web para AR con soporte para WebXR y ARCore
- **WebRTC**: Acceso a la cámara del dispositivo

## Requisitos

### Para desarrollo local:
- Navegador moderno (Chrome 90+, Safari 14+, Firefox 88+)
- Servidor HTTPS (requerido para acceso a cámara y AR)
- Dispositivo con cámara

### Para AR:
- **Android**: Chrome 87+ con ARCore instalado
- **iOS**: Safari 13+ (iPad Pro 12.9 2018+ recomendado)
- Dispositivo compatible con ARCore/ARKit

## 🚀 Inicio Rápido

### Opción A: Solo Frontend (Reconstrucción Aproximada)

```bash
# Servidor local simple
python3 -m http.server 8000
```

Abre `http://localhost:8000` - Funciona pero modelo 3D es aproximado.

### Opción B: Con Backend Profesional (Recomendado)

**1. Instalar y ejecutar backend:**

```bash
cd backend

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
python photogrammetry_server.py
```

**2. Configurar frontend:**

Edita `config.js`:
```javascript
custom: {
    enabled: true,  // Cambiar a true
    endpoint: 'http://localhost:5000/api/reconstruct'
}
```

**3. Abrir aplicación:**
```bash
python3 -m http.server 8000
```

Abre `http://localhost:8000` - Ahora con reconstrucción 3D REAL.

## Instalación y Uso (Completo)

### Opción 1: Frontend Solo (Sin Backend)

```bash
# Usando Python 3
python3 -m http.server 8000

# O usando Python 2
python -m SimpleHTTPServer 8000

# O usando Node.js (si tienes http-server instalado)
npx http-server -p 8000
```

**Nota**: Para usar la cámara y AR, necesitas HTTPS. Considera usar:

```bash
# Usando http-server con SSL
npx http-server -p 8000 -S -C cert.pem -K key.pem
```

### Opción 2: Live Server (VS Code)

1. Instala la extensión "Live Server" en VS Code
2. Clic derecho en `index.html`
3. Selecciona "Open with Live Server"

### Opción 3: Despliegue en Producción

#### GitHub Pages:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/ar-scanner.git
git push -u origin main
```

Luego activa GitHub Pages en la configuración del repositorio.

#### Netlify:
```bash
# Instala Netlify CLI
npm install -g netlify-cli

# Despliega
netlify deploy --prod
```

#### Vercel:
```bash
# Instala Vercel CLI
npm install -g vercel

# Despliega
vercel
```

## Cómo Usar la Aplicación

### 1. Iniciar Escaneo
- Abre la aplicación en tu navegador
- Presiona "Iniciar Escaneo"
- Otorga permisos de cámara cuando se solicite

### 2. Capturar Imágenes
- Coloca el objeto en el centro de la guía circular
- Presiona el botón de captura (círculo blanco)
- Muévete alrededor del objeto capturando desde diferentes ángulos
- Captura al menos 12 imágenes para mejores resultados

### 3. Procesamiento
- La aplicación procesará automáticamente las imágenes
- Se generará un modelo 3D simulado
- Espera a que se complete el procesamiento

### 4. Vista Previa 3D
- Revisa el modelo generado
- Usa el mouse/dedo para rotar el modelo
- Verifica que el modelo se vea correcto

### 5. Ver en Realidad Aumentada
- Presiona "Ver en AR"
- Toca "Ver en tu espacio"
- Apunta la cámara a una superficie plana
- El modelo aparecerá en tu espacio real

## Estructura del Proyecto

```
AR/
├── index.html          # Estructura HTML principal
├── styles.css          # Estilos CSS
├── app.js             # Lógica de la aplicación
└── README.md          # Este archivo
```

## Características Técnicas

### Captura de Imágenes
- Resolución: 1920x1080 (ideal)
- Formato: JPEG (calidad 90%)
- Almacenamiento: Blob URLs en memoria

### Modelo 3D
- Motor: Three.js
- Geometría: BoxGeometry (demostración)
- Material: MeshStandardMaterial con texturas
- Iluminación: Ambiente + Direccional

### Realidad Aumentada
- Framework: Model Viewer
- Modos AR: WebXR, Scene Viewer, Quick Look
- Formato: GLB (futuro: exportación desde Three.js)

## Limitaciones Actuales

1. **Modelo Simplificado**: La versión actual genera un cubo texturizado como demostración. Para producción, se necesitaría:
   - Algoritmos de fotogrametría
   - Reconstrucción 3D real (ej: Structure from Motion)
   - Exportación GLB completa

2. **Compatibilidad AR**:
   - WebXR está en desarrollo activo
   - Algunos dispositivos pueden requerir aplicaciones nativas
   - iOS requiere archivos `.usdz` para mejor compatibilidad

3. **Procesamiento Local**: Todo el procesamiento se hace en el navegador

## Mejoras Futuras

- [ ] Integración con servicios de fotogrametría en la nube (ej: Polycam API)
- [ ] Exportación real a formato GLB/GLTF usando GLTFExporter
- [ ] Optimización de malla (reducción de polígonos)
- [ ] Soporte para texturas de alta calidad
- [ ] Calibración automática de cámara
- [ ] Detección de características y tracking
- [ ] Almacenamiento de modelos en IndexedDB
- [ ] Compartir modelos con otros usuarios
- [ ] Edición básica del modelo (escala, rotación, color)

## Solución de Problemas

### La cámara no funciona
- Verifica que estés usando HTTPS (no HTTP)
- Comprueba los permisos de cámara en el navegador
- Intenta en otro navegador

### AR no funciona
- **Android**: Instala Google Play Services for AR (ARCore)
- **iOS**: Usa Safari (Chrome no soporta AR en iOS)
- Verifica que tu dispositivo sea compatible con AR

### El modelo no se muestra correctamente
- Refresca la página
- Intenta capturar más imágenes con mejor iluminación
- Asegúrate de capturar desde todos los ángulos

### Problemas de rendimiento
- Cierra otras pestañas del navegador
- Reduce la calidad de captura en app.js
- Usa un dispositivo más potente

## Recursos Adicionales

- [WebXR Device API](https://www.w3.org/TR/webxr/)
- [Model Viewer Documentation](https://modelviewer.dev/)
- [Three.js Documentation](https://threejs.org/docs/)
- [ARCore Supported Devices](https://developers.google.com/ar/devices)
- [Photogrammetry Guide](https://www.photogrammetry.com/)

## Navegadores Soportados

| Navegador | Versión Mínima | Notas |
|-----------|----------------|-------|
| Chrome (Android) | 87+ | Requiere ARCore |
| Safari (iOS) | 13+ | Soporte AR nativo |
| Firefox | 88+ | Sin soporte AR |
| Edge | 90+ | Funcionalidad limitada |

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Contacto

Para preguntas, sugerencias o problemas, por favor abre un issue en el repositorio.

## Agradecimientos

- Three.js por el motor 3D
- Google por Model Viewer y ARCore
- La comunidad de WebXR

---

Hecho con dedicación para demostrar las capacidades de WebXR y Realidad Aumentada en la web.
