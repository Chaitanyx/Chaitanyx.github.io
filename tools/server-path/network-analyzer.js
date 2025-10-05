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
        } catch (error) {
            console.error('Error initializing Three.js:', error);
            document.getElementById('networkMap').innerHTML = '<p style="color: #ff4444; text-align: center; padding: 50px;">Error initializing 3D visualization.</p>';
        }
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

    async getConnectionInfo() {
        const startTime = performance.now();
        
        try {
            // Get connection details via RTCPeerConnection
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            const info = {
                effectiveType: navigator.connection?.effectiveType || 'unknown',
                downlink: navigator.connection?.downlink || 0,
                rtt: navigator.connection?.rtt || 0,
                type: navigator.connection?.type || 'unknown',
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine,
                connectionSpeed: await this.measureConnectionSpeed(),
                latency: performance.now() - startTime,
                timestamp: new Date().toISOString()
            };

            // Get local IP via WebRTC
            const localIPs = await this.getLocalIPs(pc);
            info.localIPs = localIPs;

            pc.close();
            return info;
        } catch (error) {
            console.error('Connection info error:', error);
            return { error: error.message };
        }
    }

    async detectNetworkDetails() {
        try {
            // Get public IP and ISP information
            const ipInfo = await this.getPublicIPInfo();
            
            // Detect Wi-Fi details (limited by browser security)
            const wifiInfo = await this.getWiFiInfo();
            
            // Get DNS information
            const dnsInfo = await this.getDNSInfo();

            return {
                publicIP: ipInfo,
                wifi: wifiInfo,
                dns: dnsInfo,
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

    async discoverServerPath() {
        const servers = [];
        
        try {
            // GitHub Pages infrastructure
            servers.push({
                name: 'Client Device',
                type: 'client',
                description: 'Your device/browser',
                location: 'Local',
                ip: 'Detecting...',
                role: 'Origin'
            });

            // ISP Gateway
            servers.push({
                name: 'ISP Gateway',
                type: 'gateway',
                description: 'Internet Service Provider gateway',
                location: 'Local Network',
                ip: 'Router IP',
                role: 'Gateway'
            });

            // Regional ISP
            servers.push({
                name: 'Regional ISP',
                type: 'isp',
                description: 'Regional internet backbone',
                location: 'Regional',
                ip: 'ISP Backbone',
                role: 'Routing'
            });

            // Internet Backbone
            servers.push({
                name: 'Internet Backbone',
                type: 'backbone',
                description: 'Major internet infrastructure',
                location: 'International',
                ip: 'Backbone Network',
                role: 'Core Routing'
            });

            // CDN Edge Server
            servers.push({
                name: 'CDN Edge Server',
                type: 'cdn',
                description: 'Content Delivery Network',
                location: 'Edge Location',
                ip: 'CDN Server',
                role: 'Content Cache'
            });

            // GitHub Pages
            servers.push({
                name: 'GitHub Pages',
                type: 'hosting',
                description: 'GitHub Pages hosting infrastructure',
                location: 'San Francisco, US',
                ip: '185.199.108.153',
                role: 'Web Server'
            });

            // Target Server
            servers.push({
                name: 'chaitanyalade.me',
                type: 'target',
                description: 'Target website server',
                location: 'GitHub CDN',
                ip: 'Multiple IPs',
                role: 'Destination'
            });

            return servers;
        } catch (error) {
            console.error('Server path discovery error:', error);
            return [];
        }
    }

    async getLocalIPs(pc) {
        return new Promise((resolve) => {
            const ips = [];
            
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

            setTimeout(() => resolve(ips), 2000);
        });
    }

    async getPublicIPInfo() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            return await response.json();
        } catch (error) {
            console.error('Public IP fetch error:', error);
            return { error: 'Unable to fetch public IP' };
        }
    }

    async getWiFiInfo() {
        // Limited by browser security, but we can detect some connection properties
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            return {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData,
                type: connection.type
            };
        }
        
        return { error: 'Network API not supported' };
    }

    async getDNSInfo() {
        try {
            // DNS over HTTPS queries
            const dnsQueries = [
                { type: 'A', domain: 'chaitanyalade.me' },
                { type: 'CNAME', domain: 'chaitanyalade.me' },
                { type: 'NS', domain: 'chaitanyalade.me' }
            ];

            const results = [];
            for (const query of dnsQueries) {
                try {
                    const response = await fetch(`https://dns.google/resolve?name=${query.domain}&type=${query.type}`);
                    const data = await response.json();
                    results.push({ ...query, result: data });
                } catch (error) {
                    results.push({ ...query, error: error.message });
                }
            }

            return results;
        } catch (error) {
            console.error('DNS info error:', error);
            return { error: error.message };
        }
    }

    async measureConnectionSpeed() {
        const startTime = performance.now();
        try {
            await fetch('https://www.google.com/favicon.ico?' + Math.random());
            return performance.now() - startTime;
        } catch (error) {
            return -1;
        }
    }

    build3DVisualization() {
        console.log('🎨 Building 3D visualization...');
        
        // Clear existing nodes
        this.nodes.forEach(node => this.scene.remove(node));
        this.connections.forEach(conn => this.scene.remove(conn));
        this.nodes = [];
        this.connections = [];

        const servers = this.networkData.serverPath || [];
        const radius = 8;
        const nodeSpacing = 3;

        servers.forEach((server, index) => {
            // Calculate position in 3D space
            const angle = (index / servers.length) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = (index - servers.length / 2) * 0.5;

            // Create node geometry based on server type
            let geometry, material;
            
            switch (server.type) {
                case 'client':
                    geometry = new THREE.SphereGeometry(0.3, 16, 16);
                    material = new THREE.MeshPhongMaterial({ color: 0x00ff41, emissive: 0x004411 });
                    break;
                case 'gateway':
                    geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
                    material = new THREE.MeshPhongMaterial({ color: 0x0088ff, emissive: 0x002244 });
                    break;
                case 'isp':
                    geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 8);
                    material = new THREE.MeshPhongMaterial({ color: 0xff8800, emissive: 0x442200 });
                    break;
                case 'backbone':
                    geometry = new THREE.OctahedronGeometry(0.4);
                    material = new THREE.MeshPhongMaterial({ color: 0xff0088, emissive: 0x440022 });
                    break;
                case 'cdn':
                    geometry = new THREE.TetrahedronGeometry(0.4);
                    material = new THREE.MeshPhongMaterial({ color: 0x8800ff, emissive: 0x220044 });
                    break;
                case 'hosting':
                    geometry = new THREE.DodecahedronGeometry(0.3);
                    material = new THREE.MeshPhongMaterial({ color: 0x00ffff, emissive: 0x004444 });
                    break;
                case 'target':
                    geometry = new THREE.SphereGeometry(0.4, 16, 16);
                    material = new THREE.MeshPhongMaterial({ color: 0xff4444, emissive: 0x441111 });
                    break;
                default:
                    geometry = new THREE.SphereGeometry(0.2, 16, 16);
                    material = new THREE.MeshPhongMaterial({ color: 0x888888, emissive: 0x222222 });
            }

            const node = new THREE.Mesh(geometry, material);
            node.position.set(x, y, z);
            node.castShadow = true;
            node.receiveShadow = true;
            
            // Add server data to node
            node.userData = server;
            
            // Add glow effect
            const glowGeometry = new THREE.SphereGeometry(0.6, 16, 16);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: material.color,
                transparent: true,
                opacity: 0.2
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.copy(node.position);
            this.scene.add(glow);

            this.scene.add(node);
            this.nodes.push(node);

            // Create connections to next node
            if (index < servers.length - 1) {
                const nextAngle = ((index + 1) / servers.length) * Math.PI * 2;
                const nextX = Math.cos(nextAngle) * radius;
                const nextZ = Math.sin(nextAngle) * radius;
                const nextY = ((index + 1) - servers.length / 2) * 0.5;

                this.createConnection(x, y, z, nextX, nextY, nextZ);
            }

            // Add floating label
            this.createNodeLabel(server.name, x, y + 0.8, z);
        });

        // Add interactive click handlers
        this.addInteractivity();
        
        // Update UI with network data
        this.updateUI();
    }

    createConnection(x1, y1, z1, x2, y2, z2) {
        const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(x1, y1, z1),
            new THREE.Vector3((x1 + x2) / 2, Math.max(y1, y2) + 1, (z1 + z2) / 2),
            new THREE.Vector3(x2, y2, z2)
        );

        const geometry = new THREE.TubeGeometry(curve, 64, 0.02, 8, false);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ff41,
            emissive: 0x002211,
            transparent: true,
            opacity: 0.8
        });

        const connection = new THREE.Mesh(geometry, material);
        this.scene.add(connection);
        this.connections.push(connection);

        // Add animated particles along the connection
        this.createDataParticles(curve);
    }

    createDataParticles(curve) {
        const particleCount = 5;
        const geometry = new THREE.SphereGeometry(0.02, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff41,
            transparent: true,
            opacity: 0.8
        });

        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(geometry, material);
            particle.userData = {
                curve: curve,
                progress: i / particleCount,
                speed: 0.002 + Math.random() * 0.001
            };
            this.scene.add(particle);
            this.connections.push(particle);
        }
    }

    createNodeLabel(text, x, y, z) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;

        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle = '#00ff41';
        context.font = 'bold 20px Courier New';
        context.textAlign = 'center';
        context.fillText(text, canvas.width / 2, canvas.height / 2 + 7);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);
        
        sprite.position.set(x, y, z);
        sprite.scale.set(2, 0.5, 1);
        
        this.scene.add(sprite);
    }

    addInteractivity() {
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

    showNodeDetails(serverData) {
        const modal = document.createElement('div');
        modal.className = 'node-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>${serverData.name}</h3>
                <p><strong>Type:</strong> ${serverData.type}</p>
                <p><strong>Description:</strong> ${serverData.description}</p>
                <p><strong>Location:</strong> ${serverData.location}</p>
                <p><strong>IP:</strong> ${serverData.ip}</p>
                <p><strong>Role:</strong> ${serverData.role}</p>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        setTimeout(() => modal.remove(), 5000);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Update controls
        this.controls.update();

        // Animate particles
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

        // Rotate nodes slightly
        this.nodes.forEach((node, index) => {
            node.rotation.y += 0.01;
            node.rotation.x += 0.005;
        });

        this.renderer.render(this.scene, this.camera);
    }

    updateUI() {
        // Update connection overview
        const overview = document.getElementById('connectionOverview');
        if (overview && this.networkData.connection) {
            const conn = this.networkData.connection;
            overview.innerHTML = `
                <div class="connection-details">
                    <h4>Connection Analysis Complete</h4>
                    <p><strong>Connection Type:</strong> ${conn.effectiveType || 'Unknown'}</p>
                    <p><strong>Downlink Speed:</strong> ${conn.downlink || 'Unknown'} Mbps</p>
                    <p><strong>Round Trip Time:</strong> ${conn.rtt || 'Unknown'} ms</p>
                    <p><strong>Local IPs:</strong> ${conn.localIPs ? conn.localIPs.join(', ') : 'Detecting...'}</p>
                    <p><strong>Platform:</strong> ${conn.platform || 'Unknown'}</p>
                </div>
            `;
        }

        // Update DNS chain
        this.updateDNSChain();
        
        // Update server details
        this.updateServerDetails();
        
        // Update geographic analysis
        this.updateGeographicAnalysis();
        
        // Update performance metrics
        this.updatePerformanceMetrics();
    }

    updateDNSChain() {
        const dnsChain = document.getElementById('dnsChain');
        if (dnsChain && this.networkData.network && this.networkData.network.dns) {
            dnsChain.innerHTML = '';
            
            this.networkData.network.dns.forEach(record => {
                const dnsItem = document.createElement('div');
                dnsItem.className = 'dns-item';
                
                if (record.result && record.result.Answer) {
                    record.result.Answer.forEach(answer => {
                        dnsItem.innerHTML += `
                            <div class="dns-entry">
                                <span class="dns-type">${record.type}</span>
                                <span class="dns-value">${answer.data}</span>
                            </div>
                        `;
                    });
                } else {
                    dnsItem.innerHTML = `
                        <div class="dns-entry">
                            <span class="dns-type">${record.type}</span>
                            <span class="dns-value">${record.error || 'No data'}</span>
                        </div>
                    `;
                }
                
                dnsChain.appendChild(dnsItem);
            });
        }
    }

    updateServerDetails() {
        const details = this.networkData.network?.publicIP;
        if (details) {
            document.getElementById('hostingProvider').textContent = 'GitHub Pages';
            document.getElementById('cdnProvider').textContent = details.org || 'Unknown';
            document.getElementById('loadBalancer').textContent = 'GitHub Load Balancer';
            document.getElementById('sslInfo').textContent = 'TLS 1.3 (GitHub)';
        }
    }

    updateGeographicAnalysis() {
        const publicIP = this.networkData.network?.publicIP;
        if (publicIP) {
            document.getElementById('userLocation').textContent = `${publicIP.city}, ${publicIP.country_name}`;
            document.getElementById('serverLocation').textContent = 'San Francisco, US (GitHub)';
            
            // Calculate approximate distance (simplified)
            const distance = this.calculateDistance(publicIP.latitude, publicIP.longitude, 37.7749, -122.4194);
            document.getElementById('routeDistance').textContent = `~${Math.round(distance)} km`;
        }
    }

    updatePerformanceMetrics() {
        const conn = this.networkData.connection;
        if (conn) {
            document.getElementById('dnsLookup').textContent = `${Math.round(conn.latency || 0)}ms`;
            document.getElementById('connectionTime').textContent = `${conn.rtt || '--'}ms`;
            document.getElementById('firstByte').textContent = `${Math.round(conn.connectionSpeed || 0)}ms`;
            document.getElementById('totalLoad').textContent = `${Math.round((conn.latency || 0) + (conn.rtt || 0))}ms`;
        }
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

    startRealTimeMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        const canvas = document.getElementById('latencyChart');
        const ctx = canvas.getContext('2d');
        
        let dataPoints = [];
        let currentLatency = 0;
        let avgLatency = 0;
        let peakLatency = 0;

        const monitor = setInterval(async () => {
            if (!this.isMonitoring) {
                clearInterval(monitor);
                return;
            }

            // Measure current latency
            const startTime = performance.now();
            try {
                await fetch('https://www.google.com/favicon.ico?' + Math.random());
                currentLatency = Math.round(performance.now() - startTime);
            } catch (error) {
                currentLatency = -1;
            }

            if (currentLatency > 0) {
                dataPoints.push(currentLatency);
                if (dataPoints.length > 50) dataPoints.shift();

                avgLatency = Math.round(dataPoints.reduce((a, b) => a + b, 0) / dataPoints.length);
                peakLatency = Math.max(peakLatency, currentLatency);

                // Update UI
                document.getElementById('currentLatency').textContent = `${currentLatency}ms`;
                document.getElementById('avgLatency').textContent = `${avgLatency}ms`;
                document.getElementById('peakLatency').textContent = `${peakLatency}ms`;

                // Draw chart
                this.drawLatencyChart(ctx, canvas, dataPoints);
            }
        }, 2000);
    }

    drawLatencyChart(ctx, canvas, dataPoints) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (dataPoints.length < 2) return;

        const maxLatency = Math.max(...dataPoints);
        const padding = 20;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;

        // Draw grid
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const y = padding + (chartHeight / 10) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
        }

        // Draw latency line
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 2;
        ctx.beginPath();

        dataPoints.forEach((latency, index) => {
            const x = padding + (chartWidth / (dataPoints.length - 1)) * index;
            const y = canvas.height - padding - (latency / maxLatency) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw data points
        ctx.fillStyle = '#00ff41';
        dataPoints.forEach((latency, index) => {
            const x = padding + (chartWidth / (dataPoints.length - 1)) * index;
            const y = canvas.height - padding - (latency / maxLatency) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    stopMonitoring() {
        this.isMonitoring = false;
    }

    exportPath() {
        const data = {
            networkData: this.networkData,
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

// Global functions for UI interaction
function analyzeConnection() {
    if (window.networkAnalyzer) {
        window.networkAnalyzer.discoverNetwork().then(() => {
            window.networkAnalyzer.updateUI();
        });
    }
}

function toggleAnimation() {
    // Toggle 3D animation
    console.log('Toggling animation...');
}

function exportPath() {
    if (window.networkAnalyzer) {
        window.networkAnalyzer.exportPath();
    }
}

function startMonitoring() {
    if (window.networkAnalyzer) {
        window.networkAnalyzer.startRealTimeMonitoring();
        document.getElementById('monitorBtn').innerHTML = '<i class="fas fa-stop"></i> Stop Monitoring';
        document.getElementById('monitorBtn').onclick = stopMonitoring;
    }
}

function stopMonitoring() {
    if (window.networkAnalyzer) {
        window.networkAnalyzer.stopMonitoring();
        document.getElementById('monitorBtn').innerHTML = '<i class="fas fa-play"></i> Start Monitoring';
        document.getElementById('monitorBtn').onclick = startMonitoring;
    }
}

function clearMonitoring() {
    const canvas = document.getElementById('latencyChart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    document.getElementById('currentLatency').textContent = '--ms';
    document.getElementById('avgLatency').textContent = '--ms';
    document.getElementById('peakLatency').textContent = '--ms';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
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