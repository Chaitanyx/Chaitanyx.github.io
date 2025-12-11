// Security Assessment Module
class SecurityAssessment {
    constructor() {
        this.vulnerabilities = [];
        this.securityHeaders = {};
        this.cookieAnalysis = {};
        this.securityUtils = new SecurityUtils();
    }

    async runComprehensiveAssessment() {
        try {
            await this.checkSecurityHeaders();
            await this.analyzeCookies();
            await this.scanVulnerabilities();
            await this.checkBrowserSecurity();
            await this.assessNetworkSecurity();
            
            this.displayResults();
        } catch (error) {
            console.error('Security assessment failed:', error);
        }
    }

    async checkSecurityHeaders() {
        try {
            // Simulate checking common security headers
            const expectedHeaders = [
                'Content-Security-Policy',
                'X-Content-Type-Options',
                'X-Frame-Options',
                'X-XSS-Protection',
                'Strict-Transport-Security',
                'Referrer-Policy',
                'Permissions-Policy',
                'Cross-Origin-Embedder-Policy',
                'Cross-Origin-Opener-Policy',
                'Cross-Origin-Resource-Policy'
            ];

            const headerStatus = {};
            
            // Check CSP
            const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
            headerStatus['Content-Security-Policy'] = {
                present: !!metaCSP,
                value: metaCSP ? metaCSP.content : 'Not set',
                status: metaCSP ? 'PASS' : 'FAIL',
                recommendation: metaCSP ? 'CSP is configured' : 'Implement Content Security Policy'
            };

            // Check X-Frame-Options
            const metaFrameOptions = document.querySelector('meta[http-equiv="X-Frame-Options"]');
            headerStatus['X-Frame-Options'] = {
                present: !!metaFrameOptions,
                value: metaFrameOptions ? metaFrameOptions.content : 'Not set',
                status: metaFrameOptions ? 'PASS' : 'WARN',
                recommendation: metaFrameOptions ? 'Frame options configured' : 'Consider setting X-Frame-Options to DENY or SAMEORIGIN'
            };

            // Check X-Content-Type-Options
            headerStatus['X-Content-Type-Options'] = {
                present: false,
                value: 'Not set',
                status: 'WARN',
                recommendation: 'Set X-Content-Type-Options: nosniff to prevent MIME type sniffing'
            };

            // Check XSS Protection
            const metaXSS = document.querySelector('meta[http-equiv="X-XSS-Protection"]');
            headerStatus['X-XSS-Protection'] = {
                present: !!metaXSS,
                value: metaXSS ? metaXSS.content : 'Not set',
                status: metaXSS ? 'PASS' : 'WARN',
                recommendation: metaXSS ? 'XSS protection enabled' : 'Enable XSS protection with X-XSS-Protection: 1; mode=block'
            };

            // Check HTTPS
            headerStatus['HTTPS'] = {
                present: location.protocol === 'https:',
                value: location.protocol,
                status: location.protocol === 'https:' ? 'PASS' : 'FAIL',
                recommendation: location.protocol === 'https:' ? 'Site uses HTTPS' : 'Use HTTPS to encrypt data in transit'
            };

            // Check Referrer Policy
            const metaReferrer = document.querySelector('meta[name="referrer"]');
            headerStatus['Referrer-Policy'] = {
                present: !!metaReferrer,
                value: metaReferrer ? metaReferrer.content : 'Not set',
                status: metaReferrer ? 'PASS' : 'INFO',
                recommendation: metaReferrer ? 'Referrer policy configured' : 'Consider setting a referrer policy for privacy'
            };

            this.securityHeaders = headerStatus;
            
        } catch (error) {
            console.error('Security headers check failed:', error);
        }
    }

    async analyzeCookies() {
        try {
            const cookies = document.cookie.split(';').filter(cookie => cookie.trim() !== '');
            const cookieAnalysis = {
                totalCookies: cookies.length,
                secureCookies: 0,
                httpOnlyCookies: 0,
                sameSiteCookies: 0,
                sessionCookies: 0,
                persistentCookies: 0,
                vulnerabilities: [],
                details: []
            };

            if (cookies.length === 0) {
                cookieAnalysis.status = 'NO_COOKIES';
                cookieAnalysis.message = 'No cookies found on this domain';
            } else {
                cookies.forEach((cookie, index) => {
                    const [nameValue, ...attributes] = cookie.trim().split(';');
                    const [name, value] = nameValue.split('=');
                    
                    const cookieData = {
                        name: name?.trim() || `cookie_${index}`,
                        value: value?.trim() || '',
                        attributes: attributes.map(attr => attr.trim()),
                        secure: false,
                        httpOnly: false,
                        sameSite: 'none',
                        maxAge: null,
                        expires: null
                    };

                    // Analyze attributes
                    attributes.forEach(attr => {
                        const lowerAttr = attr.toLowerCase();
                        if (lowerAttr === 'secure') {
                            cookieData.secure = true;
                            cookieAnalysis.secureCookies++;
                        } else if (lowerAttr === 'httponly') {
                            cookieData.httpOnly = true;
                            cookieAnalysis.httpOnlyCookies++;
                        } else if (lowerAttr.startsWith('samesite=')) {
                            cookieData.sameSite = lowerAttr.split('=')[1];
                            cookieAnalysis.sameSiteCookies++;
                        } else if (lowerAttr.startsWith('max-age=')) {
                            cookieData.maxAge = lowerAttr.split('=')[1];
                            cookieAnalysis.persistentCookies++;
                        } else if (lowerAttr.startsWith('expires=')) {
                            cookieData.expires = lowerAttr.split('=')[1];
                            cookieAnalysis.persistentCookies++;
                        }
                    });

                    if (!cookieData.maxAge && !cookieData.expires) {
                        cookieAnalysis.sessionCookies++;
                    }

                    // Check for vulnerabilities
                    if (!cookieData.secure && location.protocol === 'https:') {
                        cookieAnalysis.vulnerabilities.push(`Cookie '${cookieData.name}' not marked as Secure`);
                    }
                    
                    if (!cookieData.httpOnly) {
                        cookieAnalysis.vulnerabilities.push(`Cookie '${cookieData.name}' not marked as HttpOnly`);
                    }
                    
                    if (cookieData.sameSite === 'none' && !cookieData.secure) {
                        cookieAnalysis.vulnerabilities.push(`Cookie '${cookieData.name}' with SameSite=None must be Secure`);
                    }

                    cookieAnalysis.details.push(cookieData);
                });
            }

            this.cookieAnalysis = cookieAnalysis;
            
        } catch (error) {
            console.error('Cookie analysis failed:', error);
        }
    }

    async scanVulnerabilities() {
        try {
            const vulnerabilities = [];

            // Check for common XSS vulnerabilities
            const xssChecks = await this.checkXSSVulnerabilities();
            vulnerabilities.push(...xssChecks);

            // Check for CSRF vulnerabilities
            const csrfChecks = await this.checkCSRFVulnerabilities();
            vulnerabilities.push(...csrfChecks);

            // Check for clickjacking vulnerabilities
            const clickjackingChecks = await this.checkClickjackingVulnerabilities();
            vulnerabilities.push(...clickjackingChecks);

            // Check for insecure references
            const insecureRefChecks = await this.checkInsecureReferences();
            vulnerabilities.push(...insecureRefChecks);

            // Check for information disclosure
            const infoDisclosureChecks = await this.checkInformationDisclosure();
            vulnerabilities.push(...infoDisclosureChecks);

            // Check for weak cryptography
            const cryptoChecks = await this.checkCryptographicImplementation();
            vulnerabilities.push(...cryptoChecks);

            this.vulnerabilities = vulnerabilities;
            
        } catch (error) {
            console.error('Vulnerability scan failed:', error);
        }
    }

    async checkXSSVulnerabilities() {
        const vulnerabilities = [];

        // Check for inline event handlers
        const elementsWithEvents = document.querySelectorAll('[onclick], [onload], [onerror], [onmouseover]');
        if (elementsWithEvents.length > 0) {
            vulnerabilities.push({
                type: 'XSS',
                severity: 'HIGH',
                title: 'Inline Event Handlers Detected',
                description: `Found ${elementsWithEvents.length} elements with inline event handlers`,
                recommendation: 'Remove inline event handlers and use addEventListener instead',
                elements: Array.from(elementsWithEvents).slice(0, 5).map(el => el.outerHTML.substring(0, 100))
            });
        }

        // Check for potential script injection points
        const userInputs = document.querySelectorAll('input[type="text"], input[type="search"], textarea');
        userInputs.forEach((input, index) => {
            if (!input.hasAttribute('data-sanitized')) {
                vulnerabilities.push({
                    type: 'XSS',
                    severity: 'MEDIUM',
                    title: 'Unsanitized Input Field',
                    description: `Input field #${index + 1} may be vulnerable to XSS`,
                    recommendation: 'Implement proper input sanitization and validation',
                    element: input.outerHTML.substring(0, 100)
                });
            }
        });

        // Check CSP effectiveness
        const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (metaCSP) {
            const cspContent = metaCSP.content;
            if (cspContent.includes("'unsafe-inline'")) {
                vulnerabilities.push({
                    type: 'XSS',
                    severity: 'MEDIUM',
                    title: 'Weak Content Security Policy',
                    description: 'CSP allows unsafe-inline which reduces XSS protection',
                    recommendation: 'Remove unsafe-inline and use nonces or hashes for inline scripts',
                    details: cspContent
                });
            }
        }

        return vulnerabilities;
    }

    async checkCSRFVulnerabilities() {
        const vulnerabilities = [];

        // Check for forms without CSRF protection
        const forms = document.querySelectorAll('form');
        forms.forEach((form, index) => {
            const hasCSRFToken = form.querySelector('input[name*="csrf"], input[name*="token"], input[name="_token"]');
            if (!hasCSRFToken && (form.method.toLowerCase() === 'post' || !form.method)) {
                vulnerabilities.push({
                    type: 'CSRF',
                    severity: 'MEDIUM',
                    title: 'Missing CSRF Protection',
                    description: `Form #${index + 1} lacks CSRF token protection`,
                    recommendation: 'Add CSRF tokens to all state-changing forms',
                    element: form.outerHTML.substring(0, 100)
                });
            }
        });

        // Check SameSite cookie attributes
        if (this.cookieAnalysis.vulnerabilities) {
            this.cookieAnalysis.vulnerabilities.forEach(vuln => {
                if (vuln.includes('SameSite')) {
                    vulnerabilities.push({
                        type: 'CSRF',
                        severity: 'LOW',
                        title: 'Weak SameSite Cookie Configuration',
                        description: vuln,
                        recommendation: 'Set SameSite=Strict or SameSite=Lax for session cookies'
                    });
                }
            });
        }

        return vulnerabilities;
    }

    async checkClickjackingVulnerabilities() {
        const vulnerabilities = [];

        // Check X-Frame-Options
        const frameOptions = document.querySelector('meta[http-equiv="X-Frame-Options"]');
        if (!frameOptions) {
            vulnerabilities.push({
                type: 'CLICKJACKING',
                severity: 'MEDIUM',
                title: 'Missing X-Frame-Options Header',
                description: 'Page can be embedded in frames, potentially allowing clickjacking attacks',
                recommendation: 'Set X-Frame-Options to DENY or SAMEORIGIN'
            });
        }

        // Check CSP frame-ancestors
        const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (csp && !csp.content.includes('frame-ancestors')) {
            vulnerabilities.push({
                type: 'CLICKJACKING',
                severity: 'LOW',
                title: 'Missing CSP frame-ancestors Directive',
                description: 'CSP does not include frame-ancestors directive',
                recommendation: 'Add frame-ancestors directive to CSP for additional clickjacking protection'
            });
        }

        return vulnerabilities;
    }

    async checkInsecureReferences() {
        const vulnerabilities = [];

        // Check for HTTP resources on HTTPS pages
        if (location.protocol === 'https:') {
            const httpResources = document.querySelectorAll('[src^="http://"], [href^="http://"]');
            if (httpResources.length > 0) {
                vulnerabilities.push({
                    type: 'MIXED_CONTENT',
                    severity: 'HIGH',
                    title: 'Mixed Content Detected',
                    description: `Found ${httpResources.length} HTTP resources on HTTPS page`,
                    recommendation: 'Use HTTPS for all resources or use protocol-relative URLs',
                    resources: Array.from(httpResources).slice(0, 5).map(el => el.src || el.href)
                });
            }
        }

        // Check for external script sources
        const externalScripts = document.querySelectorAll('script[src]:not([src^="/"])');
        if (externalScripts.length > 0) {
            vulnerabilities.push({
                type: 'EXTERNAL_RESOURCES',
                severity: 'MEDIUM',
                title: 'External JavaScript Sources',
                description: `Found ${externalScripts.length} external script sources`,
                recommendation: 'Verify all external scripts are from trusted sources and consider using SRI',
                scripts: Array.from(externalScripts).slice(0, 5).map(script => script.src)
            });
        }

        // Check for missing Subresource Integrity
        const scriptsWithoutSRI = document.querySelectorAll('script[src]:not([integrity])');
        if (scriptsWithoutSRI.length > 0) {
            vulnerabilities.push({
                type: 'INTEGRITY',
                severity: 'LOW',
                title: 'Missing Subresource Integrity',
                description: `${scriptsWithoutSRI.length} external scripts lack integrity checks`,
                recommendation: 'Add integrity attributes to external script and link tags',
                scripts: Array.from(scriptsWithoutSRI).slice(0, 3).map(script => script.src)
            });
        }

        return vulnerabilities;
    }

    async checkInformationDisclosure() {
        const vulnerabilities = [];

        // Check for debug information
        const debugElements = document.querySelectorAll('[data-debug], .debug, #debug');
        if (debugElements.length > 0) {
            vulnerabilities.push({
                type: 'INFO_DISCLOSURE',
                severity: 'LOW',
                title: 'Debug Information Exposed',
                description: 'Debug elements found in production code',
                recommendation: 'Remove debug information from production builds'
            });
        }

        // Check for comments with sensitive information
        const walker = document.createTreeWalker(
            document.documentElement,
            NodeFilter.SHOW_COMMENT,
            null,
            false
        );

        const sensitiveComments = [];
        let comment;
        while (comment = walker.nextNode()) {
            const commentText = comment.textContent.toLowerCase();
            if (commentText.includes('password') || 
                commentText.includes('secret') || 
                commentText.includes('key') || 
                commentText.includes('token') ||
                commentText.includes('api')) {
                sensitiveComments.push(comment.textContent.substring(0, 100));
            }
        }

        if (sensitiveComments.length > 0) {
            vulnerabilities.push({
                type: 'INFO_DISCLOSURE',
                severity: 'MEDIUM',
                title: 'Sensitive Information in Comments',
                description: 'HTML comments contain potentially sensitive information',
                recommendation: 'Remove sensitive information from HTML comments',
                comments: sensitiveComments.slice(0, 3)
            });
        }

        // Check for autocomplete on sensitive fields
        const sensitiveInputs = document.querySelectorAll('input[type="password"], input[name*="credit"], input[name*="ssn"]');
        sensitiveInputs.forEach(input => {
            if (input.getAttribute('autocomplete') !== 'off') {
                vulnerabilities.push({
                    type: 'INFO_DISCLOSURE',
                    severity: 'LOW',
                    title: 'Autocomplete Enabled on Sensitive Field',
                    description: `Sensitive input field has autocomplete enabled: ${input.name || input.id}`,
                    recommendation: 'Disable autocomplete on sensitive form fields'
                });
            }
        });

        return vulnerabilities;
    }

    async checkCryptographicImplementation() {
        const vulnerabilities = [];

        // Check for weak random number generation
        if (typeof Math.random === 'function') {
            vulnerabilities.push({
                type: 'WEAK_CRYPTO',
                severity: 'MEDIUM',
                title: 'Potentially Weak Random Number Generation',
                description: 'Math.random() may be used for security-sensitive operations',
                recommendation: 'Use crypto.getRandomValues() for cryptographically secure random numbers'
            });
        }

        // Check for insecure localStorage usage for sensitive data
        try {
            const storageKeys = Object.keys(localStorage);
            const sensitiveKeys = storageKeys.filter(key => 
                key.toLowerCase().includes('password') ||
                key.toLowerCase().includes('token') ||
                key.toLowerCase().includes('secret') ||
                key.toLowerCase().includes('key')
            );

            if (sensitiveKeys.length > 0) {
                vulnerabilities.push({
                    type: 'WEAK_CRYPTO',
                    severity: 'HIGH',
                    title: 'Sensitive Data in Local Storage',
                    description: 'Potentially sensitive data stored in localStorage',
                    recommendation: 'Avoid storing sensitive data in localStorage; use secure, httpOnly cookies instead',
                    keys: sensitiveKeys.slice(0, 3)
                });
            }
        } catch (error) {
            // localStorage access may be blocked
        }

        // Check for eval() usage
        const scriptTags = document.querySelectorAll('script');
        scriptTags.forEach(script => {
            if (script.textContent && script.textContent.includes('eval(')) {
                vulnerabilities.push({
                    type: 'WEAK_CRYPTO',
                    severity: 'HIGH',
                    title: 'Use of eval() Function',
                    description: 'Script contains eval() which can execute arbitrary code',
                    recommendation: 'Avoid using eval(); use JSON.parse() for JSON data or other safe alternatives'
                });
            }
        });

        return vulnerabilities;
    }

    async checkBrowserSecurity() {
        const browserSecurity = {
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack !== null,
            secureContext: window.isSecureContext,
            crossOriginIsolated: window.crossOriginIsolated || false,
            permissions: {}
        };

        // Check available APIs that could be security-relevant
        const securityAPIs = {
            'Crypto API': typeof window.crypto !== 'undefined',
            'SubtleCrypto': typeof window.crypto?.subtle !== 'undefined',
            'Permissions API': typeof navigator.permissions !== 'undefined',
            'Service Workers': 'serviceWorker' in navigator,
            'Web Workers': typeof Worker !== 'undefined',
            'SharedArrayBuffer': typeof SharedArrayBuffer !== 'undefined',
            'WebAssembly': typeof WebAssembly !== 'undefined'
        };

        return { browserSecurity, securityAPIs };
    }

    async assessNetworkSecurity() {
        const networkSecurity = {};

        // Check connection security
        if (navigator.connection) {
            networkSecurity.connection = {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            };
        }

        // Check for secure protocols
        networkSecurity.protocol = {
            isHTTPS: location.protocol === 'https:',
            hasHSTS: false, // Would need server header to determine
            supportsHTTP2: false // Would need network analysis to determine
        };

        return networkSecurity;
    }

    displayResults() {
        this.displayVulnerabilities();
        this.displaySecurityHeaders();
        this.displayCookieAnalysis();
    }

    displayVulnerabilities() {
        const vulnContainer = document.getElementById('vulnScan');
        if (!vulnContainer) return;

        let html = '';
        
        if (this.vulnerabilities.length === 0) {
            html = '<div class="data-item"><span class="data-value" style="color: #00ff00;">✅ No critical vulnerabilities detected</span></div>';
        } else {
            this.vulnerabilities.forEach(vuln => {
                const severityColor = {
                    'HIGH': '#ff4444',
                    'MEDIUM': '#ffa500',
                    'LOW': '#ffff00'
                }[vuln.severity] || '#888';

                html += `<div class="data-item">
                    <div style="color: ${severityColor}; font-weight: bold;">
                        ${vuln.severity}: ${this.securityUtils.sanitize(vuln.title)}
                    </div>
                    <div style="color: #ccc; font-size: 11px; margin-top: 5px;">
                        ${this.securityUtils.sanitize(vuln.description)}
                    </div>
                    <div style="color: #888; font-size: 10px; margin-top: 3px;">
                        💡 ${this.securityUtils.sanitize(vuln.recommendation)}
                    </div>
                </div>`;
            });
        }

        vulnContainer.innerHTML = html;
    }

    displaySecurityHeaders() {
        const headersContainer = document.getElementById('securityHeaders');
        if (!headersContainer) return;

        let html = '';
        
        for (const [header, data] of Object.entries(this.securityHeaders)) {
            const statusColor = {
                'PASS': '#00ff00',
                'WARN': '#ffa500',
                'FAIL': '#ff4444',
                'INFO': '#888'
            }[data.status] || '#888';

            html += `<div class="data-item">
                <span class="data-label">${this.securityUtils.sanitize(header)}:</span>
                <span class="data-value" style="color: ${statusColor};">
                    ${data.status} - ${this.securityUtils.sanitize(data.recommendation)}
                </span>
            </div>`;
        }

        headersContainer.innerHTML = html;
    }

    displayCookieAnalysis() {
        const cookieContainer = document.getElementById('cookieAnalysis');
        if (!cookieContainer) return;

        const analysis = this.cookieAnalysis;
        let html = '';

        if (analysis.totalCookies === 0) {
            html = '<div class="data-item"><span class="data-value">No cookies found</span></div>';
        } else {
            html += `<div class="data-item">
                <span class="data-label">Total Cookies:</span>
                <span class="data-value">${analysis.totalCookies}</span>
            </div>`;
            
            html += `<div class="data-item">
                <span class="data-label">Secure Cookies:</span>
                <span class="data-value" style="color: ${analysis.secureCookies > 0 ? '#00ff00' : '#ff4444'};">
                    ${analysis.secureCookies}/${analysis.totalCookies}
                </span>
            </div>`;
            
            html += `<div class="data-item">
                <span class="data-label">HttpOnly Cookies:</span>
                <span class="data-value" style="color: ${analysis.httpOnlyCookies > 0 ? '#00ff00' : '#ff4444'};">
                    ${analysis.httpOnlyCookies}/${analysis.totalCookies}
                </span>
            </div>`;

            if (analysis.vulnerabilities.length > 0) {
                html += `<div class="data-item">
                    <span class="data-label">Vulnerabilities:</span>
                    <span class="data-value" style="color: #ff4444;">
                        ${analysis.vulnerabilities.length} issues found
                    </span>
                </div>`;
            }
        }

        cookieContainer.innerHTML = html;
    }

    generateSecurityReport() {
        const report = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            securityHeaders: this.securityHeaders,
            vulnerabilities: this.vulnerabilities,
            cookieAnalysis: this.cookieAnalysis,
            summary: {
                totalVulnerabilities: this.vulnerabilities.length,
                criticalVulnerabilities: this.vulnerabilities.filter(v => v.severity === 'HIGH').length,
                securityScore: this.calculateSecurityScore()
            }
        };

        return report;
    }

    calculateSecurityScore() {
        let score = 100;
        
        // Deduct points for vulnerabilities
        this.vulnerabilities.forEach(vuln => {
            switch (vuln.severity) {
                case 'HIGH':
                    score -= 20;
                    break;
                case 'MEDIUM':
                    score -= 10;
                    break;
                case 'LOW':
                    score -= 5;
                    break;
            }
        });

        // Deduct points for missing security headers
        Object.values(this.securityHeaders).forEach(header => {
            if (header.status === 'FAIL') {
                score -= 10;
            } else if (header.status === 'WARN') {
                score -= 5;
            }
        });

        // Deduct points for cookie vulnerabilities
        if (this.cookieAnalysis.vulnerabilities) {
            score -= this.cookieAnalysis.vulnerabilities.length * 3;
        }

        return Math.max(0, score);
    }
}

// Initialize security assessment
if (typeof window !== 'undefined') {
    window.SecurityAssessment = SecurityAssessment;
}