/**
 * @fileoverview Simple test script for Salesforce tools and connection
 */

import {
    runSoqlQueryTool,
    runSoslSearchTool,
    getObjectFieldsTool,
    getRecordTool,
    restfulTool
} from "./tools";
import env from "../../env.config";

async function testSalesforceConnection() {
    console.log("🔧 Testing Salesforce Connection and Tools");
    console.log("==========================================");

    // Check if credentials are configured
    console.log("\n📋 Checking Salesforce Configuration:");
    console.log(`Username: ${env.SALESFORCE_USERNAME ? '✅ Set' : '❌ Missing'}`);
    console.log(`Password: ${env.SALESFORCE_PASSWORD ? '✅ Set' : '❌ Missing'}`);
    console.log(`Security Token: ${env.SALESFORCE_SECURITY_TOKEN ? '✅ Set' : '❌ Missing'}`);
    console.log(`Instance URL: ${env.SALESFORCE_INSTANCE_URL || 'https://login.salesforce.com (default)'}`);

    if (!env.SALESFORCE_USERNAME || !env.SALESFORCE_PASSWORD) {
        console.log("\n❌ Missing required Salesforce credentials. Please set:");
        console.log("   - SALESFORCE_USERNAME");
        console.log("   - SALESFORCE_PASSWORD");
        console.log("   - SALESFORCE_SECURITY_TOKEN (if required)");
        console.log("   - SALESFORCE_INSTANCE_URL (optional)");
        return;
    }

    console.log("\n🧪 Running Tests:");
    console.log("==================");

    // Test 1: Simple SOQL Query
    console.log("\n1️⃣ Testing SOQL Query (User object)...");
    try {
        const result = await runSoqlQueryTool.call({
            query: "SELECT Id, Name, Username FROM User LIMIT 5"
        });
        console.log("✅ SOQL Query successful");
        console.log("📄 Sample result:", String(result).substring(0, 200) + "...");
    } catch (error) {
        console.log("❌ SOQL Query failed:", error);
    }

    // Test 2: Get Object Fields
    console.log("\n2️⃣ Testing Object Fields (Account)...");
    try {
        const result = await getObjectFieldsTool.call({
            object_name: "Account"
        });
        console.log("✅ Object Fields retrieval successful");
        console.log("📄 Sample result:", String(result).substring(0, 200) + "...");
    } catch (error) {
        console.log("❌ Object Fields retrieval failed:", error);
    }

    // Test 3: REST API Call
    console.log("\n3️⃣ Testing REST API (Organization info)...");
    try {
        const result = await restfulTool.call({
            path: "sobjects/Organization/describe",
            method: "GET"
        });
        console.log("✅ REST API call successful");
        console.log("📄 Sample result:", String(result).substring(0, 200) + "...");
    } catch (error) {
        console.log("❌ REST API call failed:", error);
    }

    // Test 4: SOSL Search (if data exists)
    console.log("\n4️⃣ Testing SOSL Search...");
    try {
        const result = await runSoslSearchTool.call({
            search: "FIND {test} IN ALL FIELDS RETURNING Account(Id, Name) LIMIT 5"
        });
        console.log("✅ SOSL Search successful");
        console.log("📄 Sample result:", String(result).substring(0, 200) + "...");
    } catch (error) {
        console.log("❌ SOSL Search failed:", error);
    }

    console.log("\n🎉 Test completed!");
}

// Run the test if this file is executed directly
if (require.main === module) {
    testSalesforceConnection().catch(console.error);
}

export { testSalesforceConnection }; 