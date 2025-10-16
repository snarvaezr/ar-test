// Módulo de fotogrametría simplificada
// Genera un modelo 3D aproximado basado en múltiples capturas

class SimplePhotogrammetry {
    constructor(captures) {
        this.captures = captures;
        this.pointCloud = [];
        this.mesh = null;
    }

    // Detectar bordes en una imagen usando Canvas
    async detectEdges(imageUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Reducir tamaño para procesamiento más rápido
                const scale = 0.25;
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const edges = this.sobelEdgeDetection(imageData);

                resolve(edges);
            };

            img.src = imageUrl;
        });
    }

    // Algoritmo Sobel para detección de bordes
    sobelEdgeDetection(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;

        const sobelX = [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];

        const sobelY = [
            [-1, -2, -1],
            [0, 0, 0],
            [1, 2, 1]
        ];

        const edges = [];

        // Procesar solo cada N píxeles para performance
        const step = 4;

        for (let y = step; y < height - step; y += step) {
            for (let x = step; x < width - step; x += step) {
                let gx = 0;
                let gy = 0;

                // Aplicar kernels Sobel
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4;
                        const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

                        gx += gray * sobelX[ky + 1][kx + 1];
                        gy += gray * sobelY[ky + 1][kx + 1];
                    }
                }

                const magnitude = Math.sqrt(gx * gx + gy * gy);

                // Si hay un borde significativo
                if (magnitude > 50) {
                    edges.push({
                        x: x / width,
                        y: y / height,
                        strength: magnitude
                    });
                }
            }
        }

        console.log('Bordes detectados:', edges.length);
        return edges;
    }

    // Generar nube de puntos 3D
    async generatePointCloud() {
        console.log('Generando nube de puntos...');

        const angleStep = (Math.PI * 2) / this.captures.length;

        for (let i = 0; i < this.captures.length; i++) {
            const edges = await this.detectEdges(this.captures[i].url);
            const angle = i * angleStep;

            // Convertir bordes 2D a puntos 3D
            edges.forEach(edge => {
                const radius = 0.2 * (1 - edge.x); // Simular profundidad
                const height = (edge.y - 0.5) * 0.4;

                const x = radius * Math.cos(angle);
                const z = radius * Math.sin(angle);
                const y = height;

                this.pointCloud.push({
                    position: new THREE.Vector3(x, y, z),
                    captureIndex: i,
                    uv: { u: edge.x, v: edge.y }
                });
            });
        }

        console.log('Nube de puntos generada:', this.pointCloud.length, 'puntos');
        return this.pointCloud;
    }

    // Crear geometría desde nube de puntos usando ConvexHull
    createGeometryFromPointCloud() {
        console.log('Creando geometría desde nube de puntos...');

        if (this.pointCloud.length < 4) {
            console.warn('Insuficientes puntos, usando geometría por defecto');
            return new THREE.CylinderGeometry(0.15, 0.15, 0.3, 12);
        }

        // Crear geometría de puntos
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.pointCloud.length * 3);

        this.pointCloud.forEach((point, i) => {
            positions[i * 3] = point.position.x;
            positions[i * 3 + 1] = point.position.y;
            positions[i * 3 + 2] = point.position.z;
        });

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.computeVertexNormals();

        // Crear ConvexHull (envolvente convexa)
        try {
            const hull = new THREE.ConvexGeometry(this.pointCloud.map(p => p.position));
            console.log('ConvexHull creado:', hull.attributes.position.count, 'vértices');
            return hull;
        } catch (error) {
            console.error('Error creando ConvexHull:', error);
            // Fallback a cilindro
            return new THREE.CylinderGeometry(0.15, 0.15, 0.3, 12);
        }
    }

    // Proceso completo de reconstrucción
    async reconstruct() {
        console.log('=== Iniciando reconstrucción 3D ===');
        console.log('Capturas:', this.captures.length);

        // Generar nube de puntos
        await this.generatePointCloud();

        // Crear geometría
        const geometry = this.createGeometryFromPointCloud();

        return geometry;
    }
}

// Exportar para uso en app.js
window.SimplePhotogrammetry = SimplePhotogrammetry;
