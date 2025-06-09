import { openai } from "@llamaindex/openai";
import { agent } from "@llamaindex/workflow";
import env from "../env.config.js";
import { conciergeAgent } from "../concierge/index.js";
import {
    sumNumbers,
    subtractNumbers,
    multiplyNumbers,
    divideNumbers,
    powerNumbers,
    squareRoot,
    modulo
} from "./tools.js";

export const mathAgent = agent({
    name: "MathAgent",
    description: "Performs mathematical calculations including basic arithmetic, powers, square roots, and modulo operations. Always hands off back to ConciergeAgent after completing the task.",
    tools: [sumNumbers, subtractNumbers, multiplyNumbers, divideNumbers, powerNumbers, squareRoot, modulo],
    llm: openai({ model: "gpt-4.1-mini", apiKey: env.OPENAI_API_KEY }),
    verbose: false,
    canHandoffTo: [conciergeAgent],
    systemPrompt: "You are a math specialist. After completing any mathematical calculation or task, always hand off back to the ConciergeAgent to continue assisting the user.",
}); 