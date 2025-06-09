import { openai } from "@llamaindex/openai";
import { agent } from "@llamaindex/workflow";
import env from "../../env.config";
import { weatherTool } from "./tools";

export const conciergeAgent = agent({
    name: "ConciergeAgent",
    description: "A helpful assistant that can route requests to specialized agents for math calculations, text manipulation, chart generation, and Salesforce operations. Can also provide general assistance and information.",
    tools: [weatherTool],
    llm: openai({ model: "gpt-4.1-mini", apiKey: env.OPENAI_API_KEY }),
    verbose: false,
    canHandoffTo: ["MathAgent", "StringAgent", "ChartAgent", "SalesforceAgent"],
    systemPrompt: "You are a helpful concierge assistant. Route math-related requests to MathAgent, text manipulation requests to StringAgent, chart generation requests to ChartAgent, and Salesforce-related requests (SOQL queries, CRM operations, record management) to SalesforceAgent. For general questions, you can handle them directly or use available tools.",
}); 