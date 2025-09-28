/**
 * ElevenLabs Agent Integration Test
 * Tests the connection between admin templates and ElevenLabs agents
 */

import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

class ElevenLabsAgentTest {
    constructor() {
        this.mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        this.dbName = 'humaneq-hr';
        this.apiKey = process.env.XI_API_KEY;
        this.baseUrl = 'https://api.elevenlabs.io/v1';
        this.client = null;
    }

    async connect() {
        this.client = new MongoClient(this.mongoUri);
        await this.client.connect();
        return this.client.db(this.dbName);
    }

    async testElevenLabsConnection() {
        console.log("🔗 Testing ElevenLabs API Connection");
        console.log("-" * 40);

        if (!this.apiKey) {
            console.log("❌ XI_API_KEY not found in environment variables");
            return { success: false, error: "API key not set" };
        }

        const maskedKey = `${this.apiKey.substring(0, 8)}...${this.apiKey.substring(this.apiKey.length - 4)}`;
        console.log(`🔑 API Key: ${maskedKey}`);

        try {
            const response = await fetch(`${this.baseUrl}/convai/agents`, {
                method: 'GET',
                headers: {
                    'xi-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const agents = data.agents || [];
                console.log(`✅ Connection successful - Found ${agents.length} agents`);
                return { success: true, agents, count: agents.length };
            } else {
                console.log(`❌ Connection failed: ${response.status} - ${response.statusText}`);
                const errorText = await response.text();
                console.log(`Error details: ${errorText}`);
                return { success: false, error: `HTTP ${response.status}` };
            }
        } catch (error) {
            console.log(`❌ Connection error: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async getAdminTemplates() {
        const db = await this.connect();
        const templates = await db.collection('admin_templates').find({}).toArray();
        return templates;
    }

    async verifyTemplateAgents() {
        console.log("\n🤖 Verifying Template-Agent Connections");
        console.log("-" * 40);

        const templates = await this.getAdminTemplates();
        const elevenLabsResult = await this.testElevenLabsConnection();

        if (!elevenLabsResult.success) {
            console.log("❌ Cannot verify agents - ElevenLabs API not accessible");
            return { verified: false, reason: "API not accessible" };
        }

        const allAgents = elevenLabsResult.agents;
        const results = {
            total: templates.length,
            withAgentId: 0,
            withRealAgent: 0,
            working: 0,
            templateDetails: []
        };

        console.log(`\nChecking ${templates.length} admin templates...`);

        for (const template of templates) {
            const templateResult = {
                title: template.title,
                role: template.targetRole,
                agentId: template.agentId,
                hasAgentId: !!template.agentId,
                isPlaceholder: template.agentId?.startsWith('agent_'),
                foundInElevenLabs: false,
                agentWorking: false
            };

            console.log(`\n📋 ${template.title} (${template.targetRole})`);

            if (template.agentId) {
                results.withAgentId++;
                console.log(`   Agent ID: ${template.agentId}`);

                if (template.agentId.startsWith('agent_')) {
                    console.log(`   ⚠️  Placeholder agent ID (not created in ElevenLabs)`);
                } else {
                    // Check if agent exists in ElevenLabs
                    const foundAgent = allAgents.find(agent => agent.agent_id === template.agentId);
                    
                    if (foundAgent) {
                        templateResult.foundInElevenLabs = true;
                        results.withRealAgent++;
                        console.log(`   ✅ Found agent in ElevenLabs: "${foundAgent.name}"`);

                        // Test if agent is working
                        const isWorking = await this.testAgentConnection(template.agentId);
                        templateResult.agentWorking = isWorking;
                        
                        if (isWorking) {
                            results.working++;
                            console.log(`   ✅ Agent is functional`);
                        } else {
                            console.log(`   ⚠️  Agent found but not responding to connection test`);
                        }
                    } else {
                        console.log(`   ❌ Agent ID not found in ElevenLabs account`);
                    }
                }
            } else {
                console.log(`   ❌ No agent ID assigned`);
            }

            results.templateDetails.push(templateResult);
        }

        return results;
    }

    async testAgentConnection(agentId) {
        try {
            const response = await fetch(`${this.baseUrl}/convai/conversation/get-signed-url?agent_id=${agentId}`, {
                method: 'GET',
                headers: {
                    'xi-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                return !!data.signed_url;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    async checkAgentCreationIssues() {
        console.log("\n🔍 Diagnosing Agent Creation Issues");
        console.log("-" * 40);

        const issues = [];
        
        // Check 1: API key
        if (!this.apiKey) {
            issues.push("XI_API_KEY environment variable not set");
        }

        // Check 2: API access
        const apiResult = await this.testElevenLabsConnection();
        if (!apiResult.success) {
            issues.push(`ElevenLabs API not accessible: ${apiResult.error}`);
        }

        // Check 3: Admin templates
        const templates = await this.getAdminTemplates();
        if (templates.length === 0) {
            issues.push("No admin templates found in database");
        }

        // Check 4: Agent creation script
        const scriptExists = await this.checkScriptExists();
        if (!scriptExists) {
            issues.push("Agent creation script not found");
        }

        if (issues.length === 0) {
            console.log("✅ No obvious issues found");
            console.log("\n💡 To create agents for templates, run:");
            console.log("   node scripts/add-agents-to-templates.js");
        } else {
            console.log("❌ Issues found:");
            issues.forEach(issue => console.log(`   - ${issue}`));
        }

        return issues;
    }

    async checkScriptExists() {
        try {
            const fs = await import('fs');
            return fs.existsSync('./scripts/add-agents-to-templates.js');
        } catch {
            return false;
        }
    }

    async runCompleteTest() {
        console.log("🧪 ELEVENLABS AGENT INTEGRATION TEST");
        console.log("=" * 50);
        console.log(`Test Date: ${new Date().toISOString()}`);

        try {
            // Test 1: ElevenLabs connection
            const apiResult = await this.testElevenLabsConnection();
            
            // Test 2: Template-agent verification
            const verificationResult = await this.verifyTemplateAgents();
            
            // Test 3: Diagnose issues
            const issues = await this.checkAgentCreationIssues();

            // Summary
            console.log("\n📊 SUMMARY");
            console.log("=" * 30);
            console.log(`API Connection: ${apiResult.success ? '✅ Working' : '❌ Failed'}`);
            console.log(`Total Templates: ${verificationResult.total || 0}`);
            console.log(`With Agent ID: ${verificationResult.withAgentId || 0}`);
            console.log(`Real Agents: ${verificationResult.withRealAgent || 0}`);
            console.log(`Working Agents: ${verificationResult.working || 0}`);
            console.log(`Issues Found: ${issues.length}`);

            // Recommendations
            console.log("\n💡 RECOMMENDATIONS:");
            if (verificationResult.total === 0) {
                console.log("   1. Create admin templates first via admin portal");
            } else if (verificationResult.withRealAgent === 0) {
                console.log("   1. Run: node scripts/add-agents-to-templates.js");
                console.log("   2. This will create real ElevenLabs agents");
            } else if (verificationResult.working < verificationResult.withRealAgent) {
                console.log("   1. Some agents not responding - check ElevenLabs dashboard");
                console.log("   2. Verify agent configuration");
            } else {
                console.log("   ✅ System working correctly!");
            }

        } catch (error) {
            console.error("❌ Test failed:", error.message);
        } finally {
            if (this.client) {
                await this.client.close();
            }
        }
    }
}

// Run the test
async function runAgentTest() {
    const tester = new ElevenLabsAgentTest();
    await tester.runCompleteTest();
}

export default ElevenLabsAgentTest;

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAgentTest().catch(console.error);
}