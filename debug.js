// Sistema de debug en pantalla para móvil
class MobileDebug {
    constructor() {
        this.logs = [];
        this.maxLogs = 20;
        this.container = null;
        this.enabled = true;
        this.init();
    }

    init() {
        // Crear contenedor de debug
        this.container = document.createElement('div');
        this.container.id = 'mobile-debug';
        this.container.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            max-height: 200px;
            overflow-y: auto;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff00;
            font-family: monospace;
            font-size: 10px;
            padding: 10px;
            z-index: 9999;
            display: none;
            border-top: 2px solid #00ff00;
        `;

        // Botón para toggle debug
        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = '🐛';
        toggleBtn.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            border: 2px solid #00ff00;
            font-size: 24px;
            z-index: 10000;
            cursor: pointer;
        `;

        toggleBtn.addEventListener('click', () => {
            this.toggle();
        });

        document.body.appendChild(this.container);
        document.body.appendChild(toggleBtn);

        // Interceptar console.log, console.error, console.warn
        this.interceptConsole();
    }

    interceptConsole() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            originalLog.apply(console, args);
            this.add('LOG', args.join(' '));
        };

        console.error = (...args) => {
            originalError.apply(console, args);
            this.add('ERROR', args.join(' '));
        };

        console.warn = (...args) => {
            originalWarn.apply(console, args);
            this.add('WARN', args.join(' '));
        };

        // Capturar errores globales
        window.addEventListener('error', (event) => {
            this.add('ERROR', `${event.message} at ${event.filename}:${event.lineno}`);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.add('ERROR', `Promise rejected: ${event.reason}`);
        });
    }

    add(type, message) {
        const timestamp = new Date().toLocaleTimeString();
        const log = {
            type,
            message,
            timestamp
        };

        this.logs.push(log);

        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        this.render();
    }

    render() {
        const colors = {
            LOG: '#00ff00',
            ERROR: '#ff0000',
            WARN: '#ffaa00'
        };

        this.container.innerHTML = this.logs.map(log => {
            return `<div style="color: ${colors[log.type]}; margin-bottom: 5px;">
                <span style="color: #888;">[${log.timestamp}]</span>
                <strong>${log.type}:</strong> ${log.message}
            </div>`;
        }).join('');

        // Auto-scroll al final
        this.container.scrollTop = this.container.scrollHeight;
    }

    toggle() {
        if (this.container.style.display === 'none') {
            this.container.style.display = 'block';
        } else {
            this.container.style.display = 'none';
        }
    }

    clear() {
        this.logs = [];
        this.render();
    }
}

// Inicializar debug cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobileDebug = new MobileDebug();
    });
} else {
    window.mobileDebug = new MobileDebug();
}
