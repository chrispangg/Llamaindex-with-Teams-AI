import { multiAgent } from "@llamaindex/workflow";
import { mathAgent } from "./math/index.js";
import { stringAgent } from "./string/index.js";
import { conciergeAgent } from "./concierge/index.js";
import { chartAgent } from "./chart/index.js";

// Create the multi-agent workflow
export const agents = multiAgent({
    agents: [conciergeAgent, mathAgent, stringAgent, chartAgent],
    rootAgent: conciergeAgent,
    verbose: true,
});