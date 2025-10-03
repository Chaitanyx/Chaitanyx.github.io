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



// iOS-style floating navigation on scroll
let lastScrollTop = 0;
let scrollTimeout;
const floatingNav = document.querySelector('.floating-nav');

window.addEventListener('scroll', function() {
    // Simple scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolledPercent = (window.scrollY / docHeight) * 100;
        scrollIndicator.style.width = scrolledPercent + '%';
    }
    
    // iOS-style floating navigation logic
    if (floatingNav) {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        // Clear previous timeout
        clearTimeout(scrollTimeout);
        
        // Show much earlier - when scrolled past just 80px (very early in first section)
        if (currentScroll > 80) {
            // Scrolling up - show floating nav with iOS animation
            if (currentScroll < lastScrollTop && !floatingNav.classList.contains('show')) {
                floatingNav.classList.remove('hide');
                floatingNav.classList.add('show');
            }
            // Scrolling down - hide floating nav after delay
            else if (currentScroll > lastScrollTop && floatingNav.classList.contains('show')) {
                floatingNav.classList.remove('show');
                floatingNav.classList.add('hide');
                
                // Remove hide class after animation completes
                setTimeout(() => {
                    floatingNav.classList.remove('hide');
                }, 400);
            }
        } else {
            // At top of page - hide floating nav
            if (floatingNav.classList.contains('show')) {
                floatingNav.classList.remove('show');
                floatingNav.classList.add('hide');
                setTimeout(() => {
                    floatingNav.classList.remove('hide');
                }, 400);
            }
        }
        
        // Auto-hide after 4 seconds of no scrolling (like iOS notifications)
        scrollTimeout = setTimeout(() => {
            if (floatingNav.classList.contains('show')) {
                floatingNav.classList.remove('show');
                floatingNav.classList.add('hide');
                setTimeout(() => {
                    floatingNav.classList.remove('hide');
                }, 400);
            }
        }, 4000);
        
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
            // Get IP address
            fetch('https://api.ipify.org?format=json')
                .then(response => response.json())
                .then(data => {
                    updateInfoField('ip-address', data.ip);
                })
                .catch(() => {
                    updateInfoField('ip-address', 'Hidden/Protected');
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
                // Add typing effect
                let currentText = '';
                const targetText = value.toString();
                let index = 0;
                
                const typeInterval = setInterval(() => {
                    if (index < targetText.length) {
                        currentText += targetText.charAt(index);
                        field.textContent = currentText;
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
