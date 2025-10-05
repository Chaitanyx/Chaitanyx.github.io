// DNS Analyzer Module - Advanced DNS Resolution and Analysis
class DNSAnalyzer {
    constructor() {
        this.dnsServers = [
            'https://dns.google/resolve',
            'https://cloudflare-dns.com/dns-query',
            'https://dns.quad9.net/dns-query'
        ];
        this.recordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT', 'SOA'];
        this.analysisData = {};
    }

    async analyzeComplete(domain = 'chaitanyalade.me') {
        console.log(`🔍 Starting comprehensive DNS analysis for ${domain}`);
        
        const analysis = {
            domain: domain,
            timestamp: new Date().toISOString(),
            records: {},
            chain: [],
            security: {},
            performance: {},
            infrastructure: {}
        };

        try {
            // Analyze all record types
            for (const recordType of this.recordTypes) {
                analysis.records[recordType] = await this.queryRecord(domain, recordType);
                await this.delay(100); // Rate limiting
            }

            // Trace DNS resolution chain
            analysis.chain = await this.traceDNSChain(domain);

            // Analyze DNS security
            analysis.security = await this.analyzeDNSSecurity(domain);

            // Measure DNS performance
            analysis.performance = await this.measureDNSPerformance(domain);

            // Discover DNS infrastructure
            analysis.infrastructure = await this.discoverDNSInfrastructure(domain);

            this.analysisData = analysis;
            return analysis;

        } catch (error) {
            console.error('DNS analysis error:', error);
            return { error: error.message, partial: analysis };
        }
    }

    async queryRecord(domain, recordType, dnsServer = this.dnsServers[0]) {
        try {
            const url = `${dnsServer}?name=${domain}&type=${recordType}`;
            const headers = { 'Accept': 'application/dns-json' };
            
            const response = await fetch(url, { headers });
            const data = await response.json();

            return {
                type: recordType,
                status: data.Status,
                answers: data.Answer || [],
                authority: data.Authority || [],
                additional: data.Additional || [],
                queryTime: Date.now(),
                server: dnsServer
            };
        } catch (error) {
            return {
                type: recordType,
                error: error.message,
                server: dnsServer
            };
        }
    }

    async traceDNSChain(domain) {
        const chain = [];
        let currentDomain = domain;

        try {
            // Start from root servers
            chain.push({
                level: 0,
                name: 'Root Servers (.)',
                type: 'root',
                servers: ['198.41.0.4', '199.9.14.201', '192.33.4.12'],
                description: 'DNS root name servers'
            });

            // Get TLD servers
            const tld = domain.split('.').pop();
            chain.push({
                level: 1,
                name: `.${tld} TLD Servers`,
                type: 'tld',
                description: `Top Level Domain servers for .${tld}`
            });

            // Get authoritative servers for domain
            const nsRecords = await this.queryRecord(domain, 'NS');
            if (nsRecords.answers && nsRecords.answers.length > 0) {
                const authServers = nsRecords.answers.map(ns => ns.data);
                chain.push({
                    level: 2,
                    name: 'Authoritative Servers',
                    type: 'authoritative',
                    servers: authServers,
                    description: `Authoritative name servers for ${domain}`
                });
            }

            // Check for CDN/proxy layers
            const aRecords = await this.queryRecord(domain, 'A');
            if (aRecords.answers && aRecords.answers.length > 0) {
                const ips = aRecords.answers.map(a => a.data);
                const cdnInfo = await this.detectCDN(ips);
                
                if (cdnInfo.detected) {
                    chain.push({
                        level: 3,
                        name: `${cdnInfo.provider} CDN`,
                        type: 'cdn',
                        servers: ips,
                        description: `Content Delivery Network layer`
                    });
                }
            }

            return chain;
        } catch (error) {
            console.error('DNS chain trace error:', error);
            return chain;
        }
    }

    async analyzeDNSSecurity(domain) {
        const security = {
            dnssec: false,
            caa: [],
            spf: [],
            dmarc: [],
            dkim: [],
            vulnerabilities: []
        };

        try {
            // Check DNSSEC
            const dsRecord = await this.queryRecord(domain, 'DS');
            security.dnssec = dsRecord.answers && dsRecord.answers.length > 0;

            // Check CAA records
            const caaRecord = await this.queryRecord(domain, 'CAA');
            if (caaRecord.answers) {
                security.caa = caaRecord.answers.map(record => record.data);
            }

            // Check SPF records
            const txtRecords = await this.queryRecord(domain, 'TXT');
            if (txtRecords.answers) {
                security.spf = txtRecords.answers
                    .filter(record => record.data.includes('v=spf1'))
                    .map(record => record.data);
                
                security.dmarc = txtRecords.answers
                    .filter(record => record.data.includes('v=DMARC1'))
                    .map(record => record.data);
            }

            // Check for common vulnerabilities
            await this.checkDNSVulnerabilities(domain, security);

        } catch (error) {
            console.error('DNS security analysis error:', error);
            security.error = error.message;
        }

        return security;
    }

    async measureDNSPerformance(domain) {
        const performance = {
            queryTimes: {},
            totalTime: 0,
            fastest: null,
            slowest: null,
            reliability: 0
        };

        const measurements = [];

        try {
            // Test multiple DNS servers
            for (const server of this.dnsServers) {
                const startTime = Date.now();
                try {
                    await this.queryRecord(domain, 'A', server);
                    const queryTime = Date.now() - startTime;
                    measurements.push({ server, queryTime, success: true });
                    performance.queryTimes[server] = queryTime;
                } catch (error) {
                    measurements.push({ server, queryTime: -1, success: false, error: error.message });
                    performance.queryTimes[server] = -1;
                }
                
                await this.delay(100);
            }

            // Calculate statistics
            const successfulQueries = measurements.filter(m => m.success);
            if (successfulQueries.length > 0) {
                const times = successfulQueries.map(m => m.queryTime);
                performance.totalTime = times.reduce((a, b) => a + b, 0) / times.length;
                performance.fastest = Math.min(...times);
                performance.slowest = Math.max(...times);
                performance.reliability = (successfulQueries.length / measurements.length) * 100;
            }

        } catch (error) {
            console.error('DNS performance measurement error:', error);
            performance.error = error.message;
        }

        return performance;
    }

    async discoverDNSInfrastructure(domain) {
        const infrastructure = {
            providers: [],
            anycast: false,
            loadBalancing: false,
            geolocation: {},
            redundancy: 0
        };

        try {
            // Get all A records to analyze infrastructure
            const aRecords = await this.queryRecord(domain, 'A');
            if (aRecords.answers && aRecords.answers.length > 0) {
                const ips = aRecords.answers.map(a => a.data);
                
                // Detect hosting providers
                for (const ip of ips) {
                    const provider = await this.identifyProvider(ip);
                    if (provider) infrastructure.providers.push(provider);
                }

                // Check for load balancing
                infrastructure.loadBalancing = ips.length > 1;
                infrastructure.redundancy = ips.length;

                // Check for anycast
                infrastructure.anycast = await this.detectAnycast(ips);
            }

            // Get NS records for name server analysis
            const nsRecords = await this.queryRecord(domain, 'NS');
            if (nsRecords.answers) {
                const nameServers = nsRecords.answers.map(ns => ns.data);
                infrastructure.nameServers = nameServers;
                
                // Analyze name server diversity
                const uniqueProviders = new Set();
                for (const ns of nameServers) {
                    const provider = this.extractProviderFromNS(ns);
                    if (provider) uniqueProviders.add(provider);
                }
                infrastructure.nsProviders = Array.from(uniqueProviders);
            }

        } catch (error) {
            console.error('DNS infrastructure discovery error:', error);
            infrastructure.error = error.message;
        }

        return infrastructure;
    }

    async detectCDN(ips) {
        const cdnProviders = {
            'cloudflare': ['104.16.', '104.17.', '172.64.', '104.18.'],
            'amazonaws': ['54.', '52.', '34.', '3.'],
            'fastly': ['151.101.'],
            'akamai': ['23.', '104.74.'],
            'cloudfront': ['54.230.', '54.239.', '52.84.'],
            'github': ['185.199.108.', '185.199.109.', '185.199.110.', '185.199.111.']
        };

        for (const [provider, prefixes] of Object.entries(cdnProviders)) {
            for (const ip of ips) {
                for (const prefix of prefixes) {
                    if (ip.startsWith(prefix)) {
                        return { detected: true, provider: provider };
                    }
                }
            }
        }

        return { detected: false };
    }

    async identifyProvider(ip) {
        const providers = {
            'GitHub Pages': ['185.199.108.', '185.199.109.', '185.199.110.', '185.199.111.'],
            'Cloudflare': ['104.16.', '104.17.', '172.64.'],
            'AWS': ['54.', '52.', '34.', '3.'],
            'Google Cloud': ['35.', '34.102.', '34.118.'],
            'Azure': ['52.', '40.', '168.']
        };

        for (const [provider, prefixes] of Object.entries(providers)) {
            for (const prefix of prefixes) {
                if (ip.startsWith(prefix)) {
                    return { name: provider, ip: ip };
                }
            }
        }

        return null;
    }

    async detectAnycast(ips) {
        // Simple heuristic: if same IPs respond from different geographic locations
        return ips.length > 0 && ips.length <= 4; // Typical anycast setup
    }

    extractProviderFromNS(nameserver) {
        const providers = {
            'amazonaws.com': 'AWS Route 53',
            'cloudflare.com': 'Cloudflare',
            'googledomains.com': 'Google Domains',
            'namecheap.com': 'Namecheap',
            'godaddy.com': 'GoDaddy',
            'github.io': 'GitHub Pages'
        };

        for (const [domain, provider] of Object.entries(providers)) {
            if (nameserver.includes(domain)) {
                return provider;
            }
        }

        return nameserver;
    }

    async checkDNSVulnerabilities(domain, security) {
        // Check for common DNS vulnerabilities
        
        // DNS Cache Poisoning susceptibility
        const randomSubdomain = `test-${Math.random().toString(36).substr(2, 9)}.${domain}`;
        try {
            const result = await this.queryRecord(randomSubdomain, 'A');
            if (result.answers && result.answers.length > 0) {
                security.vulnerabilities.push('Potential wildcard DNS configuration');
            }
        } catch (error) {
            // Expected for non-existent subdomains
        }

        // Check for DNS amplification potential
        const anyRecord = await this.queryRecord(domain, 'ANY');
        if (anyRecord.answers && anyRecord.answers.length > 10) {
            security.vulnerabilities.push('High DNS amplification potential');
        }

        // Check zone transfer vulnerability
        try {
            const axfrResult = await this.queryRecord(domain, 'AXFR');
            if (axfrResult.answers && axfrResult.answers.length > 0) {
                security.vulnerabilities.push('Zone transfer enabled');
            }
        } catch (error) {
            // Expected - zone transfers should be restricted
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Visualization methods for DNS data
    generateDNSVisualization() {
        if (!this.analysisData.chain) return null;

        const visualization = {
            nodes: [],
            edges: [],
            metrics: this.analysisData.performance || {}
        };

        this.analysisData.chain.forEach((level, index) => {
            visualization.nodes.push({
                id: `level-${index}`,
                name: level.name,
                type: level.type,
                level: level.level,
                servers: level.servers || [],
                description: level.description
            });

            if (index > 0) {
                visualization.edges.push({
                    from: `level-${index - 1}`,
                    to: `level-${index}`,
                    type: 'dns_query'
                });
            }
        });

        return visualization;
    }

    exportDNSAnalysis() {
        const exportData = {
            ...this.analysisData,
            generatedBy: 'Chaitanya\'s DNS Analyzer',
            exportTime: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dns-analysis-${this.analysisData.domain}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Export for use in main analyzer
window.DNSAnalyzer = DNSAnalyzer;