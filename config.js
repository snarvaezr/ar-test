// Configuración de servicios de fotogrametría

const PHOTOGRAMMETRY_CONFIG = {
    // Opciones de servicios de reconstrucción 3D
    services: {
        // Opción 1: Backend propio con Python/COLMAP (requiere servidor)
        custom: {
            enabled: false,
            endpoint: 'https://tu-servidor.com/api/reconstruct'
        },

        // Opción 2: Polycam API (comercial, requiere API key)
        polycam: {
            enabled: false,
            apiKey: 'YOUR_POLYCAM_API_KEY',
            endpoint: 'https://api.polycam.ai/v1/captures'
        },

        // Opción 3: Sketchfab API (comercial, requiere API key)
        sketchfab: {
            enabled: false,
            apiKey: 'YOUR_SKETCHFAB_API_KEY',
            endpoint: 'https://api.sketchfab.com/v3/models'
        },

        // Opción 4: Meshroom Cloud (requiere cuenta)
        meshroom: {
            enabled: false,
            endpoint: 'https://meshroom.cloud/api/process'
        }
    },

    // Configuración local (aproximación sin servicios externos)
    local: {
        enabled: true,
        quality: 'medium', // low, medium, high
        maxPoints: 10000,
        useMLDepthEstimation: false
    }
};

window.PHOTOGRAMMETRY_CONFIG = PHOTOGRAMMETRY_CONFIG;
