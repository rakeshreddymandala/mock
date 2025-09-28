const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Use your existing MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI;

async function addGeneralUsers() {
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI environment variable is required');
        process.exit(1);
    }

    let client;

    try {
        console.log('🔗 Connecting to database...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db();

        console.log('🌱 Adding general users to existing database...');

        // Check if general users already exist
        const existingUsers = await db.collection('general_users').countDocuments();

        if (existingUsers > 0) {
            console.log('✅ General users already exist. Skipping creation.');
            console.log('\n🔐 Use existing test credentials:');
            console.log('   User 1: alex.johnson@generaluser.com / GeneralTest123!');
            console.log('   User 2: sarah.chen@practiceuser.com / Practice456@');
            return;
        }

        // Hash passwords
        const saltRounds = 12;
        const password1Hash = await bcrypt.hash('GeneralTest123!', saltRounds);
        const password2Hash = await bcrypt.hash('Practice456@', saltRounds);

        // Create 2 test users
        const testUsers = [
            {
                firstName: 'Alex',
                lastName: 'Johnson',
                email: 'alex.johnson@generaluser.com',
                password: password1Hash,
                profilePicture: null,
                subscriptionTier: 'free',
                interviewQuota: 3,
                interviewsUsed: 0,
                quotaResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
                preferences: {
                    emailNotifications: true,
                    practiceReminders: true,
                    performanceInsights: true
                },
                accountStatus: 'active',
                isEmailVerified: true,
                emailVerificationToken: null,
                passwordResetToken: null,
                passwordResetExpires: null,
                lastLoginAt: null,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                firstName: 'Sarah',
                lastName: 'Chen',
                email: 'sarah.chen@practiceuser.com',
                password: password2Hash,
                profilePicture: null,
                subscriptionTier: 'premium',
                interviewQuota: 999, // Unlimited for premium
                interviewsUsed: 1,
                quotaResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
                preferences: {
                    emailNotifications: true,
                    practiceReminders: false,
                    performanceInsights: true
                },
                accountStatus: 'active',
                isEmailVerified: true,
                emailVerificationToken: null,
                passwordResetToken: null,
                passwordResetExpires: null,
                lastLoginAt: new Date(),
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                updatedAt: new Date()
            }
        ];

        // Insert users into general_users collection
        console.log('👤 Adding general users to collection...');
        const usersResult = await db.collection('general_users').insertMany(testUsers);
        console.log(`✅ Added ${usersResult.insertedCount} general users`);

        // Create a sample interview session for Sarah (premium user)
        const sampleSession = {
            generalUserId: Object.values(usersResult.insertedIds)[1].toString(), // Sarah's ID
            templateId: 'sample-template-1',
            sessionId: `gen_${Date.now() - 86400000}_abc123`, // Yesterday
            templateTitle: 'Frontend Developer Practice',
            companyName: 'Practice Interview',
            candidateName: 'Sarah Chen',
            candidateEmail: 'sarah.chen@practiceuser.com',
            status: 'completed',
            scheduledAt: null,
            createdAt: new Date(Date.now() - 86400000),
            updatedAt: new Date(Date.now() - 86400000 + 3600000),
            startedAt: new Date(Date.now() - 86400000),
            completedAt: new Date(Date.now() - 86400000 + 2700000), // 45 minutes later
            duration: 45,
            responses: [
                { questionId: 1, response: 'Well-structured answer about React hooks', duration: 180 },
                { questionId: 2, response: 'Detailed explanation of state management', duration: 120 }
            ],
            analysis: {
                overallPerformance: 82,
                technicalSkills: 85,
                communicationSkills: 78,
                problemSolving: 84,
                culturalFit: 80,
                strengths: ['Strong React knowledge', 'Clear explanations', 'Problem-solving skills'],
                improvements: ['CSS optimization techniques', 'Testing best practices'],
                keyInsights: ['Solid technical foundation', 'Good communication skills', 'Ready for mid-level positions'],
                feedback: 'Strong performance with good technical depth and clear communication.'
            },
            finalScore: 82,
            metadata: {
                sessionType: 'general',
                userType: 'general',
                userId: Object.values(usersResult.insertedIds)[1].toString(),
                templateCategory: 'Development'
            }
        };

        console.log('📋 Adding sample interview session...');
        const sessionResult = await db.collection('general_interview_sessions').insertOne(sampleSession);
        console.log(`✅ Added ${sessionResult.insertedId ? 1 : 0} sample interview session`);

        console.log('\n🎯 General Users Added Successfully!');
        console.log('=====================================');
        console.log('👤 USER 1 (Free Tier):');
        console.log('   Email: alex.johnson@generaluser.com');
        console.log('   Password: GeneralTest123!');
        console.log('   Status: Free user with 3 interviews quota');
        console.log('');
        console.log('👤 USER 2 (Premium):');
        console.log('   Email: sarah.chen@practiceuser.com');
        console.log('   Password: Practice456@');
        console.log('   Status: Premium user with unlimited quota + sample history');
        console.log('=====================================');
        console.log('\n✅ Ready to test the general user system!');

    } catch (error) {
        console.error('❌ Error adding general users:', error);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// Run the script
addGeneralUsers().catch(console.error);