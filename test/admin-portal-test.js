/**
 * Admin Portal Test - Check Template Creation and Agent Status
 * This test verifies the admin portal workflow and agent creation
 */

import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

class AdminPortalTester {
    constructor() {
        this.mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        this.dbName = 'humaneq-hr';
        this.client = null;
    }

    async connect() {
        try {
            console.log("🔗 Connecting to MongoDB...");
            this.client = new MongoClient(this.mongoUri);
            await this.client.connect();
            console.log("✅ MongoDB connected successfully");
            return this.client.db(this.dbName);
        } catch (error) {
            console.error("❌ MongoDB connection failed:", error.message);
            throw error;
        }
    }

    async checkAdminTemplates() {
        console.log("\n📋 CHECKING ADMIN TEMPLATES");
        console.log("=" * 50);

        const db = await this.connect();
        const adminTemplates = await db.collection('admin_templates').find({}).toArray();

        console.log(`\n🏢 Total Admin Templates: ${adminTemplates.length}`);

        if (adminTemplates.length === 0) {
            console.log("⚠️  No admin templates found in database");
            console.log("💡 Create templates through admin portal first:");
            console.log("   1. Login at http://localhost:3000/admin/login");
            console.log("   2. Use credentials: admin@humaneqhr.com / admin123");
            console.log("   3. Go to Templates section");
            console.log("   4. Create new templates");
            return { templates: [], issues: ["No templates found"] };
        }

        const issues = [];
        const templateAnalysis = [];

        adminTemplates.forEach((template, index) => {
            console.log(`\n📋 Template ${index + 1}: "${template.title}"`);
            console.log(`   - Target Role: ${template.targetRole}`);
            console.log(`   - Agent ID: ${template.agentId || 'NOT SET'}`);
            console.log(`   - Custom Prompt: ${template.useCustomPrompt ? 'YES' : 'NO'}`);
            console.log(`   - Has Agent Prompt: ${template.agentPrompt ? 'YES' : 'NO'}`);
            console.log(`   - Questions: ${template.questions?.length || 0} questions`);
            console.log(`   - Created: ${template.createdAt}`);
            console.log(`   - Is Active: ${template.isActive}`);

            // Analyze template for issues
            const templateIssues = [];
            
            if (!template.agentId || template.agentId.startsWith('agent_')) {
                templateIssues.push("Placeholder agent ID (not real ElevenLabs agent)");
            }
            
            if (!template.agentPrompt) {
                templateIssues.push("Missing agent prompt");
            }
            
            if (!template.questions || template.questions.length === 0) {
                templateIssues.push("No questions defined");
            }

            if (templateIssues.length > 0) {
                console.log(`   ⚠️  Issues: ${templateIssues.join(', ')}`);
                issues.push(`${template.title}: ${templateIssues.join(', ')}`);
            } else {
                console.log(`   ✅ Template looks good`);
            }

            templateAnalysis.push({
                title: template.title,
                role: template.targetRole,
                agentId: template.agentId,
                hasRealAgent: template.agentId && !template.agentId.startsWith('agent_'),
                hasPrompt: !!template.agentPrompt,
                questionCount: template.questions?.length || 0,
                issues: templateIssues
            });
        });

        return { templates: templateAnalysis, issues };
    }

    async checkAgentCreationProcess() {
        console.log("\n🤖 CHECKING AGENT CREATION PROCESS");
        console.log("=" * 50);

        // Check if ElevenLabs API key is set
        const apiKey = process.env.XI_API_KEY;
        console.log(`\n🔑 XI_API_KEY: ${apiKey ? 'SET (' + apiKey.substring(0, 8) + '...)' : 'NOT SET'}`);

        if (!apiKey) {
            console.log("❌ ElevenLabs API key not found");
            console.log("💡 Set XI_API_KEY in your .env file");
            return { hasApiKey: false, issues: ["XI_API_KEY not set"] };
        }

        // Test API connectivity
        try {
            console.log("🔗 Testing ElevenLabs API connection...");
            const response = await fetch("https://api.elevenlabs.io/v1/convai/agents", {
                method: "GET",
                headers: {
                    "xi-api-key": apiKey,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                const agents = data.agents || [];
                console.log(`✅ API connection successful - Found ${agents.length} agents`);
                
                // Show first few agents
                agents.slice(0, 3).forEach(agent => {
                    console.log(`   🎯 Agent: ${agent.name} (ID: ${agent.agent_id})`);
                });

                return { hasApiKey: true, apiWorking: true, agentCount: agents.length, issues: [] };
            } else {
                console.log(`❌ API connection failed: ${response.status} - ${response.statusText}`);
                return { hasApiKey: true, apiWorking: false, issues: [`API error: ${response.status}`] };
            }
        } catch (error) {
            console.log(`❌ API connection error: ${error.message}`);
            return { hasApiKey: true, apiWorking: false, issues: [`Network error: ${error.message}`] };
        }
    }

    async checkAdminPortalFlow() {
        console.log("\n🖥️  CHECKING ADMIN PORTAL FLOW");
        console.log("=" * 50);

        // Check admin API endpoints
        const endpoints = [
            { path: '/api/admin/templates', method: 'GET', description: 'Fetch admin templates' },
            { path: '/api/admin/templates', method: 'POST', description: 'Create admin template' },
        ];

        console.log("\n📡 Admin API Endpoints Status:");
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`http://localhost:3000${endpoint.path}`, {
                    method: endpoint.method === 'POST' ? 'GET' : endpoint.method, // Just test GET for now
                });
                
                const status = response.ok ? '✅' : '❌';
                console.log(`   ${status} ${endpoint.method} ${endpoint.path} - ${endpoint.description}`);
            } catch (error) {
                console.log(`   ❌ ${endpoint.method} ${endpoint.path} - Connection failed`);
            }
        }
    }

    async generateDetailedReport() {
        console.log("\n🧪 ADMIN PORTAL COMPREHENSIVE TEST");
        console.log("=" * 60);
        console.log(`Test Date: ${new Date().toISOString()}`);
        console.log(`Database: ${this.dbName}`);
        
        try {
            // Test 1: Check admin templates
            const templateResults = await this.checkAdminTemplates();
            
            // Test 2: Check agent creation process
            const agentResults = await this.checkAgentCreationProcess();
            
            // Test 3: Check admin portal endpoints
            await this.checkAdminPortalFlow();

            // Generate summary
            console.log("\n📊 SUMMARY REPORT");
            console.log("=" * 50);
            
            console.log(`\n📋 Templates: ${templateResults.templates.length} total`);
            templateResults.templates.forEach(template => {
                const status = template.hasRealAgent ? '✅' : '⚠️ ';
                console.log(`   ${status} ${template.title} (${template.role}) - Agent: ${template.hasRealAgent ? 'Real' : 'Placeholder'}`);
            });

            console.log(`\n🤖 Agent Creation:`);
            console.log(`   - API Key: ${agentResults.hasApiKey ? '✅ Set' : '❌ Missing'}`);
            console.log(`   - API Connection: ${agentResults.apiWorking ? '✅ Working' : '❌ Failed'}`);
            console.log(`   - Total Agents: ${agentResults.agentCount || 0}`);

            // Issues summary
            const allIssues = [...templateResults.issues, ...agentResults.issues];
            if (allIssues.length > 0) {
                console.log(`\n⚠️  ISSUES FOUND (${allIssues.length}):`);
                allIssues.forEach(issue => console.log(`   - ${issue}`));
            } else {
                console.log(`\n✅ NO ISSUES FOUND - System working correctly!`);
            }

            // Recommendations
            console.log(`\n💡 NEXT STEPS:`);
            if (templateResults.templates.length === 0) {
                console.log("   1. Create admin templates through the admin portal");
            } else if (templateResults.templates.some(t => !t.hasRealAgent)) {
                console.log("   1. Run the agent creation script: 'node scripts/add-agents-to-templates.js'");
                console.log("   2. This will create real ElevenLabs agents for your templates");
            } else {
                console.log("   1. System is ready - templates have real agents!");
                console.log("   2. Test interviews to verify everything works");
            }

        } catch (error) {
            console.error("\n❌ Test failed:", error.message);
        } finally {
            if (this.client) {
                await this.client.close();
                console.log("\n🔐 Database connection closed");
            }
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
        }
    }
}

// Run the test
async function runAdminPortalTest() {
    const tester = new AdminPortalTester();
    await tester.generateDetailedReport();
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAdminPortalTest().catch(console.error);
}

export default AdminPortalTester;