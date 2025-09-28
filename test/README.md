# HumaneQ-HR Test Suite

This directory contains comprehensive tests for the HumaneQ-HR admin portal and ElevenLabs integration.

## Test Files

### 1. `check-admin-templates.js`
**Purpose:** Analyzes the admin templates database to check agent creation status

**What it does:**
- Connects to MongoDB database
- Checks admin_templates collection
- Analyzes agent IDs (placeholder vs real)
- Reports template statistics and issues
- Detects configuration problems

**Usage:**
```bash
cd test
node check-admin-templates.js
```

### 2. `test-admin-portal.js`
**Purpose:** Tests the complete admin portal workflow via API calls

**What it does:**
- Tests admin login functionality
- Tests template listing API
- Creates a test template through API
- Checks agent creation process
- Verifies ElevenLabs integration
- Generates comprehensive report

**Usage:**
```bash
cd test
node test-admin-portal.js
```

### 3. `test-elevenlabs-integration.js`
**Purpose:** Tests ElevenLabs API connectivity and agent functionality

**What it does:**
- Tests API key and connectivity
- Lists existing agents in account
- Creates a test agent
- Tests conversation endpoints
- Provides integration recommendations

**Usage:**
```bash
cd test
node test-elevenlabs-integration.js
```

## Running All Tests

To run all tests in sequence:
```bash
cd test
node check-admin-templates.js && node test-admin-portal.js && node test-elevenlabs-integration.js
```

## Test Results Interpretation

### Expected Issues to Find:
1. **Placeholder Agent IDs** - Templates have `agent_123456` instead of real ElevenLabs agent IDs
2. **Missing ElevenLabs Integration** - Admin API creates placeholders instead of real agents
3. **API Configuration Issues** - XI_API_KEY not properly configured

### When Tests Pass:
- ✅ All templates have real ElevenLabs agent IDs
- ✅ Admin portal creates functional agents
- ✅ Interview workflow works end-to-end
- ✅ ElevenLabs API integration is working

## Prerequisites

1. **Environment Variables:**
   ```
   MONGODB_URI=mongodb://localhost:27017
   XI_API_KEY=your_elevenlabs_api_key
   ```

2. **Running Application:**
   The Next.js application must be running on `http://localhost:3000`

3. **Admin Account:**
   Admin account must exist with credentials:
   - Email: `admin@humaneqhr.com`
   - Password: `admin123`

## Test Output Examples

### Successful Test Output:
```
✅ Admin login successful
✅ Templates API working
✅ Template creation successful
✅ ElevenLabs API connection successful
🤖 Agent ID: agt_abc123def456 (REAL ELEVENLABS AGENT)
```

### Failed Test Output:
```
❌ Template has PLACEHOLDER agents instead of real ElevenLabs agents
🤖 Agent ID: agent_1727123456 (PLACEHOLDER)
💡 This indicates the admin portal is NOT creating real agents
```

## Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check MONGODB_URI in .env file
   - Ensure MongoDB is running

2. **Admin Login Failed**
   - Verify admin account exists in database
   - Check credentials: admin@humaneqhr.com / admin123

3. **ElevenLabs API Failed**
   - Verify XI_API_KEY in .env file
   - Check API key has 'Conversational AI' permissions
   - Ensure API key is not expired

4. **Template Creation Failed**
   - Check API authentication
   - Verify database write permissions
   - Check request payload format

## Next Steps After Testing

Based on test results, you may need to:

1. **Fix Admin API Integration**
   - Update `/api/admin/templates` route
   - Integrate real ElevenLabs agent creation
   - Remove placeholder agent ID generation

2. **Configure ElevenLabs**
   - Set up proper API key
   - Test agent creation workflow
   - Verify conversation functionality

3. **Database Cleanup**
   - Remove templates with placeholder agents
   - Re-create templates with real agents
   - Update existing interview data