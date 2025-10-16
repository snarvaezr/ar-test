# Backend de Fotogrametría Profesional

Este backend procesa imágenes y genera modelos 3D reales usando algoritmos de fotogrametría.

## Opción 1: Instalación Rápida (Open3D - Buena Calidad)

```bash
cd backend

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install flask flask-cors pillow numpy opencv-python open3d trimesh

# Ejecutar servidor
python photogrammetry_server.py
```

El servidor estará disponible en `http://localhost:5000`

## Opción 2: Instalación Profesional (COLMAP - Máxima Calidad)

### macOS
```bash
brew install colmap
pip install flask flask-cors pillow numpy opencv-python open3d trimesh
python photogrammetry_server.py
```

### Ubuntu/Debian
```bash
sudo apt-get install colmap
pip install flask flask-cors pillow numpy opencv-python open3d trimesh
python photogrammetry_server.py
```

### Windows
1. Descargar COLMAP desde: https://colmap.github.io/install.html
2. Agregar COLMAP al PATH
3. Instalar dependencias Python:
```cmd
pip install flask flask-cors pillow numpy opencv-python open3d trimesh
python photogrammetry_server.py
```

## Configuración en la Aplicación Web

Edita `config.js`:

```javascript
custom: {
    enabled: true,  // Cambiar a true
    endpoint: 'http://localhost:5000/api/reconstruct'
}
```

## Despliegue en Producción

### Docker

```bash
cd backend
docker build -t photogrammetry-api .
docker run -p 5000:5000 photogrammetry-api
```

### Servicios Cloud

#### Railway.app
```bash
railway login
railway init
railway up
```

#### Heroku
```bash
heroku create mi-app-photogrammetry
git push heroku main
```

#### AWS Lambda + API Gateway
Usa `Zappa` para deployment serverless:
```bash
pip install zappa
zappa init
zappa deploy production
```

## API Reference

### POST /api/reconstruct

**Request:**
```
Content-Type: multipart/form-data

images: [File, File, ...]  # Mínimo 3 imágenes
options: {
    "quality": "high",  # "low", "medium", "high"
    "outputFormat": "glb",
    "textureResolution": 2048,
    "decimationTarget": 50000
}
```

**Response:**
```
Content-Type: model/gltf-binary

[GLB Binary Data]
```

### GET /health

**Response:**
```json
{
    "status": "ok",
    "colmap_available": true,
    "temp_dir": "/tmp/photogrammetry"
}
```

## Optimización de Performance

Para procesamiento más rápido:

1. **GPU Acceleration**: Instala CUDA para COLMAP
2. **Parallelización**: Usa Celery para procesar múltiples jobs
3. **Caching**: Implementa Redis para caché de resultados

## Troubleshooting

### "COLMAP no está instalado"
- Instala COLMAP o usa solo Open3D (menor calidad pero funcional)

### "Se requieren al menos 3 imágenes"
- Asegúrate de capturar mínimo 3 fotos, idealmente 12+

### "No se pudieron generar puntos 3D"
- Verifica que las imágenes tengan suficiente overlap
- Asegúrate de que las fotos sean claras y bien iluminadas

### Timeout
- Aumenta el tiempo de procesamiento en el frontend
- Usa un worker queue (Celery + Redis)

## Alternativas Comerciales (Sin Backend Propio)

Si prefieres no mantener un backend:

1. **Polycam API**: https://poly.cam/api
   - $0.10 por reconstrucción
   - Calidad excelente
   - Setup rápido

2. **Sketchfab API**: https://sketchfab.com/developers
   - Gratis para desarrollo
   - Hosting incluido

3. **Azure Object Anchors**: https://azure.microsoft.com/en-us/services/object-anchors/
   - Integración con Azure
   - Escalable

4. **RealityCapture Cloud**: https://www.capturingreality.com/
   - Calidad profesional
   - $0.50 por reconstrucción

## Licencia

MIT License - Libre para uso comercial
