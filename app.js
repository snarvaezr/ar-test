// Estado de la aplicación
const AppState = {
    captures: [],
    currentScreen: 'welcome',
    stream: null,
    model3D: null,
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

// Generar modelo 3D (simulado basado en las capturas)
async function generateModel3D() {
    // En una aplicación real, aquí se usaría fotogrametría o algoritmos de reconstrucción 3D
    // Por ahora, creamos un modelo procedural que simula el proceso

    const scene = new THREE.Scene();
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    // Crear material con textura de la primera captura
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(AppState.captures[0].url);

    const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.5,
        metalness: 0.3
    });

    const mesh = new THREE.Mesh(geometry, material);

    AppState.model3D = {
        scene: scene,
        mesh: mesh
    };

    scene.add(mesh);

    return AppState.model3D;
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
    showScreen('ar');

    // Exportar modelo a formato GLB para AR
    const glbData = await exportToGLB();

    // Configurar model-viewer con el modelo
    elements.arViewer.src = glbData;

    console.log('Modelo cargado en AR viewer');
}

// Exportar modelo a GLB (simplificado)
async function exportToGLB() {
    // En una aplicación real, usarías GLTFExporter de Three.js
    // Por ahora, usamos un modelo de ejemplo

    // Crear un blob URL con datos del modelo
    // Como fallback, usamos un modelo de ejemplo o generamos uno básico

    // Esta es una URL de ejemplo de un modelo GLB simple
    // En producción, generarías el GLB desde tu modelo 3D capturado
    const exampleModelUrl = 'data:application/octet-stream;base64,Z2xURgIAAAA...';

    // O mejor aún, generar dinámicamente desde las capturas
    return createDynamicGLB();
}

function createDynamicGLB() {
    // Crear un modelo simple basado en las capturas
    // En una app real, esto usaría THREE.GLTFExporter

    // Por ahora retornamos una URL al modelo embebido
    return generateSimpleModel();
}

function generateSimpleModel() {
    // Genera un cubo texturizado básico como demostración
    // En producción esto sería reemplazado por el modelo real reconstruido

    const scene = new THREE.Scene();
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

    // Usar la primera captura como textura
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(AppState.captures[0].url);

    const material = new THREE.MeshStandardMaterial({
        map: texture
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Retornar URL del blob (simplificado)
    // En un caso real usarías GLTFExporter aquí
    return AppState.captures[0].url; // Placeholder
}

// Reiniciar aplicación
function resetApp() {
    // Limpiar capturas
    AppState.captures.forEach(capture => {
        URL.revokeObjectURL(capture.url);
    });

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
});
