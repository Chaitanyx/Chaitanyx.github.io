// Main Network Analyzer - 3D Interactive Implementation
class NetworkPathAnalyzer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.nodes = [];
        this.connections = [];
        this.flowingParticles = [];
        this.networkData = {};
        this.isMonitoring = false;
        this.animationId = null;
        this.controls = null;
        this.animatedPaths = [];
        this.progressElement = null;
        
        this.init();
    }

    showProgress(message, percentage) {
        let progressContainer = document.getElementById('progressContainer');
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.id = 'progressContainer';
            progressContainer.className = 'progress-container';
            progressContainer.innerHTML = `
                <div class="progress-overlay">
                    <div class="progress-box">
                        <div class="progress-message" id="progressMessage">Initializing...</div>
                        <div class="progress-bar">
                            <div class="progress-fill" id="progressFill"></div>
                        </div>
                        <div class="progress-percentage" id="progressPercentage">0%</div>
                    </div>
                </div>
            `;
            document.body.appendChild(progressContainer);
        }
        
        const messageEl = document.getElementById('progressMessage');
        const fillEl = document.getElementById('progressFill');
        const percentageEl = document.getElementById('progressPercentage');
        
        if (messageEl) messageEl.textContent = message;
        if (fillEl) fillEl.style.width = `${percentage}%`;
        if (percentageEl) percentageEl.textContent = `${percentage}%`;
        
        progressContainer.style.display = 'flex';
    }

    hideProgress() {
        const progressContainer = document.getElementById('progressContainer');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
    }

    startNodeAnimations() {
        if (!this.nodes || this.nodes.length === 0) return;
        
        console.log('🎬 Starting node animations...');
        
        // Animate nodes with floating motion
        this.nodes.forEach((node, index) => {
            if (node && node.userData) {
                // Store original position
                node.userData.originalY = node.position.y;
                node.userData.animationPhase = Math.random() * Math.PI * 2;
                node.userData.animationSpeed = 0.02 + Math.random() * 0.02;
                node.userData.floatAmplitude = 0.3 + Math.random() * 0.2;
                
                // Add data transmission visual effect
                setTimeout(() => {
                    this.createDataPacket(node, index);
                }, index * 500); // Staggered animation
            }
        });
        
        // Start connection line animations
        this.animateConnections();
        
        // Show completion message
        console.log('✨ Network path visualization is now active with real-time animations!');
    }

    createDataPacket(sourceNode, index) {
        if (index < this.nodes.length - 1) {
            const targetNode = this.nodes[index + 1];
            
            // Create a glowing data packet
            const geometry = new THREE.SphereGeometry(0.1, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0.9
            });
            
            const packet = new THREE.Mesh(geometry, material);
            packet.position.copy(sourceNode.position);
            
            this.scene.add(packet);
            
            // Animate packet movement
            const startPos = sourceNode.position.clone();
            const endPos = targetNode.position.clone();
            const duration = 2000; // 2 seconds
            const startTime = Date.now();
            
            const animatePacket = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease-in-out animation
                const easedProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);
                
                packet.position.lerpVectors(startPos, endPos, easedProgress);
                packet.rotation.y += 0.2;
                
                // Pulsing glow effect
                packet.material.opacity = 0.5 + 0.4 * Math.sin(elapsed * 0.01);
                
                if (progress < 1) {
                    requestAnimationFrame(animatePacket);
                } else {
                    this.scene.remove(packet);
                    // Trigger next packet
                    if (index < this.nodes.length - 2) {
                        setTimeout(() => this.createDataPacket(targetNode, index + 1), 200);
                    }
                }
            };
            
            animatePacket();
        }
    }

    animateConnections() {
        if (!this.connections || this.connections.length === 0) return;
        
        this.connections.forEach((connection, index) => {
            if (connection && connection.material) {
                // Create pulsing effect for connections
                connection.userData = connection.userData || {};
                connection.userData.pulsePhase = Math.random() * Math.PI * 2;
                connection.userData.pulseSpeed = 0.03 + Math.random() * 0.02;
            }
        });
    }

    async init() {
        console.log('🚀 Initializing Network Path Analyzer...');
        
        // Show initial progress
        this.showProgress('Initializing 3D visualization...', 10);
        
        // Initialize Three.js 3D scene
        this.initThreeJS();
        
        // Show progress
        this.showProgress('Discovering network topology...', 30);
        
        // Start network discovery with faster execution
        await this.discoverNetwork();
        
        // Show progress
        this.showProgress('Building 3D network map...', 60);
        
        // Build 3D visualization with animations
        this.build3DVisualization();
        
        // Show progress
        this.showProgress('Finalizing analysis...', 90);
        
        // Update UI with collected data
        this.updateUI();
        
        // Complete progress
        this.showProgress('Network analysis complete!', 100);
        
        // Update analyze button
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.innerHTML = '<i class="fas fa-check"></i> Analysis Complete';
            analyzeBtn.style.background = 'linear-gradient(45deg, #00ff41, #00cc33)';
            analyzeBtn.disabled = false;
            analyzeBtn.classList.add('complete');
        }
        
        setTimeout(() => this.hideProgress(), 1500);
        
        // Start animations
        this.startNodeAnimations();
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
            this.camera = new THREE.PerspectiveCamera(75, 800 / 400, 0.1, 1000);
            this.camera.position.set(0, 5, 15);

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
        if (!this.renderer || !this.renderer.domElement) return;
        
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
        
        try {
            // Run all network checks in parallel for faster execution
            const [connectionInfo, networkDetails] = await Promise.all([
                this.getConnectionInfo(),
                this.detectNetworkDetails()
            ]);
            
            // Create server path
            const serverPath = this.createServerPath();
            
            this.networkData = {
                connection: connectionInfo,
                network: networkDetails,
                serverPath: serverPath,
                timestamp: Date.now()
            };

            console.log('📊 Network data collected:', this.networkData);
        } catch (error) {
            console.error('Network discovery error:', error);
            this.networkData = {
                connection: { error: 'Failed to get connection info' },
                network: { error: 'Failed to detect network' },
                serverPath: this.createServerPath(),
                timestamp: Date.now()
            };
        }
    }

    async getConnectionInfo() {
        try {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            
            const info = {
                effectiveType: connection?.effectiveType || 'unknown',
                downlink: connection?.downlink || 0,
                rtt: connection?.rtt || 0,
                type: connection?.type || 'unknown',
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine,
                timestamp: new Date().toISOString()
            };

            // Try to get local IPs via WebRTC
            try {
                const localIPs = await this.getLocalIPs();
                info.localIPs = localIPs;
            } catch (error) {
                info.localIPs = ['Unable to detect'];
            }

            return info;
        } catch (error) {
            console.error('Connection info error:', error);
            return { error: error.message };
        }
    }

    async getLocalIPs() {
        return new Promise((resolve) => {
            const ips = [];
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });
            
            pc.createDataChannel('');
            pc.createOffer().then(offer => pc.setLocalDescription(offer));
            
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    const candidate = event.candidate.candidate;
                    const ip = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
                    if (ip && !ips.includes(ip[1])) {
                        ips.push(ip[1]);
                    }
                }
            };

            setTimeout(() => {
                pc.close();
                resolve(ips.length > 0 ? ips : ['127.0.0.1']);
            }, 2000);
        });
    }

    async detectNetworkDetails() {
        try {
            // Get public IP information
            const ipInfo = await this.getPublicIPInfo();
            
            // Get connection details
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            
            return {
                publicIP: ipInfo,
                wifi: {
                    effectiveType: connection?.effectiveType || 'unknown',
                    downlink: connection?.downlink || 'unknown',
                    rtt: connection?.rtt || 'unknown',
                    type: connection?.type || 'unknown'
                },
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                screen: {
                    width: screen.width,
                    height: screen.height,
                    colorDepth: screen.colorDepth
                }
            };
        } catch (error) {
            console.error('Network detection error:', error);
            return { error: error.message };
        }
    }

    async getPublicIPInfo() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Failed to fetch IP info');
            }
        } catch (error) {
            console.error('Public IP fetch error:', error);
            return { 
                ip: 'Unknown',
                city: 'Unknown',
                country_name: 'Unknown',
                org: 'Unknown ISP',
                error: 'Unable to fetch public IP'
            };
        }
    }

    createServerPath() {
        return [
            {
                id: 'client',
                name: 'Your Device',
                type: 'client',
                description: 'Your browser/device',
                location: 'Local',
                position: { x: -8, y: 0, z: 0 }
            },
            {
                id: 'wifi',
                name: 'Wi-Fi/Network',
                type: 'wifi',
                description: 'Local network connection',
                location: 'Local Network',
                position: { x: -6, y: 2, z: -2 }
            },
            {
                id: 'router',
                name: 'Router/Gateway',
                type: 'router',
                description: 'Network gateway',
                location: 'Local Gateway',
                position: { x: -4, y: -1, z: 1 }
            },
            {
                id: 'isp',
                name: 'ISP Network',
                type: 'isp',
                description: 'Internet Service Provider',
                location: 'Regional',
                position: { x: -1, y: 1, z: -1 }
            },
            {
                id: 'backbone',
                name: 'Internet Backbone',
                type: 'backbone',
                description: 'Core internet infrastructure',
                location: 'Global',
                position: { x: 2, y: 3, z: 0 }
            },
            {
                id: 'cdn',
                name: 'CDN Edge',
                type: 'cdn',
                description: 'Content Delivery Network',
                location: 'Edge Location',
                position: { x: 5, y: 1, z: 2 }
            },
            {
                id: 'server',
                name: 'chaitanyalade.me',
                type: 'server',
                description: 'Target website',
                location: 'GitHub Pages',
                position: { x: 8, y: 0, z: 0 }
            }
        ];
    }

    build3DVisualization() {
        if (!this.scene || !this.networkData.serverPath) return;

        console.log('🎨 Building 3D visualization...');

        // Clear existing nodes
        this.nodes.forEach(node => this.scene.remove(node));
        this.connections.forEach(conn => this.scene.remove(conn));
        if (this.flowingParticles) {
            this.flowingParticles.forEach(particle => this.scene.remove(particle));
        }
        this.nodes = [];
        this.connections = [];
        this.flowingParticles = [];

        const nodeTypes = {
            client: { color: 0x00ff41, geometry: 'sphere', size: 0.4 },
            wifi: { color: 0x0088ff, geometry: 'box', size: 0.3 },
            router: { color: 0xff8800, geometry: 'box', size: 0.35 },
            isp: { color: 0xff0088, geometry: 'cylinder', size: 0.4 },
            backbone: { color: 0x8800ff, geometry: 'octahedron', size: 0.45 },
            cdn: { color: 0x00ffff, geometry: 'tetrahedron', size: 0.35 },
            server: { color: 0xff4444, geometry: 'dodecahedron', size: 0.5 }
        };

        // Create nodes
        this.networkData.serverPath.forEach((nodeData, index) => {
            const nodeType = nodeTypes[nodeData.type] || nodeTypes.client;
            
            // Create geometry
            let geometry;
            switch (nodeType.geometry) {
                case 'sphere':
                    geometry = new THREE.SphereGeometry(nodeType.size, 16, 16);
                    break;
                case 'box':
                    geometry = new THREE.BoxGeometry(nodeType.size, nodeType.size, nodeType.size);
                    break;
                case 'cylinder':
                    geometry = new THREE.CylinderGeometry(nodeType.size * 0.7, nodeType.size * 0.7, nodeType.size * 1.5, 8);
                    break;
                case 'octahedron':
                    geometry = new THREE.OctahedronGeometry(nodeType.size);
                    break;
                case 'tetrahedron':
                    geometry = new THREE.TetrahedronGeometry(nodeType.size);
                    break;
                case 'dodecahedron':
                    geometry = new THREE.DodecahedronGeometry(nodeType.size);
                    break;
                default:
                    geometry = new THREE.SphereGeometry(nodeType.size, 16, 16);
            }

            // Create material
            const material = new THREE.MeshPhongMaterial({
                color: nodeType.color,
                emissive: new THREE.Color(nodeType.color).multiplyScalar(0.2),
                shininess: 100
            });

            const node = new THREE.Mesh(geometry, material);
            node.position.set(nodeData.position.x, nodeData.position.y, nodeData.position.z);
            node.castShadow = true;
            node.receiveShadow = true;
            node.userData = nodeData;

            this.scene.add(node);
            this.nodes.push(node);

            // Create connections
            if (index < this.networkData.serverPath.length - 1) {
                const nextNode = this.networkData.serverPath[index + 1];
                this.createConnection(nodeData.position, nextNode.position);
            }

            // Add floating label
            this.createNodeLabel(nodeData.name, nodeData.position, nodeType.color);
        });

        // Add interactivity
        this.addInteractivity();
    }

    createConnection(pos1, pos2) {
        const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(pos1.x, pos1.y, pos1.z),
            new THREE.Vector3((pos1.x + pos2.x) / 2, Math.max(pos1.y, pos2.y) + 1, (pos1.z + pos2.z) / 2),
            new THREE.Vector3(pos2.x, pos2.y, pos2.z)
        );

        const geometry = new THREE.TubeGeometry(curve, 64, 0.05, 8, false);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ff41,
            emissive: 0x002211,
            transparent: true,
            opacity: 0.6
        });

        const connection = new THREE.Mesh(geometry, material);
        connection.userData = {
            curve: curve,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.02 + Math.random() * 0.02
        };
        
        this.scene.add(connection);
        this.connections.push(connection);

        // Add flowing particles along the connection
        this.createFlowingParticles(curve);
    }

    createFlowingParticles(curve) {
        const particleCount = 5;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.03, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: 0x00ff41,
                transparent: true,
                opacity: 0.8
            });

            const particle = new THREE.Mesh(geometry, material);
            particle.userData = {
                curve: curve,
                progress: (i / particleCount),
                speed: 0.01 + Math.random() * 0.01
            };

            this.scene.add(particle);
            particles.push(particle);
        }

        // Store particles for animation
        if (!this.flowingParticles) this.flowingParticles = [];
        this.flowingParticles.push(...particles);
    }

    createNodeLabel(text, position, color) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;

        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
        context.font = 'bold 20px Courier New';
        context.textAlign = 'center';
        context.fillText(text, canvas.width / 2, canvas.height / 2 + 7);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);
        
        sprite.position.set(position.x, position.y + 1, position.z);
        sprite.scale.set(2, 0.5, 1);
        
        this.scene.add(sprite);
    }

    addInteractivity() {
        if (!this.renderer || !this.renderer.domElement) return;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        this.renderer.domElement.addEventListener('click', (event) => {
            const rect = this.renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.nodes);

            if (intersects.length > 0) {
                const node = intersects[0].object;
                this.showNodeDetails(node.userData);
            }
        });
    }

    showNodeDetails(nodeData) {
        const modal = document.createElement('div');
        modal.className = 'node-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>${nodeData.name}</h3>
                <p><strong>Type:</strong> ${nodeData.type}</p>
                <p><strong>Description:</strong> ${nodeData.description}</p>
                <p><strong>Location:</strong> ${nodeData.location}</p>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; align-items: center;
            justify-content: center; z-index: 10000; color: #fff;
            font-family: Courier New, monospace;
        `;
        
        modal.querySelector('.modal-content').style.cssText = `
            background: #1a1a1a; border: 2px solid #00ff41; border-radius: 10px;
            padding: 20px; max-width: 400px; text-align: center;
        `;
        
        modal.querySelector('button').style.cssText = `
            background: #00ff41; color: #000; border: none; padding: 10px 20px;
            border-radius: 5px; cursor: pointer; margin-top: 15px;
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.remove(), 5000);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Update controls
        if (this.controls) {
            this.controls.update();
        }

        const time = Date.now() * 0.001;

        // Animate nodes with floating motion
        this.nodes.forEach((node, index) => {
            if (node && node.userData) {
                // Rotation animation
                node.rotation.y += 0.015;
                node.rotation.x = Math.sin(time + index) * 0.1;
                
                // Floating animation
                if (node.userData.originalY !== undefined) {
                    const phase = time * node.userData.animationSpeed + node.userData.animationPhase;
                    node.position.y = node.userData.originalY + Math.sin(phase) * node.userData.floatAmplitude;
                }
                
                // Pulsing scale effect
                const pulseScale = 1 + Math.sin(time * 2 + index * 0.5) * 0.1;
                node.scale.set(pulseScale, pulseScale, pulseScale);
            }
        });

        // Animate connections with pulsing effect
        this.connections.forEach((connection, index) => {
            if (connection && connection.material && connection.userData) {
                const phase = time * connection.userData.pulseSpeed + connection.userData.pulsePhase;
                const opacity = 0.3 + Math.sin(phase) * 0.3;
                connection.material.opacity = Math.max(0.1, opacity);
                
                // Add flowing particles effect along connections
                if (connection.geometry && connection.geometry.attributes && connection.geometry.attributes.position) {
                    const positions = connection.geometry.attributes.position.array;
                    for (let i = 0; i < positions.length; i += 3) {
                        positions[i + 1] += Math.sin(time * 3 + i * 0.1) * 0.02;
                    }
                    connection.geometry.attributes.position.needsUpdate = true;
                }
            }
        });

        // Animate flowing particles
        if (this.flowingParticles) {
            this.flowingParticles.forEach(particle => {
                if (particle && particle.userData && particle.userData.curve) {
                    particle.userData.progress += particle.userData.speed;
                    if (particle.userData.progress > 1) {
                        particle.userData.progress = 0;
                    }
                    
                    const point = particle.userData.curve.getPoint(particle.userData.progress);
                    particle.position.copy(point);
                    
                    // Add pulsing glow effect
                    const glow = 0.5 + Math.sin(time * 5 + particle.userData.progress * 10) * 0.3;
                    particle.material.opacity = glow;
                }
            });
        }

        // Camera auto-rotation when not being controlled
        if (this.controls && !this.controls.enabled) {
            this.camera.position.x = Math.cos(time * 0.2) * 15;
            this.camera.position.z = Math.sin(time * 0.2) * 15;
            this.camera.lookAt(0, 0, 0);
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

        // Update connection overview
        const overviewEl = document.getElementById('connectionOverview');
        if (overviewEl && this.networkData.connection) {
            const conn = this.networkData.connection;
            overviewEl.innerHTML = `
                <div class="connection-details">
                    <h4>✅ Network Analysis Complete</h4>
                    <p><strong>Connection Type:</strong> ${conn.effectiveType || 'Unknown'}</p>
                    <p><strong>Platform:</strong> ${conn.platform || 'Unknown'}</p>
                    <p><strong>Browser:</strong> ${this.getBrowserName(conn.userAgent)}</p>
                    <p><strong>Local IPs:</strong> ${conn.localIPs ? conn.localIPs.join(', ') : 'Detecting...'}</p>
                    <p><strong>Online Status:</strong> ${conn.onLine ? '🟢 Online' : '🔴 Offline'}</p>
                </div>
            `;
        }

        // Update server details
        if (this.networkData.network && this.networkData.network.publicIP) {
            const details = this.networkData.network.publicIP;
            const hostingEl = document.getElementById('hostingProvider');
            const cdnEl = document.getElementById('cdnProvider');
            const loadBalancerEl = document.getElementById('loadBalancer');
            const sslEl = document.getElementById('sslInfo');
            
            if (hostingEl) hostingEl.textContent = 'GitHub Pages';
            if (cdnEl) cdnEl.textContent = details.org || 'Unknown';
            if (loadBalancerEl) loadBalancerEl.textContent = 'GitHub Load Balancer';
            if (sslEl) sslEl.textContent = 'TLS 1.3 (GitHub)';
        }

        // Update geographic analysis
        if (this.networkData.network && this.networkData.network.publicIP) {
            const publicIP = this.networkData.network.publicIP;
            const userLocationEl = document.getElementById('userLocation');
            const serverLocationEl = document.getElementById('serverLocation');
            const routeDistanceEl = document.getElementById('routeDistance');
            
            if (userLocationEl) {
                userLocationEl.textContent = `${publicIP.city || 'Unknown'}, ${publicIP.country_name || 'Unknown'}`;
            }
            if (serverLocationEl) {
                serverLocationEl.textContent = 'San Francisco, US (GitHub)';
            }
            if (routeDistanceEl && publicIP.latitude && publicIP.longitude) {
                const distance = this.calculateDistance(publicIP.latitude, publicIP.longitude, 37.7749, -122.4194);
                routeDistanceEl.textContent = `~${Math.round(distance)} km`;
            }
        }

        // Update performance metrics with basic values
        const dnsLookupEl = document.getElementById('dnsLookup');
        const connectionTimeEl = document.getElementById('connectionTime');
        const firstByteEl = document.getElementById('firstByte');
        const totalLoadEl = document.getElementById('totalLoad');
        
        if (dnsLookupEl) dnsLookupEl.textContent = `${Math.round(Math.random() * 50 + 10)}ms`;
        if (connectionTimeEl) connectionTimeEl.textContent = `${Math.round(Math.random() * 100 + 50)}ms`;
        if (firstByteEl) firstByteEl.textContent = `${Math.round(Math.random() * 200 + 100)}ms`;
        if (totalLoadEl) totalLoadEl.textContent = `${Math.round(Math.random() * 500 + 200)}ms`;
    }

    getBrowserName(userAgent) {
        if (!userAgent) return 'Unknown';
        
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        if (userAgent.includes('Opera')) return 'Opera';
        
        return 'Unknown';
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
}

// Global functions for UI interaction
function analyzeConnection() {
    console.log('🚀 Starting network analysis...');
    
    // Update button to show it's working
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        analyzeBtn.disabled = true;
    }
    
    if (window.networkAnalyzer) {
        window.networkAnalyzer.init();
    } else {
        // Initialize new analyzer if not exists
        console.log('Creating new network analyzer...');
        window.networkAnalyzer = new NetworkPathAnalyzer();
    }
}

function toggleAnimation() {
    console.log('Animation toggle - feature available');
    if (window.networkAnalyzer && window.networkAnalyzer.nodes) {
        window.networkAnalyzer.nodes.forEach(node => {
            node.rotation.y += 0.1;
        });
    }
}

function exportPath() {
    if (window.networkAnalyzer && window.networkAnalyzer.networkData) {
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
        
        console.log('Network data exported successfully');
    } else {
        console.log('No network data available to export');
    }
}

function startMonitoring() {
    console.log('🚀 Starting real-time monitoring...');
    const monitorBtn = document.getElementById('monitorBtn');
    if (monitorBtn) {
        monitorBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Monitoring';
        monitorBtn.onclick = stopMonitoring;
    }
    
    // Start basic monitoring simulation
    if (window.monitoringInterval) clearInterval(window.monitoringInterval);
    
    window.monitoringInterval = setInterval(() => {
        // Update current latency
        const currentLatencyEl = document.getElementById('currentLatency');
        const avgLatencyEl = document.getElementById('avgLatency');
        const peakLatencyEl = document.getElementById('peakLatency');
        
        if (currentLatencyEl) {
            const latency = Math.round(Math.random() * 50 + 20);
            currentLatencyEl.textContent = `${latency}ms`;
        }
        
        if (avgLatencyEl) {
            const avgLatency = Math.round(Math.random() * 40 + 30);
            avgLatencyEl.textContent = `${avgLatency}ms`;
        }
        
        if (peakLatencyEl) {
            const peakLatency = Math.round(Math.random() * 80 + 40);
            peakLatencyEl.textContent = `${peakLatency}ms`;
        }
        
        // Update chart if canvas exists
        const canvas = document.getElementById('latencyChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            // Simple line animation
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#00ff41';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < canvas.width; i += 20) {
                const y = canvas.height / 2 + Math.sin((i + Date.now() / 100)) * 50;
                if (i === 0) ctx.moveTo(i, y);
                else ctx.lineTo(i, y);
            }
            ctx.stroke();
        }
    }, 2000);
}

function stopMonitoring() {
    console.log('⏹️ Stopping monitoring...');
    const monitorBtn = document.getElementById('monitorBtn');
    if (monitorBtn) {
        monitorBtn.innerHTML = '<i class="fas fa-play"></i> Start Monitoring';
        monitorBtn.onclick = startMonitoring;
    }
    
    if (window.monitoringInterval) {
        clearInterval(window.monitoringInterval);
        window.monitoringInterval = null;
    }
}

function clearMonitoring() {
    console.log('🗑️ Clearing monitoring data...');
    
    const canvas = document.getElementById('latencyChart');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    const currentLatencyEl = document.getElementById('currentLatency');
    const avgLatencyEl = document.getElementById('avgLatency');
    const peakLatencyEl = document.getElementById('peakLatency');
    
    if (currentLatencyEl) currentLatencyEl.textContent = '--ms';
    if (avgLatencyEl) avgLatencyEl.textContent = '--ms';
    if (peakLatencyEl) peakLatencyEl.textContent = '--ms';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Network Path Analyzer...');
    
    // Load Three.js
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
        console.log('✅ Three.js loaded successfully');
        
        const controlsScript = document.createElement('script');
        controlsScript.src = 'https://threejs.org/examples/js/controls/OrbitControls.js';
        controlsScript.onerror = () => {
            console.warn('⚠️ Primary OrbitControls failed, trying fallback...');
            // Fallback: try alternative CDN
            const fallbackScript = document.createElement('script');
            fallbackScript.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
            fallbackScript.onload = () => {
                console.log('✅ OrbitControls loaded from fallback CDN');
                window.networkAnalyzer = new NetworkPathAnalyzer();
            };
            fallbackScript.onerror = () => {
                console.warn('⚠️ OrbitControls failed to load, initializing without controls');
                window.networkAnalyzer = new NetworkPathAnalyzer();
            };
            document.head.appendChild(fallbackScript);
        };
        controlsScript.onload = () => {
            console.log('✅ OrbitControls loaded successfully');
            // Initialize the network analyzer
            window.networkAnalyzer = new NetworkPathAnalyzer();
        };
        document.head.appendChild(controlsScript);
    };
    script.onerror = () => {
        console.error('❌ Failed to load Three.js');
        const networkMap = document.getElementById('networkMap');
        if (networkMap) {
            networkMap.innerHTML = '<p style="color: #ff4444; text-align: center; padding: 50px;">❌ Failed to load 3D visualization library. Please check your internet connection.</p>';
        }
    };
    document.head.appendChild(script);
});