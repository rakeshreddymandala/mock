/**
 * Database Structure Test
 * This test examines all collections and their relationships
 */

import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

class DatabaseStructureTest {
    constructor() {
        this.mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        this.dbName = 'humaneq-hr';
        this.client = null;
    }

    async connect() {
        this.client = new MongoClient(this.mongoUri);
        await this.client.connect();
        return this.client.db(this.dbName);
    }

    async getAllCollections(db) {
        const collections = await db.listCollections().toArray();
        return collections.map(col => col.name);
    }

    async analyzeCollection(db, collectionName) {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        const sampleDoc = await collection.findOne({});
        
        return {
            name: collectionName,
            documentCount: count,
            sampleDocument: sampleDoc,
            fields: sampleDoc ? Object.keys(sampleDoc) : []
        };
    }

    async runCompleteAnalysis() {
        console.log("🗄️  DATABASE STRUCTURE ANALYSIS");
        console.log("=" * 50);
        
        try {
            const db = await this.connect();
            console.log(`✅ Connected to database: ${this.dbName}`);

            // Get all collections
            const collectionNames = await this.getAllCollections(db);
            console.log(`\n📁 Found ${collectionNames.length} collections:`);
            collectionNames.forEach(name => console.log(`   - ${name}`));

            // Analyze each collection
            console.log("\n📊 COLLECTION ANALYSIS:");
            console.log("=" * 50);

            const collectionAnalysis = {};
            
            for (const collectionName of collectionNames) {
                console.log(`\n📋 Collection: ${collectionName}`);
                console.log("-" * 30);
                
                const analysis = await this.analyzeCollection(db, collectionName);
                collectionAnalysis[collectionName] = analysis;
                
                console.log(`   Documents: ${analysis.documentCount}`);
                console.log(`   Fields: ${analysis.fields.join(', ')}`);
                
                if (analysis.sampleDocument) {
                    console.log(`   Sample structure:`);
                    this.printDocumentStructure(analysis.sampleDocument, 4);
                }
            }

            // Generate relationship map
            await this.analyzeRelationships(db, collectionAnalysis);

        } catch (error) {
            console.error("❌ Analysis failed:", error.message);
        } finally {
            if (this.client) {
                await this.client.close();
            }
        }
    }

    printDocumentStructure(doc, indent = 0) {
        const prefix = ' '.repeat(indent);
        
        for (const [key, value] of Object.entries(doc)) {
            if (value === null || value === undefined) {
                console.log(`${prefix}${key}: ${value}`);
            } else if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                console.log(`${prefix}${key}: {}`);
                if (indent < 8) { // Prevent too deep nesting
                    this.printDocumentStructure(value, indent + 2);
                }
            } else if (Array.isArray(value)) {
                console.log(`${prefix}${key}: [${value.length} items]`);
                if (value.length > 0 && typeof value[0] === 'object' && indent < 8) {
                    console.log(`${prefix}  Sample item:`);
                    this.printDocumentStructure(value[0], indent + 4);
                }
            } else {
                const displayValue = typeof value === 'string' && value.length > 50 
                    ? value.substring(0, 50) + '...' 
                    : value;
                console.log(`${prefix}${key}: ${displayValue}`);
            }
        }
    }

    async analyzeRelationships(db, collections) {
        console.log("\n🔗 RELATIONSHIP ANALYSIS:");
        console.log("=" * 50);

        // Common ID fields that indicate relationships
        const relationshipFields = [
            'companyId', 'templateId', 'userId', 'studentId', 'generalUserId',
            'interviewId', 'sessionId', 'agentId', 'candidateId'
        ];

        const relationships = {};

        for (const [collectionName, analysis] of Object.entries(collections)) {
            relationships[collectionName] = [];
            
            for (const field of analysis.fields) {
                if (relationshipFields.some(rf => field.includes(rf) || rf.includes(field))) {
                    relationships[collectionName].push(field);
                }
            }
        }

        for (const [collection, relFields] of Object.entries(relationships)) {
            if (relFields.length > 0) {
                console.log(`\n📎 ${collection}:`);
                relFields.forEach(field => {
                    console.log(`   - ${field} (references another collection)`);
                });
            }
        }
    }
}

// Run the test
async function runDatabaseTest() {
    const tester = new DatabaseStructureTest();
    await tester.runCompleteAnalysis();
}

export default DatabaseStructureTest;

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runDatabaseTest().catch(console.error);
}