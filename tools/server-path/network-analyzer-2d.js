// Network Path Analyzer - 2D Implementation with Detailed Server Info
class NetworkPathAnalyzer2D {
    constructor() {
        this.networkData = {};
        this.isMonitoring = false;
        this.progressElement = null;
        this.serverNodes = [];
        
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

    async init() {
        console.log('🚀 Initializing Network Path Analyzer...');
        
        // Show initial progress
        this.showProgress('Initializing visualization...', 10);
        
        // Show progress
        this.showProgress('Discovering network topology...', 30);
        
        // Start network discovery with faster execution
        await this.discoverNetwork();
        
        // Show progress
        this.showProgress('Building 2D network map...', 60);
        
        // Build 2D visualization
        this.build2DVisualization();
        
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
            console.error('Error getting connection info:', error);
            return {
                error: 'Failed to get connection info',
                timestamp: new Date().toISOString()
            };
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
            }, 1000); // Faster timeout for better UX
        });
    }

    async detectNetworkDetails() {
        try {
            // Get public IP information
            const ipInfo = await this.getPublicIPInfo();
            
            return {
                publicIP: ipInfo,
                dns: {
                    primaryDNS: '8.8.8.8', // Example - would come from real detection
                    secondaryDNS: '8.8.4.4'
                },
                traceroute: this.simulateTraceroute() // Simplified for this example
            };
        } catch (error) {
            console.error('Error detecting network details:', error);
            return {
                error: 'Failed to detect network details'
            };
        }
    }

    simulateTraceroute() {
        // Simulate a traceroute response
        return [
            { hop: 1, ip: '192.168.1.1', name: 'Local Router', rtt: '1ms' },
            { hop: 2, ip: '10.10.10.1', name: 'ISP Gateway', rtt: '15ms' },
            { hop: 3, ip: '64.233.160.1', name: 'ISP Backbone', rtt: '25ms' },
            { hop: 4, ip: '172.217.13.14', name: 'Google Edge', rtt: '30ms' },
            { hop: 5, ip: '185.199.108.153', name: 'GitHub', rtt: '45ms' }
        ];
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
        const publicIP = this.networkData?.network?.publicIP;
        return [
            {
                id: 'client',
                name: 'Your Device',
                type: 'client',
                description: 'Browser/Device',
                location: 'Local',
                details: {
                    browser: this.getBrowserName(navigator.userAgent),
                    os: this.getOperatingSystem(navigator.userAgent),
                    connection: this.getNetworkType()
                }
            },
            {
                id: 'router',
                name: 'Local Router',
                type: 'router',
                description: 'Home Gateway',
                location: 'Local Network',
                details: {
                    gateway: '192.168.1.1',
                    nat: 'Enabled',
                    firewall: 'Active'
                }
            },
            {
                id: 'isp',
                name: 'ISP Network',
                type: 'isp',
                description: 'Internet Provider',
                location: 'Regional',
                details: {
                    provider: publicIP?.org || 'Unknown ISP',
                    publicIP: publicIP?.ip || 'Detecting...',
                    location: `${publicIP?.city || 'Unknown'}, ${publicIP?.country_name || 'Unknown'}`
                }
            },
            {
                id: 'backbone',
                name: 'Internet Core',
                type: 'backbone',
                description: 'Global Network',
                location: 'Worldwide',
                details: {
                    tier: 'Tier 1 Network',
                    protocol: 'BGP',
                    routing: 'Global'
                }
            },
            {
                id: 'cdn',
                name: 'GitHub CDN',
                type: 'cdn',
                description: 'Content Network',
                location: 'Edge Server',
                details: {
                    provider: 'GitHub',
                    cache: 'Enabled',
                    protocol: 'HTTP/2'
                }
            },
            {
                id: 'loadbalancer',
                name: 'Load Balancer',
                type: 'loadbalancer',
                description: 'Traffic Distribution',
                location: 'GitHub Infrastructure',
                details: {
                    type: 'GitHub LB',
                    ssl: 'TLS 1.3',
                    distribution: 'Round Robin'
                }
            },
            {
                id: 'server',
                name: 'chaitanyalade.me',
                type: 'server',
                description: 'Target Website',
                location: 'GitHub Pages',
                details: {
                    hosting: 'GitHub Pages',
                    type: 'Static Site',
                    deployment: 'Git-based'
                }
            }
        ];
    }

    build2DVisualization() {
        const networkMap = document.getElementById('networkMap');
        if (!networkMap || !this.networkData.serverPath) return;

        // Clear previous content
        networkMap.innerHTML = '';

        // Create the 2D path container
        const pathContainer = document.createElement('div');
        pathContainer.className = 'network-path-2d';

        // Create connections container
        const connectionsContainer = document.createElement('div');
        connectionsContainer.className = 'chain-connections';
        pathContainer.appendChild(connectionsContainer);

        // Style for node colors
        const nodeColors = {
            client: '#00ff41',
            router: '#0088ff',
            isp: '#ff8800',
            backbone: '#ff0088',
            cdn: '#00ffff',
            loadbalancer: '#8800ff',
            server: '#ff4444'
        };

        // Node positions for chain layout (relative to container)
        const nodePositions = [
            { x: 50, y: 20 },   // Your Device (top center)
            { x: 25, y: 80 },   // Local Router (left)
            { x: 75, y: 140 },  // ISP Network (right)
            { x: 30, y: 200 },  // Internet Core (left)
            { x: 70, y: 260 },  // GitHub CDN (right)
            { x: 40, y: 320 },  // Load Balancer (left)
            { x: 50, y: 380 }   // Target Server (bottom center)
        ];

        // Add each node to the path
        this.networkData.serverPath.forEach((nodeData, index) => {
            // Create node container
            const nodeContainer = document.createElement('div');
            nodeContainer.className = 'network-node-container';
            
            // Create node
            const node = document.createElement('div');
            node.className = 'network-node';
            node.style.backgroundColor = nodeColors[nodeData.type] || nodeColors.client;
            node.style.borderColor = nodeColors[nodeData.type] || nodeColors.client;
            node.setAttribute('data-node-id', nodeData.id);
            
            // Create node icon
            const nodeIcon = document.createElement('div');
            nodeIcon.className = 'node-icon';
            nodeIcon.innerHTML = this.getNodeIcon(nodeData.type);
            node.appendChild(nodeIcon);
            
            // Create node label
            const nodeLabel = document.createElement('div');
            nodeLabel.className = 'node-label';
            nodeLabel.textContent = nodeData.name;
            
            // Create hover details
            const hoverDetails = document.createElement('div');
            hoverDetails.className = 'node-hover-details';
            hoverDetails.style.borderColor = nodeColors[nodeData.type] || nodeColors.client;
            hoverDetails.innerHTML = this.generateHoverDetailsHTML(nodeData);
            node.appendChild(hoverDetails);
            
            // Click handler for full details modal
            node.addEventListener('click', () => {
                this.showNodeDetails(nodeData);
            });
            
            // Add node elements to container
            nodeContainer.appendChild(node);
            nodeContainer.appendChild(nodeLabel);
            
            pathContainer.appendChild(nodeContainer);
        });

        // Create connection lines between nodes
        this.createChainConnections(connectionsContainer, nodePositions);
        
        // Add the path container to the network map
        networkMap.appendChild(pathContainer);
        
        // Save reference to server nodes
        this.serverNodes = Array.from(document.querySelectorAll('.network-node'));
    }

    createChainConnections(container, positions) {
        for (let i = 0; i < positions.length - 1; i++) {
            const start = positions[i];
            const end = positions[i + 1];
            
            // Calculate connection line properties
            const deltaX = end.x - start.x;
            const deltaY = end.y - start.y;
            const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
            
            // Create connection line
            const connectionLine = document.createElement('div');
            connectionLine.className = 'connection-line';
            connectionLine.style.width = `${length}%`;
            connectionLine.style.left = `${start.x}%`;
            connectionLine.style.top = `${start.y + 40}px`; // Offset for node center
            connectionLine.style.transform = `rotate(${angle}deg)`;
            connectionLine.style.transformOrigin = 'left center';
            
            // Add flowing data packets
            for (let j = 0; j < 2; j++) {
                const packet = document.createElement('div');
                packet.className = 'data-packet';
                packet.style.animationDelay = `${j * 2 + i * 0.5}s`;
                connectionLine.appendChild(packet);
            }
            
            container.appendChild(connectionLine);
        }
    }

    generateHoverDetailsHTML(nodeData) {
        let detailsHTML = `
            <div style="text-align: center; margin-bottom: 8px; font-weight: bold; color: inherit;">
                ${nodeData.name}
            </div>
        `;
        
        if (nodeData.details) {
            for (const [key, value] of Object.entries(nodeData.details)) {
                const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
                detailsHTML += `
                    <div class="hover-detail-item">
                        <span class="hover-detail-key">${formattedKey}:</span>
                        <span class="hover-detail-value">${value}</span>
                    </div>
                `;
            }
        }
        
        return detailsHTML;
    }

    getNodeIcon(nodeType) {
        const icons = {
            client: '<i class="fas fa-laptop"></i>',
            router: '<i class="fas fa-wifi"></i>',
            isp: '<i class="fas fa-broadcast-tower"></i>',
            backbone: '<i class="fas fa-globe"></i>',
            cdn: '<i class="fas fa-cloud"></i>',
            loadbalancer: '<i class="fas fa-balance-scale"></i>',
            server: '<i class="fas fa-server"></i>'
        };
        
        return icons[nodeType] || icons.client;
    }

    generateNodeDetailsHTML(nodeData) {
        let detailsHTML = `
            <div class="node-details-header">
                <h3>${nodeData.name}</h3>
                <p class="node-description">${nodeData.description}</p>
                <p class="node-location"><i class="fas fa-map-marker-alt"></i> ${nodeData.location}</p>
            </div>
            <div class="node-details-content">
        `;
        
        // Add essential details only
        if (nodeData.details) {
            detailsHTML += '<div class="details-grid">';
            for (const [key, value] of Object.entries(nodeData.details)) {
                const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
                detailsHTML += `
                    <div class="detail-item">
                        <span class="detail-key">${formattedKey}:</span>
                        <span class="detail-value">${value}</span>
                    </div>
                `;
            }
            detailsHTML += '</div>';
        }
        
        detailsHTML += '</div>';
        return detailsHTML;
    }

    showNodeDetails(nodeData) {
        // Create modal for node details
        let modal = document.getElementById('nodeDetailModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'nodeDetailModal';
            modal.className = 'node-modal';
            document.body.appendChild(modal);
        }
        
        // Populate modal with node details
        modal.innerHTML = `
            <button class="close-modal" onclick="document.getElementById('nodeDetailModal').remove();">×</button>
            <div class="node-details-container">
                ${this.generateNodeDetailsHTML(nodeData)}
            </div>
            <div class="node-actions">
                <button class="action-btn" onclick="exportNodeData('${nodeData.id}')">
                    <i class="fas fa-download"></i> Export
                </button>
            </div>
        `;
        
        // Display the modal
        modal.style.display = 'block';
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
        
        // Update DNS Chain analysis
        this.updateDNSChain();
    }
    
    updateDNSChain() {
        const dnsChainElement = document.getElementById('dnsChain');
        if (!dnsChainElement) return;
        
        let dnsHtml = '<div class="dns-resolution-chain">';
        
        // Simplified DNS resolution steps
        const dnsSteps = [
            { name: 'Browser Cache', status: 'MISS', time: '0ms' },
            { name: 'Local DNS', status: 'FORWARDED', time: '2ms' },
            { name: 'ISP DNS', status: 'FORWARDED', time: '15ms' },
            { name: 'Root Servers', status: 'REFERRED', time: '30ms' },
            { name: 'Authoritative NS', status: 'RESOLVED', time: '45ms' }
        ];
        
        dnsSteps.forEach((step, index) => {
            dnsHtml += `
                <div class="dns-step ${index === dnsSteps.length - 1 ? 'final-step' : ''}">
                    <div class="dns-step-icon">
                        <i class="fas fa-${this.getDNSStepIcon(step.status)}"></i>
                    </div>
                    <div class="dns-step-details">
                        <div class="dns-step-name">${step.name}</div>
                        <div class="dns-step-status">${step.status}</div>
                    </div>
                    <div class="dns-step-time">${step.time}</div>
                    ${index < dnsSteps.length - 1 ? '<div class="dns-step-arrow"><i class="fas fa-chevron-down"></i></div>' : ''}
                </div>
            `;
        });
        
        dnsHtml += '</div>';
        dnsChainElement.innerHTML = dnsHtml;
    }
    
    getDNSStepIcon(status) {
        switch(status) {
            case 'HIT': return 'check-circle';
            case 'MISS': return 'times-circle';
            case 'FORWARDED': return 'arrow-right';
            case 'REFERRED': return 'external-link-alt';
            case 'RESOLVED': return 'check-double';
            default: return 'question-circle';
        }
    }
    
    getBrowserName(userAgent) {
        if (!userAgent) return 'Unknown';
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown';
    }
    
    getOperatingSystem(userAgent) {
        if (userAgent.indexOf('Windows') !== -1) return 'Windows';
        if (userAgent.indexOf('Mac') !== -1) return 'macOS';
        if (userAgent.indexOf('Linux') !== -1) return 'Linux';
        if (userAgent.indexOf('Android') !== -1) return 'Android';
        if (userAgent.indexOf('iOS') !== -1) return 'iOS';
        return 'Unknown';
    }
    
    getNetworkType() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        return connection?.effectiveType || 'Unknown';
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
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
        // Initialize new analyzer
        console.log('Creating new network analyzer...');
        window.networkAnalyzer = new NetworkPathAnalyzer2D();
    }
}

function toggleAnimation() {
    const pathContainer = document.querySelector('.network-path-2d');
    if (pathContainer) {
        // Toggle animation class
        if (pathContainer.classList.contains('animate-paused')) {
            pathContainer.classList.remove('animate-paused');
        } else {
            pathContainer.classList.add('animate-paused');
        }
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

function exportNodeData(nodeId) {
    if (window.networkAnalyzer && window.networkAnalyzer.networkData) {
        const node = window.networkAnalyzer.networkData.serverPath.find(n => n.id === nodeId);
        if (node) {
            const data = { node: node, timestamp: new Date().toISOString() };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `node-${nodeId}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
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
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            const points = window.chartPoints || [];
            if (points.length > 100) {
                points.shift();
            }
            
            const newPoint = Math.random() * 50 + 20;
            points.push(newPoint);
            window.chartPoints = points;
            
            const stepSize = canvas.width / 100;
            
            for (let i = 0; i < points.length; i++) {
                const x = i * stepSize;
                const y = canvas.height - (points[i] / 150 * canvas.height);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
        }
    }, 1000);
}

function stopMonitoring() {
    console.log('⏹ Stopping real-time monitoring');
    const monitorBtn = document.getElementById('monitorBtn');
    if (monitorBtn) {
        monitorBtn.innerHTML = '<i class="fas fa-play"></i> Start Monitoring';
        monitorBtn.onclick = startMonitoring;
    }
    
    if (window.monitoringInterval) {
        clearInterval(window.monitoringInterval);
    }
}

function clearMonitoring() {
    console.log('🧹 Clearing monitoring data');
    window.chartPoints = [];
    
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

// Initialize network analyzer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.networkAnalyzer = new NetworkPathAnalyzer2D();
});