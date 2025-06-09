import { openai } from "@llamaindex/openai";
import { agent } from "@llamaindex/workflow";
import env from "../env.config";
import { conciergeAgent } from "../concierge/agent";
import {
    toUpperCase,
    toLowerCase,
    capitalizeWords,
    getStringLength,
    reverseString,
    extractSubstring,
    replaceText,
    splitString,
    trimWhitespace
} from "./tools";

export const stringAgent = agent({
    name: "StringAgent",
    description: "Handles text manipulation including case conversion, string operations, substring extraction, and text formatting. Always hands off back to ConciergeAgent after completing the task.",
    tools: [toUpperCase, toLowerCase, capitalizeWords, getStringLength, reverseString, extractSubstring, replaceText, splitString, trimWhitespace],
    llm: openai({ model: "gpt-4.1-mini", apiKey: env.OPENAI_API_KEY }),
    verbose: false,
    canHandoffTo: [conciergeAgent],
    systemPrompt: "You are a text manipulation specialist. After completing any string operation or text processing task, always hand off back to the ConciergeAgent to continue assisting the user.",
}); 