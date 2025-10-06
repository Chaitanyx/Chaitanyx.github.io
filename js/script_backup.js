// Backup of original script for debugging
// Simple version to test the site loading

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
                line.style.opacity = '1';
            }, delay);
        });
        
        // Progress bar animation
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 2;
            if (progressBar) progressBar.style.width = progress + '%';
            if (percentText) percentText.textContent = progress + '%';
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                setTimeout(() => {
                    if (loader) {
                        loader.style.opacity = '0';
                        setTimeout(() => {
                            loader.style.display = 'none';
                        }, 500);
                    }
                }, 500);
            }
        }, 50);
    }

    // Floating navigation
    const floatingNav = document.querySelector('.floating-nav');
    
    // Scroll event listener
    window.addEventListener('scroll', function() {
        // Simple scroll indicator
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolledPercent = (window.scrollY / docHeight) * 100;
            scrollIndicator.style.width = scrolledPercent + '%';
            
            // Floating navigation logic
            if (floatingNav) {
                if (scrolledPercent > 0) {
                    if (!floatingNav.classList.contains('show')) {
                        floatingNav.classList.add('show');
                        console.log('Showing floating nav - scroll progress:', scrolledPercent.toFixed(1) + '%');
                    }
                } else {
                    if (floatingNav.classList.contains('show')) {
                        floatingNav.classList.remove('show');
                        console.log('Hiding floating nav - back to top');
                    }
                }
            }
        }
    });
    
    // Enhanced data collection for pawned section
    const pawnedSection = document.getElementById('pawned-section');
    if (pawnedSection) {
        collectHackerInfo();
        
        function collectHackerInfo() {
            // IP address collection
            fetch('https://api.ipify.org?format=json')
                .then(response => response.json())
                .then(data => {
                    updateInfoField('ip-address', data.ip);
                })
                .catch(() => {
                    updateInfoField('ip-address', 'Protected/Unavailable');
                });
            
            // Browser and system information
            updateInfoField('user-agent', navigator.userAgent);
            updateInfoField('platform-info', navigator.platform || 'Unknown');
            updateInfoField('screen-res', `${screen.width}x${screen.height}`);
            updateInfoField('timezone-info', Intl.DateTimeFormat().resolvedOptions().timeZone);
            updateInfoField('language-info', navigator.language);
            updateInfoField('protocol-info', window.location.protocol);
            updateInfoField('referrer-info', document.referrer || 'Direct Access');
            updateInfoField('connection-info', navigator.connection ? navigator.connection.effectiveType : 'Unknown');
            
            // Browser detection
            let browserInfo = 'Unknown';
            const userAgent = navigator.userAgent;
            if (userAgent.indexOf('Chrome') > -1) browserInfo = 'Chrome';
            else if (userAgent.indexOf('Firefox') > -1) browserInfo = 'Firefox';
            else if (userAgent.indexOf('Safari') > -1) browserInfo = 'Safari';
            else if (userAgent.indexOf('Edge') > -1) browserInfo = 'Edge';
            updateInfoField('browser-info', browserInfo);
        }
        
        function updateInfoField(id, value) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        }
    }
    
    // IP display in upper section
    const ipUpper = document.getElementById('ip-upper');
    if (ipUpper) {
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                ipUpper.innerHTML = `<strong>Your IP:</strong> ${data.ip}`;
            })
            .catch(() => {
                ipUpper.innerHTML = '<strong>Your IP:</strong> Protected';
            });
    }
});