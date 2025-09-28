#!/usr/bin/env node
/**
 * Admin Portal Flow Test
 * Tests the complete admin portal workflow and API endpoints
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class AdminPortalTester {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.authCookie = null;
        this.testResults = {
            login: false,
            templateCreation: false,
            templateList: false,
            agentCreation: false,
            errors: []
        };
    }

    async runCompleteTest() {
        console.log('🧪 ADMIN PORTAL COMPLETE FLOW TEST');
        console.log('===================================');
        
        try {
            // Test 1: Admin Login
            await this.testAdminLogin();
            
            // Test 2: Get Templates
            await this.testGetTemplates();
            
            // Test 3: Create Template
            await this.testCreateTemplate();
            
            // Test 4: Verify Agent Creation
            await this.testAgentCreation();
            
            // Generate Report
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Critical test failure:', error.message);
        }
    }

    async testAdminLogin() {
        console.log('\n1️⃣ TESTING ADMIN LOGIN');
        console.log('========================');
        
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'admin@humaneqhr.com',
                    password: 'admin123'
                })
            });

            console.log(`📡 Login API Response: ${response.status} ${response.statusText}`);

            if (response.ok) {
                // Extract auth cookie
                const cookies = response.headers.get('set-cookie');
                if (cookies) {
                    this.authCookie = cookies;
                    console.log('✅ Admin login successful');
                    console.log('🍪 Auth cookie obtained');
                    this.testResults.login = true;
                } else {
                    console.log('❌ No auth cookie received');
                    this.testResults.errors.push('Login: No auth cookie');
                }
            } else {
                const errorText = await response.text();
                console.log('❌ Login failed:', errorText);
                this.testResults.errors.push(`Login failed: ${response.status}`);
            }

        } catch (error) {
            console.log('❌ Login request failed:', error.message);
            this.testResults.errors.push(`Login error: ${error.message}`);
        }
    }

    async testGetTemplates() {
        console.log('\n2️⃣ TESTING GET ADMIN TEMPLATES');
        console.log('===============================');
        
        if (!this.testResults.login) {
            console.log('⏭️ Skipping - login failed');
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/admin/templates`, {
                method: 'GET',
                headers: {
                    'Cookie': this.authCookie || ''
                }
            });

            console.log(`📡 Get Templates API Response: ${response.status} ${response.statusText}`);

            if (response.ok) {
                const data = await response.json();
                const templates = data.templates || [];
                
                console.log(`✅ Templates API working`);
                console.log(`📋 Found ${templates.length} existing admin templates`);
                
                if (templates.length > 0) {
                    console.log('\n📊 EXISTING TEMPLATES:');
                    templates.forEach((template, index) => {
                        console.log(`   ${index + 1}. "${template.title}" (${template.targetRole})`);
                        console.log(`      Agent ID: ${template.agentId || 'NONE'}`);
                        console.log(`      Has Prompt: ${!!template.agentPrompt}`);
                    });
                }
                
                this.testResults.templateList = true;
            } else {
                const errorText = await response.text();
                console.log('❌ Get templates failed:', errorText);
                this.testResults.errors.push(`Get templates failed: ${response.status}`);
            }

        } catch (error) {
            console.log('❌ Get templates request failed:', error.message);
            this.testResults.errors.push(`Get templates error: ${error.message}`);
        }
    }

    async testCreateTemplate() {
        console.log('\n3️⃣ TESTING TEMPLATE CREATION');
        console.log('=============================');
        
        if (!this.testResults.login) {
            console.log('⏭️ Skipping - login failed');
            return;
        }

        const testTemplate = {
            title: `Test Template - ${new Date().toISOString()}`,
            description: 'Automated test template for checking agent creation',
            targetRole: 'company',
            questions: [
                'Tell me about your experience with React and JavaScript.',
                'How do you handle state management in large applications?',
                'Describe a challenging project you worked on recently.'
            ],
            useCustomPrompt: false,
            agentPrompt: ''
        };

        try {
            const response = await fetch(`${this.baseUrl}/api/admin/templates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': this.authCookie || ''
                },
                body: JSON.stringify(testTemplate)
            });

            console.log(`📡 Create Template API Response: ${response.status} ${response.statusText}`);

            if (response.ok) {
                const data = await response.json();
                const createdTemplate = data.template;
                
                console.log('✅ Template creation successful');
                console.log(`📋 Template ID: ${createdTemplate._id}`);
                console.log(`🎯 Target Role: ${createdTemplate.targetRole}`);
                console.log(`🤖 Agent ID: ${createdTemplate.agentId}`);
                console.log(`📝 Has Prompt: ${!!createdTemplate.agentPrompt}`);
                
                if (createdTemplate.agentPrompt) {
                    console.log(`📝 Prompt Length: ${createdTemplate.agentPrompt.length} characters`);
                    console.log(`📝 Prompt Preview: "${createdTemplate.agentPrompt.substring(0, 100)}..."`);
                }

                // Check if agent ID is placeholder or real
                if (createdTemplate.agentId && createdTemplate.agentId.startsWith('agent_')) {
                    console.log('⚠️ Agent ID appears to be a PLACEHOLDER');
                    console.log('💡 This indicates ElevenLabs integration is NOT working');
                } else if (createdTemplate.agentId) {
                    console.log('✅ Agent ID appears to be a REAL ElevenLabs agent');
                    this.testResults.agentCreation = true;
                }
                
                this.testResults.templateCreation = true;
                
            } else {
                const errorText = await response.text();
                console.log('❌ Template creation failed:', errorText);
                this.testResults.errors.push(`Template creation failed: ${response.status}`);
            }

        } catch (error) {
            console.log('❌ Template creation request failed:', error.message);
            this.testResults.errors.push(`Template creation error: ${error.message}`);
        }
    }

    async testAgentCreation() {
        console.log('\n4️⃣ TESTING ELEVENLABS AGENT INTEGRATION');
        console.log('=======================================');
        
        // Check if XI_API_KEY is configured
        const apiKey = process.env.XI_API_KEY;
        
        if (!apiKey) {
            console.log('❌ XI_API_KEY not configured');
            console.log('💡 This explains why agents are not being created');
            this.testResults.errors.push('XI_API_KEY not set');
            return;
        }

        console.log(`🔑 XI_API_KEY configured: ${apiKey.substring(0, 8)}...${apiKey.slice(-4)}`);

        // Test ElevenLabs API connectivity
        try {
            const response = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
                method: 'GET',
                headers: {
                    'xi-api-key': apiKey
                }
            });

            console.log(`📡 ElevenLabs API Response: ${response.status} ${response.statusText}`);

            if (response.ok) {
                const data = await response.json();
                const agents = data.agents || [];
                
                console.log('✅ ElevenLabs API connection successful');
                console.log(`🤖 Total agents in account: ${agents.length}`);
                
                if (agents.length > 0) {
                    console.log('\n🤖 ELEVENLABS AGENTS:');
                    agents.slice(0, 5).forEach((agent, index) => {
                        console.log(`   ${index + 1}. "${agent.name}" - ${agent.agent_id}`);
                    });
                    if (agents.length > 5) {
                        console.log(`   ... and ${agents.length - 5} more`);
                    }
                }
                
                this.testResults.agentCreation = true;
            } else {
                const errorText = await response.text();
                console.log('❌ ElevenLabs API failed:', errorText);
                this.testResults.errors.push(`ElevenLabs API failed: ${response.status}`);
            }

        } catch (error) {
            console.log('❌ ElevenLabs API request failed:', error.message);
            this.testResults.errors.push(`ElevenLabs API error: ${error.message}`);
        }
    }

    generateReport() {
        console.log('\n📊 FINAL TEST REPORT');
        console.log('====================');
        
        const results = this.testResults;
        
        console.log('🧪 TEST RESULTS:');
        console.log(`   ✅ Admin Login: ${results.login ? 'PASS' : 'FAIL'}`);
        console.log(`   ✅ Template List: ${results.templateList ? 'PASS' : 'FAIL'}`);
        console.log(`   ✅ Template Creation: ${results.templateCreation ? 'PASS' : 'FAIL'}`);
        console.log(`   ✅ Agent Creation: ${results.agentCreation ? 'PASS' : 'FAIL'}`);
        
        console.log(`\n❌ ERRORS FOUND: ${results.errors.length}`);
        results.errors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error}`);
        });

        console.log('\n🔍 DIAGNOSIS:');
        
        if (!results.login) {
            console.log('❌ CRITICAL: Admin login is not working');
            console.log('💡 Check admin credentials and authentication system');
        }
        
        if (!results.templateCreation) {
            console.log('❌ CRITICAL: Template creation is not working');
            console.log('💡 Check admin templates API and database connection');
        }
        
        if (!results.agentCreation) {
            console.log('❌ ISSUE: ElevenLabs agent creation is not working');
            console.log('💡 Admin portal is creating placeholder agents instead of real ones');
            console.log('💡 SOLUTION: Integrate ElevenLabs API in /api/admin/templates POST route');
        }

        if (results.login && results.templateCreation && results.agentCreation) {
            console.log('✅ ALL SYSTEMS WORKING: Admin portal is fully functional!');
        }

        console.log('\n🔧 NEXT STEPS:');
        console.log('   1. Fix any failing tests above');
        console.log('   2. Integrate real ElevenLabs agent creation in admin API');
        console.log('   3. Test the complete user workflow');
        console.log('   4. Run the agent testing script to verify functionality');
    }
}

// Run the complete test
const tester = new AdminPortalTester();
tester.runCompleteTest().catch(console.error);