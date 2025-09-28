#!/usr/bin/env node
/**
 * Admin Templates Database Check
 * Tests the admin portal template creation and agent integration
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkAdminTemplates() {
    console.log('🔍 ADMIN TEMPLATES DATABASE ANALYSIS');
    console.log('=====================================');

    let client;
    try {
        // Connect to database
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        console.log('🔌 Connecting to MongoDB...');
        
        client = new MongoClient(mongoUri);
        await client.connect();
        const db = client.db('humaneq-hr');
        
        console.log('✅ Database connected');

        // Check admin templates collection
        console.log('\n📋 ADMIN TEMPLATES ANALYSIS:');
        const adminTemplates = await db.collection('admin_templates').find({}).toArray();
        
        console.log(`Total admin templates: ${adminTemplates.length}`);
        
        if (adminTemplates.length === 0) {
            console.log('❌ NO ADMIN TEMPLATES FOUND!');
            console.log('💡 This means:');
            console.log('   - No templates created through admin panel yet');
            console.log('   - Admin portal template creation may not be working');
            console.log('\n🔧 NEXT STEPS:');
            console.log('   1. Login to admin portal at /admin/login');
            console.log('   2. Go to Templates section');
            console.log('   3. Create a test template');
            console.log('   4. Run this test again');
            return;
        }

        // Analyze each template
        let templatesWithAgents = 0;
        let templatesWithPlaceholderAgents = 0;
        let templatesWithPrompts = 0;

        console.log('\n📊 DETAILED TEMPLATE ANALYSIS:');
        adminTemplates.forEach((template, index) => {
            console.log(`\n${index + 1}. "${template.title}" (${template.targetRole})`);
            console.log(`   📅 Created: ${template.createdAt}`);
            console.log(`   🎯 Target Role: ${template.targetRole}`);
            console.log(`   ❓ Questions: ${template.questions?.length || 0}`);
            
            // Check agent ID
            if (template.agentId) {
                templatesWithAgents++;
                if (template.agentId.startsWith('agent_')) {
                    templatesWithPlaceholderAgents++;
                    console.log(`   🤖 Agent ID: ${template.agentId} (PLACEHOLDER)`);
                } else {
                    console.log(`   🤖 Agent ID: ${template.agentId} (REAL ELEVENLABS AGENT)`);
                }
            } else {
                console.log(`   🤖 Agent ID: NOT SET`);
            }

            // Check prompt
            if (template.agentPrompt) {
                templatesWithPrompts++;
                const promptLength = template.agentPrompt.length;
                const isCustom = template.useCustomPrompt || false;
                console.log(`   📝 Agent Prompt: ${promptLength} chars (${isCustom ? 'CUSTOM' : 'GENERATED'})`);
                console.log(`   📝 Prompt Preview: "${template.agentPrompt.substring(0, 80)}..."`);
            } else {
                console.log(`   📝 Agent Prompt: NOT SET`);
            }

            console.log(`   🔄 Usage Count: ${template.usageCount || 0}`);
            console.log(`   ✅ Active: ${template.isActive}`);
        });

        // Summary statistics
        console.log('\n📈 SUMMARY STATISTICS:');
        console.log(`   Total Templates: ${adminTemplates.length}`);
        console.log(`   Templates with Agent IDs: ${templatesWithAgents}`);
        console.log(`   Templates with Placeholder Agents: ${templatesWithPlaceholderAgents}`);
        console.log(`   Templates with Real Agents: ${templatesWithAgents - templatesWithPlaceholderAgents}`);
        console.log(`   Templates with Prompts: ${templatesWithPrompts}`);

        // Role distribution
        console.log('\n🎭 ROLE DISTRIBUTION:');
        const roleGroups = {
            company: adminTemplates.filter(t => t.targetRole === 'company').length,
            student: adminTemplates.filter(t => t.targetRole === 'student').length,
            general: adminTemplates.filter(t => t.targetRole === 'general').length
        };
        
        Object.entries(roleGroups).forEach(([role, count]) => {
            console.log(`   ${role.charAt(0).toUpperCase() + role.slice(1)}: ${count} templates`);
        });

        // Issue detection
        console.log('\n🚨 ISSUE DETECTION:');
        
        if (templatesWithPlaceholderAgents > 0) {
            console.log(`❌ ${templatesWithPlaceholderAgents} templates have PLACEHOLDER agents instead of real ElevenLabs agents`);
            console.log('💡 This means the admin portal is NOT creating real agents');
            console.log('🔧 SOLUTION: The /api/admin/templates route needs ElevenLabs integration');
        }

        if (templatesWithAgents === adminTemplates.length && templatesWithPlaceholderAgents === 0) {
            console.log('✅ All templates have real ElevenLabs agents - GOOD!');
        }

        if (templatesWithPrompts < adminTemplates.length) {
            console.log(`❌ ${adminTemplates.length - templatesWithPrompts} templates missing agent prompts`);
        } else {
            console.log('✅ All templates have agent prompts - GOOD!');
        }

    } catch (error) {
        console.error('❌ Database check failed:', error.message);
    } finally {
        if (client) {
            await client.close();
            console.log('\n🔌 Database connection closed');
        }
    }
}

// Run the analysis
checkAdminTemplates().catch(console.error);