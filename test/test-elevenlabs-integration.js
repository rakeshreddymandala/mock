#!/usr/bin/env node
/**
 * ElevenLabs Integration Test
 * Tests ElevenLabs API connectivity and agent functionality
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class ElevenLabsIntegrationTester {
    constructor() {
        this.apiKey = process.env.XI_API_KEY;
        this.baseUrl = 'https://api.elevenlabs.io/v1';
        this.headers = {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json'
        };
    }

    async runTests() {
        console.log('🤖 ELEVENLABS INTEGRATION TEST');
        console.log('==============================');
        
        if (!this.apiKey) {
            console.log('❌ XI_API_KEY not configured');
            console.log('💡 Set XI_API_KEY in your .env file');
            return;
        }

        console.log(`🔑 API Key: ${this.apiKey.substring(0, 8)}...${this.apiKey.slice(-4)}`);

        await this.testApiConnection();
        await this.testListAgents();
        await this.testCreateAgent();
        await this.testAgentConversation();
    }

    async testApiConnection() {
        console.log('\n1️⃣ TESTING API CONNECTION');
        console.log('==========================');

        try {
            const response = await fetch(`${this.baseUrl}/user`, {
                headers: { 'xi-api-key': this.apiKey }
            });

            console.log(`📡 API Response: ${response.status} ${response.statusText}`);

            if (response.ok) {
                const userData = await response.json();
                console.log('✅ ElevenLabs API connection successful');
                console.log(`👤 Account: ${userData.email || 'Unknown'}`);
                console.log(`💰 Credits: ${userData.subscription?.character_count || 'Unknown'}`);
            } else {
                const errorText = await response.text();
                console.log('❌ API connection failed:', errorText);
            }
        } catch (error) {
            console.log('❌ API request failed:', error.message);
        }
    }

    async testListAgents() {
        console.log('\n2️⃣ TESTING LIST AGENTS');
        console.log('=======================');

        try {
            const response = await fetch(`${this.baseUrl}/convai/agents`, {
                headers: this.headers
            });

            console.log(`📡 List Agents Response: ${response.status} ${response.statusText}`);

            if (response.ok) {
                const data = await response.json();
                const agents = data.agents || [];
                
                console.log(`✅ Found ${agents.length} agents in account`);
                
                if (agents.length > 0) {
                    console.log('\n🤖 EXISTING AGENTS:');
                    agents.forEach((agent, index) => {
                        console.log(`   ${index + 1}. "${agent.name}"`);
                        console.log(`      ID: ${agent.agent_id}`);
                        console.log(`      Created: ${agent.created_unix_timestamp ? new Date(agent.created_unix_timestamp * 1000).toISOString() : 'Unknown'}`);
                    });
                }
                
                return agents;
            } else {
                const errorText = await response.text();
                console.log('❌ List agents failed:', errorText);
                return [];
            }
        } catch (error) {
            console.log('❌ List agents request failed:', error.message);
            return [];
        }
    }

    async testCreateAgent() {
        console.log('\n3️⃣ TESTING CREATE AGENT');
        console.log('========================');

        const testAgentConfig = {
            name: `Test Agent - ${new Date().toISOString()}`,
            conversationConfig: {
                agent: {
                    prompt: {
                        prompt: `You are a friendly AI interviewer conducting a test interview.

Your role: Test the agent creation functionality for the HumaneQ-HR platform.

Instructions:
- Be professional and engaging
- Ask simple questions to test the conversation flow
- Keep responses concise and clear
- This is a test agent, so focus on basic functionality

Test Questions:
1. Can you hear me clearly?
2. What's your name?
3. Tell me about yourself in one sentence.

Remember: This is a test to verify agent creation and conversation functionality.`
                    }
                }
            }
        };

        try {
            const response = await fetch(`${this.baseUrl}/convai/agents`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(testAgentConfig)
            });

            console.log(`📡 Create Agent Response: ${response.status} ${response.statusText}`);

            if (response.ok) {
                const agentData = await response.json();
                console.log('✅ Test agent created successfully');
                console.log(`🤖 Agent ID: ${agentData.agent_id}`);
                console.log(`📝 Agent Name: ${agentData.name}`);
                
                return agentData;
            } else {
                const errorText = await response.text();
                console.log('❌ Create agent failed:', errorText);
                return null;
            }
        } catch (error) {
            console.log('❌ Create agent request failed:', error.message);
            return null;
        }
    }

    async testAgentConversation(agentId = null) {
        console.log('\n4️⃣ TESTING AGENT CONVERSATION');
        console.log('==============================');

        // If no agent ID provided, use the first available agent
        if (!agentId) {
            const agents = await this.testListAgents();
            if (agents.length === 0) {
                console.log('⏭️ No agents available for conversation test');
                return;
            }
            agentId = agents[0].agent_id;
        }

        console.log(`🤖 Testing conversation with agent: ${agentId}`);

        try {
            const response = await fetch(`${this.baseUrl}/convai/conversation/get-signed-url?agent_id=${agentId}`, {
                headers: { 'xi-api-key': this.apiKey }
            });

            console.log(`📡 Signed URL Response: ${response.status} ${response.statusText}`);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Agent conversation endpoint working');
                console.log('🔗 Signed URL generated successfully');
                console.log(`🔗 URL Length: ${data.signed_url?.length || 0} characters`);
                
                // Test URL format
                if (data.signed_url && data.signed_url.includes('elevenlabs.io')) {
                    console.log('✅ Signed URL format appears correct');
                } else {
                    console.log('⚠️ Signed URL format may be incorrect');
                }
                
            } else {
                const errorText = await response.text();
                console.log('❌ Conversation test failed:', errorText);
            }
        } catch (error) {
            console.log('❌ Conversation test request failed:', error.message);
        }
    }

    async generateIntegrationReport() {
        console.log('\n📊 ELEVENLABS INTEGRATION REPORT');
        console.log('=================================');
        
        console.log('🔍 INTEGRATION STATUS:');
        
        if (!this.apiKey) {
            console.log('❌ CRITICAL: XI_API_KEY not configured');
            console.log('💡 SOLUTION: Add XI_API_KEY to your .env file');
            return;
        }

        console.log('✅ API Key configured');

        // Test basic connectivity
        try {
            const response = await fetch(`${this.baseUrl}/user`, {
                headers: { 'xi-api-key': this.apiKey }
            });

            if (response.ok) {
                console.log('✅ API connectivity working');
            } else {
                console.log('❌ API connectivity issues');
                console.log('💡 Check API key permissions and validity');
            }
        } catch (error) {
            console.log('❌ Network connectivity issues');
        }

        console.log('\n🔧 RECOMMENDED INTEGRATION STEPS:');
        console.log('1. Ensure XI_API_KEY is correctly configured');
        console.log('2. Update /api/admin/templates route to use ElevenLabs client');
        console.log('3. Replace placeholder agentId with real agent creation');
        console.log('4. Test end-to-end template-to-interview workflow');
        console.log('5. Run validation scripts to verify all agents work');
    }
}

// Run the tests
const tester = new ElevenLabsIntegrationTester();
tester.runTests()
    .then(() => tester.generateIntegrationReport())
    .catch(console.error);