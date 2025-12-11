// Behavioral Analytics Module
class BehavioralAnalytics {
    constructor() {
        this.mouseData = {
            positions: [],
            clicks: [],
            movements: 0,
            totalDistance: 0,
            clickCount: 0,
            lastPosition: { x: 0, y: 0 },
            velocity: [],
            acceleration: [],
            patterns: []
        };

        this.keyboardData = {
            keystrokes: [],
            intervals: [],
            patterns: [],
            typingSpeed: 0,
            rhythmProfile: [],
            dwellTimes: [],
            flightTimes: []
        };

        this.sessionData = {
            startTime: Date.now(),
            events: [],
            focusEvents: [],
            scrollEvents: [],
            resizeEvents: [],
            visibilityChanges: []
        };

        this.isTracking = false;
        this.canvas = null;
        this.ctx = null;
        
        this.initCanvas();
        this.bindEvents();
    }

    initCanvas() {
        this.canvas = document.getElementById('mouseCanvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.setupCanvas();
        }
    }

    setupCanvas() {
        if (!this.ctx) return;
        
        // Set canvas size
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Initial setup
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.8;
        
        // Draw grid
        this.drawGrid();
    }

    drawGrid() {
        if (!this.ctx) return;
        
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    bindEvents() {
        // Mouse tracking
        document.addEventListener('mousemove', (e) => this.trackMouseMovement(e));
        document.addEventListener('click', (e) => this.trackClick(e));
        
        // Keyboard tracking
        const keystrokeArea = document.getElementById('keystrokeArea');
        if (keystrokeArea) {
            keystrokeArea.addEventListener('keydown', (e) => this.trackKeyDown(e));
            keystrokeArea.addEventListener('keyup', (e) => this.trackKeyUp(e));
            keystrokeArea.addEventListener('input', (e) => this.trackInput(e));
        }
        
        // Session tracking
        window.addEventListener('focus', () => this.trackFocusEvent('focus'));
        window.addEventListener('blur', () => this.trackFocusEvent('blur'));
        window.addEventListener('scroll', (e) => this.trackScrollEvent(e));
        window.addEventListener('resize', (e) => this.trackResizeEvent(e));
        
        // Visibility API
        document.addEventListener('visibilitychange', () => this.trackVisibilityChange());
        
        // Touch events for mobile
        document.addEventListener('touchstart', (e) => this.trackTouchEvent('start', e));
        document.addEventListener('touchmove', (e) => this.trackTouchEvent('move', e));
        document.addEventListener('touchend', (e) => this.trackTouchEvent('end', e));
    }

    trackMouseMovement(event) {
        if (!this.isTracking) return;
        
        const now = Date.now();
        const position = {
            x: event.clientX,
            y: event.clientY,
            timestamp: now
        };

        // Calculate distance from last position
        if (this.mouseData.lastPosition.x !== 0 || this.mouseData.lastPosition.y !== 0) {
            const distance = Math.sqrt(
                Math.pow(position.x - this.mouseData.lastPosition.x, 2) +
                Math.pow(position.y - this.mouseData.lastPosition.y, 2)
            );
            
            this.mouseData.totalDistance += distance;
            this.mouseData.movements++;
            
            // Calculate velocity and acceleration
            const lastPos = this.mouseData.positions[this.mouseData.positions.length - 1];
            if (lastPos) {
                const timeDiff = now - lastPos.timestamp;
                const velocity = distance / timeDiff;
                this.mouseData.velocity.push(velocity);
                
                if (this.mouseData.velocity.length > 1) {
                    const lastVelocity = this.mouseData.velocity[this.mouseData.velocity.length - 2];
                    const acceleration = (velocity - lastVelocity) / timeDiff;
                    this.mouseData.acceleration.push(acceleration);
                }
            }
        }

        this.mouseData.positions.push(position);
        this.mouseData.lastPosition = position;
        
        // Keep only last 1000 positions
        if (this.mouseData.positions.length > 1000) {
            this.mouseData.positions.shift();
        }
        
        // Draw on canvas
        this.drawMouseTrail(position);
        
        // Update UI
        this.updateMouseStats();
        
        // Detect patterns
        this.detectMousePatterns();
    }

    trackClick(event) {
        const clickData = {
            x: event.clientX,
            y: event.clientY,
            timestamp: Date.now(),
            button: event.button,
            target: event.target.tagName,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey
        };

        this.mouseData.clicks.push(clickData);
        this.mouseData.clickCount++;
        
        // Draw click indicator
        this.drawClickIndicator(clickData);
        
        // Update UI
        this.updateMouseStats();
        
        // Add to session timeline
        this.addSessionEvent('click', `Click on ${clickData.target} at (${clickData.x}, ${clickData.y})`);
    }

    trackKeyDown(event) {
        const now = Date.now();
        const keyData = {
            key: event.key,
            code: event.code,
            timestamp: now,
            type: 'keydown',
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey
        };

        this.keyboardData.keystrokes.push(keyData);
        
        // Calculate dwell time (time between keydown and keyup)
        this.pendingKeyDown = keyData;
    }

    trackKeyUp(event) {
        const now = Date.now();
        
        if (this.pendingKeyDown && this.pendingKeyDown.code === event.code) {
            const dwellTime = now - this.pendingKeyDown.timestamp;
            this.keyboardData.dwellTimes.push(dwellTime);
            
            // Flight time (time between keyup of previous key and keydown of current key)
            if (this.lastKeyUp) {
                const flightTime = this.pendingKeyDown.timestamp - this.lastKeyUp;
                this.keyboardData.flightTimes.push(flightTime);
            }
            
            this.lastKeyUp = now;
        }
        
        // Calculate typing speed
        this.calculateTypingSpeed();
        
        // Update UI
        this.updateKeyboardStats();
    }

    trackInput(event) {
        const text = event.target.value;
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;
        
        // Calculate WPM
        const timeElapsed = (Date.now() - this.sessionData.startTime) / 60000; // in minutes
        const wpm = timeElapsed > 0 ? Math.round(wordCount / timeElapsed) : 0;
        
        this.keyboardData.typingSpeed = wpm;
        
        // Detect patterns
        this.detectTypingPatterns(text);
        
        // Update UI
        this.updateKeyboardStats();
    }

    trackFocusEvent(type) {
        const focusData = {
            type: type,
            timestamp: Date.now(),
            url: window.location.href
        };

        this.sessionData.focusEvents.push(focusData);
        this.addSessionEvent('focus', `Window ${type}`);
    }

    trackScrollEvent(event) {
        const scrollData = {
            x: window.scrollX,
            y: window.scrollY,
            timestamp: Date.now(),
            deltaX: event.deltaX || 0,
            deltaY: event.deltaY || 0
        };

        this.sessionData.scrollEvents.push(scrollData);
        
        // Keep only last 100 scroll events
        if (this.sessionData.scrollEvents.length > 100) {
            this.sessionData.scrollEvents.shift();
        }
    }

    trackResizeEvent(event) {
        const resizeData = {
            width: window.innerWidth,
            height: window.innerHeight,
            timestamp: Date.now()
        };

        this.sessionData.resizeEvents.push(resizeData);
        this.addSessionEvent('resize', `Window resized to ${resizeData.width}x${resizeData.height}`);
        
        // Redraw canvas if it exists
        if (this.canvas) {
            this.setupCanvas();
        }
    }

    trackVisibilityChange() {
        const visibilityData = {
            hidden: document.hidden,
            timestamp: Date.now(),
            visibilityState: document.visibilityState
        };

        this.sessionData.visibilityChanges.push(visibilityData);
        this.addSessionEvent('visibility', `Page ${document.hidden ? 'hidden' : 'visible'}`);
    }

    trackTouchEvent(type, event) {
        if (event.touches && event.touches.length > 0) {
            const touch = event.touches[0];
            const touchData = {
                type: type,
                x: touch.clientX,
                y: touch.clientY,
                timestamp: Date.now(),
                force: touch.force || 0,
                radiusX: touch.radiusX || 0,
                radiusY: touch.radiusY || 0
            };

            // Treat touches like mouse events for visualization
            if (type === 'move') {
                this.drawMouseTrail(touchData);
            } else if (type === 'start') {
                this.drawClickIndicator(touchData);
            }
        }
    }

    drawMouseTrail(position) {
        if (!this.ctx || !this.canvas) return;
        
        // Convert screen coordinates to canvas coordinates
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = ((position.x - rect.left) / rect.width) * this.canvas.width;
        const canvasY = ((position.y - rect.top) / rect.height) * this.canvas.height;
        
        // Only draw if within canvas bounds
        if (canvasX >= 0 && canvasX <= this.canvas.width && canvasY >= 0 && canvasY <= this.canvas.height) {
            this.ctx.strokeStyle = '#00ff00';
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = 0.6;
            
            if (this.lastCanvasPosition) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.lastCanvasPosition.x, this.lastCanvasPosition.y);
                this.ctx.lineTo(canvasX, canvasY);
                this.ctx.stroke();
            }
            
            this.lastCanvasPosition = { x: canvasX, y: canvasY };
        }
    }

    drawClickIndicator(clickData) {
        if (!this.ctx || !this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = ((clickData.x - rect.left) / rect.width) * this.canvas.width;
        const canvasY = ((clickData.y - rect.top) / rect.height) * this.canvas.height;
        
        if (canvasX >= 0 && canvasX <= this.canvas.width && canvasY >= 0 && canvasY <= this.canvas.height) {
            this.ctx.fillStyle = '#ff0080';
            this.ctx.globalAlpha = 0.8;
            this.ctx.beginPath();
            this.ctx.arc(canvasX, canvasY, 8, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Add ripple effect
            setTimeout(() => {
                this.ctx.strokeStyle = '#ff0080';
                this.ctx.lineWidth = 2;
                this.ctx.globalAlpha = 0.4;
                this.ctx.beginPath();
                this.ctx.arc(canvasX, canvasY, 15, 0, 2 * Math.PI);
                this.ctx.stroke();
            }, 100);
        }
    }

    detectMousePatterns() {
        if (this.mouseData.positions.length < 10) return;
        
        const recent = this.mouseData.positions.slice(-10);
        
        // Detect circular motions
        const isCircular = this.detectCircularMotion(recent);
        if (isCircular) {
            this.mouseData.patterns.push({
                type: 'circular',
                timestamp: Date.now(),
                positions: [...recent]
            });
        }
        
        // Detect straight lines
        const isLinear = this.detectLinearMotion(recent);
        if (isLinear) {
            this.mouseData.patterns.push({
                type: 'linear',
                timestamp: Date.now(),
                positions: [...recent]
            });
        }
        
        // Detect zigzag patterns
        const isZigzag = this.detectZigzagMotion(recent);
        if (isZigzag) {
            this.mouseData.patterns.push({
                type: 'zigzag',
                timestamp: Date.now(),
                positions: [...recent]
            });
        }
    }

    detectCircularMotion(positions) {
        if (positions.length < 8) return false;
        
        // Calculate center point
        const centerX = positions.reduce((sum, pos) => sum + pos.x, 0) / positions.length;
        const centerY = positions.reduce((sum, pos) => sum + pos.y, 0) / positions.length;
        
        // Calculate distances from center
        const distances = positions.map(pos => 
            Math.sqrt(Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2))
        );
        
        // Check if distances are relatively consistent (circular motion)
        const avgDistance = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
        const variance = distances.reduce((sum, dist) => sum + Math.pow(dist - avgDistance, 2), 0) / distances.length;
        
        return variance < avgDistance * 0.2; // Less than 20% variance indicates circular motion
    }

    detectLinearMotion(positions) {
        if (positions.length < 5) return false;
        
        // Calculate slope consistency
        const slopes = [];
        for (let i = 1; i < positions.length; i++) {
            const deltaX = positions[i].x - positions[i-1].x;
            const deltaY = positions[i].y - positions[i-1].y;
            if (deltaX !== 0) {
                slopes.push(deltaY / deltaX);
            }
        }
        
        if (slopes.length < 3) return false;
        
        // Check slope consistency
        const avgSlope = slopes.reduce((sum, slope) => sum + slope, 0) / slopes.length;
        const slopeVariance = slopes.reduce((sum, slope) => sum + Math.pow(slope - avgSlope, 2), 0) / slopes.length;
        
        return slopeVariance < 0.1; // Low variance indicates linear motion
    }

    detectZigzagMotion(positions) {
        if (positions.length < 6) return false;
        
        // Count direction changes
        let directionChanges = 0;
        let lastDirection = null;
        
        for (let i = 1; i < positions.length; i++) {
            const deltaX = positions[i].x - positions[i-1].x;
            const deltaY = positions[i].y - positions[i-1].y;
            const currentDirection = Math.atan2(deltaY, deltaX);
            
            if (lastDirection !== null) {
                const angleDiff = Math.abs(currentDirection - lastDirection);
                if (angleDiff > Math.PI / 4) { // 45 degrees or more change
                    directionChanges++;
                }
            }
            
            lastDirection = currentDirection;
        }
        
        return directionChanges >= 3; // Multiple direction changes indicate zigzag
    }

    detectTypingPatterns(text) {
        // Detect common patterns
        const patterns = {
            repeated: /(.)\1{2,}/g,
            email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
            phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
            url: /https?:\/\/[^\s]+/g,
            numbers: /\b\d+\b/g
        };

        const detectedPatterns = {};
        for (const [patternName, regex] of Object.entries(patterns)) {
            const matches = text.match(regex);
            if (matches) {
                detectedPatterns[patternName] = matches.length;
            }
        }

        this.keyboardData.patterns.push({
            timestamp: Date.now(),
            text: text,
            patterns: detectedPatterns
        });
    }

    calculateTypingSpeed() {
        if (this.keyboardData.keystrokes.length < 10) return;
        
        const recent = this.keyboardData.keystrokes.slice(-10);
        const timeSpan = recent[recent.length - 1].timestamp - recent[0].timestamp;
        const keystrokes = recent.length;
        
        // Calculate keystrokes per minute
        const kpm = timeSpan > 0 ? (keystrokes / timeSpan) * 60000 : 0;
        
        // Estimate WPM (assuming average 5 keystrokes per word)
        this.keyboardData.typingSpeed = Math.round(kpm / 5);
    }

    updateMouseStats() {
        const clickCountEl = document.getElementById('clickCount');
        const mouseDistanceEl = document.getElementById('mouseDistance');
        
        if (clickCountEl) clickCountEl.textContent = this.mouseData.clickCount;
        if (mouseDistanceEl) mouseDistanceEl.textContent = Math.round(this.mouseData.totalDistance);
    }

    updateKeyboardStats() {
        const wpmCountEl = document.getElementById('wpmCount');
        const patternCountEl = document.getElementById('patternCount');
        
        if (wpmCountEl) wpmCountEl.textContent = this.keyboardData.typingSpeed;
        if (patternCountEl) patternCountEl.textContent = this.keyboardData.patterns.length;
    }

    addSessionEvent(type, description) {
        const eventData = {
            type: type,
            description: description,
            timestamp: Date.now()
        };

        this.sessionData.events.push(eventData);
        
        // Update timeline
        this.updateSessionTimeline(eventData);
        
        // Keep only last 50 events
        if (this.sessionData.events.length > 50) {
            this.sessionData.events.shift();
        }
    }

    updateSessionTimeline(eventData) {
        const timeline = document.getElementById('sessionTimeline');
        if (!timeline) return;
        
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        const elapsed = Math.floor((eventData.timestamp - this.sessionData.startTime) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        timelineItem.innerHTML = `
            <span class="time">${timeString}</span>
            <span class="event">${eventData.description}</span>
        `;
        
        timeline.appendChild(timelineItem);
        
        // Remove old items if there are too many
        while (timeline.children.length > 10) {
            timeline.removeChild(timeline.firstChild);
        }
        
        // Scroll to bottom
        timeline.scrollTop = timeline.scrollHeight;
    }

    startTracking() {
        this.isTracking = true;
        console.log('Behavioral tracking started');
    }

    stopTracking() {
        this.isTracking = false;
        console.log('Behavioral tracking stopped');
    }

    getAnalyticsData() {
        return {
            mouse: this.mouseData,
            keyboard: this.keyboardData,
            session: this.sessionData,
            summary: {
                totalMouseMovements: this.mouseData.movements,
                totalMouseDistance: this.mouseData.totalDistance,
                totalClicks: this.mouseData.clickCount,
                totalKeystrokes: this.keyboardData.keystrokes.length,
                averageTypingSpeed: this.keyboardData.typingSpeed,
                sessionDuration: Date.now() - this.sessionData.startTime,
                patternsDetected: this.mouseData.patterns.length + this.keyboardData.patterns.length
            }
        };
    }

    clearCanvas() {
        if (this.ctx && this.canvas) {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawGrid();
            this.lastCanvasPosition = null;
        }
    }

    exportHeatmap() {
        if (!this.canvas) return null;
        
        // Generate heatmap from mouse positions
        const heatmapCanvas = document.createElement('canvas');
        heatmapCanvas.width = this.canvas.width;
        heatmapCanvas.height = this.canvas.height;
        const heatCtx = heatmapCanvas.getContext('2d');
        
        // Create heatmap
        const imageData = heatCtx.createImageData(heatmapCanvas.width, heatmapCanvas.height);
        const data = imageData.data;
        
        // Initialize with black background
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 0;     // Red
            data[i + 1] = 0; // Green
            data[i + 2] = 0; // Blue
            data[i + 3] = 255; // Alpha
        }
        
        // Add heat for each mouse position
        this.mouseData.positions.forEach(pos => {
            const rect = this.canvas.getBoundingClientRect();
            const x = Math.floor(((pos.x - rect.left) / rect.width) * heatmapCanvas.width);
            const y = Math.floor(((pos.y - rect.top) / rect.height) * heatmapCanvas.height);
            
            if (x >= 0 && x < heatmapCanvas.width && y >= 0 && y < heatmapCanvas.height) {
                const index = (y * heatmapCanvas.width + x) * 4;
                data[index] = Math.min(255, data[index] + 5);     // Increase red
                data[index + 1] = Math.min(255, data[index + 1] + 2); // Slight green
            }
        });
        
        heatCtx.putImageData(imageData, 0, 0);
        return heatmapCanvas.toDataURL();
    }
}

// Initialize behavioral analytics
if (typeof window !== 'undefined') {
    window.BehavioralAnalytics = BehavioralAnalytics;
}