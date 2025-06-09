/**
 * @fileoverview Defines the SalesforceAgent responsible for Salesforce operations.
 */

import { openai } from "@llamaindex/openai";
import { agent } from "@llamaindex/workflow";
import { conciergeAgent } from "../concierge/index";
import {
    runSoqlQueryTool,
    runSoslSearchTool,
    getObjectFieldsTool,
    getRecordTool,
} from "./tools";
import env from "../../env.config";

export const salesforceAgent = agent({
    name: "SalesforceAgent",
    description: "Performs Salesforce operations including SOQL queries, CRUD operations, and API calls.",
    tools: [
        runSoqlQueryTool,
        runSoslSearchTool,
        getObjectFieldsTool,
        getRecordTool
    ],
    llm: openai({ model: "gpt-4.1-mini", apiKey: env.OPENAI_API_KEY }),
    verbose: false,
    canHandoffTo: [conciergeAgent],
    systemPrompt: `You are a specialized agent for Salesforce read-only operations. You can:

1. Execute SOQL queries to retrieve data from Salesforce
2. Perform SOSL searches across multiple objects
3. Get metadata about Salesforce objects and their fields
4. Read individual records by ID
5. Execute Tooling API requests for development operations (read-only)
6. Execute Apex REST requests for custom functionality
7. Make direct REST API calls to Salesforce

When working with Salesforce:
- Always validate object names and field names before operations
- Use proper SOQL syntax for queries
- Handle errors gracefully and provide helpful error messages
- You can only perform read operations - no create, update, or delete operations are available
- For data modification requests, explain that you can only read data and suggest alternatives

If you cannot fulfill a request or need clarification, explain why and suggest alternatives.`,
}); 