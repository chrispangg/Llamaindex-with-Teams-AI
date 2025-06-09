/**
 * @fileoverview Defines the ChartAgent responsible for generating charts.
 */

import { openai } from "@llamaindex/openai";
import { agent } from "@llamaindex/workflow"; // This is fine
import { conciergeAgent } from "../concierge/index"; // Corrected path
import { generateChartTool } from "./tools"; // Import the refactored tool
import env from "../env.config";

export const chartAgent = agent({
  name: "ChartAgent",
  description: "Generates charts using the image-charts API.",
  tools: [generateChartTool], // Use the imported tool directly
  llm: openai({ model: "gpt-4.1-mini", apiKey: env.OPENAI_API_KEY }),
  verbose: false,
  canHandoffTo: [conciergeAgent],
  systemPrompt: "You are a specialized agent for generating charts. Use the provided tool to create charts based on user specifications. If you cannot fulfill the request, explain why.",
});
