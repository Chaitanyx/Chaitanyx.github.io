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



// Parallax effect for multiple layers
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    // Only move parallax layers, not video
    document.querySelectorAll('.parallax-bg').forEach(layer => {
        const speed = layer.dataset.speed ? parseFloat(layer.dataset.speed) : 0.2;
        layer.style.transform = `translateY(${scrolled * speed}px) scale(1.5)`;
    });

    // Scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolledPercent = (window.scrollY / docHeight) * 100;
        scrollIndicator.style.width = scrolledPercent + '%';
    }

    // Isomerism stacking effect for sections
    document.querySelectorAll('section').forEach((section, idx) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            // Calculate stacking based on scroll position
            let offset = Math.max(0, window.scrollY - section.offsetTop);
            let stackDepth = Math.min(offset / 40, 8); // max stack
            section.style.transform = `translateY(${stackDepth * 8}px) scale(${1 - stackDepth * 0.03}) rotateX(${stackDepth * 3}deg)`;
            section.style.boxShadow = `0 ${stackDepth * 6}px ${16 + stackDepth * 8}px rgba(0,170,255,${0.08 + stackDepth * 0.02})`;
            section.style.zIndex = `${100 - idx}`;
        } else {
            section.style.transform = '';
            section.style.boxShadow = '';
            section.style.zIndex = '';
        }
    });
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

// Securely fetch user's IP and show in pawned section
(function() {
    const ipGuess = document.getElementById('ip-guess');
    const pawnedSection = document.getElementById('pawned-section');
    if (ipGuess && pawnedSection) {
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                // Only set textContent, never use innerHTML
                ipGuess.textContent = 'Your IP address (for the pawned section): ' + data.ip;
                pawnedSection.style.display = 'block';
            })
            .catch(() => {
                ipGuess.textContent = 'Could not guess your IP address.';
                pawnedSection.style.display = 'block';
            });
    }
})();
