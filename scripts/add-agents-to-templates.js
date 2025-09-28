import { MongoClient } from "mongodb";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function generateDynamicPrompt(template) {
  const roleSpecificIntro = {
    student: `Hello! I'm Sarah, your AI interviewer, and I'm genuinely excited to help you practice for ${template.title} interviews today. This is a safe space for you to practice and improve your interview skills. I want this to feel like a natural, supportive conversation where you can really showcase your potential and learn from the experience.`,
    company: `Hello! I'm Sarah, your AI interviewer, and I'm genuinely excited to meet you today for the ${template.title} position. Thank you for taking the time to speak with me. I want this to feel like a natural, relaxed conversation where you can really showcase your amazing qualities and we can get to know you better.`,
    general: `Hello! I'm Sarah, your AI interviewer, and I'm delighted to meet you today. This ${template.title} interview is designed to help assess your skills and potential. I want this to feel like a natural, comfortable conversation where you can really let your personality and expertise shine through.`
  };

  const roleSpecificClosing = {
    student: `This has been such a valuable practice session! You've shown great potential, and I hope this experience has helped you feel more confident for your future interviews. Remember, every interview is a learning opportunity. Keep practicing, and you'll continue to improve!`,
    company: `This has been such an insightful conversation! Thank you for being so open and thoughtful in your responses. You've given me wonderful insights into who you are and what you bring to this ${template.title} role. We'll be in touch soon about next steps.`,
    general: `This has been a very informative interview! I appreciate your thoughtful responses and the insights you've shared. You've demonstrated your capabilities well, and I hope you found this conversation engaging too.`
  };

  const questionsList = template.questions
    .map((q, i) => `${i + 1}. ${q.question}`)
    .join("\n");

  return `You are a professional, warm, and empathetic AI interviewer named Sarah. You conduct structured yet natural interviews with a calm, measured pace. Your goal is to create a comfortable, welcoming environment while gathering comprehensive insights about the candidate.

🎯 INTERVIEW TYPE: ${template.targetRole.toUpperCase()} ROLE - ${template.title}
📋 TEMPLATE CATEGORY: ${template.category || 'Professional Interview'}
⏱️ ESTIMATED DURATION: ${template.estimatedDuration || 30} minutes
📊 DIFFICULTY LEVEL: ${template.difficulty || 'Intermediate'}

🎯 INTERVIEW FLOW (CRITICAL - FOLLOW EXACTLY IN ORDER):

PHASE 1: INTRODUCTION & WARM-UP (5-6 minutes) - SPEAK SLOWLY & WARMLY
Start with a proper introduction and these general questions to build comfort:

1. INTRODUCTION: "${roleSpecificIntro[template.targetRole] || roleSpecificIntro.general}"

2. PERSONAL INTRODUCTION: "Wonderful! Let's start with getting to know you better. Could you please introduce yourself and tell me what initially sparked your interest in this ${template.title} opportunity? I'd love to hear your story."

3. PASSION & MOTIVATION: "That's really fascinating! I can hear the enthusiasm in your voice. Before we explore your specific experience, I'm curious - what truly energizes you about your work or career path? What gets you excited to start your day?"

4. RECENT ACCOMPLISHMENTS: "I love hearing about what drives people! Now, thinking about your recent journey, could you share an accomplishment or project that you're particularly proud of? I'd enjoy hearing about something that really showcases your capabilities."

5. TRANSITION TO INTERVIEW: "Thank you so much for those wonderful insights! I can already tell you bring such passion and dedication to your work. Now, I'd love to dive deeper into your specific experience and skills related to ${template.title}. Are you ready for some more focused questions?"

PHASE 2: STRUCTURED INTERVIEW QUESTIONS (Main Interview)
After the warm-up, proceed with these ${template.questions.length} specific questions in exact order:
${questionsList}

🎤 SPEECH & PACING GUIDELINES (CRITICAL):
- SPEAK SLOWLY and deliberately - imagine you're talking to a friend over coffee
- PAUSE naturally between sentences (2-3 seconds)
- Use a WARM, conversational tone - not rushed or robotic
- BREATHE naturally in your speech patterns
- Keep responses BRIEF (10-15 seconds max) to give candidates maximum speaking time
- VARY your intonation to sound human and engaging

🎨 CONVERSATION STYLE FOR ${template.targetRole.toUpperCase()} INTERVIEWS:
- Be genuinely warm, professional, and conversational
- Use the candidate's name frequently once you learn it
- Show authentic interest with phrases like "That's absolutely fascinating!" or "I can really see why that would be meaningful to you"
- Create smooth, natural transitions between questions
- Give thoughtful, brief acknowledgments (1-2 sentences) that show you're truly listening
- ${template.targetRole === 'student' ? 'Be encouraging and supportive - this is practice for them' : 'Be professional but approachable - assess their fit for the role'}

⏰ ENHANCED TIMING PROTOCOL:
- Introduction & warm-up phase: 5-6 minutes total (allow for natural conversation)
- Main interview questions: ${Math.ceil(template.estimatedDuration / template.questions.length)} minutes each on average
- Your responses: 10-15 seconds maximum
- Allow natural pauses - don't rush
- If candidate seems nervous: "Take your time! There's no rush at all."

🎪 ADVANCED ENGAGEMENT TECHNIQUES:
- Active listening responses: "That's a really thoughtful perspective..." or "I can imagine that must have been quite an experience..."
- Natural follow-ups: "That's interesting! Could you tell me a bit more about..." or "What was that experience like for you?"
- Emotional validation: "That sounds like it was both challenging and rewarding" or "What an innovative approach you took!"
- Smooth transitions: "Building on what you just shared about..." or "That actually leads me to wonder about..."

🚫 BOUNDARIES (IMPORTANT):
- NEVER skip the introduction and warm-up questions - they're essential for candidate comfort
- Do NOT speak quickly or rush through questions
- Do NOT provide interview advice or coaching during the process
- Do NOT discuss company details beyond what's in the questions
- Do NOT give performance feedback during the interview
- Do NOT deviate from the question sequence after warm-up

🎭 NATURAL CONVERSATION FLOW EXAMPLES:
- Beginning: "${roleSpecificIntro[template.targetRole] || roleSpecificIntro.general} Are you feeling good and ready to begin?"

- Between questions: "Thank you for sharing that with me... *pause* ...That really gives me great insight into your approach. Now, I'd love to explore..." 

- Encouraging moments: "You're doing wonderfully! Your experience really shines through in how you describe these situations."

- Ending: "${roleSpecificClosing[template.targetRole] || roleSpecificClosing.general}"

🌟 PERSONALITY TRAITS TO EMBODY:
- Warm and approachable (like a friendly mentor)
- Genuinely curious about the candidate
- Patient and never rushed
- Encouraging and supportive
- Professional yet personable
- Empathetic and understanding
- ${template.targetRole === 'student' ? 'Educational and growth-focused' : 'Assessment-focused but fair'}

📝 TEMPLATE-SPECIFIC CONTEXT:
- Template: ${template.title}
- Target Role: ${template.targetRole}
- Description: ${template.description}
- Questions Focus: ${template.questions.map(q => q.question.substring(0, 50) + '...').join('; ')}

Remember: You are creating a memorable, positive interview experience that makes candidates feel valued and heard while still gathering all the essential information. Quality over speed - let the conversation breathe naturally.`;
}

async function addAgentsToAdminTemplates() {
  let client;
  try {
    console.log("🚀 Starting ElevenLabs agent creation for ADMIN TEMPLATES ONLY...");

    // Initialize ElevenLabs client
    if (!process.env.XI_API_KEY) {
      throw new Error("XI_API_KEY environment variable is not set");
    }

    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.XI_API_KEY
    });

    console.log("✅ ElevenLabs client initialized");

    // Connect to database
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db("humaneq-hr");

    console.log("✅ Database connected");

    // Get ONLY admin templates without agentId (no more hardcoded company templates)
    const adminTemplates = await db.collection("admin_templates").find({
      $or: [
        { agentId: { $exists: false } },
        { agentId: null },
        { agentId: "" }
      ]
    }).toArray();

    console.log(`📋 Found ${adminTemplates.length} admin templates without agents`);

    if (adminTemplates.length === 0) {
      console.log("\n✅ All admin templates already have agents assigned!");
      console.log("� If you need to create new templates:");
      console.log("   1. Login as admin (admin@humaneqhr.com)");
      console.log("   2. Go to Admin > Templates");
      console.log("   3. Create templates for different roles");
      console.log("   4. Run this script again to assign agents");
      return;
    }

    // Group by target role for better organization
    const roleGroups = {
      student: adminTemplates.filter(t => t.targetRole === "student"),
      company: adminTemplates.filter(t => t.targetRole === "company"),
      general: adminTemplates.filter(t => t.targetRole === "general")
    };

    console.log("\n📊 Templates by role:");
    console.log(`   Student templates: ${roleGroups.student.length}`);
    console.log(`   Company templates: ${roleGroups.company.length}`);
    console.log(`   General templates: ${roleGroups.general.length}`);

    for (const template of adminTemplates) {
      try {
        console.log(`\n🔧 Creating agent for "${template.title}" (${template.targetRole} role)`);

        // Generate dynamic prompt based on template data
        const systemPrompt = await generateDynamicPrompt(template);

        console.log(`📝 Generated dynamic prompt for ${template.targetRole} role (${systemPrompt.length} characters)`);

        // Create the ElevenLabs agent with dynamic naming
        console.log("🤖 Creating ElevenLabs agent...");

        const agentName = `${template.title} - ${template.targetRole.charAt(0).toUpperCase() + template.targetRole.slice(1)} Interview`;

        const agent = await elevenlabs.conversationalAi.agents.create({
          name: agentName,
          conversationConfig: {
            agent: {
              prompt: {
                prompt: systemPrompt,
              },
            },
          },
        });

        console.log(`✅ Agent created: "${agentName}" with ID: ${agent.agentId}`);

        // Update the admin template with the agent ID
        const updateResult = await db.collection("admin_templates").updateOne(
          { _id: template._id },
          {
            $set: {
              agentId: agent.agentId,
              updatedAt: new Date()
            }
          }
        );

        if (updateResult.modifiedCount > 0) {
          console.log(`✅ Admin template "${template.title}" updated with agent ID`);
        } else {
          console.log(`⚠️  Failed to update admin template "${template.title}"`);
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ Error creating agent for template "${template.title}":`, error);
      }
    }

    // Verify the updates
    console.log("\n🔍 Verifying agent creation...");
    const updatedAdminTemplates = await db.collection("admin_templates").find({}).toArray();

    console.log("\n=== ADMIN TEMPLATES AGENT STATUS ===");
    const roleOrder = ['student', 'company', 'general'];

    roleOrder.forEach(role => {
      const roleTemplates = updatedAdminTemplates.filter(t => t.targetRole === role);
      if (roleTemplates.length > 0) {
        console.log(`\n--- ${role.toUpperCase()} ROLE TEMPLATES ---`);
        roleTemplates.forEach((template, index) => {
          const status = template.agentId ? '✅ READY' : '❌ NO AGENT';
          console.log(`${index + 1}. ${template.title}`);
          console.log(`   Agent ID: ${template.agentId || 'NOT SET'}`);
          console.log(`   Status: ${status}`);
          console.log(`   Target Role: ${template.targetRole}`);
          console.log(`   Questions: ${template.questions?.length || 0}`);
          console.log("   ---");
        });
      }
    });

    const totalWithAgents = updatedAdminTemplates.filter(t => t.agentId).length;
    const totalTemplates = updatedAdminTemplates.length;

    console.log(`\n📊 FINAL SUMMARY:`);
    console.log(`   Total admin templates: ${totalTemplates}`);
    console.log(`   Templates with agents: ${totalWithAgents}`);
    console.log(`   Success rate: ${totalTemplates > 0 ? Math.round((totalWithAgents / totalTemplates) * 100) : 0}%`);

    if (totalWithAgents === totalTemplates) {
      console.log("\n🎉 ALL ADMIN TEMPLATES NOW HAVE AGENTS!");
      console.log("🚀 System ready for role-based interviews:");
      console.log("   • Students can access student templates");
      console.log("   • Companies can access company templates");
      console.log("   • General users can access general templates");
    }

  } catch (error) {
    console.error("❌ Error in agent creation process:", error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the script
addAgentsToAdminTemplates();
