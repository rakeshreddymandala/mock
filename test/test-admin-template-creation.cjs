/**
 * Admin Template Creation Test
 * Tests the ElevenLabs agent creation integration in admin portal
 */

require('dotenv').config();

class AdminTemplateCreationTest {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.testResults = {
            apiConnection: false,
            templateCreation: false,
            agentCreation: false,
            agentIdValid: false,
            errors: []
        };
    }

    async testApiConnection() {
        console.log("🔗 Testing API Connection...");
        try {
            const response = await fetch(`${this.baseUrl}/api/admin/templates`);
            if (response.ok) {
                console.log("✅ Admin templates API is accessible");
                this.testResults.apiConnection = true;
                return true;
            } else {
                console.log(`❌ API responded with status: ${response.status}`);
                this.testResults.errors.push(`API connection failed: ${response.status}`);
                return false;
            }
        } catch (error) {
            console.log("❌ API connection failed:", error.message);
            if (error.code === 'ECONNREFUSED') {
                console.log("💡 Make sure your Next.js server is running (npm run dev)");
            }
            this.testResults.errors.push(`API connection error: ${error.message}`);
            return false;
        }
    }

    async testTemplateCreation() {
        console.log("\n📝 Testing Template Creation with ElevenLabs Integration...");
        
        const testTemplate = {
            title: `Test Interview Template ${Date.now()}`,
            description: 'Testing admin portal agent creation functionality',
            targetRole: 'company',
            questions: [
                'Tell me about your experience with JavaScript and React',
                'Describe a challenging project you worked on recently',
                'How do you approach problem-solving in your development work?',
                'What interests you most about this position?'
            ],
            useCustomPrompt: false
        };

        try {
            const response = await fetch(`${this.baseUrl}/api/admin/templates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testTemplate)
            });

            const result = await response.json();
            
            console.log(`📋 Response Status: ${response.status}`);
            console.log(`📋 Response Message: ${result.message}`);

            if (response.ok && result.template) {
                console.log("✅ Template created successfully");
                this.testResults.templateCreation = true;
                
                // Check agent creation
                return this.validateAgentCreation(result);
            } else {
                console.log("❌ Template creation failed:", result.error || result.message);
                this.testResults.errors.push(`Template creation failed: ${result.error || result.message}`);
                return false;
            }
        } catch (error) {
            console.log("❌ Template creation error:", error.message);
            this.testResults.errors.push(`Template creation error: ${error.message}`);
            return false;
        }
    }

    validateAgentCreation(result) {
        console.log("\n🤖 Validating Agent Creation...");
        
        const template = result.template;
        const agentId = template.agentId;
        
        console.log(`🔍 Agent ID: ${agentId}`);
        console.log(`🔍 Agent Creation Status: ${template.agentCreationStatus}`);
        
        if (!agentId) {
            console.log("❌ No agent ID found in template");
            this.testResults.errors.push("No agent ID in template");
            return false;
        }

        // Check if it's a real ElevenLabs agent ID or placeholder
        if (agentId.startsWith('agent_') && agentId.includes('_failed')) {
            console.log("❌ Agent creation failed - using fallback placeholder");
            console.log(`   Error: ${template.agentCreationError}`);
            this.testResults.errors.push(`Agent creation failed: ${template.agentCreationError}`);
            this.testResults.agentCreation = false;
        } else if (agentId.startsWith('agent_') && agentId.length < 20) {
            console.log("⚠️  Still using placeholder agent ID (old implementation)");
            this.testResults.errors.push("Using placeholder agent ID");
            this.testResults.agentCreation = false;
        } else {
            console.log("✅ Real ElevenLabs agent ID detected");
            console.log(`   Agent created: ${result.agentCreated ? 'Yes' : 'No'}`);
            this.testResults.agentCreation = true;
            this.testResults.agentIdValid = true;
        }

        // Log additional details
        if (template.agentPrompt) {
            console.log(`📝 Agent Prompt Length: ${template.agentPrompt.length} characters`);
        }

        return this.testResults.agentCreation;
    }

    async checkElevenLabsApiKey() {
        console.log("\n🔑 Checking ElevenLabs API Configuration...");
        
        if (!process.env.XI_API_KEY) {
            console.log("❌ XI_API_KEY environment variable not found");
            this.testResults.errors.push("XI_API_KEY not configured");
            return false;
        }

        if (process.env.XI_API_KEY.length < 10) {
            console.log("❌ XI_API_KEY appears to be invalid (too short)");
            this.testResults.errors.push("XI_API_KEY appears invalid");
            return false;
        }

        console.log(`✅ XI_API_KEY is configured (${process.env.XI_API_KEY.substring(0, 8)}...)`);
        return true;
    }

    async runFullTest() {
        console.log("🧪 ADMIN TEMPLATE CREATION TEST");
        console.log("=".repeat(50));
        console.log(`📅 Test Date: ${new Date().toISOString()}`);
        console.log(`🔗 Testing URL: ${this.baseUrl}`);
        console.log("");

        // Test 1: API Key
        await this.checkElevenLabsApiKey();

        // Test 2: API Connection
        const apiConnected = await this.testApiConnection();
        if (!apiConnected) {
            console.log("\n❌ Cannot proceed - API not accessible");
            return this.generateReport();
        }

        // Test 3: Template Creation with Agent
        await this.testTemplateCreation();

        return this.generateReport();
    }

    generateReport() {
        console.log("\n" + "=".repeat(50));
        console.log("📊 TEST RESULTS SUMMARY");
        console.log("=".repeat(50));

        const results = this.testResults;
        
        console.log(`🔗 API Connection: ${results.apiConnection ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`📝 Template Creation: ${results.templateCreation ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`🤖 Agent Creation: ${results.agentCreation ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`🆔 Valid Agent ID: ${results.agentIdValid ? '✅ PASS' : '❌ FAIL'}`);

        if (results.errors.length > 0) {
            console.log("\n❌ ERRORS FOUND:");
            results.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }

        const overallStatus = results.apiConnection && 
                            results.templateCreation && 
                            results.agentCreation && 
                            results.agentIdValid;

        console.log(`\n🎯 OVERALL STATUS: ${overallStatus ? '✅ PASS' : '❌ FAIL'}`);

        if (overallStatus) {
            console.log("\n🎉 SUCCESS! Admin portal now creates real ElevenLabs agents!");
        } else {
            console.log("\n🔧 NEXT STEPS:");
            console.log("   1. Check that your Next.js server is running");
            console.log("   2. Verify XI_API_KEY is properly configured");
            console.log("   3. Check the admin template API implementation");
            console.log("   4. Review server logs for detailed error messages");
        }

        return overallStatus;
    }
}

// Run the test
const test = new AdminTemplateCreationTest();
test.runFullTest().catch(console.error);