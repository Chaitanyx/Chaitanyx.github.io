// 3D Visualization Engine - Advanced 3D Network Visualization
class Visualization3D {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.nodes = new Map();
        this.connections = new Map();
        this.particles = [];
        this.animationMixer = null;
        this.clock = new THREE.Clock();
        this.isAnimating = true;
        
        this.nodeTypes = {
            client: { color: 0x00ff41, shape: 'sphere', size: 0.4 },
            wifi: { color: 0x0088ff, shape: 'diamond', size: 0.3 },
            router: { color: 0xff8800, shape: 'box', size: 0.35 },
            isp: { color: 0xff0088, shape: 'cylinder', size: 0.4 },
            backbone: { color: 0x8800ff, shape: 'octahedron', size: 0.45 },
            cdn: { color: 0x00ffff, shape: 'tetrahedron', size: 0.35 },
            server: { color: 0xff4444, shape: 'dodecahedron', size: 0.5 }
        };

        this.init();
    }

    init() {
        this.setupScene();
        this.setupLighting();
        this.setupControls();
        this.setupEventHandlers();
        this.startRenderLoop();
    }

    setupScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            this.container.clientWidth / this.container.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 10, 15);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        // Clear container and add renderer
        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);

        // Add starfield background
        this.createStarfield();
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0x00ff41, 1);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        this.scene.add(directionalLight);

        // Additional accent lights
        const blueLight = new THREE.PointLight(0x4444ff, 0.5, 20);
        blueLight.position.set(-10, 5, -10);
        this.scene.add(blueLight);

        const redLight = new THREE.PointLight(0xff4444, 0.5, 20);
        redLight.position.set(10, 5, 10);
        this.scene.add(redLight);
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 50;
        this.controls.maxPolarAngle = Math.PI / 1.5;
    }

    setupEventHandlers() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Mouse interaction
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        this.renderer.domElement.addEventListener('click', (event) => {
            const rect = this.renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects([...this.nodes.values()]);

            if (intersects.length > 0) {
                this.onNodeClick(intersects[0].object);
            }
        });

        // Hover effects
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            const rect = this.renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects([...this.nodes.values()]);

            // Reset all nodes
            this.nodes.forEach(node => {
                node.scale.setScalar(1);
                if (node.userData.originalEmissive) {
                    node.material.emissive.copy(node.userData.originalEmissive);
                }
            });

            if (intersects.length > 0) {
                const node = intersects[0].object;
                node.scale.setScalar(1.2);
                if (node.material.emissive) {
                    node.material.emissive.multiplyScalar(2);
                }
                this.renderer.domElement.style.cursor = 'pointer';
            } else {
                this.renderer.domElement.style.cursor = 'default';
            }
        });
    }

    createStarfield() {
        const starsGeometry = new THREE.BufferGeometry();
        const starCount = 1000;
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 200;     // x
            positions[i + 1] = (Math.random() - 0.5) * 200; // y
            positions[i + 2] = (Math.random() - 0.5) * 200; // z
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.6
        });

        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }

    createNetworkVisualization(networkData) {
        console.log('🎨 Creating 3D network visualization...', networkData);

        // Clear existing visualization
        this.clearVisualization();

        // Create network topology
        const topology = this.generateNetworkTopology(networkData);
        
        // Create nodes
        topology.nodes.forEach((nodeData, index) => {
            const node = this.createNode(nodeData, index);
            this.nodes.set(nodeData.id, node);
            this.scene.add(node);
        });

        // Create connections
        topology.connections.forEach((connectionData) => {
            const connection = this.createConnection(connectionData);
            this.connections.set(connectionData.id, connection);
            this.scene.add(connection);
        });

        // Add data flow animation
        this.createDataFlowAnimation();

        // Position camera for best view
        this.optimizeCameraPosition();
    }

    generateNetworkTopology(networkData) {
        const nodes = [];
        const connections = [];

        // Client device
        nodes.push({
            id: 'client',
            name: 'Your Device',
            type: 'client',
            position: { x: -8, y: 0, z: 0 },
            data: networkData.connection || {},
            details: {
                ip: networkData.connection?.localIPs?.[0] || 'Local IP',
                platform: networkData.connection?.platform || 'Unknown',
                browser: this.getBrowserName(networkData.connection?.userAgent)
            }
        });

        // Wi-Fi/Network layer
        nodes.push({
            id: 'wifi',
            name: 'Wi-Fi/Network',
            type: 'wifi',
            position: { x: -6, y: 2, z: -2 },
            data: networkData.network?.wifi || {},
            details: {
                type: networkData.network?.wifi?.type || 'Unknown',
                effectiveType: networkData.network?.wifi?.effectiveType || 'Unknown',
                downlink: networkData.network?.wifi?.downlink || 'Unknown'
            }
        });

        // Router/Gateway
        nodes.push({
            id: 'router',
            name: 'Router/Gateway',
            type: 'router',
            position: { x: -4, y: -1, z: 1 },
            data: {},
            details: {
                type: 'Local Gateway',
                ip: 'Router IP',
                role: 'NAT/Firewall'
            }
        });

        // ISP
        nodes.push({
            id: 'isp',
            name: 'ISP Network',
            type: 'isp',
            position: { x: -1, y: 1, z: -1 },
            data: networkData.network?.publicIP || {},
            details: {
                provider: networkData.network?.publicIP?.org || 'Unknown ISP',
                location: `${networkData.network?.publicIP?.city || 'Unknown'}, ${networkData.network?.publicIP?.country_name || 'Unknown'}`,
                ip: networkData.network?.publicIP?.ip || 'Unknown'
            }
        });

        // Internet Backbone
        nodes.push({
            id: 'backbone',
            name: 'Internet Backbone',
            type: 'backbone',
            position: { x: 2, y: 3, z: 0 },
            data: {},
            details: {
                type: 'Core Internet Infrastructure',
                providers: 'Tier 1 ISPs',
                role: 'Global Routing'
            }
        });

        // CDN/Edge
        nodes.push({
            id: 'cdn',
            name: 'CDN Edge',
            type: 'cdn',
            position: { x: 5, y: 1, z: 2 },
            data: {},
            details: {
                provider: 'GitHub CDN',
                location: 'Edge Location',
                role: 'Content Caching'
            }
        });

        // Target Server
        nodes.push({
            id: 'server',
            name: 'chaitanyalade.me',
            type: 'server',
            position: { x: 8, y: 0, z: 0 },
            data: {},
            details: {
                host: 'GitHub Pages',
                location: 'San Francisco, US',
                ip: '185.199.108.153'
            }
        });

        // Create connections
        const connectionPath = [
            { from: 'client', to: 'wifi' },
            { from: 'wifi', to: 'router' },
            { from: 'router', to: 'isp' },
            { from: 'isp', to: 'backbone' },
            { from: 'backbone', to: 'cdn' },
            { from: 'cdn', to: 'server' }
        ];

        connectionPath.forEach((conn, index) => {
            connections.push({
                id: `connection-${index}`,
                from: conn.from,
                to: conn.to,
                type: 'primary',
                animated: true
            });
        });

        return { nodes, connections };
    }

    createNode(nodeData, index) {
        const nodeType = this.nodeTypes[nodeData.type] || this.nodeTypes.client;
        
        // Create geometry based on shape
        let geometry;
        switch (nodeType.shape) {
            case 'sphere':
                geometry = new THREE.SphereGeometry(nodeType.size, 32, 32);
                break;
            case 'box':
                geometry = new THREE.BoxGeometry(nodeType.size, nodeType.size, nodeType.size);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(nodeType.size * 0.7, nodeType.size * 0.7, nodeType.size * 1.5, 16);
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
            case 'diamond':
                geometry = new THREE.OctahedronGeometry(nodeType.size);
                break;
            default:
                geometry = new THREE.SphereGeometry(nodeType.size, 16, 16);
        }

        // Create material with glow effect
        const material = new THREE.MeshPhongMaterial({
            color: nodeType.color,
            emissive: new THREE.Color(nodeType.color).multiplyScalar(0.2),
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });

        const node = new THREE.Mesh(geometry, material);
        node.position.set(nodeData.position.x, nodeData.position.y, nodeData.position.z);
        node.castShadow = true;
        node.receiveShadow = true;

        // Store original emissive for hover effects
        node.userData.originalEmissive = material.emissive.clone();
        node.userData.nodeData = nodeData;

        // Create glow effect
        const glowGeometry = geometry.clone();
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: nodeType.color,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.scale.multiplyScalar(1.5);
        glow.position.copy(node.position);
        this.scene.add(glow);

        // Add floating label
        this.createFloatingLabel(nodeData.name, node.position, nodeType.color);

        // Add subtle rotation animation
        node.userData.rotationSpeed = {
            x: (Math.random() - 0.5) * 0.01,
            y: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.01
        };

        return node;
    }

    createConnection(connectionData) {
        const fromNode = this.nodes.get(connectionData.from);
        const toNode = this.nodes.get(connectionData.to);

        if (!fromNode || !toNode) return null;

        const fromPos = fromNode.position;
        const toPos = toNode.position;

        // Create curved connection
        const midPoint = new THREE.Vector3(
            (fromPos.x + toPos.x) / 2,
            Math.max(fromPos.y, toPos.y) + 2,
            (fromPos.z + toPos.z) / 2
        );

        const curve = new THREE.QuadraticBezierCurve3(fromPos, midPoint, toPos);
        
        // Create tube geometry for the connection
        const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.05, 8, false);
        const tubeMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff41,
            emissive: 0x002211,
            transparent: true,
            opacity: 0.7
        });

        const connection = new THREE.Mesh(tubeGeometry, tubeMaterial);
        connection.userData.connectionData = connectionData;
        connection.userData.curve = curve;

        // Add data particles if animated
        if (connectionData.animated) {
            this.createDataParticles(curve, connectionData.id);
        }

        return connection;
    }

    createDataParticles(curve, connectionId) {
        const particleCount = 8;
        const particleGeometry = new THREE.SphereGeometry(0.03, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff41,
            transparent: true,
            opacity: 0.8
        });

        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.userData = {
                curve: curve,
                progress: i / particleCount,
                speed: 0.01 + Math.random() * 0.005,
                connectionId: connectionId
            };
            
            this.particles.push(particle);
            this.scene.add(particle);
        }
    }

    createFloatingLabel(text, position, color) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;

        // Background
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Border
        context.strokeStyle = `#${color.toString(16).padStart(6, '0')}`;
        context.lineWidth = 4;
        context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

        // Text
        context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
        context.font = 'bold 32px Courier New';
        context.textAlign = 'center';
        context.fillText(text, canvas.width / 2, canvas.height / 2 + 12);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ 
            map: texture, 
            transparent: true,
            alphaTest: 0.1
        });
        const sprite = new THREE.Sprite(material);
        
        sprite.position.set(position.x, position.y + 1, position.z);
        sprite.scale.set(3, 0.75, 1);
        
        this.scene.add(sprite);
    }

    createDataFlowAnimation() {
        // Create flowing energy effects between nodes
        const flowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0x00ff41) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                varying vec2 vUv;
                
                void main() {
                    float wave = sin(vUv.x * 20.0 - time * 10.0) * 0.5 + 0.5;
                    float alpha = wave * (1.0 - vUv.x) * vUv.x;
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        // Apply to connections
        this.connections.forEach(connection => {
            if (connection.userData.connectionData.animated) {
                const flowGeometry = connection.geometry.clone();
                const flowMesh = new THREE.Mesh(flowGeometry, flowMaterial.clone());
                flowMesh.userData.isFlow = true;
                this.scene.add(flowMesh);
            }
        });
    }

    optimizeCameraPosition() {
        // Calculate bounding box of all nodes
        const box = new THREE.Box3();
        this.nodes.forEach(node => {
            box.expandByObject(node);
        });

        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // Position camera to view all nodes
        this.camera.position.set(
            center.x + maxDim * 1.5,
            center.y + maxDim * 1.2,
            center.z + maxDim * 1.5
        );

        this.controls.target.copy(center);
        this.controls.update();
    }

    onNodeClick(node) {
        if (!node.userData.nodeData) return;

        const nodeData = node.userData.nodeData;
        this.showNodeDetails(nodeData);

        // Highlight connected nodes
        this.highlightConnections(nodeData.id);
    }

    showNodeDetails(nodeData) {
        // Create detailed info modal
        const modal = document.createElement('div');
        modal.className = 'node-details-modal';
        modal.innerHTML = `
            <div class="modal-content-3d">
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">&times;</button>
                <h3><i class="fas fa-server"></i> ${nodeData.name}</h3>
                <div class="node-info">
                    <div class="info-section">
                        <h4>Node Details</h4>
                        <p><strong>Type:</strong> ${nodeData.type}</p>
                        <p><strong>Position:</strong> (${nodeData.position.x}, ${nodeData.position.y}, ${nodeData.position.z})</p>
                    </div>
                    <div class="info-section">
                        <h4>Technical Information</h4>
                        ${Object.entries(nodeData.details || {}).map(([key, value]) => 
                            `<p><strong>${key}:</strong> ${value}</p>`
                        ).join('')}
                    </div>
                    <div class="info-section">
                        <h4>Network Data</h4>
                        ${Object.entries(nodeData.data || {}).slice(0, 5).map(([key, value]) => 
                            `<p><strong>${key}:</strong> ${typeof value === 'object' ? JSON.stringify(value).slice(0, 50) + '...' : value}</p>`
                        ).join('')}
                    </div>
                </div>
                <div class="modal-actions">
                    <button onclick="this.parentElement.parentElement.remove()">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (modal.parentNode) modal.remove();
        }, 10000);
    }

    highlightConnections(nodeId) {
        // Reset all connections
        this.connections.forEach(connection => {
            connection.material.emissive.setScalar(0.1);
            connection.material.opacity = 0.7;
        });

        // Highlight connections to/from selected node
        this.connections.forEach(connection => {
            const connData = connection.userData.connectionData;
            if (connData.from === nodeId || connData.to === nodeId) {
                connection.material.emissive.setScalar(0.5);
                connection.material.opacity = 1.0;
            }
        });
    }

    startRenderLoop() {
        const animate = () => {
            requestAnimationFrame(animate);

            const deltaTime = this.clock.getDelta();
            const elapsedTime = this.clock.getElapsedTime();

            if (this.isAnimating) {
                // Update controls
                this.controls.update();

                // Animate nodes
                this.nodes.forEach(node => {
                    if (node.userData.rotationSpeed) {
                        node.rotation.x += node.userData.rotationSpeed.x;
                        node.rotation.y += node.userData.rotationSpeed.y;
                        node.rotation.z += node.userData.rotationSpeed.z;
                    }
                });

                // Animate particles
                this.particles.forEach(particle => {
                    if (particle.userData.curve) {
                        particle.userData.progress += particle.userData.speed;
                        if (particle.userData.progress > 1) {
                            particle.userData.progress = 0;
                        }
                        
                        const point = particle.userData.curve.getPoint(particle.userData.progress);
                        particle.position.copy(point);
                    }
                });

                // Update shader uniforms
                this.scene.traverse((object) => {
                    if (object.material && object.material.uniforms && object.material.uniforms.time) {
                        object.material.uniforms.time.value = elapsedTime;
                    }
                });
            }

            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    toggleAnimation() {
        this.isAnimating = !this.isAnimating;
        return this.isAnimating;
    }

    clearVisualization() {
        // Remove all nodes
        this.nodes.forEach(node => this.scene.remove(node));
        this.nodes.clear();

        // Remove all connections
        this.connections.forEach(connection => this.scene.remove(connection));
        this.connections.clear();

        // Remove all particles
        this.particles.forEach(particle => this.scene.remove(particle));
        this.particles = [];

        // Remove other objects (sprites, flows, etc.)
        const objectsToRemove = [];
        this.scene.traverse((object) => {
            if (object.userData.isFlow || object.type === 'Sprite') {
                objectsToRemove.push(object);
            }
        });
        objectsToRemove.forEach(obj => this.scene.remove(obj));
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

    exportVisualization() {
        // Create a screenshot
        const dataURL = this.renderer.domElement.toDataURL('image/png');
        
        // Download screenshot
        const link = document.createElement('a');
        link.download = `network-visualization-${Date.now()}.png`;
        link.href = dataURL;
        link.click();
    }

    getPerformanceStats() {
        const info = this.renderer.info;
        return {
            triangles: info.render.triangles,
            calls: info.render.calls,
            points: info.render.points,
            lines: info.render.lines,
            frame: info.render.frame,
            memory: {
                geometries: info.memory.geometries,
                textures: info.memory.textures
            }
        };
    }
}

// CSS styles for modals
const style = document.createElement('style');
style.textContent = `
    .node-details-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    }
    
    .modal-content-3d {
        background: #1a1a1a;
        border: 2px solid #00ff41;
        border-radius: 10px;
        padding: 30px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        color: #ffffff;
        font-family: 'Courier New', monospace;
        position: relative;
        box-shadow: 0 0 30px rgba(0, 255, 65, 0.5);
    }
    
    .close-btn {
        position: absolute;
        top: 10px;
        right: 15px;
        background: none;
        border: none;
        color: #00ff41;
        font-size: 24px;
        cursor: pointer;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .close-btn:hover {
        background: rgba(0, 255, 65, 0.2);
        border-radius: 50%;
    }
    
    .node-info {
        margin-top: 20px;
    }
    
    .info-section {
        margin-bottom: 20px;
        padding: 15px;
        background: rgba(0, 255, 65, 0.1);
        border-radius: 5px;
        border-left: 3px solid #00ff41;
    }
    
    .info-section h4 {
        color: #00ff41;
        margin-bottom: 10px;
        border-bottom: 1px solid #333;
        padding-bottom: 5px;
    }
    
    .info-section p {
        margin: 5px 0;
        font-size: 14px;
    }
    
    .modal-actions {
        text-align: center;
        margin-top: 20px;
    }
    
    .modal-actions button {
        background: #00ff41;
        color: #000;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
    }
    
    .modal-actions button:hover {
        background: #00cc33;
        transform: translateY(-2px);
    }
`;
document.head.appendChild(style);

// Export for use in main analyzer
window.Visualization3D = Visualization3D;