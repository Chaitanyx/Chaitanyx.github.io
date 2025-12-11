// Terminal JavaScript Implementation with Security Enhancements
class SecurityUtils {
    // Sanitize HTML to prevent XSS attacks
    static sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    
    // Safe HTML parser that only allows whitelisted tags and attributes
    static createSafeHTML(htmlString) {
        const allowedTags = ['div', 'span', 'p', 'br', 'strong', 'em', 'pre', 'code'];
        const allowedAttributes = ['style', 'class'];
        
        // For now, we'll use a simple approach - in production, use a library like DOMPurify
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;
        
        // Remove any script tags or dangerous content
        const scripts = tempDiv.getElementsByTagName('script');
        for (let i = scripts.length - 1; i >= 0; i--) {
            scripts[i].remove();
        }
        
        return tempDiv.innerHTML;
    }
    
    // Validate command input
    static validateCommand(command) {
        // Only allow alphanumeric characters, spaces, and common command characters
        const allowedPattern = /^[a-zA-Z0-9\s\-_\.\/]*$/;
        return allowedPattern.test(command) && command.length <= 100;
    }
}

class InteractiveTerminal {
    constructor() {
        this.commandHistory = [];
        this.historyIndex = -1;
        this.currentPath = '~';
        this.lastCommandTime = 0; // For rate limiting
        this.availableCommands = {
            'help': 'Show available commands',
            'about': 'Learn about Chaitanya',
            'whoami': 'Display user information',
            'skills': 'Show technical skills',
            'projects': 'Display project portfolio',
            'education': 'Show educational background',
            'certifications': 'Display certifications',
            'contact': 'Get contact information',
            'experience': 'Show work experience',
            'ls': 'List directory contents',
            'pwd': 'Print working directory',
            'cat': 'Display file contents',
            'cd': 'Change directory',
            'clear': 'Clear terminal screen',
            'date': 'Show current date and time',
            'echo': 'Display message',
            'history': 'Show command history',
            'matrix': 'Start matrix animation',
            'hack': 'Ethical hacking information',
            'social': 'Show social media links',
            'resume': 'Download resume',
            'theme': 'Change terminal theme'
        };
        
        this.fileSystem = {
            '~': {
                type: 'directory',
                contents: ['about.txt', 'skills.txt', 'projects/', 'contact.txt', 'resume.pdf']
            },
            'projects': {
                type: 'directory',
                contents: ['cybersec_tools/', 'web_apps/', 'mobile_apps/']
            }
        };
        
        this.init();
    }

    init() {
        this.commandInput = document.getElementById('command-input');
        this.terminalContent = document.getElementById('terminal-content');
        this.commandHistoryDiv = document.getElementById('command-history');
        this.loading = document.getElementById('loading');
        
        // Hide loading screen after 2 seconds
        setTimeout(() => {
            this.loading.style.display = 'none';
            this.commandInput.focus();
        }, 2000);
        
        this.bindEvents();
        this.startMatrixBackground();
    }

    bindEvents() {
        this.commandInput.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'Enter':
                    e.preventDefault();
                    this.executeCommand();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateHistory('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateHistory('down');
                    break;
                case 'Tab':
                    e.preventDefault();
                    this.autoComplete();
                    break;
            }
        });

        this.commandInput.addEventListener('input', () => {
            this.showSuggestions();
        });

        // Keep focus on input
        document.addEventListener('click', () => {
            this.commandInput.focus();
        });
    }

    executeCommand() {
        const command = this.commandInput.value.trim();
        if (!command) return;

        // Validate command for security
        if (!SecurityUtils.validateCommand(command)) {
            this.addOutputLine('Invalid command format. Only alphanumeric characters and basic symbols are allowed.', 'error');
            this.commandInput.value = '';
            return;
        }

        // Rate limiting check (prevent spam)
        const now = Date.now();
        if (this.lastCommandTime && (now - this.lastCommandTime) < 100) {
            this.addOutputLine('Please wait before executing another command.', 'warning');
            return;
        }
        this.lastCommandTime = now;

        // Add to history (limit history size for memory protection)
        if (this.commandHistory.length > 100) {
            this.commandHistory.shift();
        }
        this.commandHistory.push(command);
        this.historyIndex = this.commandHistory.length;

        // Display command
        this.addCommandLine(command);

        // Parse and execute
        const [cmd, ...args] = command.toLowerCase().split(' ');
        this.processCommand(cmd, args);

        // Clear input
        this.commandInput.value = '';
        this.scrollToBottom();
    }

    addCommandLine(command) {
        // Sanitize the command to prevent XSS
        const sanitizedCommand = SecurityUtils.sanitizeHTML(command);
        const sanitizedPath = SecurityUtils.sanitizeHTML(this.currentPath);
        
        const commandDiv = document.createElement('div');
        commandDiv.className = 'terminal-line command-line';
        
        // Create elements safely
        const promptSpan = document.createElement('span');
        promptSpan.className = 'prompt';
        promptSpan.textContent = `guest@chaitanya:${sanitizedPath}$ `;
        
        const commandSpan = document.createElement('span');
        commandSpan.textContent = sanitizedCommand;
        
        commandDiv.appendChild(promptSpan);
        commandDiv.appendChild(commandSpan);
        this.commandHistoryDiv.appendChild(commandDiv);
    }

    addOutputLine(content, type = 'output') {
        const outputDiv = document.createElement('div');
        outputDiv.className = `terminal-line ${type}-line`;
        
        // Use safe HTML parsing for styled content
        const safeContent = SecurityUtils.createSafeHTML(content);
        outputDiv.innerHTML = safeContent;
        
        this.commandHistoryDiv.appendChild(outputDiv);
    }

    processCommand(cmd, args) {
        switch(cmd) {
            case 'help':
                this.showHelp();
                break;
            case 'about':
                this.showAbout();
                break;
            case 'whoami':
                this.showWhoami();
                break;
            case 'skills':
                this.showSkills();
                break;
            case 'projects':
                this.showProjects();
                break;
            case 'education':
                this.showEducation();
                break;
            case 'certifications':
                this.showCertifications();
                break;
            case 'contact':
                this.showContact();
                break;
            case 'experience':
                this.showExperience();
                break;
            case 'ls':
                this.listDirectory();
                break;
            case 'pwd':
                this.printWorkingDirectory();
                break;
            case 'cd':
                this.changeDirectory(args[0]);
                break;
            case 'cat':
                this.displayFile(args[0]);
                break;
            case 'clear':
                this.clearTerminal();
                break;
            case 'date':
                this.showDate();
                break;
            case 'echo':
                this.echo(args.join(' '));
                break;
            case 'history':
                this.showHistory();
                break;
            case 'matrix':
                this.startMatrixAnimation();
                break;
            case 'hack':
                this.hackingSimulation();
                break;
            case 'social':
                this.showSocial();
                break;
            case 'resume':
                this.downloadResume();
                break;
            case 'theme':
                this.changeTheme(args[0]);
                break;
            default:
                this.addOutputLine(`Command not found: ${cmd}. Type 'help' for available commands.`, 'error');
        }
    }

    showHelp() {
        let helpText = `<div style="color: #00aaff; font-weight: bold; margin-bottom: 15px;">Available Commands:</div>`;
        
        Object.entries(this.availableCommands).forEach(([cmd, desc]) => {
            helpText += `<div style="margin-bottom: 8px;">
                <span style="color: #00ff88; font-weight: bold;">${cmd.padEnd(15)}</span>
                <span style="color: #888;">${desc}</span>
            </div>`;
        });
        
        helpText += `<div style="color: #ffaa00; margin-top: 15px;">
            💡 Tips: Use Tab for auto-completion, ↑↓ arrows for command history
        </div>`;
        
        this.addOutputLine(helpText);
    }

    showAbout() {
        const aboutText = `
<div style="color: #00aaff; font-weight: bold; font-size: 16px; margin-bottom: 15px;">About Chaitanya</div>

<div style="color: #00ff88; margin-bottom: 10px;">
🛡️ Cybersecurity Professional & Ethical Hacker
</div>

<div style="color: #888; line-height: 1.6; margin-bottom: 15px;">
Passionate cybersecurity enthusiast with expertise in penetration testing, 
vulnerability assessment, and digital forensics. I specialize in identifying 
security vulnerabilities and developing robust defense mechanisms.
</div>

<div style="color: #ffaa00;">Key Interests:</div>
<div style="color: #888; margin-left: 20px;">
• Ethical Hacking & Penetration Testing<br>
• Web Application Security<br>
• Network Security & Incident Response<br>
• Malware Analysis & Reverse Engineering<br>
• Cloud Security & DevSecOps
</div>

<div style="color: #00aaff; margin-top: 15px;">
🎯 "Security is not a product, but a process" - Bruce Schneier
</div>`;
        
        this.addOutputLine(aboutText);
    }

    showWhoami() {
        const userInfo = `
<div style="color: #00aaff; font-weight: bold; font-size: 16px; margin-bottom: 15px;">About the 'whoami' Command</div>

<div style="color: #00ff88; margin-bottom: 15px;">
📋 Portfolio Guest User Information:
</div>

<div style="color: #888; line-height: 1.6; margin-bottom: 15px;">
<strong style="color: #ffaa00;">Current Context:</strong> Interactive Portfolio Terminal<br>
<strong style="color: #ffaa00;">User Level:</strong> Guest/Visitor<br>
<strong style="color: #ffaa00;">Environment:</strong> Web-based Demo<br>
<strong style="color: #ffaa00;">Purpose:</strong> Educational Portfolio Showcase
</div>

<div style="color: #00aaff; font-weight: bold; margin-bottom: 10px;">🛡️ Cybersecurity Note:</div>
<div style="color: #888; margin-bottom: 15px;">
The 'whoami' command in real systems reveals the current user identity. 
In cybersecurity contexts, this is often used during:
<br>• Reconnaissance phases of security assessments
<br>• Privilege escalation verification
<br>• System access validation
</div>

<div style="color: #ff6b6b; margin-top: 15px;">
⚠️ This is a simulated environment for educational purposes only.
</div>`;
        this.addOutputLine(userInfo);
    }

    showSkills() {
        const skillsText = `
<div style="color: #00aaff; font-weight: bold; font-size: 16px; margin-bottom: 15px;">Technical Skills</div>

<div class="skill-grid">
    <div class="skill-item">
        <div style="color: #ff6b6b; font-weight: bold;">🛡️ Cybersecurity</div>
        <div style="color: #888; font-size: 12px;">Penetration Testing, VAPT, Incident Response</div>
    </div>
    <div class="skill-item">
        <div style="color: #4ecdc4; font-weight: bold;">🔍 Digital Forensics</div>
        <div style="color: #888; font-size: 12px;">Malware Analysis, Memory Forensics</div>
    </div>
    <div class="skill-item">
        <div style="color: #45b7d1; font-weight: bold;">🌐 Web Security</div>
        <div style="color: #888; font-size: 12px;">OWASP Top 10, Burp Suite, DVWA</div>
    </div>
    <div class="skill-item">
        <div style="color: #f39c12; font-weight: bold;">🐧 Linux/Unix</div>
        <div style="color: #888; font-size: 12px;">System Administration, Shell Scripting</div>
    </div>
    <div class="skill-item">
        <div style="color: #e74c3c; font-weight: bold;">🐍 Python</div>
        <div style="color: #888; font-size: 12px;">Security Tools, Automation Scripts</div>
    </div>
    <div class="skill-item">
        <div style="color: #9b59b6; font-weight: bold;">🔧 Security Tools</div>
        <div style="color: #888; font-size: 12px;">Nmap, Metasploit, Wireshark, Nessus</div>
    </div>
</div>

<div style="color: #ffaa00; margin-top: 20px;">
⚡ Currently learning: Advanced Malware Analysis & Cloud Security
</div>`;
        
        this.addOutputLine(skillsText);
    }

    showProjects() {
        const projectsText = `
<div style="color: #00aaff; font-weight: bold; font-size: 16px; margin-bottom: 15px;">Featured Projects</div>

<div class="project-card">
    <div class="project-title">🛡️ Network Vulnerability Scanner</div>
    <div style="color: #888; margin: 10px 0;">
        Automated network security assessment tool built with Python. 
        Performs comprehensive vulnerability scans and generates detailed reports.
    </div>
    <div class="project-tech">Tech: Python, Nmap, Socket Programming, Threading</div>
</div>

<div class="project-card">
    <div class="project-title">🔍 Web Application Security Analyzer</div>
    <div style="color: #888; margin: 10px 0;">
        OWASP-compliant security testing framework for web applications. 
        Detects common vulnerabilities like SQLi, XSS, and CSRF.
    </div>
    <div class="project-tech">Tech: Python, BeautifulSoup, Requests, Selenium</div>
</div>

<div class="project-card">
    <div class="project-title">🕵️ Digital Forensics Toolkit</div>
    <div style="color: #888; margin: 10px 0;">
        Collection of forensic analysis tools for incident response. 
        Includes memory dump analysis and file carving capabilities.
    </div>
    <div class="project-tech">Tech: Python, Volatility, Autopsy, Hex Analysis</div>
</div>

<div class="project-card">
    <div class="project-title">⚡ Cybersecurity Dashboard</div>
    <div style="color: #888; margin: 10px 0;">
        Real-time security monitoring dashboard with threat intelligence feeds. 
        Visualizes security metrics and alerts.
    </div>
    <div class="project-tech">Tech: React, D3.js, Node.js, Socket.io, APIs</div>
</div>

<div style="color: #00ff88; margin-top: 15px;">
📂 Use 'ls projects/' to explore project directories
</div>`;
        
        this.addOutputLine(projectsText);
    }

    showEducation() {
        const educationText = `
<div style="color: #00aaff; font-weight: bold; font-size: 16px; margin-bottom: 15px;">Educational Background</div>

<div style="color: #00ff88; font-weight: bold; margin-bottom: 10px;">
🎓 Bachelor's in Computer Science & Engineering
</div>
<div style="color: #888; margin-bottom: 15px;">
Specialization in Cybersecurity & Information Assurance<br>
Relevant Coursework: Network Security, Cryptography, Digital Forensics, Ethical Hacking
</div>

<div style="color: #ffaa00; font-weight: bold; margin-bottom: 10px;">
📚 Additional Training & Courses:
</div>
<div style="color: #888; margin-left: 20px;">
• CEH (Certified Ethical Hacker) Preparation<br>
• OSCP (Offensive Security Certified Professional)<br>
• CompTIA Security+ Training<br>
• SANS GIAC Security Essentials<br>
• Advanced Penetration Testing Bootcamp
</div>`;
        
        this.addOutputLine(educationText);
    }

    showCertifications() {
        const certificationsText = `
<div style="color: #00aaff; font-weight: bold; font-size: 16px; margin-bottom: 15px;">Certifications & Achievements</div>

<div style="background: linear-gradient(45deg, #ff6b6b, #4ecdc4); padding: 15px; border-radius: 8px; margin: 10px 0;">
    <div style="color: #fff; font-weight: bold;">🏆 Certified Ethical Hacker (CEH)</div>
    <div style="color: #fff; opacity: 0.9; font-size: 12px;">EC-Council • Valid until 2026</div>
</div>

<div style="background: linear-gradient(45deg, #45b7d1, #f39c12); padding: 15px; border-radius: 8px; margin: 10px 0;">
    <div style="color: #fff; font-weight: bold;">🛡️ CompTIA Security+</div>
    <div style="color: #fff; opacity: 0.9; font-size: 12px;">CompTIA • Valid until 2025</div>
</div>

<div style="background: linear-gradient(45deg, #e74c3c, #9b59b6); padding: 15px; border-radius: 8px; margin: 10px 0;">
    <div style="color: #fff; font-weight: bold;">🔍 GCIH (GIAC Certified Incident Handler)</div>
    <div style="color: #fff; opacity: 0.9; font-size: 12px;">SANS/GIAC • In Progress</div>
</div>

<div style="color: #00ff88; margin-top: 20px;">
🎯 Currently pursuing: OSCP (Offensive Security Certified Professional)
</div>`;
        
        this.addOutputLine(certificationsText);
    }

    showContact() {
        const contactText = `
<div style="color: #00aaff; font-weight: bold; font-size: 16px; margin-bottom: 15px;">Contact Information</div>

<div style="background: rgba(0, 255, 136, 0.1); padding: 20px; border-radius: 8px; border: 1px solid rgba(0, 255, 136, 0.3);">
    <div style="color: #00ff88; margin-bottom: 10px;">
        📧 <strong>Email:</strong> <a href="mailto:chaitanya@cybersec.dev" style="color: #00aaff;">chaitanya@cybersec.dev</a>
    </div>
    
    <div style="color: #00ff88; margin-bottom: 10px;">
        💼 <strong>LinkedIn:</strong> <a href="https://linkedin.com/in/chaitanya-cybersec" style="color: #00aaff;">/in/chaitanya-cybersec</a>
    </div>
    
    <div style="color: #00ff88; margin-bottom: 10px;">
        🐙 <strong>GitHub:</strong> <a href="https://github.com/Chaitanyx" style="color: #00aaff;">github.com/Chaitanyx</a>
    </div>
    
    <div style="color: #00ff88; margin-bottom: 10px;">
        🐦 <strong>Twitter:</strong> <a href="https://twitter.com/ChaitanyaCyber" style="color: #00aaff;">@ChaitanyaCyber</a>
    </div>
    
    <div style="color: #00ff88;">
        🌐 <strong>Website:</strong> <a href="https://chaitanyx.github.io" style="color: #00aaff;">chaitanyx.github.io</a>
    </div>
</div>

<div style="color: #ffaa00; margin-top: 15px;">
💬 Feel free to reach out for cybersecurity collaborations or discussions!
</div>`;
        
        this.addOutputLine(contactText);
    }

    showExperience() {
        const experienceText = `
<div style="color: #00aaff; font-weight: bold; font-size: 16px; margin-bottom: 15px;">Professional Experience</div>

<div style="border-left: 3px solid #00ff88; padding-left: 15px; margin-bottom: 20px;">
    <div style="color: #00ff88; font-weight: bold;">Junior Cybersecurity Analyst</div>
    <div style="color: #ffaa00;">SecureNet Solutions • 2023 - Present</div>
    <div style="color: #888; margin-top: 8px;">
        • Conduct vulnerability assessments and penetration testing<br>
        • Analyze security incidents and provide incident response<br>
        • Develop and maintain security documentation<br>
        • Monitor security tools and investigate alerts
    </div>
</div>

<div style="border-left: 3px solid #00aaff; padding-left: 15px; margin-bottom: 20px;">
    <div style="color: #00aaff; font-weight: bold;">Security Intern</div>
    <div style="color: #ffaa00;">CyberDefense Corp • 2022 - 2023</div>
    <div style="color: #888; margin-top: 8px;">
        • Assisted in network security assessments<br>
        • Performed web application security testing<br>
        • Created security awareness training materials<br>
        • Supported SOC operations and threat hunting
    </div>
</div>

<div style="color: #00ff88; margin-top: 20px;">
🚀 Looking for new opportunities in advanced threat hunting and red team operations!
</div>`;
        
        this.addOutputLine(experienceText);
    }

    listDirectory() {
        const currentDir = this.fileSystem[this.currentPath.replace('~', '').replace('/', '') || '~'];
        if (currentDir && currentDir.type === 'directory') {
            let output = '<div style="color: #00aaff; margin-bottom: 10px;">Directory contents:</div>';
            currentDir.contents.forEach(item => {
                const isDir = item.endsWith('/');
                const color = isDir ? '#00ff88' : '#ffaa00';
                const icon = isDir ? '📁' : '📄';
                output += `<div style="color: ${color};">${icon} ${item}</div>`;
            });
            this.addOutputLine(output);
        } else {
            this.addOutputLine('Not a directory', 'error');
        }
    }

    printWorkingDirectory() {
        this.addOutputLine(`<span style="color: #00ff88;">${this.currentPath}</span>`);
    }

    changeDirectory(dir) {
        if (!dir || dir === '~') {
            this.currentPath = '~';
            this.addOutputLine('Changed to home directory');
        } else {
            this.addOutputLine(`Directory change not implemented for: ${dir}`, 'warning');
        }
    }

    displayFile(filename) {
        const files = {
            'about.txt': 'Cybersecurity professional passionate about ethical hacking and digital security.',
            'skills.txt': 'Penetration Testing, Network Security, Python Programming, Linux Administration',
            'contact.txt': 'Email: chaitanya@cybersec.dev\nGitHub: github.com/Chaitanyx',
            'resume.pdf': 'Binary file - use "resume" command to download'
        };
        
        if (files[filename]) {
            this.addOutputLine(`<pre style="color: #00ff88;">${files[filename]}</pre>`);
        } else {
            this.addOutputLine(`File not found: ${filename}`, 'error');
        }
    }

    clearTerminal() {
        this.commandHistoryDiv.innerHTML = '';
    }

    showDate() {
        const now = new Date();
        this.addOutputLine(`<span style="color: #00ff88;">${now.toString()}</span>`);
    }

    echo(message) {
        this.addOutputLine(`<span style="color: #00ff88;">${message}</span>`);
    }

    showHistory() {
        if (this.commandHistory.length === 0) {
            this.addOutputLine('No command history');
            return;
        }
        
        let output = '<div style="color: #00aaff; margin-bottom: 10px;">Command History:</div>';
        this.commandHistory.forEach((cmd, index) => {
            output += `<div style="color: #888;">${(index + 1).toString().padStart(3)} ${cmd}</div>`;
        });
        this.addOutputLine(output);
    }

    startMatrixAnimation() {
        this.addOutputLine('<div style="color: #00ff88;">Initiating Matrix Protocol...</div>');
        // Add more intense matrix background
        this.addOutputLine('<div style="color: #00aaff;">Wake up, Neo... 🔴💊</div>');
    }

    hackingSimulation() {
        this.addOutputLine('<div style="color: #00aaff; font-weight: bold; font-size: 16px; margin-bottom: 15px;">�️ Ethical Hacking Information</div>');
        
        const ethicalHackingInfo = `
<div style="color: #00ff88; margin-bottom: 15px;">
<strong>What is Ethical Hacking?</strong>
</div>

<div style="color: #888; line-height: 1.8; margin-bottom: 20px;">
Ethical hacking, also known as penetration testing or white-hat hacking, 
is the practice of intentionally probing systems for vulnerabilities with 
the explicit permission of the system owner to improve security.
</div>

<div style="color: #ffaa00; font-weight: bold; margin-bottom: 10px;">📋 Ethical Hacking Methodology:</div>
<div style="color: #888; margin-left: 20px; margin-bottom: 15px;">
<strong style="color: #00aaff;">1. Reconnaissance:</strong> Information gathering about the target<br>
<strong style="color: #00aaff;">2. Scanning:</strong> Identifying live systems and open ports<br>
<strong style="color: #00aaff;">3. Enumeration:</strong> Extracting information from identified services<br>
<strong style="color: #00aaff;">4. Vulnerability Assessment:</strong> Identifying security weaknesses<br>
<strong style="color: #00aaff;">5. Exploitation:</strong> Safely demonstrating vulnerabilities<br>
<strong style="color: #00aaff;">6. Reporting:</strong> Documenting findings and recommendations
</div>

<div style="color: #ffaa00; font-weight: bold; margin-bottom: 10px;">🎯 Common Tools Used:</div>
<div style="color: #888; margin-left: 20px; margin-bottom: 15px;">
• <strong style="color: #00ff88;">Nmap:</strong> Network discovery and port scanning<br>
• <strong style="color: #00ff88;">Burp Suite:</strong> Web application security testing<br>
• <strong style="color: #00ff88;">Metasploit:</strong> Penetration testing framework<br>
• <strong style="color: #00ff88;">Wireshark:</strong> Network protocol analyzer<br>
• <strong style="color: #00ff88;">OWASP ZAP:</strong> Web application scanner
</div>

<div style="color: #ff6b6b; font-weight: bold; margin-bottom: 10px;">⚖️ Legal and Ethical Considerations:</div>
<div style="color: #888; margin-left: 20px; margin-bottom: 15px;">
• Always obtain written permission before testing<br>
• Follow responsible disclosure practices<br>
• Respect data privacy and confidentiality<br>
• Document all activities thoroughly<br>
• Never cause harm or disruption to systems
</div>

<div style="color: #00aaff; margin-top: 20px;">
💡 <strong>Remember:</strong> The goal is to strengthen security, not exploit it maliciously.
</div>`;
        
        this.addOutputLine(ethicalHackingInfo);
    }

    showSocial() {
        const socialText = `
<div style="color: #00aaff; font-weight: bold; font-size: 16px; margin-bottom: 15px;">Social Media & Online Presence</div>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
    <div style="background: rgba(0, 170, 255, 0.1); border: 1px solid rgba(0, 170, 255, 0.3); border-radius: 8px; padding: 15px;">
        <div style="color: #00aaff; font-weight: bold;">🐙 GitHub</div>
        <div style="color: #888; font-size: 12px;">Open source projects & security tools</div>
        <div style="color: #00ff88; margin-top: 5px;">github.com/Chaitanyx</div>
    </div>
    
    <div style="background: rgba(0, 255, 136, 0.1); border: 1px solid rgba(0, 255, 136, 0.3); border-radius: 8px; padding: 15px;">
        <div style="color: #00ff88; font-weight: bold;">💼 LinkedIn</div>
        <div style="color: #888; font-size: 12px;">Professional network & career updates</div>
        <div style="color: #00aaff; margin-top: 5px;">/in/chaitanya-cybersec</div>
    </div>
    
    <div style="background: rgba(255, 170, 0, 0.1); border: 1px solid rgba(255, 170, 0, 0.3); border-radius: 8px; padding: 15px;">
        <div style="color: #ffaa00; font-weight: bold;">🐦 Twitter</div>
        <div style="color: #888; font-size: 12px;">Cybersecurity insights & news</div>
        <div style="color: #00ff88; margin-top: 5px;">@ChaitanyaCyber</div>
    </div>
</div>`;
        
        this.addOutputLine(socialText);
    }

    downloadResume() {
        this.addOutputLine('<div style="color: #00ff88;">📄 Initiating resume download...</div>');
        this.addOutputLine('<div style="color: #ffaa00;">⚠️ Feature not implemented in demo version</div>');
        this.addOutputLine('<div style="color: #888;">Contact me directly for resume: chaitanya@cybersec.dev</div>');
    }

    changeTheme(theme) {
        this.addOutputLine('<div style="color: #ffaa00;">🎨 Theme customization coming soon!</div>');
        this.addOutputLine('<div style="color: #888;">Available themes: matrix, cyberpunk, classic, hacker</div>');
    }

    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        if (direction === 'up') {
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.commandInput.value = this.commandHistory[this.historyIndex];
            }
        } else if (direction === 'down') {
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                this.commandInput.value = this.commandHistory[this.historyIndex];
            } else {
                this.historyIndex = this.commandHistory.length;
                this.commandInput.value = '';
            }
        }
    }

    autoComplete() {
        const input = this.commandInput.value.toLowerCase();
        const matches = Object.keys(this.availableCommands).filter(cmd => 
            cmd.startsWith(input)
        );
        
        if (matches.length === 1) {
            this.commandInput.value = matches[0] + ' ';
        } else if (matches.length > 1) {
            // Safe completion display
            const completions = matches.map(match => SecurityUtils.sanitizeHTML(match)).join(', ');
            this.addOutputLine(`<div style="color: #ffaa00;">Possible completions: ${completions}</div>`);
        }
    }

    showSuggestions() {
        const input = this.commandInput.value.toLowerCase();
        if (input.length < 2) return;
        
        const matches = Object.keys(this.availableCommands).filter(cmd => 
            cmd.includes(input)
        );
        
        // This would show a suggestions dropdown in a full implementation
    }

    scrollToBottom() {
        const terminalBody = document.querySelector('.terminal-body');
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    startMatrixBackground() {
        // Create matrix background effect
        const matrixContainer = document.createElement('div');
        matrixContainer.className = 'matrix-bg';
        document.body.appendChild(matrixContainer);
        
        const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        
        for (let i = 0; i < 50; i++) {
            const column = document.createElement('div');
            column.className = 'matrix-column';
            column.style.left = Math.random() * 100 + '%';
            column.style.animationDelay = Math.random() * 10 + 's';
            column.style.animationDuration = (Math.random() * 10 + 10) + 's';
            
            // Safe text creation without innerHTML
            for (let j = 0; j < 20; j++) {
                const charSpan = document.createElement('span');
                charSpan.textContent = characters[Math.floor(Math.random() * characters.length)];
                column.appendChild(charSpan);
                if (j < 19) {
                    column.appendChild(document.createElement('br'));
                }
            }
            
            matrixContainer.appendChild(column);
        }
    }
}

// Initialize terminal when page loads
document.addEventListener('DOMContentLoaded', () => {
    new InteractiveTerminal();
});