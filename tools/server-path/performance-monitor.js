// Performance Monitor Module - Real-time Network Performance Tracking
class PerformanceMonitor {
    constructor() {
        this.isMonitoring = false;
        this.measurements = [];
        this.metrics = {
            latency: [],
            bandwidth: [],
            packetLoss: [],
            jitter: []
        };
        this.targets = [
            { name: 'chaitanyalade.me', url: 'https://chaitanyalade.me', type: 'target' },
            { name: 'Google DNS', url: 'https://dns.google/resolve?name=google.com&type=A', type: 'dns' },
            { name: 'Cloudflare', url: 'https://cloudflare.com', type: 'cdn' },
            { name: 'GitHub', url: 'https://github.com', type: 'platform' }
        ];
        this.charts = {};
    }

    async startMonitoring() {
        if (this.isMonitoring) return;
        
        console.log('🚀 Starting network performance monitoring...');
        this.isMonitoring = true;

        // Initialize charts
        this.initializeCharts();

        // Start measurement loops
        this.startLatencyMonitoring();
        this.startBandwidthMonitoring();
        this.startPacketLossMonitoring();
        this.startJitterMonitoring();

        // Start real-time updates
        this.startRealTimeUpdates();
    }

    stopMonitoring() {
        console.log('⏹️ Stopping network performance monitoring...');
        this.isMonitoring = false;
        
        // Clear intervals
        if (this.latencyInterval) clearInterval(this.latencyInterval);
        if (this.bandwidthInterval) clearInterval(this.bandwidthInterval);
        if (this.packetLossInterval) clearInterval(this.packetLossInterval);
        if (this.jitterInterval) clearInterval(this.jitterInterval);
        if (this.updateInterval) clearInterval(this.updateInterval);
    }

    async measureLatency(target) {
        const measurements = [];
        
        for (let i = 0; i < 5; i++) {
            const startTime = performance.now();
            try {
                // Use a lightweight request to measure latency
                await fetch(target.url + '?t=' + Date.now(), { 
                    method: 'HEAD',
                    mode: 'no-cors',
                    cache: 'no-cache'
                });
                const latency = performance.now() - startTime;
                measurements.push(latency);
            } catch (error) {
                // Use img loading as fallback for CORS issues
                const latency = await this.measureImageLatency(target.url);
                if (latency > 0) measurements.push(latency);
            }
            
            await this.delay(100);
        }

        if (measurements.length === 0) return null;

        return {
            target: target.name,
            type: target.type,
            min: Math.min(...measurements),
            max: Math.max(...measurements),
            avg: measurements.reduce((a, b) => a + b, 0) / measurements.length,
            measurements: measurements,
            timestamp: Date.now()
        };
    }

    async measureImageLatency(baseUrl) {
        return new Promise((resolve) => {
            const startTime = performance.now();
            const img = new Image();
            
            img.onload = () => {
                resolve(performance.now() - startTime);
            };
            
            img.onerror = () => {
                resolve(-1);
            };
            
            // Use favicon or try to construct a small image URL
            img.src = new URL('/favicon.ico', baseUrl).href + '?t=' + Date.now();
            
            setTimeout(() => resolve(-1), 5000);
        });
    }

    async measureBandwidth() {
        const testSizes = [100, 500, 1000]; // KB
        const results = [];

        for (const size of testSizes) {
            try {
                const startTime = performance.now();
                
                // Create a test payload
                const testData = 'x'.repeat(size * 1024);
                const blob = new Blob([testData], { type: 'text/plain' });
                
                // Simulate upload (limited by CORS, so we'll estimate)
                const uploadTime = await this.simulateUpload(blob);
                
                if (uploadTime > 0) {
                    const bandwidth = (size * 8) / (uploadTime / 1000); // Kbps
                    results.push({
                        size: size,
                        time: uploadTime,
                        bandwidth: bandwidth
                    });
                }
            } catch (error) {
                console.warn('Bandwidth test failed for size', size, error);
            }
        }

        if (results.length === 0) return null;

        const avgBandwidth = results.reduce((a, b) => a + b.bandwidth, 0) / results.length;
        
        return {
            bandwidth: avgBandwidth,
            tests: results,
            timestamp: Date.now()
        };
    }

    async simulateUpload(blob) {
        // Since we can't actually upload due to CORS, simulate based on connection info
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection && connection.downlink) {
            // Estimate upload time based on connection speed
            const sizeKB = blob.size / 1024;
            const estimatedTime = (sizeKB / (connection.downlink * 100)) * 1000; // Rough estimation
            return estimatedTime;
        }
        
        // Fallback: measure a small actual request
        const startTime = performance.now();
        try {
            await fetch('https://httpbin.org/post', {
                method: 'POST',
                body: blob.slice(0, 1024) // Small sample
            });
            return performance.now() - startTime;
        } catch (error) {
            return -1;
        }
    }

    async measurePacketLoss() {
        const totalRequests = 10;
        let successfulRequests = 0;
        
        const promises = [];
        for (let i = 0; i < totalRequests; i++) {
            promises.push(
                fetch('https://www.google.com/favicon.ico?' + Math.random(), {
                    method: 'HEAD',
                    mode: 'no-cors',
                    cache: 'no-cache'
                }).then(() => {
                    successfulRequests++;
                }).catch(() => {
                    // Failed request
                })
            );
        }

        await Promise.allSettled(promises);
        
        const packetLoss = ((totalRequests - successfulRequests) / totalRequests) * 100;
        
        return {
            totalRequests: totalRequests,
            successfulRequests: successfulRequests,
            packetLoss: packetLoss,
            timestamp: Date.now()
        };
    }

    async measureJitter() {
        const measurements = [];
        
        for (let i = 0; i < 10; i++) {
            const latency = await this.quickLatencyMeasure();
            if (latency > 0) measurements.push(latency);
            await this.delay(200);
        }

        if (measurements.length < 2) return null;

        // Calculate jitter (variation in latency)
        const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;
        const variations = measurements.map(m => Math.abs(m - avg));
        const jitter = variations.reduce((a, b) => a + b, 0) / variations.length;

        return {
            jitter: jitter,
            measurements: measurements,
            average: avg,
            timestamp: Date.now()
        };
    }

    async quickLatencyMeasure() {
        const startTime = performance.now();
        try {
            await fetch('https://www.google.com/favicon.ico?' + Math.random(), {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache'
            });
            return performance.now() - startTime;
        } catch (error) {
            return -1;
        }
    }

    startLatencyMonitoring() {
        this.latencyInterval = setInterval(async () => {
            if (!this.isMonitoring) return;
            
            for (const target of this.targets) {
                const result = await this.measureLatency(target);
                if (result) {
                    this.metrics.latency.push(result);
                    if (this.metrics.latency.length > 100) {
                        this.metrics.latency.shift();
                    }
                }
            }
        }, 3000);
    }

    startBandwidthMonitoring() {
        this.bandwidthInterval = setInterval(async () => {
            if (!this.isMonitoring) return;
            
            const result = await this.measureBandwidth();
            if (result) {
                this.metrics.bandwidth.push(result);
                if (this.metrics.bandwidth.length > 50) {
                    this.metrics.bandwidth.shift();
                }
            }
        }, 10000);
    }

    startPacketLossMonitoring() {
        this.packetLossInterval = setInterval(async () => {
            if (!this.isMonitoring) return;
            
            const result = await this.measurePacketLoss();
            if (result) {
                this.metrics.packetLoss.push(result);
                if (this.metrics.packetLoss.length > 50) {
                    this.metrics.packetLoss.shift();
                }
            }
        }, 15000);
    }

    startJitterMonitoring() {
        this.jitterInterval = setInterval(async () => {
            if (!this.isMonitoring) return;
            
            const result = await this.measureJitter();
            if (result) {
                this.metrics.jitter.push(result);
                if (this.metrics.jitter.length > 50) {
                    this.metrics.jitter.shift();
                }
            }
        }, 8000);
    }

    startRealTimeUpdates() {
        this.updateInterval = setInterval(() => {
            if (!this.isMonitoring) return;
            
            this.updatePerformanceUI();
            this.updateCharts();
        }, 1000);
    }

    initializeCharts() {
        // Initialize canvas charts
        const latencyCanvas = document.getElementById('latencyChart');
        const bandwidthCanvas = document.getElementById('bandwidthChart');
        const packetLossCanvas = document.getElementById('packetLossChart');
        const jitterCanvas = document.getElementById('jitterChart');

        if (latencyCanvas) this.charts.latency = latencyCanvas.getContext('2d');
        if (bandwidthCanvas) this.charts.bandwidth = bandwidthCanvas.getContext('2d');
        if (packetLossCanvas) this.charts.packetLoss = packetLossCanvas.getContext('2d');
        if (jitterCanvas) this.charts.jitter = jitterCanvas.getContext('2d');
    }

    updatePerformanceUI() {
        // Update current metrics display
        if (this.metrics.latency.length > 0) {
            const latest = this.metrics.latency[this.metrics.latency.length - 1];
            const currentLatencyEl = document.getElementById('currentLatency');
            if (currentLatencyEl) {
                currentLatencyEl.textContent = `${Math.round(latest.avg)}ms`;
            }
        }

        if (this.metrics.bandwidth.length > 0) {
            const latest = this.metrics.bandwidth[this.metrics.bandwidth.length - 1];
            const currentBandwidthEl = document.getElementById('currentBandwidth');
            if (currentBandwidthEl) {
                currentBandwidthEl.textContent = `${Math.round(latest.bandwidth)} Kbps`;
            }
        }

        if (this.metrics.packetLoss.length > 0) {
            const latest = this.metrics.packetLoss[this.metrics.packetLoss.length - 1];
            const packetLossEl = document.getElementById('packetLoss');
            if (packetLossEl) {
                packetLossEl.textContent = `${latest.packetLoss.toFixed(1)}%`;
            }
        }

        if (this.metrics.jitter.length > 0) {
            const latest = this.metrics.jitter[this.metrics.jitter.length - 1];
            const jitterEl = document.getElementById('jitter');
            if (jitterEl) {
                jitterEl.textContent = `${Math.round(latest.jitter)}ms`;
            }
        }

        // Update averages
        this.updateAverages();
    }

    updateAverages() {
        if (this.metrics.latency.length > 0) {
            const avgLatency = this.metrics.latency.reduce((sum, m) => sum + m.avg, 0) / this.metrics.latency.length;
            const avgLatencyEl = document.getElementById('avgLatency');
            if (avgLatencyEl) {
                avgLatencyEl.textContent = `${Math.round(avgLatency)}ms`;
            }
        }

        if (this.metrics.bandwidth.length > 0) {
            const avgBandwidth = this.metrics.bandwidth.reduce((sum, m) => sum + m.bandwidth, 0) / this.metrics.bandwidth.length;
            const avgBandwidthEl = document.getElementById('avgBandwidth');
            if (avgBandwidthEl) {
                avgBandwidthEl.textContent = `${Math.round(avgBandwidth)} Kbps`;
            }
        }
    }

    updateCharts() {
        // Update latency chart
        if (this.charts.latency && this.metrics.latency.length > 0) {
            this.drawLatencyChart();
        }

        // Update other charts
        if (this.charts.bandwidth && this.metrics.bandwidth.length > 0) {
            this.drawBandwidthChart();
        }

        if (this.charts.packetLoss && this.metrics.packetLoss.length > 0) {
            this.drawPacketLossChart();
        }

        if (this.charts.jitter && this.metrics.jitter.length > 0) {
            this.drawJitterChart();
        }
    }

    drawLatencyChart() {
        const ctx = this.charts.latency;
        const canvas = ctx.canvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.metrics.latency.length < 2) return;

        const data = this.metrics.latency.slice(-50); // Last 50 measurements
        const maxLatency = Math.max(...data.map(d => d.max));
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

        // Draw latency lines for each target
        const colors = ['#00ff41', '#ff4444', '#4444ff', '#ffff44'];
        const targets = [...new Set(data.map(d => d.target))];

        targets.forEach((target, targetIndex) => {
            const targetData = data.filter(d => d.target === target);
            if (targetData.length < 2) return;

            ctx.strokeStyle = colors[targetIndex % colors.length];
            ctx.lineWidth = 2;
            ctx.beginPath();

            targetData.forEach((point, index) => {
                const x = padding + (chartWidth / (targetData.length - 1)) * index;
                const y = canvas.height - padding - (point.avg / maxLatency) * chartHeight;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();
        });

        // Draw legend
        targets.forEach((target, index) => {
            ctx.fillStyle = colors[index % colors.length];
            ctx.fillRect(padding + index * 100, padding - 15, 10, 10);
            ctx.fillStyle = '#fff';
            ctx.font = '12px Courier New';
            ctx.fillText(target, padding + index * 100 + 15, padding - 5);
        });
    }

    drawBandwidthChart() {
        const ctx = this.charts.bandwidth;
        const canvas = ctx.canvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.metrics.bandwidth.length < 2) return;

        const data = this.metrics.bandwidth.slice(-30);
        const maxBandwidth = Math.max(...data.map(d => d.bandwidth));
        const padding = 20;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;

        // Draw bars
        data.forEach((point, index) => {
            const barWidth = chartWidth / data.length - 2;
            const barHeight = (point.bandwidth / maxBandwidth) * chartHeight;
            const x = padding + index * (chartWidth / data.length);
            const y = canvas.height - padding - barHeight;

            ctx.fillStyle = '#00ff41';
            ctx.fillRect(x, y, barWidth, barHeight);
        });
    }

    drawPacketLossChart() {
        const ctx = this.charts.packetLoss;
        const canvas = ctx.canvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.metrics.packetLoss.length < 2) return;

        const data = this.metrics.packetLoss.slice(-20);
        const padding = 20;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;

        // Draw line chart
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 3;
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = canvas.height - padding - (point.packetLoss / 100) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Fill area
        ctx.fillStyle = 'rgba(255, 68, 68, 0.2)';
        ctx.beginPath();
        ctx.moveTo(padding, canvas.height - padding);
        data.forEach((point, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = canvas.height - padding - (point.packetLoss / 100) * chartHeight;
            ctx.lineTo(x, y);
        });
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.closePath();
        ctx.fill();
    }

    drawJitterChart() {
        const ctx = this.charts.jitter;
        const canvas = ctx.canvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.metrics.jitter.length < 2) return;

        const data = this.metrics.jitter.slice(-30);
        const maxJitter = Math.max(...data.map(d => d.jitter));
        const padding = 20;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;

        // Draw scatter plot
        ctx.fillStyle = '#8800ff';
        data.forEach((point, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = canvas.height - padding - (point.jitter / maxJitter) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw trend line
        if (data.length > 2) {
            ctx.strokeStyle = '#8800ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            data.forEach((point, index) => {
                const x = padding + (chartWidth / (data.length - 1)) * index;
                const y = canvas.height - padding - (point.jitter / maxJitter) * chartHeight;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getPerformanceSummary() {
        const summary = {
            latency: this.calculateLatencyStats(),
            bandwidth: this.calculateBandwidthStats(),
            packetLoss: this.calculatePacketLossStats(),
            jitter: this.calculateJitterStats(),
            overall: 'Good' // Will be calculated
        };

        // Calculate overall performance score
        summary.overall = this.calculateOverallPerformance(summary);
        
        return summary;
    }

    calculateLatencyStats() {
        if (this.metrics.latency.length === 0) return null;
        
        const latencies = this.metrics.latency.map(l => l.avg);
        return {
            current: latencies[latencies.length - 1],
            average: latencies.reduce((a, b) => a + b, 0) / latencies.length,
            min: Math.min(...latencies),
            max: Math.max(...latencies),
            count: latencies.length
        };
    }

    calculateBandwidthStats() {
        if (this.metrics.bandwidth.length === 0) return null;
        
        const bandwidths = this.metrics.bandwidth.map(b => b.bandwidth);
        return {
            current: bandwidths[bandwidths.length - 1],
            average: bandwidths.reduce((a, b) => a + b, 0) / bandwidths.length,
            min: Math.min(...bandwidths),
            max: Math.max(...bandwidths),
            count: bandwidths.length
        };
    }

    calculatePacketLossStats() {
        if (this.metrics.packetLoss.length === 0) return null;
        
        const losses = this.metrics.packetLoss.map(p => p.packetLoss);
        return {
            current: losses[losses.length - 1],
            average: losses.reduce((a, b) => a + b, 0) / losses.length,
            min: Math.min(...losses),
            max: Math.max(...losses),
            count: losses.length
        };
    }

    calculateJitterStats() {
        if (this.metrics.jitter.length === 0) return null;
        
        const jitters = this.metrics.jitter.map(j => j.jitter);
        return {
            current: jitters[jitters.length - 1],
            average: jitters.reduce((a, b) => a + b, 0) / jitters.length,
            min: Math.min(...jitters),
            max: Math.max(...jitters),
            count: jitters.length
        };
    }

    calculateOverallPerformance(summary) {
        let score = 100;
        
        // Penalize high latency
        if (summary.latency && summary.latency.average > 100) score -= 20;
        if (summary.latency && summary.latency.average > 200) score -= 30;
        
        // Penalize packet loss
        if (summary.packetLoss && summary.packetLoss.average > 1) score -= 25;
        if (summary.packetLoss && summary.packetLoss.average > 5) score -= 50;
        
        // Penalize high jitter
        if (summary.jitter && summary.jitter.average > 50) score -= 15;
        if (summary.jitter && summary.jitter.average > 100) score -= 25;
        
        // Consider bandwidth
        if (summary.bandwidth && summary.bandwidth.average < 1000) score -= 10;
        
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Poor';
    }

    exportPerformanceData() {
        const exportData = {
            metrics: this.metrics,
            summary: this.getPerformanceSummary(),
            targets: this.targets,
            generatedBy: 'Chaitanya\'s Performance Monitor',
            exportTime: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-analysis-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Export for use in main analyzer
window.PerformanceMonitor = PerformanceMonitor;