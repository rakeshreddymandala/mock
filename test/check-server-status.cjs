/**
 * Quick Server Status Check
 */

async function checkServerStatus() {
    console.log("🔍 Checking Development Server Status...\n");
    
    try {
        const response = await fetch('http://localhost:3000/api/admin/templates');
        
        if (response.ok) {
            console.log("✅ Server is running on http://localhost:3000");
            console.log(`📡 Admin Templates API Status: ${response.status} ${response.statusText}`);
            
            const data = await response.json();
            console.log(`📋 Templates found: ${data.templates?.length || 0}`);
        } else {
            console.log(`⚠️  Server responded with: ${response.status} ${response.statusText}`);
        }
        
        return true;
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log("❌ Development server is not running");
            console.log("\n💡 To start the server, run:");
            console.log("   npm run dev");
            console.log("   # or");
            console.log("   yarn dev");
            console.log("   # or"); 
            console.log("   pnpm dev");
        } else {
            console.log("❌ Connection error:", error.message);
        }
        return false;
    }
}

checkServerStatus().catch(console.error);