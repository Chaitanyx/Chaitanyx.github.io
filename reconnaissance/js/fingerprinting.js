// Advanced Fingerprinting Module
class AdvancedFingerprinting {
    constructor() {
        this.fingerprintData = {};
        this.securityUtils = new SecurityUtils();
    }

    async generateAdvancedFingerprint() {
        try {
            const fingerprint = {
                timestamp: Date.now(),
                basic: await this.getBasicFingerprint(),
                advanced: await this.getAdvancedProperties(),
                behavioral: this.getBehavioralFingerprint(),
                environment: this.getEnvironmentFingerprint(),
                security: this.getSecurityFingerprint()
            };

            this.fingerprintData = fingerprint;
            return fingerprint;
        } catch (error) {
            console.error('Advanced fingerprinting failed:', error);
            return null;
        }
    }

    async getBasicFingerprint() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages || [],
            platform: navigator.platform,
            vendor: navigator.vendor || 'Unknown',
            product: navigator.product || 'Unknown',
            productSub: navigator.productSub || 'Unknown',
            appName: navigator.appName || 'Unknown',
            appVersion: navigator.appVersion || 'Unknown',
            appCodeName: navigator.appCodeName || 'Unknown',
            buildID: navigator.buildID || 'Unknown'
        };
    }

    async getAdvancedProperties() {
        const advanced = {};

        // Screen properties
        advanced.screen = {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,
            orientation: screen.orientation ? {
                angle: screen.orientation.angle,
                type: screen.orientation.type
            } : 'Unknown'
        };

        // Window properties
        advanced.window = {
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            outerWidth: window.outerWidth,
            outerHeight: window.outerHeight,
            devicePixelRatio: window.devicePixelRatio || 1,
            screenX: window.screenX,
            screenY: window.screenY
        };

        // Hardware concurrency
        advanced.hardware = {
            concurrency: navigator.hardwareConcurrency || 'Unknown',
            deviceMemory: navigator.deviceMemory || 'Unknown',
            maxTouchPoints: navigator.maxTouchPoints || 0,
            webdriver: navigator.webdriver || false
        };

        // Date and timezone
        advanced.time = {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: new Date().getTimezoneOffset(),
            locale: Intl.DateTimeFormat().resolvedOptions().locale,
            calendar: Intl.DateTimeFormat().resolvedOptions().calendar || 'Unknown',
            numberingSystem: Intl.DateTimeFormat().resolvedOptions().numberingSystem || 'Unknown'
        };

        // WebRTC fingerprinting
        advanced.webrtc = await this.getWebRTCFingerprint();

        // Media devices
        advanced.media = await this.getMediaDeviceFingerprint();

        // Storage quota
        advanced.storage = await this.getStorageQuota();

        return advanced;
    }

    getBehavioralFingerprint() {
        return {
            mouseMovement: this.getMouseBehavior(),
            keyboardBehavior: this.getKeyboardBehavior(),
            scrollBehavior: this.getScrollBehavior(),
            clickPatterns: this.getClickPatterns(),
            focusEvents: this.getFocusEvents()
        };
    }

    getEnvironmentFingerprint() {
        const env = {};

        // Performance timing
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            env.performance = {
                navigationStart: timing.navigationStart,
                loadEventEnd: timing.loadEventEnd,
                domContentLoadedEventEnd: timing.domContentLoadedEventEnd,
                responseEnd: timing.responseEnd,
                connectEnd: timing.connectEnd
            };
        }

        // Connection information
        if (navigator.connection) {
            env.connection = {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            };
        }

        // Battery API (if available)
        if (navigator.getBattery) {
            navigator.getBattery().then(battery => {
                env.battery = {
                    charging: battery.charging,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime,
                    level: battery.level
                };
            });
        }

        // Permissions API
        env.permissions = this.getPermissionsStatus();

        return env;
    }

    getSecurityFingerprint() {
        return {
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack || 'Not set',
            javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
            onlineStatus: navigator.onLine,
            secureContext: window.isSecureContext,
            crossOriginIsolated: window.crossOriginIsolated || false,
            localStorage: this.testLocalStorage(),
            sessionStorage: this.testSessionStorage(),
            indexedDB: this.testIndexedDB(),
            webSQL: this.testWebSQL(),
            webWorkers: this.testWebWorkers(),
            serviceWorkers: this.testServiceWorkers()
        };
    }

    async getWebRTCFingerprint() {
        try {
            const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
            const pc = new RTCPeerConnection(rtcConfig);
            
            return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    pc.close();
                    resolve('WebRTC timeout');
                }, 5000);

                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        clearTimeout(timeout);
                        pc.close();
                        resolve({
                            candidate: event.candidate.candidate,
                            protocol: event.candidate.protocol,
                            type: event.candidate.type
                        });
                    }
                };

                pc.createDataChannel('test');
                pc.createOffer().then(offer => pc.setLocalDescription(offer));
            });
        } catch (error) {
            return 'WebRTC not available';
        }
    }

    async getMediaDeviceFingerprint() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
                return 'Media devices API not available';
            }

            const devices = await navigator.mediaDevices.enumerateDevices();
            return {
                audioInputs: devices.filter(d => d.kind === 'audioinput').length,
                audioOutputs: devices.filter(d => d.kind === 'audiooutput').length,
                videoInputs: devices.filter(d => d.kind === 'videoinput').length,
                labels: devices.some(d => d.label !== '') // Check if labels are accessible
            };
        } catch (error) {
            return 'Media device enumeration failed';
        }
    }

    async getStorageQuota() {
        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                return {
                    quota: estimate.quota,
                    usage: estimate.usage,
                    usageDetails: estimate.usageDetails || {}
                };
            }
            return 'Storage quota API not available';
        } catch (error) {
            return 'Storage quota estimation failed';
        }
    }

    getMouseBehavior() {
        // This would be populated by mouse tracking events
        return {
            totalMovement: 0,
            averageSpeed: 0,
            clickCount: 0,
            dwellTime: 0,
            patterns: []
        };
    }

    getKeyboardBehavior() {
        // This would be populated by keyboard tracking events
        return {
            typingSpeed: 0,
            keyPressIntervals: [],
            commonPatterns: [],
            dwellTimes: []
        };
    }

    getScrollBehavior() {
        return {
            scrollSpeed: 0,
            scrollDirection: 'unknown',
            scrollPatterns: [],
            pageHeight: document.documentElement.scrollHeight,
            viewportHeight: window.innerHeight
        };
    }

    getClickPatterns() {
        return {
            clickFrequency: 0,
            doubleClickSpeed: 0,
            clickPositions: [],
            clickTargets: []
        };
    }

    getFocusEvents() {
        return {
            focusLoss: 0,
            focusGain: 0,
            activeTime: 0,
            tabSwitches: 0
        };
    }

    async getPermissionsStatus() {
        const permissions = {};
        const permissionNames = [
            'camera', 'microphone', 'geolocation', 'notifications',
            'persistent-storage', 'push', 'midi', 'background-sync'
        ];

        for (const permission of permissionNames) {
            try {
                if ('permissions' in navigator) {
                    const result = await navigator.permissions.query({ name: permission });
                    permissions[permission] = result.state;
                }
            } catch (error) {
                permissions[permission] = 'unknown';
            }
        }

        return permissions;
    }

    testLocalStorage() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    testSessionStorage() {
        try {
            const test = 'test';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    testIndexedDB() {
        try {
            return !!window.indexedDB;
        } catch (error) {
            return false;
        }
    }

    testWebSQL() {
        try {
            return !!window.openDatabase;
        } catch (error) {
            return false;
        }
    }

    testWebWorkers() {
        try {
            return !!window.Worker;
        } catch (error) {
            return false;
        }
    }

    testServiceWorkers() {
        try {
            return 'serviceWorker' in navigator;
        } catch (error) {
            return false;
        }
    }

    // Canvas and WebGL fingerprinting
    getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = 200;
            canvas.height = 50;
            
            // Draw text with various styles
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('🔍 Canvas fingerprint', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('Canvas fingerprint 123', 4, 45);
            
            // Draw some shapes
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = 'rgb(255, 0, 255)';
            ctx.beginPath();
            ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
            
            return canvas.toDataURL();
        } catch (error) {
            return 'Canvas fingerprinting failed';
        }
    }

    getWebGLFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) return 'WebGL not supported';
            
            const fingerprint = {
                version: gl.getParameter(gl.VERSION),
                vendor: gl.getParameter(gl.VENDOR),
                renderer: gl.getParameter(gl.RENDERER),
                shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
                maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
                maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
                maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
                maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS)
            };
            
            // Get extensions
            const extensions = gl.getSupportedExtensions();
            if (extensions) {
                fingerprint.extensions = extensions.join(', ');
            }
            
            // Get unmasked vendor and renderer if available
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                fingerprint.unmaskedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                fingerprint.unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }
            
            return fingerprint;
        } catch (error) {
            return 'WebGL fingerprinting failed';
        }
    }

    // Audio context fingerprinting
    async getAudioContextFingerprint() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            const oscillator = audioContext.createOscillator();
            const analyser = audioContext.createAnalyser();
            const gain = audioContext.createGain();
            const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
            
            gain.gain.value = 0; // Mute
            oscillator.type = 'triangle';
            oscillator.frequency.value = 10000;
            
            oscillator.connect(analyser);
            analyser.connect(scriptProcessor);
            scriptProcessor.connect(gain);
            gain.connect(audioContext.destination);
            
            return new Promise((resolve) => {
                let sampleCount = 0;
                const maxSamples = 1000;
                const samples = [];
                
                scriptProcessor.onaudioprocess = (event) => {
                    const inputBuffer = event.inputBuffer;
                    const inputData = inputBuffer.getChannelData(0);
                    
                    for (let i = 0; i < inputData.length && sampleCount < maxSamples; i++) {
                        samples.push(inputData[i]);
                        sampleCount++;
                    }
                    
                    if (sampleCount >= maxSamples) {
                        oscillator.stop();
                        audioContext.close();
                        
                        // Create fingerprint from samples
                        const fingerprint = samples.slice(0, 50).join(',');
                        resolve(fingerprint);
                    }
                };
                
                oscillator.start(0);
                
                // Fallback timeout
                setTimeout(() => {
                    try {
                        oscillator.stop();
                        audioContext.close();
                    } catch (e) {}
                    resolve('Audio fingerprinting timeout');
                }, 5000);
            });
        } catch (error) {
            return 'Audio context fingerprinting failed';
        }
    }

    // Font detection
    async getFontList() {
        const fonts = [
            // Windows fonts
            'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math',
            'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New',
            'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'HoloLens MDL2 Assets',
            'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode',
            'Malgun Gothic', 'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue',
            'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti',
            'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MS PGothic', 'MS UI Gothic', 'MV Boli',
            'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print',
            'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol',
            'SimSun', 'Sitka', 'Sylfaen', 'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS',
            'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic',
            
            // macOS fonts
            'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold',
            'Arial Unicode MS', 'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon',
            'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT',
            'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS',
            'Copperplate', 'Courier', 'Courier New', 'Didot', 'DIN Alternate', 'DIN Condensed',
            'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum',
            'Hoefler Text', 'Impact', 'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Monaco',
            'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET',
            'SignPainter', 'Skia', 'Snell Roundhand', 'Tahoma', 'Times', 'Times New Roman', 'Trattatello',
            'Trebuchet MS', 'Verdana', 'Zapfino'
        ];
        
        const availableFonts = [];
        const testString = 'mmmmmmmmmmlli';
        const testSize = '72px';
        const h = document.getElementsByTagName('body')[0];
        
        // Create containers
        const s = document.createElement('span');
        s.style.fontSize = testSize;
        s.style.position = 'absolute';
        s.style.left = '-9999px';
        s.innerHTML = testString;
        
        const defaultWidth = {};
        const defaultHeight = {};
        
        // Get default measurements
        const baseFonts = ['monospace', 'sans-serif', 'serif'];
        
        for (const baseFont of baseFonts) {
            s.style.fontFamily = baseFont;
            h.appendChild(s);
            defaultWidth[baseFont] = s.offsetWidth;
            defaultHeight[baseFont] = s.offsetHeight;
            h.removeChild(s);
        }
        
        // Test each font
        for (const font of fonts) {
            let detected = false;
            
            for (const baseFont of baseFonts) {
                s.style.fontFamily = `"${font}",${baseFont}`;
                h.appendChild(s);
                
                const matched = (s.offsetWidth !== defaultWidth[baseFont] || 
                               s.offsetHeight !== defaultHeight[baseFont]);
                
                h.removeChild(s);
                
                if (matched) {
                    detected = true;
                    break;
                }
            }
            
            if (detected) {
                availableFonts.push(font);
            }
        }
        
        return availableFonts;
    }

    // Generate unique hash for the fingerprint
    generateHash(data) {
        const str = JSON.stringify(data);
        let hash = 0;
        
        if (str.length === 0) return hash.toString();
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash).toString(16);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedFingerprinting;
} else {
    window.AdvancedFingerprinting = AdvancedFingerprinting;
}