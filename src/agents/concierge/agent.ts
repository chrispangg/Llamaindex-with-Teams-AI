import { openai } from "@llamaindex/openai";
import { agent } from "@llamaindex/workflow";
import env from "../../env.config";
import { wikiTool } from "./tools";

export const conciergeAgent = agent({
    name: "ConciergeAgent",
    description: "A helpful assistant that can route requests to specialized agents for math calculations and text manipulation. Can also provide general assistance and information.",
    tools: [wikiTool],
    llm: openai({ model: "gpt-4.1-mini", apiKey: env.OPENAI_API_KEY }),
    verbose: false,
    canHandoffTo: ["MathAgent", "StringAgent", "ChartAgent"],
    systemPrompt: "You are a helpful concierge assistant. Route math-related requests to MathAgent, text manipulation requests to StringAgent, and chart generation requests to ChartAgent. For general questions, you can handle them directly or use available tools.",
}); 