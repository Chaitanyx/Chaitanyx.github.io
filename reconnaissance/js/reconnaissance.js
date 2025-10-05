// Reconnaissance Lab - Main JavaScript
class ReconnaissanceLab {
    constructor() {
        this.collectionEnabled = true;
        this.liveModeActive = false;
        this.sessionStartTime = Date.now();
        this.collectedData = {};
        this.securityUtils = new SecurityUtils();
        
        this.init();
    }

    init() {
        this.updateSessionTime();
        this.initializePrivacyControls();
        this.startDataCollection();
        this.updateDataSummary();
        
        // Initialize behavioral analytics
        this.behavioralAnalytics = new BehavioralAnalytics();
        
        // Initialize security assessment
        this.securityAssessment = new SecurityAssessment();
        
        // Update summary every 5 seconds
        setInterval(() => {
            this.updateDataSummary();
        }, 5000);
    }

    initializePrivacyControls() {
        const enableCollection = document.getElementById('enableCollection');
        const enableFingerprinting = document.getElementById('enableFingerprinting');
        const enableBehavioral = document.getElementById('enableBehavioral');

        enableCollection.addEventListener('change', (e) => {
            this.collectionEnabled = e.target.checked;
            if (!this.collectionEnabled) {
                this.stopAllCollection();
            } else {
                this.startDataCollection();
            }
        });

        enableFingerprinting.addEventListener('change', (e) => {
            if (e.target.checked && this.collectionEnabled) {
                this.collectDeviceFingerprint();
            }
        });

        enableBehavioral.addEventListener('change', (e) => {
            if (e.target.checked && this.collectionEnabled) {
                this.initBehavioralTracking();
            } else {
                this.stopBehavioralTracking();
            }
        });
    }

    async startDataCollection() {
        if (!this.collectionEnabled) return;

        try {
            await this.collectNetworkIntelligence();
            await this.collectSystemInformation();
            await this.runSecurityAssessment();
            
            if (document.getElementById('enableFingerprinting').checked) {
                await this.collectDeviceFingerprint();
            }
            
            if (document.getElementById('enableBehavioral').checked) {
                this.initBehavioralTracking();
            }
        } catch (error) {
            console.error('Data collection error:', error);
        }
    }

    initBehavioralTracking() {
        if (this.behavioralAnalytics) {
            this.behavioralAnalytics.startTracking();
        }
    }

    async runSecurityAssessment() {
        if (this.securityAssessment) {
            await this.securityAssessment.runComprehensiveAssessment();
        }
    }

    async collectNetworkIntelligence() {
        try {
            // IP Information
            const ipResponse = await fetch('https://api.ipify.org?format=json', {
                timeout: 5000
            });
            const ipData = await ipResponse.json();
            
            const geoResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`, {
                timeout: 5000
            });
            const geoData = await geoResponse.json();
            
            const ipInfo = {
                publicIP: ipData.ip || 'Unknown',
                city: geoData.city || 'Unknown',
                region: geoData.region || 'Unknown',
                country: geoData.country_name || 'Unknown',
                isp: geoData.org || 'Unknown',
                timezone: geoData.timezone || 'Unknown',
                latitude: geoData.latitude || 'Unknown',
                longitude: geoData.longitude || 'Unknown'
            };

            this.displayData('ipInfo', ipInfo);
            this.collectedData.network = ipInfo;

            // Connection Analysis
            const connectionInfo = {
                protocol: location.protocol,
                hostname: location.hostname,
                port: location.port || (location.protocol === 'https:' ? '443' : '80'),
                path: location.pathname,
                userAgent: navigator.userAgent,
                language: navigator.language,
                languages: navigator.languages?.join(', ') || 'Unknown',
                onlineStatus: navigator.onLine ? 'Online' : 'Offline',
                connectionType: navigator.connection?.effectiveType || 'Unknown',
                downlink: navigator.connection?.downlink || 'Unknown'
            };

            this.displayData('connectionInfo', connectionInfo);
            this.collectedData.connection = connectionInfo;

            // DNS Information
            const dnsInfo = {
                hostname: location.hostname,
                origin: location.origin,
                referrer: document.referrer || 'Direct access',
                protocol: location.protocol.replace(':', ''),
                tlsVersion: 'TLS 1.3 (estimated)',
                dnsOver: 'System resolver',
                ipv4Support: 'Enabled',
                ipv6Support: navigator.connection?.type === 'wifi' ? 'Enabled' : 'Unknown'
            };

            this.displayData('dnsInfo', dnsInfo);
            this.collectedData.dns = dnsInfo;

        } catch (error) {
            console.error('Network intelligence collection failed:', error);
            this.displayError('ipInfo', 'Network data collection failed');
            this.displayError('connectionInfo', 'Connection analysis failed');
            this.displayError('dnsInfo', 'DNS resolution failed');
        }
    }

    async collectSystemInformation() {
        try {
            const systemInfo = {
                platform: navigator.platform,
                userAgent: navigator.userAgent,
                vendor: navigator.vendor,
                oscpu: navigator.oscpu || 'Unknown',
                cookieEnabled: navigator.cookieEnabled,
                doNotTrack: navigator.doNotTrack || 'Not set',
                javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
                onlineStatus: navigator.onLine,
                maxTouchPoints: navigator.maxTouchPoints || 0,
                hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
                deviceMemory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown'
            };

            this.displayData('systemInfo', systemInfo);
            this.collectedData.system = systemInfo;

        } catch (error) {
            console.error('System information collection failed:', error);
            this.displayError('systemInfo', 'System data collection failed');
        }
    }

    async collectDeviceFingerprint() {
        try {
            // Browser fingerprinting
            const browserInfo = {
                userAgent: navigator.userAgent,
                language: navigator.language,
                languages: navigator.languages?.join(', ') || 'Unknown',
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled,
                doNotTrack: navigator.doNotTrack || 'Not set',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                timezoneOffset: new Date().getTimezoneOffset(),
                screen: `${screen.width}x${screen.height}`,
                colorDepth: screen.colorDepth,
                pixelRatio: window.devicePixelRatio || 1,
                touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0
            };

            this.displayData('browserInfo', browserInfo);
            this.collectedData.browser = browserInfo;

            // Hardware fingerprinting
            const hardwareInfo = {
                cpuCores: navigator.hardwareConcurrency || 'Unknown',
                memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown',
                gpu: this.getGPUInfo(),
                audio: await this.getAudioFingerprint(),
                canvas: this.getCanvasFingerprint(),
                webgl: this.getWebGLFingerprint(),
                fonts: await this.getFontFingerprint(),
                plugins: this.getPluginInfo()
            };

            this.displayData('hardwareInfo', hardwareInfo);
            this.collectedData.hardware = hardwareInfo;

        } catch (error) {
            console.error('Device fingerprinting failed:', error);
            this.displayError('browserInfo', 'Browser profiling failed');
            this.displayError('hardwareInfo', 'Hardware fingerprinting failed');
        }
    }

    getGPUInfo() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) return 'WebGL not supported';
            
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                return {
                    vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
                    renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
                };
            }
            
            return 'GPU info masked';
        } catch (error) {
            return 'GPU detection failed';
        }
    }

    async getAudioFingerprint() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const analyser = audioContext.createAnalyser();
            const gain = audioContext.createGain();
            
            oscillator.type = 'triangle';
            oscillator.frequency.value = 10000;
            
            gain.gain.value = 0;
            
            oscillator.connect(analyser);
            analyser.connect(gain);
            gain.connect(audioContext.destination);
            
            oscillator.start(0);
            
            const data = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(data);
            
            oscillator.stop();
            audioContext.close();
            
            return Array.from(data).slice(0, 30).join(',');
        } catch (error) {
            return 'Audio fingerprinting blocked';
        }
    }

    getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('Canvas fingerprint test 🔍', 2, 2);
            
            return canvas.toDataURL().slice(-50);
        } catch (error) {
            return 'Canvas fingerprinting blocked';
        }
    }

    getWebGLFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl');
            
            if (!gl) return 'WebGL not supported';
            
            return {
                version: gl.getParameter(gl.VERSION),
                vendor: gl.getParameter(gl.VENDOR),
                shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
            };
        } catch (error) {
            return 'WebGL fingerprinting failed';
        }
    }

    async getFontFingerprint() {
        const fonts = [
            'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
            'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
            'Trebuchet MS', 'Arial Black', 'Impact'
        ];
        
        const availableFonts = [];
        
        for (const font of fonts) {
            if (await this.isFontAvailable(font)) {
                availableFonts.push(font);
            }
        }
        
        return availableFonts.join(', ') || 'No fonts detected';
    }

    async isFontAvailable(fontName) {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            ctx.font = `72px monospace`;
            const baselineWidth = ctx.measureText('mmmmmmmmmmlli').width;
            
            ctx.font = `72px ${fontName}, monospace`;
            const testWidth = ctx.measureText('mmmmmmmmmmlli').width;
            
            return baselineWidth !== testWidth;
        } catch (error) {
            return false;
        }
    }

    getPluginInfo() {
        try {
            const plugins = Array.from(navigator.plugins).map(plugin => ({
                name: plugin.name,
                filename: plugin.filename,
                description: plugin.description
            }));
            
            return plugins.length > 0 ? plugins : 'No plugins detected';
        } catch (error) {
            return 'Plugin detection blocked';
        }
    }

    displayData(elementId, data) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let html = '';
        if (typeof data === 'object' && data !== null) {
            for (const [key, value] of Object.entries(data)) {
                const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
                html += `<div class="data-item">
                    <span class="data-label">${this.securityUtils.sanitize(displayKey)}:</span>
                    <span class="data-value">${this.securityUtils.sanitize(displayValue)}</span>
                </div>`;
            }
        } else {
            html = `<div class="data-item">
                <span class="data-value">${this.securityUtils.sanitize(data)}</span>
            </div>`;
        }

        element.innerHTML = html;
        element.classList.add('data-updated');
        setTimeout(() => element.classList.remove('data-updated'), 500);
    }

    displayError(elementId, message) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.innerHTML = `<div class="data-item" style="color: #ff4444;">
            <span class="data-value">❌ ${this.securityUtils.sanitize(message)}</span>
        </div>`;
    }

    updateSessionTime() {
        const sessionStart = document.getElementById('sessionStart');
        if (sessionStart) {
            const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 1000);
            const hours = Math.floor(elapsed / 3600);
            const minutes = Math.floor((elapsed % 3600) / 60);
            const seconds = elapsed % 60;
            
            sessionStart.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        setTimeout(() => this.updateSessionTime(), 1000);
    }

    updateDataSummary() {
        const totalDataPoints = Object.keys(this.collectedData).reduce((count, key) => {
            const data = this.collectedData[key];
            return count + (typeof data === 'object' ? Object.keys(data).length : 1);
        }, 0);

        const collectionTime = Math.floor((Date.now() - this.sessionStartTime) / 1000);
        const storageUsed = Math.round(JSON.stringify(this.collectedData).length / 1024 * 100) / 100;

        const totalDataPointsEl = document.getElementById('totalDataPoints');
        const collectionTimeEl = document.getElementById('collectionTime');
        const storageUsedEl = document.getElementById('storageUsed');

        if (totalDataPointsEl) totalDataPointsEl.textContent = totalDataPoints;
        if (collectionTimeEl) collectionTimeEl.textContent = collectionTime;
        if (storageUsedEl) storageUsedEl.textContent = storageUsed;
    }

    stopAllCollection() {
        // Stop all active collection processes
        this.stopBehavioralTracking();
        console.log('All data collection stopped');
    }

    stopBehavioralTracking() {
        // Remove behavioral event listeners
        if (this.behavioralAnalytics) {
            this.behavioralAnalytics.stopTracking();
        }
    }
}

// Security utilities class
class SecurityUtils {
    constructor() {
        this.xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi
        ];
    }

    sanitize(input) {
        if (typeof input !== 'string') {
            input = String(input);
        }

        // Remove potential XSS patterns
        for (const pattern of this.xssPatterns) {
            input = input.replace(pattern, '[FILTERED]');
        }

        // Escape HTML entities
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    validateInput(input, type = 'text') {
        if (!input || typeof input !== 'string') {
            return false;
        }

        switch (type) {
            case 'ip':
                return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(input);
            case 'url':
                try {
                    new URL(input);
                    return true;
                } catch {
                    return false;
                }
            case 'text':
            default:
                return input.length <= 1000; // Reasonable length limit
        }
    }
}

// Global functions
function clearAllData() {
    if (confirm('Are you sure you want to clear all collected data? This action cannot be undone.')) {
        localStorage.removeItem('reconnaissanceData');
        location.reload();
    }
}

function toggleLiveMode() {
    const icon = document.getElementById('liveModeIcon');
    if (window.reconLab) {
        window.reconLab.liveModeActive = !window.reconLab.liveModeActive;
        icon.textContent = window.reconLab.liveModeActive ? '🔴' : '📡';
        
        if (window.reconLab.liveModeActive) {
            console.log('Live mode activated - Real-time data collection enabled');
        } else {
            console.log('Live mode deactivated');
        }
    }
}

function exportData(format) {
    if (!window.reconLab || !window.reconLab.collectedData) {
        alert('No data available to export');
        return;
    }

    const data = window.reconLab.collectedData;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format.toLowerCase()) {
        case 'json':
            content = JSON.stringify(data, null, 2);
            filename = `reconnaissance-data-${timestamp}.json`;
            mimeType = 'application/json';
            break;
        
        case 'csv':
            content = convertToCSV(data);
            filename = `reconnaissance-data-${timestamp}.csv`;
            mimeType = 'text/csv';
            break;
        
        case 'xml':
            content = convertToXML(data);
            filename = `reconnaissance-data-${timestamp}.xml`;
            mimeType = 'application/xml';
            break;
        
        default:
            alert('Unsupported export format');
            return;
    }

    downloadFile(content, filename, mimeType);
}

function convertToCSV(data) {
    const rows = [];
    rows.push(['Category', 'Key', 'Value']);
    
    for (const [category, categoryData] of Object.entries(data)) {
        if (typeof categoryData === 'object') {
            for (const [key, value] of Object.entries(categoryData)) {
                rows.push([category, key, typeof value === 'object' ? JSON.stringify(value) : value]);
            }
        } else {
            rows.push([category, '', categoryData]);
        }
    }
    
    return rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
}

function convertToXML(data) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<reconnaissance>\n';
    
    for (const [category, categoryData] of Object.entries(data)) {
        xml += `  <${category}>\n`;
        
        if (typeof categoryData === 'object') {
            for (const [key, value] of Object.entries(categoryData)) {
                const xmlValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
                xml += `    <${key}>${xmlValue.replace(/[<>&'"]/g, char => ({
                    '<': '&lt;',
                    '>': '&gt;',
                    '&': '&amp;',
                    "'": '&apos;',
                    '"': '&quot;'
                })[char])}</${key}>\n`;
            }
        } else {
            xml += `    <value>${String(categoryData).replace(/[<>&'"]/g, char => ({
                '<': '&lt;',
                '>': '&gt;',
                '&': '&amp;',
                "'": '&apos;',
                '"': '&quot;'
            })[char])}</value>\n`;
        }
        
        xml += `  </${category}>\n`;
    }
    
    xml += '</reconnaissance>';
    return xml;
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

function generateReport() {
    if (!window.reconLab || !window.reconLab.collectedData) {
        alert('No data available to generate report');
        return;
    }

    const data = window.reconLab.collectedData;
    const timestamp = new Date().toISOString();
    
    let report = `# Reconnaissance Report\n\n`;
    report += `**Generated:** ${timestamp}\n\n`;
    report += `**Session Duration:** ${Math.floor((Date.now() - window.reconLab.sessionStartTime) / 1000)} seconds\n\n`;
    
    for (const [category, categoryData] of Object.entries(data)) {
        report += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
        
        if (typeof categoryData === 'object') {
            for (const [key, value] of Object.entries(categoryData)) {
                const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                report += `- **${displayKey}:** ${typeof value === 'object' ? JSON.stringify(value) : value}\n`;
            }
        } else {
            report += `- ${categoryData}\n`;
        }
        
        report += '\n';
    }
    
    downloadFile(report, `reconnaissance-report-${timestamp.replace(/[:.]/g, '-')}.md`, 'text/markdown');
}

// Initialize the reconnaissance lab when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.reconLab = new ReconnaissanceLab();
    
    // Mark that user has visited the recon lab
    localStorage.setItem('reconLabVisited', 'true');
    localStorage.setItem('reconLabVisitTime', Date.now().toString());
    
    // Setup cleanup on page unload
    setupReconLabCleanup();
});

// Cleanup function to reset Easter egg state when leaving recon lab
function setupReconLabCleanup() {
    // Track when user navigates away from recon lab
    window.addEventListener('beforeunload', () => {
        // Clear the unlock state so button will be hidden again
        localStorage.removeItem('reconLabUnlocked');
        
        // Clear all cookies for privacy
        clearAllCookies();
        
        // Mark that cleanup happened
        localStorage.setItem('reconLabCleanupDone', 'true');
    });
    
    // Also handle navigation via links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && (link.href.includes('index.html') || link.href.endsWith('/'))) {
            // User is navigating back to portfolio
            localStorage.removeItem('reconLabUnlocked');
            clearAllCookies();
            localStorage.setItem('reconLabCleanupDone', 'true');
        }
    });
}

// Function to clear all cookies
function clearAllCookies() {
    try {
        // Get all cookies
        const cookies = document.cookie.split(";");
        
        // Clear each cookie
        for (let cookie of cookies) {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            
            if (name) {
                // Clear for current domain
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
            }
        }
        
        console.log('🍪 All cookies cleared for privacy');
    } catch (error) {
        console.error('Cookie clearing failed:', error);
    }
    
    // Clear localStorage related to tracking
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
            key.includes('recon') || 
            key.includes('fingerprint') || 
            key.includes('tracking') ||
            key.includes('analytics') ||
            key.includes('session')
        )) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => {
        if (key !== 'reconLabCleanupDone') { // Keep cleanup marker
            localStorage.removeItem(key);
        }
    });
    
    // Clear sessionStorage
    try {
        sessionStorage.clear();
        console.log('🗃️ Session storage cleared');
    } catch (error) {
        console.error('Session storage clearing failed:', error);
    }
}