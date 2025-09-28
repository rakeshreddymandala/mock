HumaneQ-HR/
├── .gitignore                       # Specifies intentionally untracked files to ignore
├── components.json                  # Configuration for shadcn/ui components
├── COMPREHENSIVE_FLOW_ANALYSIS_REPORT.md # Analysis report of the application flow
├── current.md                       # The file you are currently reading
├── HumaneQ-HR_Documentation.md      # Main documentation for the application
├── next.config.mjs                  # Configuration for Next.js
├── Notes.md                         # Developer notes
├── package-lock.json                # Exact, versioned dependency tree
├── package.json                     # Project metadata and dependencies
├── pnpm-lock.yaml                   # PNPM lockfile
├── test-agents.bat                  # Batch script for testing agents
├── tsconfig.json                    # TypeScript compiler configuration
├── .vscode/                         # VS Code editor configuration
│   └── extensions.json              # Recommended VS Code extensions for the project
├── a_reference_animation/           # Reference code for a voice-reactive animation
│   ├── App.tsx                      # Main component for the reference animation
│   ├── components/                  # Components for the reference animation
│   │   └── VoiceReactiveVisual.tsx  # Voice visualization component
│   ├── design/                      # Design and shader code for the animation
│   │   ├── analyser.ts              # Audio analysis for visualization
│   │   ├── backdrop-shader.ts       # Background shader
│   │   ├── piz_compressed.exr       # Environment map texture
│   │   ├── sphere-shader.ts         # Main sphere visualization shader
│   │   ├── utils.ts                 # Utility functions for the 3D scene
│   │   └── visual-3d.ts             # Core 3D visualization logic
│   └── public/                      # Public assets for the reference animation
│       ├── piz_compressed.exr       # Environment map texture
│       └── vite.svg                 # Vite logo
├── app/                             # Main application source code (using Next.js App Router)
│   ├── globals.css                  # Global CSS styles
│   ├── layout.tsx                   # Root layout for the application
│   ├── page.tsx                     # Homepage/main entry point UI
│   ├── admin/                       # Admin-facing pages
│   │   ├── analytics/               # Analytics dashboard for admins
│   │   │   └── page.tsx             # UI for admin analytics
│   │   ├── companies/               # Company management pages for admins
│   │   │   ├── loading.tsx          # Loading UI for company management
│   │   │   └── page.tsx             # UI for listing and managing companies
│   │   ├── dashboard/               # Main admin dashboard
│   │   │   └── page.tsx             # UI for the admin dashboard
│   │   ├── interviews/              # Interview management for admins
│   │   │   ├── loading.tsx          # Loading UI for interview management
│   │   │   └── page.tsx             # UI for viewing all interviews
│   │   ├── login/                   # Admin login page
│   │   │   └── page.tsx             # UI for admin login
│   │   └── signup/                  # Admin signup page
│   │       └── page.tsx             # UI for admin signup
│   ├── api/                         # Backend API endpoints
│   │   ├── admin/                   # API routes for admin functionality
│   │   │   └── companies/           # API for company management by admins
│   │   │       └── route.ts         # Handles CRUD operations for companies
│   │   ├── auth/                    # Authentication-related API routes
│   │   │   ├── login/               # User login endpoint
│   │   │   │   └── route.ts         # Handles user login
│   │   │   ├── logout/              # User logout endpoint
│   │   │   │   └── route.ts         # Handles user logout
│   │   │   ├── me/                  # Endpoint to get current user info
│   │   │   │   └── route.ts         # Fetches current user data
│   │   │   └── signup/              # User signup endpoint
│   │   │       └── route.ts         # Handles user registration
│   │   ├── interviews/              # API routes for interviews
│   │   │   ├── route.ts             # Handles creating and listing interviews
│   │   │   └── [id]/                # API for a specific interview
│   │   │       ├── route.ts         # Handles fetching/updating a specific interview
│   │   │       ├── signed-url/      # API for ElevenLabs integration
│   │   │       │   └── route.ts     # Generates a signed URL to connect to the AI agent
│   │   │       └── video/           # API for video uploads
│   │   │           └── route.ts     # Handles interview video uploads
│   │   ├── practice/                # API routes for student practice sessions
│   │   │   ├── [sessionId]/         # API for a specific practice session
│   │   │   │   ├── audio/           # API for audio uploads in practice
│   │   │   │   │   └── route.ts     # Handles practice audio uploads
│   │   │   │   ├── signed-url/      # API for ElevenLabs in practice
│   │   │   │   │   └── route.ts     # Generates signed URL for practice agent
│   │   │   │   └── video/           # API for video uploads in practice
│   │   │   │       └── route.ts     # Handles practice video uploads
│   │   │   ├── sessions/            # API for managing practice sessions
│   │   │   │   ├── route.ts         # Handles CRUD for practice sessions
│   │   │   │   └── [sessionId]/     # API for a specific practice session's data
│   │   │   │       └── route.ts     # Fetches/updates a specific practice session
│   │   │   └── templates/           # API for practice templates
│   │   │       └── route.ts         # Fetches available practice templates
│   │   ├── student/                 # API routes for student-specific data
│   │   │   ├── analytics/           # API for student analytics
│   │   │   │   └── route.ts         # Fetches analytics data for a student
│   │   │   ├── auth/                # API for student authentication
│   │   │   │   ├── login/           # Student login endpoint
│   │   │   │   │   └── route.ts     # Handles student login
│   │   │   │   ├── logout/          # Student logout endpoint
│   │   │   │   │   └── route.ts     # Handles student logout
│   │   │   │   └── signup/          # Student signup endpoint
│   │   │   │       └── route.ts     # Handles student registration
│   │   │   ├── interviews/          # API for student's real interviews
│   │   │   │   └── route.ts         # Fetches interviews for a student
│   │   │   ├── profile/             # API for student profile
│   │   │   │   └── route.ts         # Handles CRUD for student profile
│   │   │   ├── results/             # API for student results
│   │   │   │   └── route.ts         # Fetches results for a student
│   │   │   ├── sessions/            # API for student session history
│   │   │   │   └── route.ts         # Fetches session history for a student
│   │   │   └── templates/           # API for student-accessible templates
│   │   │       └── route.ts         # Fetches templates for a student
│   │   └── templates/               # API for interview templates
│   │       ├── generate-questions.ts # (Helper) Logic for generating questions
│   │       ├── route.ts             # Handles CRUD for templates
│   │       └── generate-questions/  # API for AI question generation
│   │           └── route.ts         # Endpoint to generate questions via AI
│   ├── company/                     # Company-facing pages
│   │   ├── dashboard/               # Company dashboard
│   │   │   └── page.tsx             # UI for the company dashboard
│   │   ├── login/                   # Company login page
│   │   │   └── page.tsx             # UI for company login
│   │   ├── results/                 # Pages for viewing interview results
│   │   │   ├── page.tsx             # UI for listing all results
│   │   │   └── [id]/                # Page for a specific result
│   │   │       └── page.tsx         # UI for a detailed interview result
│   │   ├── signup/                  # Company signup page
│   │   │   └── page.tsx             # UI for company signup
│   │   └── templates/               # Template management pages for companies
│   │       ├── create/              # Page for creating a new template
│   │       │   └── page.tsx         # UI form for template creation
│   │       ├── loading.tsx          # Loading UI for templates
│   │       └── page.tsx             # UI for listing and managing templates
│   ├── contact/                     # Contact page
│   │   └── page.tsx                 # UI for the contact form
│   ├── demo/                        # Demonstration pages
│   │   ├── interview/               # Demo interview page
│   │   │   └── page.tsx             # UI for a demo interview
│   │   └── page.tsx                 # Main demo page
│   ├── interview/                   # Candidate-facing interview experience
│   │   └── [id]/                    # A specific interview instance
│   │       ├── components/          # Components used in the interview UI
│   │       │   ├── CompletionStep.tsx # UI for when the interview is complete
│   │       │   ├── InterviewHeader.tsx # Header for the interview page
│   │       │   ├── InterviewStep.tsx # Main UI for the active interview
│   │       │   ├── MouseWarningAlert.tsx # Alert for mouse leaving the window
│   │       │   ├── PermissionsStep.tsx # UI for requesting camera/mic permissions
│   │       │   ├── VideoPreview.tsx # Component to show camera preview
│   │       │   └── WelcomeStep.tsx  # Initial welcome screen for the interview
│   │       ├── hooks/               # React hooks for the interview experience
│   │       │   ├── useAudioAnalysis.ts # Hook for analyzing audio
│   │       │   ├── useElevenLabsAgent.ts # Hook for managing the ElevenLabs AI agent
│   │       │   ├── useEnhancedRecording.ts # Hook for advanced media recording
│   │       │   ├── useInterviewData.ts # Hook for fetching interview data
│   │       │   ├── useInterviewFlow.ts # Hook for managing the flow of the interview (steps)
│   │       │   ├── useInterviewState.ts # Hook for managing the state of the interview
│   │       │   ├── useMediaStream.ts # Hook for managing the user's media stream
│   │       │   ├── useMouseTracking.ts # Hook for tracking mouse movement
│   │       │   └── useRecording.ts  # Hook for recording the interview
│   │       ├── loading.tsx          # Loading UI for the interview page
│   │       ├── page-backup.tsx      # A backup or alternative version of the interview page
│   │       └── page.tsx             # Main UI for the interview experience
│   ├── practice/                    # Student-facing practice interview experience
│   │   └── [sessionId]/             # A specific practice session
│   │       ├── components/          # Components for the practice UI
│   │       │   ├── PracticeCompletionStep.tsx # UI for practice completion
│   │       │   ├── PracticeInterviewStep.tsx # Main UI for active practice
│   │       │   ├── PracticePermissionsStep.tsx # UI for practice permissions
│   │       │   └── PracticeWelcomeStep.tsx # Welcome screen for practice
│   │       ├── hooks/               # React hooks for the practice experience
│   │       │   ├── usePracticeAgent.ts # Hook for the practice AI agent
│   │       │   ├── usePracticeData.ts # Hook for practice session data
│   │       │   ├── usePracticeFlow.ts # Hook for managing practice flow
│   │       │   ├── usePracticeMediaStream.ts # Hook for media stream in practice
│   │       │   └── usePracticeRecording.ts # Hook for recording practice sessions
│   │       └── page.tsx             # Main UI for the practice experience
│   ├── simple-test/                 # A simple page for testing purposes
│   │   └── page.tsx                 # UI for the simple test
│   └── student/                     # Student-facing pages
│       ├── dashboard/               # Student dashboard
│       │   ├── page copy.txt        # A text copy of the dashboard page
│       │   └── page.tsx             # UI for the student dashboard
│       ├── login/                   # Student login page
│       │   └── page.tsx             # UI for student login
│       ├── practice/                # Student practice area
│       │   ├── components/          # Components for the practice area UI
│       │   │   ├── EmptyState.tsx   # UI for when no practice templates are available
│       │   │   ├── PracticeHeader.tsx # Header for the practice page
│       │   │   ├── QuotaWarning.tsx # UI to warn about practice quotas
│       │   │   ├── TemplateCard.tsx # UI card for a practice template
│   │   │   │   └── TemplateFilters.tsx # UI for filtering practice templates
│   │   │   ├── hooks/               # Hooks for the practice area
│   │   │   │   ├── useStudentTemplates.ts # Hook to fetch student templates
│   │   │   │   └── useTemplateFilters.ts # Hook to manage template filtering logic
│   │   │   └── page.tsx             # UI for selecting a practice template
│       ├── profile/                 # Student profile page
│       │   └── page.tsx             # UI for managing student profile
│       ├── results/                 # Student results page
│       │   └── page.tsx             # UI for viewing results and analytics
│       ├── signup/                  # Student signup page
│       │   └── page.tsx             # UI for student signup
│       └── templates/               # Page for browsing available templates
│           └── page.tsx             # UI for browsing templates
├── components/                      # Shared, reusable components
│   ├── TestModularAnimation.tsx     # A component for testing modular animations
│   ├── theme-provider.tsx           # Provides theme (dark/light mode) to the app
│   ├── VoiceReactiveVisual-copy.tsx # A copy of the voice visualization component
│   ├── VoiceReactiveVisual.tsx      # The main voice-reactive visualization component
│   ├── student/                     # Components specific to the student dashboard
│   │   ├── DashboardHeader.tsx      # Header for the student dashboard
│   │   ├── DashboardMetricsSummary.tsx # Summary of student metrics
│   │   ├── DashboardRecentResults.tsx # List of recent results on the dashboard
│   │   ├── MetricsCards.tsx         # Cards for displaying metrics
│   │   ├── ProgressCharts.tsx       # Charts for showing progress
│   │   ├── QuotaCard.tsx            # Card for displaying usage quota
│   │   ├── RealTimeProgressChart.tsx # Real-time progress chart component
│   │   ├── RealTimeSessionTypePie.tsx # Real-time session type pie chart
│   │   ├── RealTimeSkillsRadar.tsx  # Real-time skills radar chart
│   │   ├── RealTimeWeeklyActivity.tsx # Real-time weekly activity chart
│   │   ├── RecentSessions.tsx       # List of recent sessions
│   │   ├── ResultsMetricsFilters.tsx # Filters for the results metrics
│   │   ├── ResultsMetricsList.tsx   # List of results metrics
│   │   ├── ResultsMetricsOverview.tsx # Overview of results metrics
│   │   ├── SessionTypeChart.tsx     # Chart for session types
│   │   ├── SkillsRadar.tsx          # Radar chart for skills
│   │   └── WeeklyActivity.tsx       # Chart for weekly activity
│   ├── ui/                          # Base UI components from shadcn/ui
│   │   ├── avatar.tsx               # Avatar component
│   │   ├── badge.tsx                # Badge component
│   │   ├── button.tsx               # Button component
│   │   ├── card.tsx                 # Card component
│   │   ├── checkbox.tsx             # Checkbox component
│   │   ├── dialog.tsx               # Dialog/modal component
│   │   ├── input.tsx                # Input field component
│   │   ├── label.tsx                # Label component
│   │   ├── progress.tsx             # Progress bar component
│   │   ├── select.tsx               # Select/dropdown component
│   │   ├── separator.tsx            # Separator line component
│   │   ├── switch.tsx               # Switch toggle component
│   │   ├── table.tsx                # Table component
│   │   ├── tabs.tsx                 # Tabs component
│   │   └── textarea.tsx             # Textarea component
│   └── voice-reactive/              # Hooks for the voice-reactive visualization
│       ├── useAnimationLoop.ts      # Hook to manage the animation loop
│       ├── useAudioManager.ts       # Hook to manage audio processing
│       └── useThreeScene.ts         # Hook to manage the Three.js scene
├── hooks/                           # Global React hooks
│   ├── useStudentData.ts            # Hook for fetching student data
│   └── useStudentResults.ts         # Hook for fetching student results
├── lib/                             # Core libraries, helpers, and configuration
│   ├── auth.ts                      # Authentication helpers (JWT, passwords)
│   ├── mongodb.ts                   # MongoDB connection helper
│   ├── utils.ts                     # General utility functions
│   ├── design/                      # Design assets and logic for 3D visuals
│   │   ├── analyser.ts              # Audio analysis for visualization
│   │   ├── backdrop-shader.ts       # Background shader
│   │   ├── piz_compressed.exr       # Environment map texture
│   │   ├── sphere-shader.ts         # Main sphere visualization shader
│   │   ├── utils.ts                 # Utility functions for the 3D scene
│   │   └── visual-3d.ts             # Core 3D visualization logic
│   ├── models/                      # Mongoose models for MongoDB
│   │   ├── Interview.ts             # Schema for interviews
│   │   ├── Student.ts               # Schema for students
│   │   ├── Template.ts              # Schema for interview templates
│   │   └── User.ts                  # Schema for admin/company users
│   └── utils/                       # Utility functions
│       ├── generateLink.ts          # Functions for generating unique links
│       ├── s3.ts                    # AWS S3 upload helper
│       └── studentAuth.ts           # Student-specific authentication helpers
├── public/                          # Static assets accessible from the browser
│   ├── piz_compressed.exr           # Environment map for 3D visuals
│   ├── placeholder-logo.png         # Placeholder logo image
│   ├── placeholder-logo.svg         # Placeholder logo SVG
│   ├── placeholder-user.jpg         # Placeholder user image
│   ├── placeholder.jpg              # Placeholder image
│   ├── placeholder.svg              # Placeholder SVG
│   ├── professional-candidate-headshot.jpg # Stock photo
│   ├── professional-chro-headshot.png # Stock photo
│   ├── professional-cto-headshot.png # Stock photo
│   ├── professional-woman-ceo.png   # Stock photo
│   └── professional-woman-headshot.png # Stock photo
├── scripts/                         # Standalone scripts for various tasks
│   ├── add-agents-to-templates.js   # Script to add ElevenLabs agents to templates
│   ├── check-agents.js              # Script to check the status of agents
│   ├── check-templates.js           # Script to check templates in the database
│   ├── requirements.txt             # Python dependencies for scripts
│   ├── seed-database.js             # Script to seed the database with initial data (JS version)
│   ├── seed-database.ts             # Script to seed the database (TS version)
│   ├── separate-flow-architecture.js # Script to generate architecture documentation
│   ├── separate-flow-progress.js    # Script to track progress
│   ├── test-elevenlabs-agents.py    # Python script to test ElevenLabs agents
│   └── verify-complete-fixes.js     # Script to verify fixes
├── styles/                          # Global styles
│   └── globals.css                  # Main global stylesheet
└── uploads/                         # Directory for local uploads (e.g., interview recordings)
