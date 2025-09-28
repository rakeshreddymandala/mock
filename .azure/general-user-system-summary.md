# General User Interview System - Complete Isolation

## Overview

Created a completely isolated interview system for general users that doesn't interfere with company and student interview processes.

## New Endpoints Created

### 1. General Templates API (`/api/general/templates/`)

- **GET**: Fetch public interview templates for general users
  - Returns default practice templates if none exist
  - Includes categories: Development, Data Science, Product Management
  - Templates include questions, skills, difficulty levels
- **POST**: Start a new interview session with a template
  - Checks user quota (free users limited to 3 interviews)
  - Creates new session in `general_interview_sessions` collection
  - Generates unique session ID with `gen_` prefix

### 2. General Interview Sessions API (`/api/general/interviews/[id]/`)

- **GET**: Fetch interview data for general users
  - Uses separate `general_interview_sessions` and `general_templates` collections
  - Requires general user authentication
  - Returns interview data in same format as company/student interviews
- **PATCH**: Update interview session status and data
  - Handles audio saving, transcript processing, and analysis
  - Updates user quota when interview is completed
  - Processes results through same analysis pipeline

### 3. General Interview Management API (`/api/general/interviews/`)

- **GET**: Fetch user's interview sessions
  - Returns all sessions (pending, in-progress, completed)
  - Formatted for dashboard display
- **PATCH**: Update session status (start interview)
  - Changes status from 'pending' to 'in-progress'
  - Adds timestamp tracking

### 4. General Results API (`/api/general/results/`)

- **GET**: Fetch interview results and analytics
  - Calculates performance metrics and trends
  - Extracts skills breakdown and improvement areas
  - Returns paginated results with analytics

## Database Collections

### New Collections Created

1. **`general_templates`**: Public interview templates for general users
2. **`general_interview_sessions`**: Interview sessions for general users
3. **`general_users`**: General user accounts (already existed)

### Data Isolation

- Company interviews: `interviews` collection
- Student interviews: `student_interview_sessions` collection  
- General interviews: `general_interview_sessions` collection
- Each collection is completely separate with no cross-references

## Frontend Pages

### 1. Templates Browser (`/templates/page.tsx`)

- Browse and filter public interview templates
- Start new interview sessions
- Shows quota usage for free users
- Upgrade prompt for premium features

### 2. Updated Dashboard (`/app/general/dashboard/page.tsx`)

- Complete redesign matching company/student dashboard styling
- Shows interview statistics and recent sessions
- Quota management for free/premium users
- Quick actions and navigation

### 3. Updated Login Page (`/app/general/login/page.tsx`)

- Consistent styling with company/student login pages
- Demo credentials and upgrade prompts

## Interview Flow Integration

### Modified Hooks

1. **`useInterviewData.ts`**:
   - Detects general sessions by `gen_` prefix
   - Routes to correct API endpoint
   - Adds authentication headers for general users

2. **`useInterviewFlow.ts`**:
   - Updated completion data fetching
   - Routes to general interview API for results
   - Maintains same interview experience

### Session ID Format

- **Company**: Uses MongoDB ObjectId or unique link
- **Student**: Uses student-specific format
- **General**: Uses `gen_` prefix (e.g., `gen_1234567890_abc123def`)

## Authentication & Security

### Isolated Authentication

- General users use JWT tokens stored in `general-auth-token`
- Separate authentication middleware in `generalAuth.ts`
- No access to company or student data

### Quota Management

- Free users: 3 interviews per month
- Premium users: Unlimited interviews
- Quota resets monthly
- Upgrade prompts for free users

## Key Features

### Complete Isolation

✅ Separate database collections
✅ Separate API endpoints
✅ Separate authentication system
✅ Separate session management
✅ No data cross-contamination

### Feature Parity

✅ Same interview experience (VoiceReactiveVisual, permissions, etc.)
✅ Same analysis and scoring system
✅ Same audio processing and transcription
✅ Same results and analytics dashboard

### User Experience

✅ Consistent UI/UX across all user types
✅ Quota management and upgrade paths
✅ Template browsing and filtering
✅ Progress tracking and analytics

## Templates Included

### Default Templates Created

1. **Frontend Developer Assessment**
   - React, JavaScript, TypeScript, CSS, HTML
   - 4 questions, 45 minutes
   - Intermediate difficulty

2. **Data Science Interview**
   - Python, Machine Learning, Statistics, SQL
   - 4 questions, 60 minutes  
   - Advanced difficulty

3. **Backend Developer Assessment**
   - Node.js, MongoDB, REST APIs, Authentication
   - 4 questions, 50 minutes
   - Intermediate difficulty

4. **Product Manager Interview**
   - Product Strategy, Analytics, Leadership
   - 4 questions, 45 minutes
   - Intermediate difficulty

## Usage Flow

### For General Users

1. Register/Login at `/general/login`
2. View dashboard at `/general/dashboard`
3. Browse templates at `/templates`
4. Start interview session
5. Take interview at `/interview/[sessionId]`
6. View results at `/general/results`

### Session Management

- Sessions are created with templates
- Status tracking: pending → in-progress → completed
- Full audit trail and analytics
- Quota enforcement and management

This creates a completely isolated, fully-featured interview system for general users that maintains the same high-quality experience as company and student interviews while ensuring no interference between user types.
