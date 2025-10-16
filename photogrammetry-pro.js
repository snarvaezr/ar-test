// Módulo de fotogrametría profesional con integración a servicios externos

class ProfessionalPhotogrammetry {
    constructor(captures) {
        this.captures = captures;
        this.model = null;
        this.status = 'pending';
    }

    // Enviar imágenes a servicio de procesamiento
    async processWithExternalService(serviceConfig) {
        console.log('Enviando imágenes a servicio de procesamiento...');

        const formData = new FormData();

        // Agregar todas las capturas
        for (let i = 0; i < this.captures.length; i++) {
            const response = await fetch(this.captures[i].url);
            const blob = await response.blob();
            formData.append(`image_${i}`, blob, `capture_${i}.jpg`);
        }

        // Agregar metadata
        formData.append('metadata', JSON.stringify({
            captureCount: this.captures.length,
            timestamp: Date.now(),
            quality: 'high',
            format: 'glb'
        }));

        try {
            const response = await fetch(serviceConfig.endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceConfig.apiKey}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Respuesta del servicio:', result);

            return result;
        } catch (error) {
            console.error('Error llamando al servicio:', error);
            throw error;
        }
    }

    // Opción para backend personalizado con Python
    async processWithCustomBackend(endpoint) {
        console.log('=== Procesamiento con backend personalizado ===');

        const formData = new FormData();

        // Convertir capturas a blobs y agregarlas
        for (let i = 0; i < this.captures.length; i++) {
            formData.append('images', this.captures[i].blob, `capture_${i}.jpg`);
        }

        formData.append('options', JSON.stringify({
            quality: 'high',
            outputFormat: 'glb',
            textureResolution: 2048,
            decimationTarget: 50000 // Número de polígonos objetivo
        }));

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Backend error: ${response.status} - ${errorText}`);
            }

            // Recibir modelo GLB
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            console.log('Modelo recibido del backend:', blob.size, 'bytes');

            return {
                modelUrl: url,
                blob: blob,
                vertices: null, // El backend debería proporcionar esto
                faces: null
            };

        } catch (error) {
            console.error('Error en procesamiento backend:', error);
            throw error;
        }
    }

    // Polling para servicios asíncronos
    async pollForCompletion(jobId, serviceConfig, maxAttempts = 60) {
        console.log('Esperando procesamiento... Job ID:', jobId);

        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos

            const response = await fetch(`${serviceConfig.endpoint}/${jobId}`, {
                headers: {
                    'Authorization': `Bearer ${serviceConfig.apiKey}`
                }
            });

            const status = await response.json();
            console.log(`Intento ${i + 1}/${maxAttempts}:`, status.status);

            if (status.status === 'completed') {
                return status;
            } else if (status.status === 'failed') {
                throw new Error('Procesamiento fallido: ' + status.error);
            }

            // Actualizar progreso
            if (status.progress) {
                this.updateProgress(status.progress);
            }
        }

        throw new Error('Timeout: El procesamiento tomó demasiado tiempo');
    }

    updateProgress(progress) {
        console.log('Progreso:', progress + '%');
        // Emitir evento para actualizar UI
        window.dispatchEvent(new CustomEvent('photogrammetry-progress', {
            detail: { progress }
        }));
    }

    // Método principal: intentar servicios en orden
    async reconstruct() {
        console.log('=== Reconstrucción 3D Profesional ===');
        console.log('Capturas:', this.captures.length);

        const config = window.PHOTOGRAMMETRY_CONFIG;

        // Intentar backend personalizado primero
        if (config.services.custom.enabled) {
            try {
                console.log('Intentando backend personalizado...');
                const result = await this.processWithCustomBackend(
                    config.services.custom.endpoint
                );
                return result;
            } catch (error) {
                console.error('Backend personalizado falló:', error);
            }
        }

        // Intentar Polycam
        if (config.services.polycam.enabled) {
            try {
                console.log('Intentando Polycam API...');
                const result = await this.processWithExternalService(
                    config.services.polycam
                );

                // Esperar procesamiento
                const completed = await this.pollForCompletion(
                    result.jobId,
                    config.services.polycam
                );

                return {
                    modelUrl: completed.modelUrl,
                    blob: null
                };
            } catch (error) {
                console.error('Polycam falló:', error);
            }
        }

        // Si todos los servicios externos fallan, error
        throw new Error('No hay servicios de fotogrametría disponibles. Configure un backend o API key.');
    }
}

window.ProfessionalPhotogrammetry = ProfessionalPhotogrammetry;
