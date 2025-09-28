/**
 * Check Admin Templates Agent Status
 * Verifies if admin templates have real ElevenLabs agent IDs
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkAdminTemplatesAgentStatus() {
    console.log("🔍 CHECKING ADMIN TEMPLATES AGENT STATUS");
    console.log("=".repeat(50));

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = 'humaneq-hr'; // Correct database name from seed-database.js

    let client;

    try {
        // Connect to MongoDB
        console.log("🔗 Connecting to MongoDB...");
        client = new MongoClient(mongoUri);
        await client.connect();
        
        const db = client.db(dbName);
        const adminTemplatesCollection = db.collection('admin_templates');

        // Get all admin templates
        const templates = await adminTemplatesCollection.find({}).toArray();
        
        console.log(`📋 Found ${templates.length} admin templates\n`);

        if (templates.length === 0) {
            console.log("ℹ️  No admin templates found. This is expected if:");
            console.log("   - You haven't created any templates via admin portal yet");
            console.log("   - This is a fresh installation");
            console.log("\n💡 To test: Create a template via the admin portal UI");
            return;
        }

        // Analyze each template
        let realAgents = 0;
        let placeholderAgents = 0;
        let failedAgents = 0;

        templates.forEach((template, index) => {
            console.log(`📝 Template ${index + 1}: "${template.title}"`);
            console.log(`   Role: ${template.targetRole}`);
            console.log(`   Created: ${template.createdAt?.toISOString() || 'Unknown'}`);
            console.log(`   Agent ID: ${template.agentId}`);
            
            if (template.agentCreationStatus) {
                console.log(`   Agent Status: ${template.agentCreationStatus}`);
                if (template.agentCreationError) {
                    console.log(`   Agent Error: ${template.agentCreationError}`);
                }
            }

            // Categorize agent type
            if (!template.agentId) {
                console.log("   🚫 No agent ID found");
            } else if (template.agentId.includes('_failed')) {
                console.log("   ❌ Failed agent creation");
                failedAgents++;
            } else if (template.agentId.startsWith('agent_') && template.agentId.length < 20) {
                console.log("   ⚠️  Placeholder agent ID (not real ElevenLabs agent)");
                placeholderAgents++;
            } else {
                console.log("   ✅ Real ElevenLabs agent ID");
                realAgents++;
            }

            console.log(`   Questions: ${template.questions?.length || 0} questions`);
            console.log(`   Prompt Length: ${template.agentPrompt?.length || 0} characters`);
            console.log("");
        });

        // Summary
        console.log("📊 AGENT STATUS SUMMARY");
        console.log("-".repeat(30));
        console.log(`✅ Real ElevenLabs Agents: ${realAgents}`);
        console.log(`⚠️  Placeholder Agents: ${placeholderAgents}`);
        console.log(`❌ Failed Agent Creation: ${failedAgents}`);
        console.log(`📝 Total Templates: ${templates.length}`);

        // Assessment
        if (realAgents === templates.length) {
            console.log("\n🎉 SUCCESS! All admin templates have real ElevenLabs agents!");
        } else if (realAgents > 0) {
            console.log("\n⚠️  PARTIAL SUCCESS: Some templates have real agents, others need fixing");
        } else {
            console.log("\n❌ ISSUE: No admin templates have real ElevenLabs agents");
            console.log("\n🔧 NEXT STEPS:");
            console.log("   1. Update the admin template API to create real agents");
            console.log("   2. Test template creation via admin portal");
            console.log("   3. Run the migration script to fix existing templates");
        }

        // Show recent templates
        if (templates.length > 0) {
            console.log("\n📅 RECENT TEMPLATES:");
            const recentTemplates = templates
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 3);
            
            recentTemplates.forEach(template => {
                console.log(`   • "${template.title}" - ${template.createdAt?.toISOString() || 'Unknown date'}`);
            });
        }

    } catch (error) {
        console.error("❌ Database Error:", error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log("\n💡 Make sure MongoDB is running");
        } else if (error.message.includes('authentication failed')) {
            console.log("\n💡 Check your MongoDB credentials");
        }
    } finally {
        if (client) {
            await client.close();
            console.log("\n🔒 Database connection closed");
        }
    }
}

// Run the check
checkAdminTemplatesAgentStatus().catch(console.error);