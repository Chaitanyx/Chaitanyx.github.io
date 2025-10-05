// Main Network Analyzer - 3D Interactive Implementation
class NetworkPathAnalyzer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.nodes = [];
        this.connections = [];
        this.networkData = {};
        this.isMonitoring = false;
        this.animationId = null;
        
        this.init();
        this.startAnalysis();
    }

    async init() {
        // Initialize Three.js 3D scene
        this.initThreeJS();
        
        // Start network discovery
        await this.discoverNetwork();
        
        // Gather client information
        await this.gatherClientData();
        
        // Build 3D visualization
        this.build3DVisualization();
        
        // Start real-time monitoring
        this.startRealTimeMonitoring();
    }

    initThreeJS() {
        try {
            // Check if Three.js is loaded
            if (typeof THREE === 'undefined') {
                console.error('Three.js not loaded');
                document.getElementById('networkMap').innerHTML = '<p style="color: #ff4444; text-align: center; padding: 50px;">3D visualization library not available.</p>';
                return;
            }

            // Create scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x0a0a0a);

            // Create camera
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.camera.position.set(0, 5, 10);

            // Create renderer
            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            this.renderer.setSize(800, 400);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            // Add to DOM
            const networkMap = document.getElementById('networkMap');
            if (networkMap) {
                networkMap.innerHTML = '';
                networkMap.appendChild(this.renderer.domElement);
            }

            // Add orbit controls if available
            if (typeof THREE.OrbitControls !== 'undefined') {
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.05;
            } else {
                console.warn('OrbitControls not available, using basic camera controls');
                // Add basic mouse controls
                this.addBasicControls();
            }

            // Add lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
            this.scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0x00ff41, 0.8);
            directionalLight.position.set(10, 10, 5);
            directionalLight.castShadow = true;
            this.scene.add(directionalLight);

            // Start render loop
            this.animate();
        } catch (error) {
            console.error('Error initializing Three.js:', error);
            document.getElementById('networkMap').innerHTML = '<p style="color: #ff4444; text-align: center; padding: 50px;">Error initializing 3D visualization.</p>';
        }
    }

    addBasicControls() {
        let isMouseDown = false;
        let mouseX = 0;
        let mouseY = 0;

        this.renderer.domElement.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        });

        this.renderer.domElement.addEventListener('mousemove', (event) => {
            if (!isMouseDown) return;

            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;

            // Rotate camera around origin
            const spherical = new THREE.Spherical();
            spherical.setFromVector3(this.camera.position);
            spherical.theta -= deltaX * 0.01;
            spherical.phi += deltaY * 0.01;
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

            this.camera.position.setFromSpherical(spherical);
            this.camera.lookAt(0, 0, 0);

            mouseX = event.clientX;
            mouseY = event.clientY;
        });

        this.renderer.domElement.addEventListener('mouseup', () => {
            isMouseDown = false;
        });

        this.renderer.domElement.addEventListener('wheel', (event) => {
            const scale = event.deltaY > 0 ? 1.1 : 0.9;
            this.camera.position.multiplyScalar(scale);
        });
    }

    async discoverNetwork() {
        console.log('🔍 Discovering network infrastructure...');
        
        // Get basic connection info
        const connectionInfo = await this.getConnectionInfo();
        
        // Detect Wi-Fi/Network details
        const networkDetails = await this.detectNetworkDetails();
        
        // Discover intermediate servers
        const serverPath = await this.discoverServerPath();
        
        this.networkData = {
            connection: connectionInfo,
            network: networkDetails,
            serverPath: serverPath,
            timestamp: Date.now()
        };

        console.log('📊 Network data collected:', this.networkData);
    }

    async startAnalysis() {
        try {
            await this.discoverNetwork();
            this.updateUI();
        } catch (error) {
            console.error('Analysis error:', error);
        }
    }

    // ... (rest of the methods would continue here)
    // For brevity, I'll add the essential methods

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Update controls
        if (this.controls) {
            this.controls.update();
        }

        // Animate particles and other elements
        if (this.connections) {
            this.connections.forEach(connection => {
                if (connection.userData && connection.userData.curve) {
                    connection.userData.progress += connection.userData.speed;
                    if (connection.userData.progress > 1) {
                        connection.userData.progress = 0;
                    }
                    
                    const point = connection.userData.curve.getPoint(connection.userData.progress);
                    connection.position.copy(point);
                }
            });
        }

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    updateUI() {
        // Update status
        const statusEl = document.getElementById('siteStatus');
        if (statusEl) {
            statusEl.textContent = 'Online';
            statusEl.className = 'status online';
        }

        // Update basic info
        const overviewEl = document.getElementById('connectionOverview');
        if (overviewEl) {
            overviewEl.innerHTML = '<p style="color: #00ff41;">Network analysis in progress...</p>';
        }
    }
}

// Global functions for UI interaction
function analyzeConnection() {
    if (window.networkAnalyzer) {
        window.networkAnalyzer.startAnalysis();
    }
}

function toggleAnimation() {
    console.log('Toggling animation...');
}

function exportPath() {
    if (window.networkAnalyzer) {
        const data = {
            networkData: window.networkAnalyzer.networkData,
            timestamp: new Date().toISOString(),
            analysis: 'Network Path Analysis - chaitanyalade.me'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `network-analysis-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

function startMonitoring() {
    console.log('Starting monitoring...');
    document.getElementById('monitorBtn').innerHTML = '<i class="fas fa-stop"></i> Stop Monitoring';
    document.getElementById('monitorBtn').onclick = stopMonitoring;
}

function stopMonitoring() {
    console.log('Stopping monitoring...');
    document.getElementById('monitorBtn').innerHTML = '<i class="fas fa-play"></i> Start Monitoring';
    document.getElementById('monitorBtn').onclick = startMonitoring;
}

function clearMonitoring() {
    const canvas = document.getElementById('latencyChart');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    document.getElementById('currentLatency').textContent = '--ms';
    document.getElementById('avgLatency').textContent = '--ms';
    document.getElementById('peakLatency').textContent = '--ms';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Network Path Analyzer...');
    
    // Load Three.js
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
        const controlsScript = document.createElement('script');
        controlsScript.src = 'https://threejs.org/examples/js/controls/OrbitControls.js';
        controlsScript.onerror = () => {
            // Fallback: try alternative CDN
            const fallbackScript = document.createElement('script');
            fallbackScript.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
            fallbackScript.onload = () => {
                window.networkAnalyzer = new NetworkPathAnalyzer();
            };
            fallbackScript.onerror = () => {
                console.warn('OrbitControls failed to load, initializing without controls');
                window.networkAnalyzer = new NetworkPathAnalyzer();
            };
            document.head.appendChild(fallbackScript);
        };
        controlsScript.onload = () => {
            // Initialize the network analyzer
            window.networkAnalyzer = new NetworkPathAnalyzer();
        };
        document.head.appendChild(controlsScript);
    };
    script.onerror = () => {
        console.error('Failed to load Three.js');
        document.getElementById('networkMap').innerHTML = '<p style="color: #ff4444; text-align: center; padding: 50px;">Failed to load 3D visualization library. Please check your internet connection.</p>';
    };
    document.head.appendChild(script);
});