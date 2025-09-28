require('dotenv').config();
const { MongoClient } = require('mongodb');

async function checkTemplates() {
  let client;
  try {
    console.log("Connecting to database...");

    // Connect to the database
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db("humaneq-hr");

    // Get ONLY admin templates (role-based templates created by admin)
    const adminTemplates = await db.collection("admin_templates").find({}).toArray();

    console.log(`\n=== ADMIN TEMPLATES (Official Role-based) ===`);
    console.log(`Total admin templates found: ${adminTemplates.length}\n`);

    if (adminTemplates.length === 0) {
      console.log("❌ NO ADMIN TEMPLATES FOUND");
      console.log("💡 Please create templates through the admin panel first:");
      console.log("   1. Login as admin (admin@humaneqhr.com / admin123)");
      console.log("   2. Go to Admin > Templates");
      console.log("   3. Create templates for different roles (student, company, general)");
      console.log("   4. Templates will be stored in admin_templates collection");
      return;
    }

    // Group by target role
    const roleGroups = {
      company: adminTemplates.filter(t => t.targetRole === "company"),
      student: adminTemplates.filter(t => t.targetRole === "student"),
      general: adminTemplates.filter(t => t.targetRole === "general")
    };

    console.log(`📊 TEMPLATES BY ROLE:`);
    console.log(`Company templates: ${roleGroups.company.length}`);
    console.log(`Student templates: ${roleGroups.student.length}`);
    console.log(`General templates: ${roleGroups.general.length}\n`);

    // Display templates by role
    ["company", "student", "general"].forEach(role => {
      const roleTemplates = roleGroups[role];
      if (roleTemplates.length > 0) {
        console.log(`--- ${role.toUpperCase()} ROLE TEMPLATES ---`);
        roleTemplates.forEach((template, index) => {
          console.log(`${index + 1}. Template ID: ${template._id}`);
          console.log(`   Title: ${template.title}`);
          console.log(`   Description: ${template.description}`);
          console.log(`   Questions: ${template.questions?.length || 0}`);
          console.log(`   Target Role: ${template.targetRole}`);
          console.log(`   Agent ID: ${template.agentId || 'NOT SET ❌'}`);
          console.log(`   Agent Status: ${template.agentId ? '✅ HAS AGENT' : '❌ NEEDS AGENT'}`);
          console.log(`   Is Active: ${template.isActive ?? 'undefined'}`);
          console.log(`   Created: ${template.createdAt}`);
          console.log(`   Category: ${template.category || 'Not specified'}`);
          console.log(`   Difficulty: ${template.difficulty || 'Not specified'}`);
          console.log(`   Duration: ${template.estimatedDuration || 'Not specified'} minutes`);
          console.log(`   ---`);
        });
        console.log();
      } else {
        console.log(`--- ${role.toUpperCase()} ROLE TEMPLATES ---`);
        console.log(`   No templates found for ${role} role`);
        console.log(`   💡 Create ${role} templates in admin panel\n`);
      }
    });

    // Agent status summary
    const templatesWithAgents = adminTemplates.filter(t => t.agentId);
    const templatesWithoutAgents = adminTemplates.filter(t => !t.agentId);

    console.log(`\n=== AGENT STATUS SUMMARY ===`);
    console.log(`✅ Templates with agents: ${templatesWithAgents.length}/${adminTemplates.length}`);
    console.log(`❌ Templates missing agents: ${templatesWithoutAgents.length}/${adminTemplates.length}`);

    if (templatesWithoutAgents.length > 0) {
      console.log(`\n🤖 TEMPLATES NEEDING AGENTS:`);
      templatesWithoutAgents.forEach((template, index) => {
        console.log(`${index + 1}. "${template.title}" (${template.targetRole} role)`);
      });
      console.log(`\n💡 Run 'node scripts/add-agents-to-templates.js' to create agents for these templates`);
    }

    // Check if old company templates exist (should be migrated)
    const companyTemplates = await db.collection("templates").find({}).toArray();
    if (companyTemplates.length > 0) {
      console.log(`\n⚠️  OLD COMPANY TEMPLATES DETECTED:`);
      console.log(`   Found ${companyTemplates.length} templates in 'templates' collection`);
      console.log(`   These are old company-created templates`);
      console.log(`   💡 Consider migrating important ones to admin_templates if needed`);
    }

    // Final recommendations
    console.log(`\n=== NEXT STEPS ===`);
    if (adminTemplates.length === 0) {
      console.log('1. ❌ Create admin templates first through the admin panel');
    } else if (templatesWithoutAgents.length > 0) {
      console.log('1. 🤖 Run agent creation script for templates missing agents');
      console.log('2. ✅ Test templates in their respective role logins');
    } else {
      console.log('1. ✅ All admin templates have agents - system ready!');
      console.log('2. 🧪 Test template access in different role logins');
      console.log('3. 📊 Monitor template usage and performance');
    }

  } catch (error) {
    console.error("Error checking templates:", error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the check
checkTemplates();
