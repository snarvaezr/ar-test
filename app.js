// Estado de la aplicación
const AppState = {
    captures: [],
    currentScreen: 'welcome',
    stream: null,
    model3D: null,
    glbUrl: null,
    requiredCaptures: 12
};

// Elementos DOM
const elements = {
    welcomeScreen: document.getElementById('welcome-screen'),
    scanScreen: document.getElementById('scan-screen'),
    processingScreen: document.getElementById('processing-screen'),
    previewScreen: document.getElementById('preview-screen'),
    arScreen: document.getElementById('ar-screen'),

    camera: document.getElementById('camera'),
    canvas: document.getElementById('canvas'),
    captureBtn: document.getElementById('capture-btn'),
    captureCount: document.getElementById('capture-count'),
    progressCircles: document.getElementById('progress-circles'),
    galleryGrid: document.getElementById('gallery-grid'),
    captureGallery: document.getElementById('capture-gallery'),

    startScanBtn: document.getElementById('start-scan-btn'),
    cancelScanBtn: document.getElementById('cancel-scan-btn'),
    viewArBtn: document.getElementById('view-ar-btn'),
    newScanBtn: document.getElementById('new-scan-btn'),
    closePreviewBtn: document.getElementById('close-preview-btn'),
    closeArBtn: document.getElementById('close-ar-btn'),

    processingStatus: document.getElementById('processing-status'),
    progressFill: document.getElementById('progress-fill'),
    progressPercent: document.getElementById('progress-percent'),

    previewContainer: document.getElementById('preview-container'),
    arViewer: document.getElementById('ar-viewer')
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    createProgressCircles();
});

function initializeApp() {
    console.log('Inicializando aplicación de escaneo 3D con AR');
    console.log('THREE.js disponible:', typeof THREE !== 'undefined');
    console.log('GLTFExporter disponible:', typeof THREE !== 'undefined' && typeof THREE.GLTFExporter !== 'undefined');
    console.log('Model Viewer disponible:', typeof document.createElement('model-viewer') !== 'undefined');
    checkDeviceCapabilities();
}

function checkDeviceCapabilities() {
    // Verificar soporte de cámara
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Tu dispositivo no soporta acceso a la cámara');
        return false;
    }

    // Verificar soporte de WebXR (opcional, fallback disponible)
    if ('xr' in navigator) {
        navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
            if (supported) {
                console.log('WebXR AR soportado');
            } else {
                console.log('WebXR AR no soportado, usando Scene Viewer');
            }
        });
    }

    return true;
}

// Event Listeners
function setupEventListeners() {
    elements.startScanBtn.addEventListener('click', startScanning);
    elements.cancelScanBtn.addEventListener('click', cancelScanning);
    elements.captureBtn.addEventListener('click', capturePhoto);
    elements.viewArBtn.addEventListener('click', showARView);
    elements.newScanBtn.addEventListener('click', resetApp);
    elements.closePreviewBtn.addEventListener('click', () => showScreen('welcome'));
    elements.closeArBtn.addEventListener('click', () => showScreen('preview'));

    // Eventos de model-viewer para debugging
    elements.arViewer.addEventListener('load', () => {
        console.log('Model Viewer: Modelo cargado correctamente');
    });

    elements.arViewer.addEventListener('error', (event) => {
        console.error('Model Viewer: Error al cargar modelo');
        console.error('Event detail:', event.detail);
        console.error('Event type:', event.type);
        console.error('Stringified detail:', JSON.stringify(event.detail, null, 2));
        if (event.detail && event.detail.message) {
            console.error('Error message:', event.detail.message);
        }
    });
}

// Navegación entre pantallas
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    const screenMap = {
        'welcome': elements.welcomeScreen,
        'scan': elements.scanScreen,
        'processing': elements.processingScreen,
        'preview': elements.previewScreen,
        'ar': elements.arScreen
    };

    if (screenMap[screenName]) {
        screenMap[screenName].classList.add('active');
        AppState.currentScreen = screenName;
    }
}

// Iniciar escaneo
async function startScanning() {
    try {
        AppState.stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        });

        elements.camera.srcObject = AppState.stream;
        showScreen('scan');
        elements.captureGallery.style.display = 'none';

    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
    }
}

function cancelScanning() {
    stopCamera();
    AppState.captures = [];
    updateCaptureProgress();
    elements.galleryGrid.innerHTML = '';
    elements.captureGallery.style.display = 'none';
    showScreen('welcome');
}

function stopCamera() {
    if (AppState.stream) {
        AppState.stream.getTracks().forEach(track => track.stop());
        AppState.stream = null;
    }
}

// Captura de fotos
function capturePhoto() {
    const video = elements.camera;
    const canvas = elements.canvas;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
        const captureData = {
            blob: blob,
            url: URL.createObjectURL(blob),
            timestamp: Date.now(),
            angle: AppState.captures.length * (360 / AppState.requiredCaptures)
        };

        AppState.captures.push(captureData);
        updateCaptureProgress();
        addToGallery(captureData);

        // Animación de captura
        animateCapture();

        // Si completamos todas las capturas
        if (AppState.captures.length >= AppState.requiredCaptures) {
            setTimeout(() => {
                stopCamera();
                processImages();
            }, 500);
        }
    }, 'image/jpeg', 0.9);
}

function animateCapture() {
    elements.captureBtn.classList.add('capturing');
    setTimeout(() => {
        elements.captureBtn.classList.remove('capturing');
    }, 200);
}

// Actualizar progreso
function updateCaptureProgress() {
    elements.captureCount.textContent = AppState.captures.length;

    const circles = elements.progressCircles.querySelectorAll('.progress-circle');
    circles.forEach((circle, index) => {
        if (index < AppState.captures.length) {
            circle.classList.add('completed');
        } else {
            circle.classList.remove('completed');
        }
    });
}

function createProgressCircles() {
    elements.progressCircles.innerHTML = '';
    for (let i = 0; i < AppState.requiredCaptures; i++) {
        const circle = document.createElement('div');
        circle.className = 'progress-circle';
        elements.progressCircles.appendChild(circle);
    }
}

// Galería de capturas
function addToGallery(captureData) {
    elements.captureGallery.style.display = 'block';

    const img = document.createElement('img');
    img.src = captureData.url;
    img.alt = `Captura ${AppState.captures.length}`;
    img.className = 'gallery-item';

    elements.galleryGrid.appendChild(img);

    // Scroll al final
    elements.galleryGrid.scrollLeft = elements.galleryGrid.scrollWidth;
}

// Procesar imágenes y generar modelo 3D
async function processImages() {
    showScreen('processing');

    const steps = [
        { text: 'Analizando imágenes...', duration: 1000 },
        { text: 'Detectando características...', duration: 1500 },
        { text: 'Calculando geometría...', duration: 2000 },
        { text: 'Generando malla 3D...', duration: 1500 },
        { text: 'Aplicando texturas...', duration: 1000 },
        { text: 'Optimizando modelo...', duration: 1000 },
        { text: 'Finalizando...', duration: 500 }
    ];

    let totalProgress = 0;
    const progressStep = 100 / steps.length;

    for (let i = 0; i < steps.length; i++) {
        elements.processingStatus.textContent = steps[i].text;

        await new Promise(resolve => setTimeout(resolve, steps[i].duration));

        totalProgress += progressStep;
        elements.progressFill.style.width = totalProgress + '%';
        elements.progressPercent.textContent = Math.round(totalProgress);
    }

    // Generar modelo 3D
    await generateModel3D();

    // Mostrar vista previa
    setTimeout(() => {
        showScreen('preview');
        render3DPreview();
    }, 500);
}

// Generar modelo 3D usando fotogrametría simplificada
async function generateModel3D() {
    console.log('=== Iniciando reconstrucción 3D ===');
    console.log('Capturas disponibles:', AppState.captures.length);

    try {
        const scene = new THREE.Scene();

        // Crear instancia de fotogrametría
        const photogrammetry = new SimplePhotogrammetry(AppState.captures);

        // Reconstruir geometría desde las capturas
        const geometry = await photogrammetry.reconstruct();

        console.log('Geometría reconstruida:', geometry.type);

        // Cargar textura principal
        const textureLoader = new THREE.TextureLoader();

        return new Promise((resolve) => {
            textureLoader.load(
                AppState.captures[0].url,
                (texture) => {
                    console.log('Textura principal cargada');

                    const material = new THREE.MeshStandardMaterial({
                        map: texture,
                        roughness: 0.6,
                        metalness: 0.3,
                        side: THREE.DoubleSide
                    });

                    const mesh = new THREE.Mesh(geometry, material);
                    scene.add(mesh);

                    AppState.model3D = {
                        scene: scene,
                        mesh: mesh,
                        geometry: geometry,
                        pointCloud: photogrammetry.pointCloud,
                        captureCount: AppState.captures.length
                    };

                    console.log('Modelo 3D generado:', {
                        geometryType: geometry.type,
                        vertices: geometry.attributes.position.count,
                        points: photogrammetry.pointCloud.length,
                        capturas: AppState.captures.length
                    });

                    resolve(AppState.model3D);
                },
                undefined,
                (error) => {
                    console.error('Error cargando textura:', error);

                    // Crear sin textura
                    const material = new THREE.MeshStandardMaterial({
                        color: 0x6366f1,
                        roughness: 0.6,
                        metalness: 0.3,
                        side: THREE.DoubleSide
                    });

                    const mesh = new THREE.Mesh(geometry, material);
                    scene.add(mesh);

                    AppState.model3D = {
                        scene: scene,
                        mesh: mesh,
                        geometry: geometry
                    };

                    resolve(AppState.model3D);
                }
            );
        });
    } catch (error) {
        console.error('Error en reconstrucción 3D:', error);

        // Fallback a geometría simple
        return createSimpleFallbackModel();
    }
}

// Fallback: crear modelo simple si falla la reconstrucción
function createSimpleFallbackModel() {
    console.log('Usando modelo fallback simple');

    const scene = new THREE.Scene();
    const geometry = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 12);
    const material = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        roughness: 0.6,
        metalness: 0.3
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    return Promise.resolve({
        scene: scene,
        mesh: mesh
    });
}

// Renderizar vista previa 3D
function render3DPreview() {
    const container = elements.previewContainer;
    container.innerHTML = '';

    // Configurar escena Three.js
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Cámara
    const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 3;

    // Renderizador
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Añadir modelo
    if (AppState.model3D && AppState.model3D.mesh) {
        scene.add(AppState.model3D.mesh);
    }

    // Controles de ratón
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    renderer.domElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    renderer.domElement.addEventListener('mousemove', (e) => {
        if (isDragging && AppState.model3D && AppState.model3D.mesh) {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            AppState.model3D.mesh.rotation.y += deltaX * 0.01;
            AppState.model3D.mesh.rotation.x += deltaY * 0.01;

            previousMousePosition = { x: e.clientX, y: e.clientY };
        }
    });

    renderer.domElement.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Controles táctiles
    let touchStartX = 0;
    let touchStartY = 0;

    renderer.domElement.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    renderer.domElement.addEventListener('touchmove', (e) => {
        if (AppState.model3D && AppState.model3D.mesh) {
            const deltaX = e.touches[0].clientX - touchStartX;
            const deltaY = e.touches[0].clientY - touchStartY;

            AppState.model3D.mesh.rotation.y += deltaX * 0.01;
            AppState.model3D.mesh.rotation.x += deltaY * 0.01;

            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }
    });

    // Animación
    function animate() {
        requestAnimationFrame(animate);

        // Rotación suave automática
        if (AppState.model3D && AppState.model3D.mesh && !isDragging) {
            AppState.model3D.mesh.rotation.y += 0.005;
        }

        renderer.render(scene, camera);
    }

    animate();

    // Redimensionar
    window.addEventListener('resize', () => {
        if (AppState.currentScreen === 'preview') {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    });
}

// Mostrar en AR
async function showARView() {
    console.log('=== INICIANDO VISTA AR ===');
    console.log('Estado del modelo:', AppState.model3D ? 'Disponible' : 'No disponible');

    showScreen('ar');

    // TEMPORAL: Probar primero con un modelo de ejemplo
    const useExampleModel = false; // Cambiar a true para debug

    if (useExampleModel) {
        console.log('Usando modelo de ejemplo para prueba');
        // Modelo público de ejemplo de Google
        elements.arViewer.src = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';
        console.log('Model Viewer src configurado con modelo de ejemplo');
        return;
    }

    // Exportar modelo a formato GLB para AR
    try {
        console.log('Llamando a exportToGLB...');
        const glbData = await exportToGLB();

        console.log('GLB Data recibida:', glbData);
        console.log('Longitud de URL:', glbData.length);

        // Configurar model-viewer con el modelo
        elements.arViewer.src = glbData;

        console.log('Model Viewer src configurado');
        console.log('Esperando carga del modelo...');

    } catch (error) {
        console.error('Error al exportar modelo:', error);
        console.error('Stack trace:', error.stack);
        alert('Error al preparar el modelo para AR: ' + error);
    }
}

// Exportar modelo a GLB usando GLTFExporter
async function exportToGLB() {
    return new Promise((resolve, reject) => {
        if (!AppState.model3D || !AppState.model3D.mesh) {
            reject('No hay modelo 3D disponible');
            return;
        }

        // Verificar que GLTFExporter esté disponible
        if (typeof THREE.GLTFExporter === 'undefined') {
            console.error('GLTFExporter no está disponible');
            reject('GLTFExporter no cargado');
            return;
        }

        console.log('Iniciando exportación a GLB...');
        console.log('Mesh disponible:', AppState.model3D.mesh);
        console.log('Scene children:', AppState.model3D.scene.children.length);

        // Usar GLTFExporter para convertir solo el mesh (no la escena vacía)
        const exporter = new THREE.GLTFExporter();

        const options = {
            binary: true,
            maxTextureSize: 1024,
            includeCustomExtensions: false,
            truncateDrawRange: false
        };

        // Exportar el mesh directamente en lugar de la escena
        exporter.parse(
            AppState.model3D.mesh,  // Cambio clave: exportar mesh en lugar de scene
            (result) => {
                console.log('Modelo exportado exitosamente');
                console.log('Tipo de resultado:', typeof result);
                console.log('Es ArrayBuffer?', result instanceof ArrayBuffer);

                let blob;

                // Si es ArrayBuffer (binario GLB), usarlo directamente
                if (result instanceof ArrayBuffer) {
                    blob = new Blob([result], { type: 'model/gltf-binary' });
                    console.log('Blob GLB creado desde ArrayBuffer');
                }
                // Si es objeto (GLTF JSON), convertirlo a JSON string
                else if (typeof result === 'object') {
                    const jsonString = JSON.stringify(result);
                    blob = new Blob([jsonString], { type: 'model/gltf+json' });
                    console.log('Blob GLTF JSON creado desde objeto');
                    console.log('Keys en resultado:', Object.keys(result));
                }
                else {
                    reject('Formato de exportación no reconocido');
                    return;
                }

                console.log('Blob creado, tamaño:', blob.size, 'bytes');
                console.log('Blob type:', blob.type);

                // Debug: intentar leer el contenido del blob
                const reader = new FileReader();
                reader.onload = function(e) {
                    const content = e.target.result;
                    const preview = content.substring ? content.substring(0, 300) : 'Binary data';
                    console.log('Contenido del blob (primeros 300 chars):', preview);
                };
                reader.readAsText(blob);

                const url = URL.createObjectURL(blob);
                console.log('URL creada:', url);

                // Guardar URL para limpieza posterior
                if (AppState.glbUrl) {
                    URL.revokeObjectURL(AppState.glbUrl);
                }
                AppState.glbUrl = url;

                resolve(url);
            },
            (error) => {
                console.error('Error en GLTFExporter:', error);
                reject(error);
            },
            options
        );
    });
}

// Reiniciar aplicación
function resetApp() {
    // Limpiar capturas
    AppState.captures.forEach(capture => {
        URL.revokeObjectURL(capture.url);
    });

    // Limpiar GLB URL
    if (AppState.glbUrl) {
        URL.revokeObjectURL(AppState.glbUrl);
        AppState.glbUrl = null;
    }

    AppState.captures = [];
    AppState.model3D = null;

    elements.galleryGrid.innerHTML = '';
    elements.captureGallery.style.display = 'none';
    elements.progressFill.style.width = '0%';
    elements.progressPercent.textContent = '0';

    updateCaptureProgress();
    showScreen('welcome');
}

// Manejo de errores globales
window.addEventListener('error', (event) => {
    console.error('Error en la aplicación:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesa rechazada:', event.reason);
});

// Limpiar recursos al salir
window.addEventListener('beforeunload', () => {
    stopCamera();
    AppState.captures.forEach(capture => {
        URL.revokeObjectURL(capture.url);
    });
    if (AppState.glbUrl) {
        URL.revokeObjectURL(AppState.glbUrl);
    }
});
