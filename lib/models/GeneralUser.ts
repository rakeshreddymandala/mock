import mongoose, { Schema, Document } from 'mongoose'

// General User Interface
export interface IGeneralUser extends Document {
    _id: string
    email: string
    passwordHash: string
    firstName: string
    lastName: string
    profilePicture?: string
    resumeUrl?: string
    phoneNumber?: string
    location?: string
    subscriptionTier: 'free' | 'premium'
    interviewQuota: number
    interviewsUsed: number
    quotaResetDate: Date
    preferences: {
        emailNotifications: boolean
        interviewReminders: boolean
        preferredDifficulty: 'beginner' | 'intermediate' | 'advanced'
        focusAreas: string[]
        preferredLanguage: string
    }
    accountStatus: 'active' | 'suspended' | 'pending'
    isEmailVerified: boolean
    emailVerificationToken?: string
    passwordResetToken?: string
    passwordResetExpiry?: Date
    lastLoginAt?: Date
    createdAt: Date
    updatedAt: Date
}

// Interview Session Interface for General Users
export interface IGeneralInterviewSession extends Document {
    _id: string
    generalUserId: string
    templateId: string
    sessionId: string
    templateTitle: string
    companyName: string
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
    scheduledAt?: Date
    startedAt?: Date
    completedAt?: Date
    duration: number // in minutes
    score?: number
    feedback?: string
    interviewerNotes?: string
    recordingUrl?: string
    transcriptUrl?: string
    analysis: {
        overallPerformance: number
        technicalSkills: number
        communicationSkills: number
        problemSolving: number
        culturalFit: number
        strengths: string[]
        improvements: string[]
        keyInsights: string[]
    }
    questionsAsked: Array<{
        question: string
        answer: string
        score: number
        feedback: string
        timeSpent: number
    }>
    createdAt: Date
    updatedAt: Date
}

// Interview Template Access Interface
export interface IInterviewAccess extends Document {
    _id: string
    generalUserId: string
    templateId: string
    companyId: string
    accessType: 'public' | 'shared' | 'purchased'
    accessGrantedAt: Date
    accessExpiryAt?: Date
    isActive: boolean
    createdAt: Date
}

// General User Schema
const generalUserSchema = new Schema<IGeneralUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    profilePicture: {
        type: String,
        default: null
    },
    resumeUrl: {
        type: String,
        default: null
    },
    phoneNumber: {
        type: String,
        default: null
    },
    location: {
        type: String,
        default: null
    },
    subscriptionTier: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free'
    },
    interviewQuota: {
        type: Number,
        default: 3 // Free tier gets 3 interviews per month
    },
    interviewsUsed: {
        type: Number,
        default: 0
    },
    quotaResetDate: {
        type: Date,
        default: () => {
            const now = new Date()
            return new Date(now.getFullYear(), now.getMonth() + 1, 1)
        }
    },
    preferences: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        interviewReminders: {
            type: Boolean,
            default: true
        },
        preferredDifficulty: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'intermediate'
        },
        focusAreas: [{
            type: String
        }],
        preferredLanguage: {
            type: String,
            default: 'english'
        }
    },
    accountStatus: {
        type: String,
        enum: ['active', 'suspended', 'pending'],
        default: 'pending'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
        default: null
    },
    passwordResetToken: {
        type: String,
        default: null
    },
    passwordResetExpiry: {
        type: Date,
        default: null
    },
    lastLoginAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    collection: 'generalusers'
})

// Interview Session Schema for General Users
const generalInterviewSessionSchema = new Schema<IGeneralInterviewSession>({
    generalUserId: {
        type: String,
        required: true,
        index: true
    },
    templateId: {
        type: String,
        required: true,
        index: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    templateTitle: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    scheduledAt: {
        type: Date,
        default: null
    },
    startedAt: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    },
    duration: {
        type: Number,
        default: 0
    },
    score: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },
    feedback: {
        type: String,
        default: null
    },
    interviewerNotes: {
        type: String,
        default: null
    },
    recordingUrl: {
        type: String,
        default: null
    },
    transcriptUrl: {
        type: String,
        default: null
    },
    analysis: {
        overallPerformance: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        technicalSkills: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        communicationSkills: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        problemSolving: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        culturalFit: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        strengths: [{
            type: String
        }],
        improvements: [{
            type: String
        }],
        keyInsights: [{
            type: String
        }]
    },
    questionsAsked: [{
        question: {
            type: String,
            required: true
        },
        answer: {
            type: String,
            required: true
        },
        score: {
            type: Number,
            min: 0,
            max: 100,
            required: true
        },
        feedback: {
            type: String,
            required: true
        },
        timeSpent: {
            type: Number,
            required: true
        }
    }]
}, {
    timestamps: true,
    collection: 'generalinterviewsessions'
})

// Interview Access Schema
const interviewAccessSchema = new Schema<IInterviewAccess>({
    generalUserId: {
        type: String,
        required: true,
        index: true
    },
    templateId: {
        type: String,
        required: true,
        index: true
    },
    companyId: {
        type: String,
        required: true,
        index: true
    },
    accessType: {
        type: String,
        enum: ['public', 'shared', 'purchased'],
        required: true
    },
    accessGrantedAt: {
        type: Date,
        default: Date.now
    },
    accessExpiryAt: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: 'interviewaccess'
})

// Indexes for performance
generalUserSchema.index({ email: 1 })
generalUserSchema.index({ accountStatus: 1 })
generalUserSchema.index({ subscriptionTier: 1 })
generalUserSchema.index({ quotaResetDate: 1 })

generalInterviewSessionSchema.index({ generalUserId: 1, createdAt: -1 })
generalInterviewSessionSchema.index({ status: 1 })
generalInterviewSessionSchema.index({ completedAt: -1 })

interviewAccessSchema.index({ generalUserId: 1, isActive: 1 })
interviewAccessSchema.index({ templateId: 1, accessType: 1 })

// Models
export const GeneralUser = mongoose.models.GeneralUser || mongoose.model<IGeneralUser>('GeneralUser', generalUserSchema)
export const GeneralInterviewSession = mongoose.models.GeneralInterviewSession || mongoose.model<IGeneralInterviewSession>('GeneralInterviewSession', generalInterviewSessionSchema)
export const InterviewAccess = mongoose.models.InterviewAccess || mongoose.model<IInterviewAccess>('InterviewAccess', interviewAccessSchema)