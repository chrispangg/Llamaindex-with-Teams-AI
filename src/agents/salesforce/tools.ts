/**
 * @fileoverview Defines tools for Salesforce operations including SOQL queries, CRUD operations, and API calls.
 */

import { tool } from "llamaindex";
import { z } from "zod";
import * as jsforce from "jsforce";
import env from "../../env.config";

// Constants for payload management
const MAX_RECORDS_DEFAULT = 100;
const MAX_RESPONSE_SIZE = 50000; // ~50KB limit for responses
const MAX_FIELDS_DISPLAY = 50; // Limit fields shown in metadata

// Utility function to truncate large responses
function truncateResponse(data: any, maxSize: number = MAX_RESPONSE_SIZE): string {
    const jsonString = JSON.stringify(data, null, 2);
    if (jsonString.length <= maxSize) {
        return jsonString;
    }

    const truncated = jsonString.substring(0, maxSize);
    const lastCompleteObject = truncated.lastIndexOf('\n');
    return truncated.substring(0, lastCompleteObject) + '\n... (response truncated due to size)';
}

// Utility function to limit records in query results
function limitQueryResults(result: any, maxRecords: number = MAX_RECORDS_DEFAULT): any {
    if (result.records && Array.isArray(result.records)) {
        const originalCount = result.records.length;
        if (originalCount > maxRecords) {
            return {
                ...result,
                records: result.records.slice(0, maxRecords),
                totalSize: result.totalSize,
                done: result.done,
                _truncated: true,
                _originalRecordCount: originalCount,
                _displayedRecordCount: maxRecords
            };
        }
    }
    return result;
}

// Salesforce connection singleton
class SalesforceClient {
    private static instance: SalesforceClient;
    private conn: jsforce.Connection | null = null;
    private sobjectsCache: Record<string, any> = {};

    private constructor() { }

    static getInstance(): SalesforceClient {
        if (!SalesforceClient.instance) {
            SalesforceClient.instance = new SalesforceClient();
        }
        return SalesforceClient.instance;
    }

    async connect(): Promise<boolean> {
        try {

            const username = env.SALESFORCE_USERNAME;
            const password = env.SALESFORCE_PASSWORD;
            const securityToken = env.SALESFORCE_SECURITY_TOKEN;

            if (!username || !password) {
                throw new Error("Missing Salesforce credentials");
            }

            this.conn = new jsforce.Connection({
                loginUrl: env.SALESFORCE_INSTANCE_URL
            });

            await this.conn.login(username, password + securityToken);
            return true;
        } catch (error) {
            console.error("Salesforce connection failed:", error);
            return false;
        }
    }

    getConnection(): jsforce.Connection {
        if (!this.conn) {
            throw new Error("Salesforce connection not established. Call connect() first.");
        }
        return this.conn;
    }

    async getObjectFields(objectName: string): Promise<string> {
        if (!this.conn) {
            throw new Error("Salesforce connection not established.");
        }

        if (!this.sobjectsCache[objectName]) {
            const describe = await this.conn.sobject(objectName).describe();
            const filteredFields = describe.fields.map((field: any) => ({
                label: field.label,
                name: field.name,
                updateable: field.updateable,
                type: field.type,
                length: field.length,
                picklistValues: field.picklistValues
            }));
            this.sobjectsCache[objectName] = filteredFields;
        }

        // Limit the number of fields displayed to prevent large payloads
        const fields = this.sobjectsCache[objectName];
        if (fields.length > MAX_FIELDS_DISPLAY) {
            const limitedFields = fields.slice(0, MAX_FIELDS_DISPLAY);
            const result = {
                fields: limitedFields,
                _truncated: true,
                _totalFieldCount: fields.length,
                _displayedFieldCount: MAX_FIELDS_DISPLAY,
                _note: `Showing first ${MAX_FIELDS_DISPLAY} fields out of ${fields.length} total fields`
            };
            return JSON.stringify(result, null, 2);
        }

        return JSON.stringify(fields, null, 2);
    }
}

const sfClient = SalesforceClient.getInstance();

export const runSoqlQueryTool = tool({
    name: "runSoqlQuery",
    description: "Executes a SOQL query against Salesforce. Automatically limits results to prevent large payloads.",
    parameters: z.object({
        query: z.string().describe("The SOQL query to execute"),
        maxRecords: z.number().optional().default(MAX_RECORDS_DEFAULT).describe("Maximum number of records to return (default: 100)")
    }),
    execute: async ({ query, maxRecords = MAX_RECORDS_DEFAULT }): Promise<string> => {
        try {
            const connected = await sfClient.connect();
            if (!connected) {
                return `Error executing SOQL query: Failed to connect to Salesforce. Please check your credentials.`;
            }
            const conn = sfClient.getConnection();

            // Add LIMIT clause if not present and maxRecords is specified
            let modifiedQuery = query;
            if (!query.toUpperCase().includes('LIMIT') && maxRecords) {
                modifiedQuery = `${query} LIMIT ${maxRecords}`;
            }

            const result = await conn.query(modifiedQuery);
            const limitedResult = limitQueryResults(result, maxRecords);
            const truncatedResponse = truncateResponse(limitedResult);

            return `SOQL Query Results (JSON):\n${truncatedResponse}`;
        } catch (error: any) {
            return `Error executing SOQL query: ${error.message}`;
        }
    }
});

export const runSoslSearchTool = tool({
    name: "runSoslSearch",
    description: "Executes a SOSL search against Salesforce. Results are automatically limited to prevent large payloads.",
    parameters: z.object({
        search: z.string().describe("The SOSL search to execute (e.g., 'FIND {John Smith} IN ALL FIELDS')"),
        maxRecords: z.number().optional().default(MAX_RECORDS_DEFAULT).describe("Maximum number of records to return (default: 100)")
    }),
    execute: async ({ search, maxRecords = MAX_RECORDS_DEFAULT }): Promise<string> => {
        try {
            const connected = await sfClient.connect();
            if (!connected) {
                return `Error executing SOSL search: Failed to connect to Salesforce. Please check your credentials.`;
            }
            const conn = sfClient.getConnection();

            // Add LIMIT clause if not present
            let modifiedSearch = search;
            if (!search.toUpperCase().includes('LIMIT') && maxRecords) {
                modifiedSearch = `${search} LIMIT ${maxRecords}`;
            }

            const result = await conn.search(modifiedSearch);
            const truncatedResponse = truncateResponse(result);

            return `SOSL Search Results (JSON):\n${truncatedResponse}`;
        } catch (error: any) {
            return `Error executing SOSL search: ${error.message}`;
        }
    }
});

export const getObjectFieldsTool = tool({
    name: "getObjectFields",
    description: "Retrieves field names, labels and types for a specific Salesforce object. Large field lists are automatically truncated.",
    parameters: z.object({
        object_name: z.string().describe("The name of the Salesforce object (e.g., 'Account', 'Contact')"),
        maxFields: z.number().optional().default(MAX_FIELDS_DISPLAY).describe("Maximum number of fields to return (default: 50)")
    }),
    execute: async ({ object_name, maxFields = MAX_FIELDS_DISPLAY }): Promise<string> => {
        try {
            const connected = await sfClient.connect();
            if (!connected) {
                return `Error getting object fields: Failed to connect to Salesforce. Please check your credentials.`;
            }

            // Temporarily override the max fields limit
            const originalMax = MAX_FIELDS_DISPLAY;
            (global as any).MAX_FIELDS_DISPLAY = maxFields;

            const result = await sfClient.getObjectFields(object_name);

            // Restore original limit
            (global as any).MAX_FIELDS_DISPLAY = originalMax;

            return `${object_name} Metadata (JSON):\n${result}`;
        } catch (error: any) {
            return `Error getting object fields: ${error.message}`;
        }
    }
});

export const getRecordTool = tool({
    name: "getRecord",
    description: "Retrieves a specific record by ID",
    parameters: z.object({
        object_name: z.string().describe("The name of the Salesforce object (e.g., 'Account', 'Contact')"),
        record_id: z.string().describe("The ID of the record to retrieve")
    }),
    execute: async ({ object_name, record_id }): Promise<string> => {
        try {
            const connected = await sfClient.connect();
            if (!connected) {
                return `Error retrieving record: Failed to connect to Salesforce. Please check your credentials.`;
            }
            const conn = sfClient.getConnection();
            const result = await conn.sobject(object_name).retrieve(record_id);
            const truncatedResponse = truncateResponse(result);
            return `${object_name} Record (JSON):\n${truncatedResponse}`;
        } catch (error: any) {
            return `Error retrieving record: ${error.message}`;
        }
    }
});

export const createRecordTool = tool({
    name: "createRecord",
    description: "Creates a new record",
    parameters: z.object({
        object_name: z.string().describe("The name of the Salesforce object (e.g., 'Account', 'Contact')"),
        data: z.record(z.any()).describe("The data for the new record")
    }),
    execute: async ({ object_name, data }): Promise<string> => {
        try {
            await sfClient.connect();
            const conn = sfClient.getConnection();
            const result = await conn.sobject(object_name).create(data);
            const truncatedResponse = truncateResponse(result);
            return `Create ${object_name} Record Result (JSON):\n${truncatedResponse}`;
        } catch (error: any) {
            return `Error creating record: ${error.message}`;
        }
    }
});

export const updateRecordTool = tool({
    name: "updateRecord",
    description: "Updates an existing record",
    parameters: z.object({
        object_name: z.string().describe("The name of the Salesforce object (e.g., 'Account', 'Contact')"),
        record_id: z.string().describe("The ID of the record to update"),
        data: z.record(z.any()).describe("The updated data for the record")
    }),
    execute: async ({ object_name, record_id, data }): Promise<string> => {
        try {
            await sfClient.connect();
            const conn = sfClient.getConnection();
            const result = await conn.sobject(object_name).update({ Id: record_id, ...data });
            const truncatedResponse = truncateResponse(result);
            return `Update ${object_name} Record Result: ${truncatedResponse}`;
        } catch (error: any) {
            return `Error updating record: ${error.message}`;
        }
    }
});

export const deleteRecordTool = tool({
    name: "deleteRecord",
    description: "Deletes a record",
    parameters: z.object({
        object_name: z.string().describe("The name of the Salesforce object (e.g., 'Account', 'Contact')"),
        record_id: z.string().describe("The ID of the record to delete")
    }),
    execute: async ({ object_name, record_id }): Promise<string> => {
        try {
            await sfClient.connect();
            const conn = sfClient.getConnection();
            const result = await conn.sobject(object_name).del(record_id);
            const truncatedResponse = truncateResponse(result);
            return `Delete ${object_name} Record Result: ${truncatedResponse}`;
        } catch (error: any) {
            return `Error deleting record: ${error.message}`;
        }
    }
});

export const toolingExecuteTool = tool({
    name: "toolingExecute",
    description: "Executes a Tooling API request. Large responses are automatically truncated.",
    parameters: z.object({
        action: z.string().describe("The Tooling API endpoint to call (e.g., 'sobjects/ApexClass')"),
        method: z.enum(["GET", "POST", "PATCH", "DELETE"]).default("GET").describe("The HTTP method"),
        data: z.record(z.any()).optional().describe("Data for POST/PATCH requests")
    }),
    execute: async ({ action, method = "GET", data }): Promise<string> => {
        try {
            const connected = await sfClient.connect();
            if (!connected) {
                return `Error executing tooling request: Failed to connect to Salesforce. Please check your credentials.`;
            }
            const conn = sfClient.getConnection();
            const result = await conn.tooling.request({
                method,
                url: `/services/data/v${conn.version}/tooling/${action}`,
                body: data ? JSON.stringify(data) : undefined,
                headers: data ? { 'Content-Type': 'application/json' } : undefined
            });
            const truncatedResponse = truncateResponse(result);
            return `Tooling Execute Result (JSON):\n${truncatedResponse}`;
        } catch (error: any) {
            return `Error executing tooling request: ${error.message}`;
        }
    }
});

export const apexExecuteTool = tool({
    name: "apexExecute",
    description: "Executes an Apex REST request. Large responses are automatically truncated.",
    parameters: z.object({
        action: z.string().describe("The Apex REST endpoint to call (e.g., '/MyApexClass')"),
        method: z.enum(["GET", "POST", "PATCH", "DELETE"]).default("GET").describe("The HTTP method"),
        data: z.record(z.any()).optional().describe("Data for POST/PATCH requests")
    }),
    execute: async ({ action, method = "GET", data }): Promise<string> => {
        try {
            const connected = await sfClient.connect();
            if (!connected) {
                return `Error executing apex request: Failed to connect to Salesforce. Please check your credentials.`;
            }
            const conn = sfClient.getConnection();
            const result = await conn.request({
                method,
                url: `/services/apexrest${action}`,
                body: data ? JSON.stringify(data) : undefined,
                headers: data ? { 'Content-Type': 'application/json' } : undefined
            });
            const truncatedResponse = truncateResponse(result);
            return `Apex Execute Result (JSON):\n${truncatedResponse}`;
        } catch (error: any) {
            return `Error executing apex request: ${error.message}`;
        }
    }
});

export const restfulTool = tool({
    name: "restful",
    description: "Makes a direct REST API call to Salesforce. Large responses are automatically truncated.",
    parameters: z.object({
        path: z.string().describe("The path of the REST API endpoint (e.g., 'sobjects/Account/describe')"),
        method: z.enum(["GET", "POST", "PATCH", "DELETE"]).default("GET").describe("The HTTP method"),
        params: z.record(z.any()).optional().describe("Query parameters for the request"),
        data: z.record(z.any()).optional().describe("Data for POST/PATCH requests")
    }),
    execute: async ({ path, method = "GET", params, data }): Promise<string> => {
        try {
            const connected = await sfClient.connect();
            if (!connected) {
                return `Error making REST API call: Failed to connect to Salesforce. Please check your credentials.`;
            }
            const conn = sfClient.getConnection();

            let url = `/services/data/v${conn.version}/${path}`;
            if (params) {
                const searchParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    searchParams.append(key, String(value));
                });
                url += `?${searchParams.toString()}`;
            }

            const result = await conn.request({
                method,
                url,
                body: data ? JSON.stringify(data) : undefined,
                headers: data ? { 'Content-Type': 'application/json' } : undefined
            });
            const truncatedResponse = truncateResponse(result);
            return `RESTful API Call Result (JSON):\n${truncatedResponse}`;
        } catch (error: any) {
            return `Error making REST API call: ${error.message}`;
        }
    }
}); 