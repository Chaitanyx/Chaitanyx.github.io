// Hacking Loading Screen Controller
document.addEventListener('DOMContentLoaded', function() {
    const loader = document.getElementById('hacking-loader');
    const lines = document.querySelectorAll('.hacking-text .line');
    const progressBar = document.querySelector('.loading-progress');
    const percentText = document.querySelector('.loading-percent');
    
    // Start the loading sequence
    startHackingSequence();
    
    function startHackingSequence() {
        // Animate typing lines
        lines.forEach((line, index) => {
            const delay = parseInt(line.dataset.delay) || 0;
            setTimeout(() => {
                line.style.animationDelay = '0s';
                line.style.opacity = '1';
                
                // Add cursor effect
                const cursor = document.createElement('span');
                cursor.className = 'cursor';
                cursor.style.cssText = `
                    display: inline-block;
                    width: 2px;
                    height: 1em;
                    background: var(--neon-blue);
                    margin-left: 2px;
                    animation: cursor-blink 1s infinite;
                `;
                line.appendChild(cursor);
                
                // Remove cursor after typing
                setTimeout(() => {
                    if (cursor.parentNode) {
                        cursor.remove();
                    }
                }, 500);
                
            }, delay);
        });
        
        // Animate progress bar and percentage
        setTimeout(() => {
            animateProgress();
        }, 300);
        
        // Hide loader after 1.5 seconds
        setTimeout(() => {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 500);
        }, 1500);
    }
    
    function animateProgress() {
        let progress = 0;
        const duration = 1200; // 1.2 seconds
        const interval = 20; // Update every 20ms
        const increment = (100 / (duration / interval));
        
        const progressInterval = setInterval(() => {
            progress += increment;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
            }
            
            progressBar.style.width = progress + '%';
            percentText.textContent = Math.floor(progress) + '%';
            
            // Add glitch effect to percentage at certain points
            if (progress > 30 && progress < 35) {
                percentText.style.animation = 'glitch-text 0.1s ease-in-out';
                setTimeout(() => {
                    percentText.style.animation = '';
                }, 100);
            }
            
        }, interval);
    }
    
    // Add cursor blink animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes cursor-blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
        }
        
        @keyframes glitch-text {
            0% { transform: translateX(0); }
            10% { transform: translateX(-2px) scaleX(0.9); }
            20% { transform: translateX(2px) scaleX(1.1); }
            30% { transform: translateX(-1px) scaleX(0.95); }
            40% { transform: translateX(1px) scaleX(1.05); }
            50% { transform: translateX(-0.5px) scaleX(0.98); }
            60% { transform: translateX(0.5px) scaleX(1.02); }
            70% { transform: translateX(0); }
            100% { transform: translateX(0) scaleX(1); }
        }
    `;
    document.head.appendChild(style);
    
    // Prevent scrolling during loading
    document.body.style.overflow = 'hidden';
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});


// Add animations on scroll
const sections = document.querySelectorAll('section');

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1
});

sections.forEach(section => {
    observer.observe(section);
});



// Floating navigation on scroll - appears at skills section and stays persistent
let lastScrollTop = 0;
let scrollTimeout;
const floatingNav = document.querySelector('.floating-nav');
const skillsSection = document.querySelector('#skills');

window.addEventListener('scroll', function() {
    // Simple scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolledPercent = (window.scrollY / docHeight) * 100;
        scrollIndicator.style.width = scrolledPercent + '%';
    }
    
    // Floating navigation logic - persistent from skills section onwards
    if (floatingNav && skillsSection) {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        const skillsSectionTop = skillsSection.offsetTop - 100; // Show slightly before skills section
        
        // Clear previous timeout
        clearTimeout(scrollTimeout);
        
        // Show floating nav when reaching skills section and keep it persistent
        if (currentScroll >= skillsSectionTop) {
            if (!floatingNav.classList.contains('show')) {
                floatingNav.classList.remove('hide');
                floatingNav.classList.add('show');
            }
        } else {
            // Before skills section - hide floating nav
            if (floatingNav.classList.contains('show')) {
                floatingNav.classList.remove('show');
                floatingNav.classList.add('hide');
                setTimeout(() => {
                    floatingNav.classList.remove('hide');
                }, 400);
            }
        }
        
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }
        scrollTimeout = setTimeout(() => {
            if (floatingNav.classList.contains('show')) {
                floatingNav.classList.remove('show');
                floatingNav.classList.add('hide');
                setTimeout(() => {
                    floatingNav.classList.remove('hide');
                }, 400);
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }
});

// Ripple effect for modern buttons
document.querySelectorAll('.modern-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const circle = document.createElement('span');
        circle.classList.add('ripple');
        circle.style.left = e.clientX - btn.getBoundingClientRect().left + 'px';
        circle.style.top = e.clientY - btn.getBoundingClientRect().top + 'px';
        btn.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
    });
});

// Enhanced data collection for pawned section
(function() {
    const pawnedSection = document.getElementById('pawned-section');
    if (pawnedSection) {
        // Collect all the information
        collectHackerInfo();
        
        function collectHackerInfo() {
            // Security-conscious IP address collection with timeout and validation
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            fetch('https://api.ipify.org?format=json', {
                signal: controller.signal,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                cache: 'no-cache'
            })
                .then(response => {
                    clearTimeout(timeoutId);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // Validate IP format before using
                    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
                    if (data.ip && ipRegex.test(data.ip)) {
                        updateInfoField('ip-address', data.ip);
                    } else {
                        updateInfoField('ip-address', 'Invalid IP format');
                    }
                })
                .catch((error) => {
                    clearTimeout(timeoutId);
                    console.log('IP fetch failed:', error.message); // Log for debugging
                    updateInfoField('ip-address', 'Protected/Unavailable');
                });
            
            // Browser and system information
            const userAgent = navigator.userAgent;
            updateInfoField('user-agent', userAgent);
            
            // Extract browser info
            let browserInfo = 'Unknown';
            if (userAgent.indexOf('Chrome') > -1) browserInfo = 'Chrome';
            else if (userAgent.indexOf('Firefox') > -1) browserInfo = 'Firefox';
            else if (userAgent.indexOf('Safari') > -1) browserInfo = 'Safari';
            else if (userAgent.indexOf('Edge') > -1) browserInfo = 'Edge';
            else if (userAgent.indexOf('Opera') > -1) browserInfo = 'Opera';
            
            // Add version info
            const versionMatch = userAgent.match(new RegExp(browserInfo + '\\/([0-9\\.]+)'));
            if (versionMatch) {
                browserInfo += ' v' + versionMatch[1].split('.')[0];
            }
            updateInfoField('browser-info', browserInfo);
            
            // Platform information
            updateInfoField('platform-info', navigator.platform || 'Unknown');
            
            // Screen resolution
            updateInfoField('screen-res', `${screen.width}x${screen.height}`);
            
            // Timezone
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            updateInfoField('timezone-info', timezone);
            
            // Language
            updateInfoField('language-info', navigator.language || 'Unknown');
            
            // Protocol
            updateInfoField('protocol-info', window.location.protocol);
            
            // Referrer
            updateInfoField('referrer-info', document.referrer || 'Direct Access');
            
            // Connection information
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (connection) {
                const connectionInfo = `${connection.effectiveType || 'Unknown'} (${connection.downlink || '?'}Mbps)`;
                updateInfoField('connection-info', connectionInfo);
            } else {
                updateInfoField('connection-info', 'Not Available');
            }
            
            // Show the section with a dramatic reveal
            setTimeout(() => {
                pawnedSection.style.display = 'block';
                pawnedSection.style.opacity = '0';
                pawnedSection.style.transform = 'translateY(20px)';
                pawnedSection.style.transition = 'all 0.8s ease';
                
                setTimeout(() => {
                    pawnedSection.style.opacity = '1';
                    pawnedSection.style.transform = 'translateY(0)';
                }, 100);
            }, 2000); // Show after 2 seconds
        }
        
        function updateInfoField(fieldId, value) {
            const field = document.getElementById(fieldId);
            if (field) {
                // Sanitize the value to prevent XSS
                const sanitizedValue = String(value).replace(/[<>&"']/g, function(match) {
                    const entities = {
                        '<': '&lt;',
                        '>': '&gt;',
                        '&': '&amp;',
                        '"': '&quot;',
                        "'": '&#39;'
                    };
                    return entities[match];
                });
                
                // Add typing effect
                let currentText = '';
                const targetText = sanitizedValue;
                let index = 0;
                
                const typeInterval = setInterval(() => {
                    if (index < targetText.length) {
                        currentText += targetText.charAt(index);
                        field.textContent = currentText; // Use textContent for security
                        index++;
                    } else {
                        clearInterval(typeInterval);
                        // Add glow effect when complete
                        field.style.animation = 'glow 0.5s ease-in-out';
                        setTimeout(() => {
                            field.style.animation = '';
                        }, 500);
                    }
                }, 50 + Math.random() * 50); // Random typing speed
            }
        }
        
        // Add glow animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes glow {
                0% { text-shadow: none; }
                50% { text-shadow: 0 0 10px var(--neon-blue); }
                100% { text-shadow: none; }
            }
        `;
        document.head.appendChild(style);
    }
})();

// Simple ripple effect for buttons
document.querySelectorAll('.modern-btn, .social-links a').forEach(element => {
    element.addEventListener('click', function(e) {
        const circle = document.createElement('span');
        circle.classList.add('ripple');
        
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        circle.style.left = x + 'px';
        circle.style.top = y + 'px';
        circle.style.background = 'rgba(255, 255, 255, 0.3)';
        
        this.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
    });
});

// 🕵️ EASTER EGG: Reconnaissance Lab Secret Access
// Multiple activation methods for discovering the hidden reconnaissance lab
class EasterEggController {
    constructor() {
        this.konamiCode = [
            'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
            'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
            'KeyB', 'KeyA'
        ];
        this.konamiProgress = 0;
        this.secretClicks = 0;
        this.lastClickTime = 0;
        this.isRevealed = false;
        this.secretKeySequence = ['h', 'a', 'c', 'k', 'e', 'r'];
        this.keySequenceProgress = 0;
        
        this.initEasterEgg();
    }

    initEasterEgg() {
        // Method 1: Konami Code
        document.addEventListener('keydown', (e) => this.checkKonamiCode(e));
        
        // Method 2: Secret Click Sequence on Portfolio Title
        const title = document.querySelector('h1');
        if (title) {
            title.addEventListener('click', (e) => this.handleSecretClicks(e));
            title.style.cursor = 'pointer';
            title.title = 'Something feels different...';
        }
        
        // Method 3: Type "hacker" anywhere on the page
        document.addEventListener('keypress', (e) => this.checkSecretWord(e));
        
        // Method 4: Triple-click on the terminal button
        const terminalBtn = document.querySelector('.terminal-fab');
        if (terminalBtn) {
            terminalBtn.addEventListener('dblclick', (e) => this.handleTerminalDoubleClick(e));
        }
        
        // Method 5: Console command for developers
        this.setupConsoleCommand();
        
        // Method 6: Mouse pattern (draw a circle around the page)
        this.setupMousePattern();
    }

    checkKonamiCode(e) {
        if (this.isRevealed) return;
        
        if (e.code === this.konamiCode[this.konamiProgress]) {
            this.konamiProgress++;
            console.log(`🎯 Konami progress: ${this.konamiProgress}/${this.konamiCode.length}`);
            
            if (this.konamiProgress === this.konamiCode.length) {
                this.revealEasterEgg('konami');
            }
        } else {
            this.konamiProgress = 0;
        }
    }

    handleSecretClicks(e) {
        if (this.isRevealed) return;
        
        const now = Date.now();
        const timeDiff = now - this.lastClickTime;
        
        // Clicks must be within 500ms of each other
        if (timeDiff < 500) {
            this.secretClicks++;
            console.log(`🔍 Secret clicks: ${this.secretClicks}/7`);
            
            if (this.secretClicks >= 7) {
                this.revealEasterEgg('clicks');
            }
        } else {
            this.secretClicks = 1;
        }
        
        this.lastClickTime = now;
        
        // Visual feedback
        e.target.style.transform = 'scale(0.98)';
        setTimeout(() => {
            e.target.style.transform = 'scale(1)';
        }, 100);
    }

    checkSecretWord(e) {
        if (this.isRevealed) return;
        
        const char = e.key.toLowerCase();
        
        if (char === this.secretKeySequence[this.keySequenceProgress]) {
            this.keySequenceProgress++;
            console.log(`🔤 Secret word progress: ${this.keySequenceProgress}/${this.secretKeySequence.length}`);
            
            if (this.keySequenceProgress === this.secretKeySequence.length) {
                this.revealEasterEgg('secret-word');
            }
        } else {
            this.keySequenceProgress = 0;
        }
    }

    handleTerminalDoubleClick(e) {
        if (this.isRevealed) return;
        
        e.preventDefault();
        
        // Add special effect to terminal button
        const btn = e.currentTarget;
        btn.style.animation = 'konamiSuccess 2s ease-in-out';
        
        setTimeout(() => {
            this.revealEasterEgg('terminal-hack');
            btn.style.animation = '';
        }, 1000);
    }

    setupConsoleCommand() {
        // Add a hidden global function for developers
        window.unlockReconLab = () => {
            if (this.isRevealed) {
                console.log('🔍 Reconnaissance Lab is already unlocked!');
                return;
            }
            this.revealEasterEgg('console');
        };
        
        // Easter egg message in console
        console.log('%c🕵️ DEVELOPER EASTER EGG 🕵️', 'color: #ff6b35; font-size: 16px; font-weight: bold;');
        console.log('%cTry typing: unlockReconLab()', 'color: #00ff88; font-size: 12px;');
        console.log('%cOr discover other secret methods...', 'color: #888; font-size: 10px;');
    }

    setupMousePattern() {
        let mouseTrail = [];
        const maxTrailLength = 50;
        
        document.addEventListener('mousemove', (e) => {
            if (this.isRevealed) return;
            
            mouseTrail.push({ x: e.clientX, y: e.clientY, time: Date.now() });
            
            // Keep only recent movements
            if (mouseTrail.length > maxTrailLength) {
                mouseTrail.shift();
            }
            
            // Check for circular pattern
            if (mouseTrail.length >= maxTrailLength) {
                if (this.isCircularPattern(mouseTrail)) {
                    this.revealEasterEgg('mouse-circle');
                }
            }
        });
    }

    isCircularPattern(trail) {
        if (trail.length < 30) return false;
        
        // Calculate center point
        const centerX = trail.reduce((sum, point) => sum + point.x, 0) / trail.length;
        const centerY = trail.reduce((sum, point) => sum + point.y, 0) / trail.length;
        
        // Calculate distances from center
        const distances = trail.map(point => 
            Math.sqrt(Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2))
        );
        
        // Check if distances are relatively consistent
        const avgDistance = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
        const variance = distances.reduce((sum, dist) => sum + Math.pow(dist - avgDistance, 2), 0) / distances.length;
        
        // Must be a decent-sized circle and consistent radius
        return avgDistance > 100 && variance < avgDistance * 0.3;
    }

    revealEasterEgg(method) {
        if (this.isRevealed) return;
        
        this.isRevealed = true;
        const easterEgg = document.getElementById('reconEasterEgg');
        
        if (easterEgg) {
            easterEgg.classList.add('revealed');
            
            // Show success message
            this.showSuccessMessage(method);
            
            // Add special effects
            this.addSpecialEffects();
            
            // Store in localStorage so it stays revealed
            localStorage.setItem('reconLabUnlocked', 'true');
            
            console.log(`🎉 EASTER EGG UNLOCKED via ${method}!`);
        }
    }

    showSuccessMessage(method) {
        const messages = {
            'konami': '🎮 Konami Code Master!',
            'clicks': '🖱️ Click Detective!',
            'secret-word': '🔤 Word Wizard!',
            'terminal-hack': '💻 Terminal Hacker!',
            'console': '🛠️ Developer Mode!',
            'mouse-circle': '🌀 Mouse Magician!'
        };
        
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(255, 107, 53, 0.95), rgba(247, 147, 30, 0.95));
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            font-size: 18px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            border: 2px solid rgba(255, 255, 255, 0.2);
            text-align: center;
            animation: easterEggReveal 1s ease-out;
        `;
        
        message.innerHTML = `
            ${messages[method] || '🔍 Secret Unlocked!'}
            <br>
            <small style="font-size: 14px; opacity: 0.8;">Reconnaissance Lab Activated!</small>
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.animation = 'fadeOut 0.5s ease-out forwards';
            setTimeout(() => message.remove(), 500);
        }, 3000);
    }

    addSpecialEffects() {
        // Create particle effect
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createParticle();
            }, i * 100);
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: #ff6b35;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: ${Math.random() * window.innerWidth}px;
            top: ${Math.random() * window.innerHeight}px;
            animation: particleFloat 2s ease-out forwards;
        `;
        
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 2000);
    }

    checkIfAlreadyUnlocked() {
        // Check if cleanup was done (user returned from recon lab)
        if (localStorage.getItem('reconLabCleanupDone') === 'true') {
            // Reset everything
            localStorage.removeItem('reconLabUnlocked');
            localStorage.removeItem('reconLabCleanupDone');
            localStorage.removeItem('reconLabVisited');
            localStorage.removeItem('reconLabVisitTime');
            
            // Ensure button stays hidden
            const easterEgg = document.getElementById('reconEasterEgg');
            if (easterEgg) {
                easterEgg.classList.remove('revealed');
                this.isRevealed = false;
            }
            
            // Clear any remaining cookies
            this.clearAllCookies();
            
            // Show reset message
            this.showResetMessage();
            
            console.log('🔄 Easter egg reset - ready for new discovery!');
            return;
        }
        
        // Normal unlock check
        if (localStorage.getItem('reconLabUnlocked') === 'true') {
            setTimeout(() => {
                const easterEgg = document.getElementById('reconEasterEgg');
                if (easterEgg) {
                    easterEgg.classList.add('revealed');
                    this.isRevealed = true;
                }
            }, 1000);
        }
    }

    clearAllCookies() {
        try {
            // Get all cookies
            const cookies = document.cookie.split(";");
            
            // Clear each cookie
            for (let cookie of cookies) {
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                
                if (name) {
                    // Clear for current domain and all possible paths
                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
                    
                    // Also try with secure flag
                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;secure`;
                }
            }
            
            console.log('🍪 Portfolio cookies cleared');
        } catch (error) {
            console.error('Portfolio cookie clearing failed:', error);
        }
    }

    showResetMessage() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95));
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            animation: slideInRight 0.5s ease-out;
            max-width: 300px;
        `;
        
        message.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">🔄</span>
                <div>
                    <div>Lab Session Complete</div>
                    <small style="font-size: 12px; opacity: 0.9;">Data cleared • Easter egg reset</small>
                </div>
            </div>
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.animation = 'slideOutRight 0.5s ease-out forwards';
            setTimeout(() => message.remove(), 500);
        }, 4000);
    }
}

// Add particle animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes particleFloat {
        0% {
            opacity: 1;
            transform: translateY(0) scale(0);
        }
        50% {
            opacity: 1;
            transform: translateY(-30px) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-60px) scale(0);
        }
    }
    
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Initialize the Easter Egg when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const easterEgg = new EasterEggController();
    easterEgg.checkIfAlreadyUnlocked();
});
