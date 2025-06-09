import { multiAgent } from "@llamaindex/workflow";
import { mathAgent } from "./math";
import { stringAgent } from "./string";
import { conciergeAgent } from "./concierge";

// Create the multi-agent workflow
export const agents = multiAgent({
    agents: [conciergeAgent, mathAgent, stringAgent],
    rootAgent: conciergeAgent,
    verbose: true,
});