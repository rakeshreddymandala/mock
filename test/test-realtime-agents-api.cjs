/**
 * Test Real-time Agents API
 * Tests the new real-time agents endpoint
 */

async function testRealtimeAgentsAPI() {
    console.log("🧪 Testing Real-time Agents API...\n");

    try {
        const response = await fetch('http://localhost:3000/api/admin/agents/realtime');
        
        console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            
            console.log("\n📊 SUMMARY:");
            console.log(`  Total Agents: ${data.summary.totalAgents}`);
            console.log(`  Active Agents: ${data.summary.activeAgents}`);
            console.log(`  Real Agents: ${data.summary.realAgents}`);
            console.log(`  Failed Agents: ${data.summary.failedAgents}`);
            console.log(`  Placeholder Agents: ${data.summary.placeholderAgents}`);
            console.log(`  Total Conversations: ${data.summary.totalConversations}`);
            console.log(`  ElevenLabs Connected: ${data.summary.elevenLabsConnected}`);
            console.log(`  Last Updated: ${data.summary.lastUpdated}`);
            
            console.log("\n🤖 AGENTS:");
            if (data.agents.length > 0) {
                data.agents.forEach((agent, index) => {
                    console.log(`\n  Agent ${index + 1}: "${agent.templateTitle}"`);
                    console.log(`    Role: ${agent.targetRole}`);
                    console.log(`    Agent ID: ${agent.agentId}`);
                    console.log(`    Status: ${agent.agentStatus}`);
                    console.log(`    Questions: ${agent.questionsCount}`);
                    console.log(`    Created: ${new Date(agent.createdAt).toLocaleString()}`);
                    
                    if (agent.liveData) {
                        console.log(`    Live Data:`);
                        console.log(`      Conversations: ${agent.liveData.conversationsCount}`);
                        console.log(`      Model: ${agent.liveData.model}`);
                        console.log(`      Language: ${agent.liveData.language}`);
                    } else {
                        console.log(`    Live Data: Not available`);
                    }
                    
                    console.log(`    Classification:`);
                    console.log(`      Real Agent: ${agent.classification.isRealAgent}`);
                    console.log(`      Active: ${agent.classification.isActive}`);
                    console.log(`      Failed: ${agent.classification.isFailed}`);
                    console.log(`      Placeholder: ${agent.classification.isPlaceholder}`);
                });
            } else {
                console.log("  No agents found");
            }
            
            console.log("\n✅ Real-time Agents API is working!");
            
        } else {
            console.log("❌ API Error:", await response.text());
        }
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log("❌ Connection refused - make sure the development server is running");
            console.log("   Run: npm run dev");
        } else {
            console.log("❌ Test Error:", error.message);
        }
    }
}

testRealtimeAgentsAPI().catch(console.error);